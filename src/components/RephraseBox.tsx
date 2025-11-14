import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2 } from 'lucide-react';
import { getPhraseBank, type PhraseSuggestion } from '@/api/openai';

interface RephraseBoxProps {
  rephraseResponse: {
    rephrased?: string;
    alternatives?: string[];
    wordCount?: number;
  } | null;
  isLoading: boolean;
  onApply: (content: string) => void;
  onClose: () => void;
  originalText: string;
  onPartialApply?: (content: string) => void;
  baseText?: string; // the current editor text to apply partial swaps on
}

export function RephraseBox({ rephraseResponse, isLoading, onApply, onClose, originalText, onPartialApply, baseText }: RephraseBoxProps) {
  if (!rephraseResponse && !isLoading) return null;


  return (
    <div className="space-y-3 animate-in slide-in-from-right-2">
      {isLoading ? (
        <div className="w-full rounded-lg border-2 border-[#75E6DA] bg-white">
          <div className="p-4 flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#05445E]" />
            <span className="text-sm text-[#71717A]">Generating rephrase suggestions...</span>
          </div>
        </div>
      ) : (
        <>
          {rephraseResponse?.rephrased && (
            <div className="w-full rounded-lg border-2 border-[#75E6DA] bg-white">
              <div className="prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 text-[#202124]">
                <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">
                  {rephraseResponse.rephrased}
                </p>
              </div>
              
              <div className="flex items-center justify-between p-3 border-t border-gray-100">
                <span className="text-xs text-[#71717A]">
                  {rephraseResponse.wordCount || rephraseResponse.rephrased.split(/\s+/).filter(w => w).length} words
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      onApply(rephraseResponse.rephrased!);
                      onClose();
                    }}
                    size="sm"
                    className="bg-[#05445E] hover:bg-[#189AB4] text-white"
                  >
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Native Phrase Bank */}
          {rephraseResponse?.rephrased && (
            <PhraseBankSection 
              originalText={originalText}
              rephrasedText={rephraseResponse.rephrased}
              baseText={baseText || originalText}
              onApplyPartial={onPartialApply || onApply} 
            />
          )}

          {rephraseResponse?.alternatives && rephraseResponse.alternatives.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-[#71717A] px-1">Alternative options:</h4>
              {rephraseResponse.alternatives.map((alternative, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <p className="text-sm text-black leading-relaxed mb-2">
                    {alternative}
                  </p>
                  <Button
                    onClick={() => {
                      onApply(alternative);
                      onClose();
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-[#05445E] hover:text-[#189AB4]"
                  >
                    Use This
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface PhraseBankSectionProps {
  originalText: string;
  rephrasedText: string;
  baseText: string;
  onApplyPartial: (updated: string) => void;
}

function PhraseBankSection({ originalText, rephrasedText, baseText, onApplyPartial }: PhraseBankSectionProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PhraseSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await getPhraseBank(originalText, rephrasedText);
        if (!cancelled) setSuggestions(items);
      } catch (e) {
        if (!cancelled) setError('Failed to load phrase suggestions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [originalText, rephrasedText]);

  if (loading) {
    return (
      <Card className="border-[#E5E5EA]">
        <CardContent className="p-3 flex items-center text-[#71717A] text-sm">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading Native Phrase Bank...
        </CardContent>
      </Card>
    );
  }

  const isEmpty = !suggestions || suggestions.length === 0;

  const handleReplace = (from: string, to: string) => {
    if (!from || !to) return;
    // Replace against the current base text (what user sees/edits now)
    const idx = baseText.indexOf(from);
    if (idx === -1) return;
    const updated = baseText.slice(0, idx) + to + baseText.slice(idx + from.length);
    onApplyPartial(updated);
  };

  return (
    <Card className="border-[#E5E5EA]">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-[#05445E]" />
          <h4 className="text-sm font-medium text-black">Native Phrase Bank</h4>
        </div>
        {isEmpty ? (
          <div className="text-xs text-[#71717A] px-1">No native phrase suggestions found for this text.</div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg p-2 bg-gray-50">
                <div className="min-w-0">
                  <div className="text-sm text-black truncate"><span className="font-medium">{s.from}</span> → {s.to}</div>
                  {s.reason && (
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-xs">{s.reason}</Badge>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#05445E] hover:text-[#189AB4]"
                  onClick={() => handleReplace(s.from, s.to)}
                  title="Replace this phrase"
                >
                  Replace
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
