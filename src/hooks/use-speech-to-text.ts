import { useCallback, useEffect, useRef, useState } from 'react';
import { transcribeAudio } from '@/api/openai';

interface UseSpeechToTextOptions {
  lang?: string;
  interim?: boolean;
  continuous?: boolean;
  onFinal?: (text: string) => void;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { lang = 'en-US', interim = true, continuous = false, onFinal } = options;
  const recognitionRef = useRef<any | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const mimeRef = useRef<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [interimText, setInterimText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const SR = (window as any).webkitSpeechRecognition;
    // Prefer MediaRecorder + server transcription when available
    setIsSupported(!!(navigator.mediaDevices && window.MediaRecorder));
    // Cleanup
    return () => {
      try { recognitionRef.current?.stop?.(); } catch {}
      recognitionRef.current = null;
      try { mediaRecorderRef.current?.stop(); } catch {}
      mediaRecorderRef.current = null;
    };
  }, [lang, interim, continuous, onFinal]);

  const start = useCallback(() => {
    setError(null);
    setInterimText('');
    chunksRef.current = [];
    // Choose best supported mime type that OpenAI accepts
    // Prefer WebM Opus for best compatibility with OpenAI transcription
    // Try multiple types, fallback automatically
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mpeg'];
    const chosen = candidates.find(t => (window as any).MediaRecorder && (window as any).MediaRecorder.isTypeSupported && (window as any).MediaRecorder.isTypeSupported(t)) || '';
    mimeRef.current = chosen || '';

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const options = mimeRef.current ? { mimeType: mimeRef.current } as MediaRecorderOptions : undefined;
      const mr = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const type = mimeRef.current || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        if (blob.size < 2000) {
          setError('Recording too short or silent');
        }
        try {
          const text = await transcribeAudio(blob);
          if (text && onFinal) onFinal(text);
        } catch (e) {
          setError('Transcription failed');
        } finally {
          setIsRecording(false);
          setInterimText('');
        }
      };
      mr.start();
      setIsRecording(true);
    }).catch(() => {
      setError('Microphone permission denied');
    });
  }, []);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  }, []);

  return { isSupported, isRecording, interimText, error, start, stop };
}


