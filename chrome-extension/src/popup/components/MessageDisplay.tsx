import React, { useEffect } from 'react';

interface MessageDisplayProps {
  message: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ 
  message, 
  onDismiss,
  autoDismiss = false,
  dismissDelay = 3000 
}) => {
  useEffect(() => {
    if (message && autoDismiss && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, dismissDelay);

      return () => clearTimeout(timer);
    }
  }, [message, autoDismiss, dismissDelay, onDismiss]);

  if (!message) return null;

  const isError = message.toLowerCase().includes('error');
  
  return (
    <div className={`message ${isError ? 'error' : 'success'}`}>
      {message}
    </div>
  );
};