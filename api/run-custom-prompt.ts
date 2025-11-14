import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, prompt } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Limit content length to avoid excessive token usage
    const limitedContent = content.slice(0, 10000);

    // Run the custom prompt against the content
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an experienced writer.',
        },
        {
          role: 'user',
          content: `${prompt}\n\nArticle content:\n\n${limitedContent}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content || '';

    // Log what we're sending back
    console.log('Custom prompt response:', response);

    return res.status(200).json({
      success: true,
      response: response.trim(),
    });
  } catch (error: any) {
    console.error('Error running custom prompt:', error);
    return res.status(500).json({
      error: 'Failed to run custom prompt',
      message: error.message,
    });
  }
}
