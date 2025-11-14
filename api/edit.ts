import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Initialize OpenRouter client for editing
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL || 'https://captur.academy',
    'X-Title': 'Daily Notes Writer',
  }
});

// Helper function to clean AI responses that include prefacing text
function cleanEditResponse(text: string): string {
  const prefacingPatterns = [
    /^Here's [^:]*:\s*/i,
    /^Here is [^:]*:\s*/i,
    /^I've simplified [^:]*:\s*/i,
    /^Simplified:\s*/i,
    /^Simplified version:\s*/i,
    /^Here's the simplified [^:]*:\s*/i,
    /^The simplified text:\s*/i,
  ];

  let cleaned = text.trim();

  for (const pattern of prefacingPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  return cleaned.trim();
}

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

    // Call OpenRouter API for editing with the specified prompt
    const completion = await openai.chat.completions.create({
      model: 'z-ai/glm-4.5-air',
      messages: [
        {
          role: 'system',
          content: `You are a writing editor. Simplify the text to be conversational and clear.

Rules:
- Cut unnecessary words
- Use simple, everyday words
- Make it conversational and specific
- Preserve all formatting, markdown, emojis, links, numbers, names
- Return ONLY the simplified text
- NO explanations, NO headings, NO commentary

Output ONLY the final simplified text.`
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.7,
    });

    let edited = completion.choices[0]?.message?.content?.trim() || '';

    if (!edited) {
      throw new Error('No edited text returned from OpenAI');
    }

    // Clean any prefacing text from the AI response
    edited = cleanEditResponse(edited);

    // Return successful response
    res.status(200).json({
      edited
    });
  } catch (error) {
    console.error('Edit endpoint error:', error);

    // Return appropriate error message
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      error: errorMessage,
      message: 'Failed to process edit request'
    });
  }
};

export default handler;
