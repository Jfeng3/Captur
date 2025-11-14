import React, { useEffect, useRef } from 'react';
import { RefreshCw, Send, Mic, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeTranscription } from '@/hooks/use-realtime-transcription';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface TextEditorProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onCritic?: () => void;
  onRephrase?: () => void;
  onApplyStyle?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  wordCount?: number;
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  group: 'ai' | 'action';
}

export function TextEditor({ 
  placeholder = "What's in your mind?",
  value = '',
  onChange,
  onSubmit,
  onCritic,
  onRephrase,
  onApplyStyle,
  disabled = false,
  isLoading = false,
  className,
  wordCount = 0
}: TextEditorProps) {
  const { toast } = useToast();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getText());
    },
  });

  // Real-time transcription
  const baseContentRef = useRef('');
  const { isSupported, isRecording, interimTranscript, error, start, stop } = useRealtimeTranscription({
    onTranscript: (text, isFinal) => {
      console.log('[TextEditor onTranscript] Received:', text, 'isFinal:', isFinal);
      if (isFinal) {
        // Add final transcript to the content
        // Use the base content (before interim) as the starting point
        const baseContent = baseContentRef.current || editor?.getText() || '';
        const separator = baseContent && !baseContent.endsWith(' ') && !baseContent.endsWith('\n') ? ' ' : '';
        const newContent = baseContent + separator + text;
        editor?.commands.setContent(newContent);
        onChange?.(newContent);
        baseContentRef.current = ''; // Reset for next speech segment
      } else {
        // Update with interim transcript (real-time display)
        if (!baseContentRef.current) {
          baseContentRef.current = editor?.getText() || '';
        }
        const separator = baseContentRef.current && !baseContentRef.current.endsWith(' ') && !baseContentRef.current.endsWith('\n') ? ' ' : '';
        const tempContent = baseContentRef.current + separator + text;
        editor?.commands.setContent(tempContent);
      }
    },
    onError: (error) => {
      toast({
        title: 'Transcription Error',
        description: error,
        variant: 'destructive'
      });
    }
  });

  // Sync external value changes with editor
  useEffect(() => {
    if (editor && value !== editor.getText()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const handleSubmit = () => {
    if (editor) {
      onSubmit?.(editor.getText());
    }
  };

  const toolbarButtons: ToolbarButton[] = [
    {
      icon: <RefreshCw className="w-5 h-5" />,
      label: 'Rephrase',
      action: () => onRephrase?.(),
      group: 'ai'
    },
    {
      icon: isRecording ? 
        <Square className="w-5 h-5 text-red-500 animate-pulse" /> : 
        <Mic className="w-5 h-5" />,
      label: isRecording ? 'Stop recording' : 'Start recording',
      action: () => {
        if (!isSupported) {
          toast({ 
            title: 'Speech not supported', 
            description: 'Your browser does not support speech recognition.',
            variant: 'destructive'
          });
          return;
        }
        if (isRecording) {
          stop();
        } else {
          start();
        }
      },
      group: 'ai'
    }
  ];

  return (
    <div className={cn(
      "w-full rounded-lg border-2 bg-white transition-all duration-300",
      isRecording ? "border-red-400 shadow-lg shadow-red-100" : "border-[#75E6DA]",
      className
    )}>
      <EditorContent 
        editor={editor} 
        className="text-[#202124]"
      />
      
      {isRecording && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-red-600 font-medium">Recording... Speak now</span>
          {interimTranscript && (
            <span className="text-sm text-gray-500 italic ml-2">"{interimTranscript}"</span>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between p-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          {toolbarButtons.map((button, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={button.action}
              disabled={disabled || (button.label === 'Rephrase' ? (isLoading || !editor?.getText().trim()) : false)}
              className="h-9 w-9 p-0 hover:bg-[#D4F1F4] text-gray-600 hover:text-[#05445E]"
              title={button.label}
            >
              {button.icon}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`text-sm ${wordCount > 300 ? 'text-red-500' : 'text-[#71717A]'}`}>
            {wordCount}/300 words
          </div>
          <Button
            onClick={handleSubmit}
            size="sm"
            disabled={disabled || !editor?.getText().trim()}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}