// All OpenAI functionality now uses backend APIs
// Audio conversion utilities remain client-side

import { apiFetch } from '@/lib/api';

interface CriticResponse {
  feedback: string;
  suggestions: string[];
  score: number;
}

interface RephraseResponse {
  rephrased: string;
  alternatives: string[];
  wordCount: number;
}

export interface PhraseSuggestion {
  from: string;
  to: string;
  reason: string;
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // First attempt: send original blob as-is (preferred)
    const t = (audioBlob as any)?.type || 'audio/webm';
    const ext = t.includes('mp4') ? 'mp4' : t.includes('mpeg') ? 'mp3' : t.includes('webm') ? 'webm' : 'dat';
    
    // Try original format first
    try {
      const response1 = await apiFetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Filename': `audio.${ext}`,
        },
        body: audioBlob,
      });

      if (response1.ok) {
        const data1 = await response1.json();
        const text1 = data1.text || '';
        if (String(text1 || '').trim()) return String(text1).trim();
      }
    } catch (e) {
      // fall through to WAV conversion
    }

    // Fallback: convert to WAV and retry
    const wavBlob = await convertToWav(audioBlob);
    const response2 = await apiFetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Filename': 'audio.wav',
      },
      body: wavBlob,
    });

    if (!response2.ok) {
      const error = await response2.json();
      throw new Error(error.message || 'Failed to transcribe audio');
    }

    const data2 = await response2.json();
    const text2 = data2.text || '';
    return String(text2 || '').trim();
  } catch (error) {
    console.error('Transcription API error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

async function convertToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  // @ts-ignore - webkitAudioContext for Safari
  const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioCtx();
  const audioBuffer: AudioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length * numChannels * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + audioBuffer.length * numChannels * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM
  view.setUint16(20, 1, true); // Linear quantization
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, audioBuffer.length * numChannels * 2, true);

  // Interleave channels and write PCM samples
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  for (let i = 0; i < audioBuffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      // clamp
      sample = Math.max(-1, Math.min(1, sample));
      // convert to 16-bit PCM
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export async function getCriticFeedback(content: string): Promise<CriticResponse> {
  try {
    const response = await apiFetch('/api/critic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get critic feedback');
    }

    const data = await response.json();
    console.log('[API][CriticFeedback] Response:', data);
    
    return data;
  } catch (error) {
    console.error('Critic API error:', error);
    throw new Error('Failed to get critic feedback');
  }
}

export async function getRephraseOptions(content: string): Promise<RephraseResponse> {
  try {
    const response = await apiFetch('/api/rephrase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get rephrase options');
    }

    const data = await response.json();
    console.log('[API][RephraseOptions] Response:', data);
    
    return data;
  } catch (error) {
    console.error('Rephrase API error:', error);
    throw new Error('Failed to get rephrase options');
  }
}

export async function getPhraseBank(original: string, rephrased?: string): Promise<PhraseSuggestion[]> {
  try {
    const response = await apiFetch('/api/phrase-bank', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ original, rephrased }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Phrase bank API error:', error);
      return [];
    }

    const data = await response.json();
    console.log('[API][PhraseBank] Response:', data);
    
    return data.suggestions || [];
  } catch (error) {
    console.error('Phrase bank API error:', error);
    return [];
  }
}

