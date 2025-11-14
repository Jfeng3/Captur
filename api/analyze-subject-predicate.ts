import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Analyze Subject/Predicate API called:', req.method);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { sentence } = req.body;

      if (!sentence || !sentence.trim()) {
        return res.status(400).json({ error: 'Sentence is required' });
      }

      console.log('Analyzing sentence:', sentence);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a grammar expert. Analyze the given sentence and identify ONLY the CORE subject and CORE predicate, excluding all modifiers.

Return ONLY a JSON object with this exact structure:
{
  "subject": "core subject only",
  "predicate": "core verb phrase only"
}

Rules:
- Subject: Return ONLY the core noun/pronoun (主语核心), WITHOUT any modifiers (修饰部分)
  Example: "The quick brown fox" → return only "fox"
  Example: "My best friend" → return only "friend"
  Example: "The beautiful sunset" → return only "sunset"

- Predicate: Return ONLY the core verb phrase (谓语核心), WITHOUT modifiers
  Example: "jumps quickly over the fence" → return only "jumps"
  Example: "is running very fast" → return only "is running"
  Example: "ate the delicious pizza" → return only "ate"

- Return the EXACT text from the original sentence
- Do not include adjectives, adverbs, articles, or prepositional phrases
- Focus on the bare minimum grammatical core`
          },
          {
            role: 'user',
            content: sentence
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const analysis = JSON.parse(content);

      if (!analysis.subject || !analysis.predicate) {
        throw new Error('Invalid analysis format');
      }

      console.log('Analysis result:', analysis);

      return res.status(200).json({
        subject: analysis.subject,
        predicate: analysis.predicate
      });
    } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({
        error: 'Failed to analyze sentence',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
