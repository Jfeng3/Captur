interface RealtimeHandlers {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export class OpenAIRealtimeService {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private handlers: RealtimeHandlers = {};
  private isRecording = false;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async connect(handlers: RealtimeHandlers) {
    this.handlers = handlers;
    
    return new Promise<void>((resolve, reject) => {
      try {
        // Connect to OpenAI Realtime API
        // Note: Authentication needs to be handled server-side for security
        // This is a client implementation that would need a proxy server
        const wsUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('Connected to OpenAI Realtime API');
          this.handlers.onConnectionChange?.(true);
          
          // Configure transcription session
          this.ws?.send(JSON.stringify({
            type: 'session.update',
            session: {
              modalities: ['text'], // Text output only
              input_audio_transcription: {
                model: 'whisper-1'
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 500
              }
            }
          }));
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'input_audio_transcription.partial':
              // Partial transcript while speaking
              this.handlers.onTranscript?.(data.transcript, false);
              break;
              
            case 'input_audio_transcription.completed':
              // Final transcript when speech segment ends
              this.handlers.onTranscript?.(data.transcript, true);
              break;
              
            case 'error':
              console.error('Realtime API error:', data.error);
              this.handlers.onError?.(data.error.message || 'Unknown error');
              break;
              
            case 'session.created':
              console.log('Session created:', data.session);
              break;
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.handlers.onError?.('Connection error');
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Disconnected from OpenAI Realtime API');
          this.handlers.onConnectionChange?.(false);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }

  async startRecording() {
    if (this.isRecording) return;
    
    try {
      // Get microphone permission
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 24000
        } 
      });
      
      // Create audio context for processing (24kHz to match OpenAI's expected format)
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create processor for capturing audio data
      this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        if (this.ws?.readyState === WebSocket.OPEN && this.isRecording) {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Convert Float32 to PCM16
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          
          // Convert to base64
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
          
          // Send audio data to API
          this.ws.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: base64Audio
          }));
        }
      };
      
      // Connect audio nodes
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      this.isRecording = true;
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.handlers.onError?.('Failed to access microphone');
      throw error;
    }
  }

  stopRecording() {
    if (!this.isRecording) return;
    
    this.isRecording = false;
    
    // Stop audio processing
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    // Commit any pending audio
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'input_audio_buffer.commit'
      }));
    }
  }

  disconnect() {
    this.stopRecording();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}