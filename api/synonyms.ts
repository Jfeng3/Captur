import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Initialize OpenRouter client for synonyms
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL || 'https://captur.academy',
    'X-Title': 'Daily Notes Writer',
  }
});

const handler = async (
  req: VercelRequest,
  res: VercelResponse
) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        error: 'Invalid request: content is required and must be a string'
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        error: 'Content cannot be empty'
      });
    }

    // Call OpenRouter API to find synonyms
    const completion = await openai.chat.completions.create({
      model: 'z-ai/glm-4.5-air',
      messages: [
        {
          role: 'system',
          content: `You are a helpful vocabulary assistant. Given a word or phrase, provide 3-5 synonyms that are commonly used in English.

RULES:
- Return ONLY a JSON array of synonym strings
- Each synonym should be a single word or short phrase
- Synonyms should be appropriate for the context and meaning
- Return synonyms in order from most to least common
- Do NOT include explanations or additional text
- Format: ["synonym1", "synonym2", "synonym3", ...]

Example input: "happy"
Example output: ["joyful", "pleased", "delighted", "cheerful", "content"]

Example input: "difficult"
Example output: ["challenging", "hard", "tough", "complex", "demanding"]`
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || '';

    if (!responseText) {
      throw new Error('No synonyms returned from OpenAI');
    }

    // Parse the JSON array response
    let synonyms: string[];
    try {
      synonyms = JSON.parse(responseText);
      if (!Array.isArray(synonyms) || synonyms.length === 0) {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error('Failed to parse synonyms response:', responseText);
      throw new Error('Failed to parse synonyms from response');
    }

    // Return successful response
    res.status(200).json({
      synonyms
    });
  } catch (error) {
    console.error('Synonyms endpoint error:', error);

    // Return appropriate error message
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      error: errorMessage,
      message: 'Failed to find synonyms'
    });
  }
};

export default handler;
