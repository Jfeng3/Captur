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
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Limit content length to avoid excessive token usage
    const limitedContent = content.slice(0, 10000);

    // Generate essay writing prompts based on the content
    const promptsCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an essay writing coach. Generate 5 thought-provoking questions to help readers critically analyze the content and prepare to write their own essay.

The questions should:
- Guide readers to identify the main argument
- Evaluate evidence and reasoning
- Make connections to other ideas
- Think of real-world examples
- Formulate their own thesis

Keep questions concise and specific to the content provided.`,
        },
        {
          role: 'user',
          content: `Generate 5 essay writing prompts based on this content:\n\n${limitedContent}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 400,
    });

    const promptsText = promptsCompletion.choices[0]?.message?.content || '';

    // Parse the prompts
    const promptLines = promptsText.split('\n').filter(line => line.trim());
    const prompts: string[] = [];

    for (const line of promptLines) {
      // Match lines starting with numbers or bullet points
      const match = line.match(/^(?:\d+\.?|[-•*])\s*(.+)$/);
      if (match && prompts.length < 5) {
        prompts.push(match[1].trim());
      }
    }

    // Fallback if parsing fails
    if (prompts.length === 0) {
      prompts.push(
        'What is the author\'s main argument? Do you agree or disagree?',
        'What evidence was most convincing? What was missing?',
        'How does this connect to other ideas you\'ve encountered?',
        'What real-world example could you use to illustrate this point?',
        'If you were writing about this topic, what would your thesis be?'
      );
    }

    const finalPrompts = prompts.slice(0, 5);

    // Log what we're sending back
    console.log('Final Prompts:', finalPrompts);

    return res.status(200).json({
      success: true,
      prompts: finalPrompts,
    });
  } catch (error: any) {
    console.error('Error generating prompts:', error);
    return res.status(500).json({
      error: 'Failed to generate prompts',
      message: error.message,
    });
  }
}
