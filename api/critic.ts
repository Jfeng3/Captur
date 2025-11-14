import { VercelRequest, VercelResponse } from '@vercel/node';
import { getCriticFeedback } from './openai-service.js';

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

    // Call OpenAI service
    const response = await getCriticFeedback(content);
    
    // Return successful response
    res.status(200).json(response);
  } catch (error) {
    console.error('Critic endpoint error:', error);
    
    // Return appropriate error message
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ 
      error: errorMessage,
      message: 'Failed to process critic request'
    });
  }
};

export default handler;