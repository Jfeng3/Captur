import { VercelRequest, VercelResponse } from '@vercel/node';
// TEMPORARILY DISABLED - Migrating to Claude Agent SDK
// import Anthropic from '@anthropic-ai/sdk';

const handler = async (
  req: VercelRequest,
  res: VercelResponse
) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // TEMPORARILY DISABLED - Agent workflow being migrated to Claude Agent SDK
  return res.status(503).json({
    error: 'Service temporarily unavailable',
    message: 'Agent workflow is being migrated to Claude Agent SDK'
  });

  // try {
  //   // Validate request body
  //   const { text } = req.body;

  //   console.log('📥 Agent workflow received text:', {
  //     length: text?.length,
  //     preview: text?.substring(0, 100) + (text?.length > 100 ? '...' : '')
  //   });

  //   if (!text || typeof text !== 'string') {
  //     console.error('❌ Invalid text input:', typeof text);
  //     return res.status(400).json({
  //       error: 'Invalid request: text is required and must be a string'
  //     });
  //   }

  //   if (text.trim().length === 0) {
  //     console.error('❌ Empty text received');
  //     return res.status(400).json({
  //       error: 'Text cannot be empty'
  //     });
  //   }

  //   // Initialize Anthropic client
  //   const anthropic = new Anthropic({
  //     apiKey: process.env.ANTHROPIC_API_KEY,
  //   });

  //   console.log('🤖 Running Anthropic agent workflow...');

  //   // Create message with Claude
  //   const message = await anthropic.messages.create({
  //     model: 'claude-sonnet-4-20250514',
  //     max_tokens: 4096,
  //     messages: [
  //       {
  //         role: 'user',
  //         content: text
  //       }
  //     ],
  //     system: 'You are a helpful assistant.'
  //   });

  //   // Extract text from response
  //   const outputText = message.content
  //     .filter((block) => block.type === 'text')
  //     .map((block) => (block as { type: 'text'; text: string }).text)
  //     .join('\n');

  //   if (!outputText) {
  //     console.error('❌ Agent returned no output');
  //     throw new Error("Agent result is undefined");
  //   }

  //   const myAgentResult = {
  //     output_text: outputText
  //   };

  //   console.log('✅ Agent workflow completed successfully:', {
  //     outputLength: myAgentResult.output_text.length,
  //     outputPreview: myAgentResult.output_text.substring(0, 100) + (myAgentResult.output_text.length > 100 ? '...' : '')
  //   });

  //   // Return successful response
  //   res.status(200).json({
  //     success: true,
  //     result: myAgentResult
  //   });
  // } catch (error) {
  //   console.error('Agent workflow endpoint error:', error);

  //   // Return appropriate error message
  //   const errorMessage = error instanceof Error ? error.message : 'Internal server error';
  //   res.status(500).json({
  //     error: errorMessage,
  //     message: 'Failed to process agent workflow request'
  //   });
  // }
};

export default handler;
