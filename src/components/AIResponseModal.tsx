import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

interface AIResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'critic';
  response: {
    feedback?: string;
    suggestions?: string[];
    score?: number;
  };
  isLoading?: boolean;
}

export default function AIResponseModal({
  isOpen,
  onClose,
  type,
  response,
  isLoading = false
}: AIResponseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            AI Critic Feedback
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <span className="ml-3 text-[#71717A]">Analyzing your content...</span>
            </div>
          ) : (
            <>
              {type === 'critic' && (
                <div className="space-y-4">
                  {response.score && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-sm text-black">
                        Quality Score: <Badge variant="secondary">{response.score}/100</Badge>
                      </span>
                    </div>
                  )}
                  
                  {response.feedback && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Feedback:</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-black leading-relaxed">
                          {response.feedback}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {response.suggestions && response.suggestions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Key Suggestions:</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {response.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-black">
                              <AlertCircle size={14} className="text-[#71717A] mt-0.5 flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

            </>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}