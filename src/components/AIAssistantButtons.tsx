import React, { useState } from 'react';
import { MessageCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface AIAssistantButtonsProps {
  onCritic: () => void;
  onRephrase: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function AIAssistantButtons({
  onCritic,
  onRephrase,
  isLoading = false,
  disabled = false
}: AIAssistantButtonsProps) {
  const [activeAction, setActiveAction] = useState<'critic' | 'rephrase' | null>(null);

  const handleCritic = () => {
    setActiveAction('critic');
    onCritic();
  };

  const handleRephrase = () => {
    setActiveAction('rephrase');
    onRephrase();
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleCritic}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isLoading && activeAction === 'critic' ? (
          <Loader2 size={16} className="animate-spin mr-2" />
        ) : (
          <MessageCircle size={16} className="mr-2" />
        )}
        Critic
      </Button>
      
      <Button
        onClick={handleRephrase}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isLoading && activeAction === 'rephrase' ? (
          <Loader2 size={16} className="animate-spin mr-2" />
        ) : (
          <RefreshCw size={16} className="mr-2" />
        )}
        Rephrase
      </Button>
    </div>
  );
}