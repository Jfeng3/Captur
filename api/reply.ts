import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    // Call OpenAI API for reply generation with the specified prompt
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Based on your understanding of me, reply to this message on twitter. I am a soloentrepreneur in the field of AI, n8n automation, reinforcement learning.

Make the English simple, plain, and conversational.

Write in the style of Paul Graham — clear, thoughtful, and direct.

Edit for economy: cut every unnecessary word or repetition.`
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.8,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || '';

    if (!reply) {
      throw new Error('No reply returned from OpenAI');
    }

    // Return successful response
    res.status(200).json({
      reply
    });
  } catch (error) {
    console.error('Reply endpoint error:', error);

    // Return appropriate error message
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      error: errorMessage,
      message: 'Failed to process reply request'
    });
  }
};

export default handler;
