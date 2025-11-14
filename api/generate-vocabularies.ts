import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Initialize OpenRouter client
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL || 'https://captur.academy',
    'X-Title': 'Daily Notes Writer',
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Limit content length to avoid excessive token usage
    const limitedContent = content.slice(0, 10000);

    // Generate 10 difficult vocabulary words from the article
    const vocabPrompt = `Extract exactly 10 difficult vocabulary words or phrases from this article that would be challenging for a high school student.

For each word/phrase, provide:
1. The word or phrase (as it appears in the article)
2. A brief definition (5-10 words)
3. Chinese translation (Simplified Chinese)
4. The sentence from the article where this word appears

Format your response as a JSON array like this:
[
  {"word": "algorithm", "definition": "a step-by-step procedure for solving a problem", "chinese": "算法", "sentence": "The algorithm processes data efficiently."},
  {"word": "recursion", "definition": "a programming technique that calls itself", "chinese": "递归", "sentence": "Recursion is commonly used in tree traversal."}
]

Article content:
${limitedContent}`;

    const vocabCompletion = await openai.chat.completions.create({
      model: 'z-ai/glm-4.5-air',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that identifies difficult vocabulary words from articles and provides definitions and Chinese translations. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: vocabPrompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    const vocabResponseText = vocabCompletion.choices[0]?.message?.content || '[]';
    console.log('Vocabulary Response:', vocabResponseText);

    // Parse the vocabulary response
    let hardVocabularies: Array<{word: string, definition: string, chinese: string, sentence: string}> = [];
    try {
      // Extract JSON from response (handle cases where GPT adds markdown code blocks)
      const jsonMatch = vocabResponseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        hardVocabularies = JSON.parse(jsonMatch[0]);
        // Ensure we have exactly 10 words (or less if content is short)
        hardVocabularies = hardVocabularies.slice(0, 10);
      }
    } catch (parseError) {
      console.error('Failed to parse vocabulary JSON:', parseError);
      return res.status(500).json({
        error: 'Failed to parse vocabulary response',
        message: parseError instanceof Error ? parseError.message : 'Unknown error',
      });
    }

    console.log('Hard Vocabularies:', hardVocabularies);

    return res.status(200).json({
      success: true,
      vocabularies: hardVocabularies,
    });
  } catch (error: any) {
    console.error('Error generating vocabularies:', error);
    return res.status(500).json({
      error: 'Failed to generate vocabularies',
      message: error.message,
    });
  }
}
