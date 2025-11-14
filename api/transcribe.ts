import { VercelRequest, VercelResponse } from '@vercel/node';
import { transcribeAudio } from './openai-service.js';

const handler = async (
  req: VercelRequest,
  res: VercelResponse
) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get filename from headers
    const filename = req.headers['x-filename'] as string || 'audio.wav';
    
    // Get the audio data as buffer
    const audioBuffer = Buffer.from(req.body);
    
    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(400).json({ 
        error: 'No audio data provided' 
      });
    }

    // Call transcription service
    const text = await transcribeAudio(audioBuffer, filename);
    
    // Return successful response
    res.status(200).json({ text });
  } catch (error) {
    console.error('Transcription endpoint error:', error);
    
    // Return appropriate error message
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ 
      error: errorMessage,
      message: 'Failed to transcribe audio'
    });
  }
};

export default handler;