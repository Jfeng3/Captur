import { useCallback, useEffect, useRef, useState } from 'react';

interface UseRealtimeTranscriptionOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useRealtimeTranscription(options: UseRealtimeTranscriptionOptions = {}) {
  const { onTranscript, onError } = options;
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  
  // Update refs when callbacks change
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);
  
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  
  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    setIsSupported(!!SpeechRecognition);
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    // Create recognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      let interimText = '';
      let finalText = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }
      
      if (finalText) {
        console.log('[Final text] Calling onTranscript with:', finalText);
        setInterimTranscript('');
        onTranscriptRef.current?.(finalText, true);
      } else if (interimText) {
        setInterimTranscript(interimText);
        onTranscriptRef.current?.(interimText, false);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking louder.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was stopped.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Please check your microphone.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not allowed.';
          break;
      }
      
      setError(errorMessage);
      onErrorRef.current?.(errorMessage);
      setIsRecording(false);
      setInterimTranscript('');
    };
    
    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript('');
    };
    
    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []); // Empty dependency array - setup only once

  const start = useCallback(async () => {
    if (!recognitionRef.current || !isSupported) {
      setError('Speech recognition not supported');
      return;
    }
    
    if (isRecording) {
      return; // Already recording
    }
    
    setError(null);
    setInterimTranscript('');
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start recording');
    }
  }, [isSupported, isRecording]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      // Immediately update state without waiting for onend event
      setIsRecording(false);
      setInterimTranscript('');
      // Use abort() for immediate termination instead of stop()
      recognitionRef.current.abort();
    }
  }, []);

  return {
    isSupported,
    isRecording,
    interimTranscript,
    error,
    start,
    stop
  };
}