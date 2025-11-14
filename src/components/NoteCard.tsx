import React, { useState } from 'react';
import { MoreVertical, Sparkles, Edit3, Trash2, Copy, Target, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Note } from '@/api/notes';

interface NoteCardProps {
  note: Note;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onActivate?: () => void;
  difficultVocabularies?: string[];
  onVocabularyCheck?: (vocabulary: string) => void;
}

export function NoteCard({ note, isExpanded, onToggleExpand, onEdit, onDelete, onActivate, difficultVocabularies = [], onVocabularyCheck }: NoteCardProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content);
  };

  // Parse content into sections matching StickyNotes.ts format
  const parseContentSections = (content: string) => {
    const sections = {
      keyTakeaways: [] as string[],
      reflections: [] as string[],
      markedSentences: [] as string[]
    };

    // Split content by markdown headers
    const lines = content.split('\n');
    let currentSection: 'keyTakeaways' | 'reflections' | 'markedSentences' | 'url' | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Detect section headers (# Header format from StickyNotes.ts)
      if (line.match(/^#\s*URL$/i)) {
        currentSection = 'url';
        continue;
      } else if (line.match(/^#\s*Key\s*Takeaways$/i)) {
        currentSection = 'keyTakeaways';
        continue;
      } else if (line.match(/^#\s*Reflections?$/i)) {
        currentSection = 'reflections';
        continue;
      } else if (line.match(/^#\s*Marked\s*Sentences$/i)) {
        currentSection = 'markedSentences';
        continue;
      } else if (line.match(/^##\s*/)) {
        // Subsection within Marked Sentences
        continue;
      } else if (line.match(/^#\s*Skills$/i)) {
        // Skip skills section
        currentSection = null;
        continue;
      }

      // Skip URL section content
      if (currentSection === 'url') continue;

      // Add content to appropriate section
      if (currentSection === 'keyTakeaways') {
        // Extract numbered or bulleted items
        if (line.match(/^\d+\.\s*/)) {
          sections.keyTakeaways.push(line.replace(/^\d+\.\s*/, ''));
        } else if (line.match(/^[-*•]\s*/)) {
          sections.keyTakeaways.push(line.replace(/^[-*•]\s*/, ''));
        }
      } else if (currentSection === 'reflections') {
        // Extract numbered or bulleted items
        if (line.match(/^\d+\.\s*/)) {
          sections.reflections.push(line.replace(/^\d+\.\s*/, ''));
        } else if (line.match(/^[-*•]\s*/)) {
          sections.reflections.push(line.replace(/^[-*•]\s*/, ''));
        }
      } else if (currentSection === 'markedSentences') {
        // Extract bulleted items (marked sentences use bullets)
        if (line.match(/^[-*•]\s*/)) {
          sections.markedSentences.push(line.replace(/^[-*•]\s*/, ''));
        }
      }
    }

    return sections;
  };

  const sections = parseContentSections(note.content);

  // Get source URL from note.url field instead of parsing from content
  const sourceUrl = note.url || null;
  const hasUrl = !!sourceUrl;

  // Calculate if content needs expansion
  const totalWords = note.content.trim().split(/\s+/).length;
  const contentNeedsExpansion = totalWords > 300;

  return (
    <div
      className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
    >
      {/* Header with tag, date, link, and actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {note.tag}
          </Badge>
        </div>

        {/* Right side: Date, Link, and Actions */}
        <div className="flex items-center gap-2">
          {/* Timestamp */}
          <span className="text-xs text-gray-500">
            {formatDate(note.createdAt)}
          </span>

          {/* Link */}
          {hasUrl && sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              <span>link</span>
            </a>
          )}

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onActivate && (
                <>
                  <DropdownMenuItem onClick={onActivate} className="text-blue-600">
                    <Target className="mr-2 h-4 w-4" />
                    Activate Vocabulary
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={onEdit}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content sections */}
      <div className="space-y-4">
        {/* Key Takeaways Section */}
        <div>
          <h3 className="font-bold text-sm text-gray-900 mb-2">Key Takeaways</h3>
          {sections.keyTakeaways.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {sections.keyTakeaways.map((takeaway, index) => (
                <li key={index} className="text-sm text-gray-700 leading-relaxed">
                  {takeaway}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No takeaways yet</p>
          )}
        </div>

        {/* Reflections Section */}
        <div>
          <h3 className="font-bold text-sm text-gray-900 mb-2">Reflections</h3>
          {sections.reflections.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {sections.reflections.map((reflection, index) => (
                <li key={index} className="text-sm text-gray-700 leading-relaxed">
                  {reflection}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No reflections yet</p>
          )}
        </div>

        {/* Marked Sentences Section */}
        <div>
          <h3 className="font-bold text-sm text-gray-900 mb-2">Marked Sentences</h3>
          {sections.markedSentences.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {sections.markedSentences.map((sentence, index) => (
                <li key={index} className="text-sm text-gray-700 leading-relaxed">
                  {sentence}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No marked sentences yet</p>
          )}
        </div>

        {/* Difficult Vocabularies Section */}
        {difficultVocabularies && difficultVocabularies.length > 0 && (
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-2">Difficult Vocabularies</h3>
            <div className="space-y-2">
              {difficultVocabularies.map((vocab, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vocab-${note.id}-${index}`}
                    onCheckedChange={(checked) => {
                      if (checked && onVocabularyCheck) {
                        onVocabularyCheck(vocab);
                      }
                    }}
                  />
                  <label
                    htmlFor={`vocab-${note.id}-${index}`}
                    className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {vocab}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Show More/Less Button */}
      {contentNeedsExpansion && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show more
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
