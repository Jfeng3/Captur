import React, { useState, useRef, useEffect } from 'react';
import { useNotesStore } from '../stores/notesStore';
import { Plus } from 'lucide-react';

interface HashtagTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

export const HashtagTextarea: React.FC<HashtagTextareaProps> = ({
  value,
  onChange,
  placeholder = "Start writing your note...",
  className = "",
  maxLength = 1500
}) => {
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [hashtagStart, setHashtagStart] = useState(-1);
  const [filterText, setFilterText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { weeklyTags, canCreateNewTag, createNewTag } = useNotesStore();

  const availableTags = [weeklyTags.tag1, weeklyTags.tag2].filter(tag => tag);

  // Auto-expand functionality
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the actual scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight to fit content
      textarea.style.height = `${Math.max(textarea.scrollHeight, 128)}px`; // 128px = h-32 (8rem)
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    onChange(newValue);
    
    // Adjust textarea height after content change
    setTimeout(() => adjustTextareaHeight(), 0);
    
    // Check for hashtag trigger
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const hashtagMatch = textBeforeCursor.match(/#([a-zA-Z0-9]*)$/);
    
    if (hashtagMatch) {
      const hashtagStartPos = cursorPosition - hashtagMatch[0].length;
      setHashtagStart(hashtagStartPos);
      setFilterText(hashtagMatch[1]);
      setShowTagDropdown(true);
      
      // Calculate dropdown position
      const textarea = textareaRef.current;
      if (textarea) {
        const rect = textarea.getBoundingClientRect();
        const lineHeight = 24; // Approximate line height
        const charWidth = 8; // Approximate character width
        
        // Simple position calculation
        const lines = textBeforeCursor.split('\n').length - 1;
        const lastLineLength = textBeforeCursor.split('\n').pop()?.length || 0;
        
        setDropdownPosition({
          top: rect.top + (lines * lineHeight) + 40,
          left: rect.left + (lastLineLength * charWidth)
        });
      }
    } else {
      setShowTagDropdown(false);
      setHashtagStart(-1);
      setFilterText('');
    }
  };

  const handleTagSelect = (tag: string) => {
    if (hashtagStart >= 0) {
      const currentCursorPos = textareaRef.current?.selectionStart || 0;
      const beforeHashtag = value.substring(0, hashtagStart);
      const afterCursor = value.substring(currentCursorPos);
      const newValue = beforeHashtag + `#${tag} ` + afterCursor;
      
      onChange(newValue);
      setShowTagDropdown(false);
      setHashtagStart(-1);
      setFilterText('');
      
      // Focus back to textarea
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = hashtagStart + tag.length + 2;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const handleCreateNewTag = async () => {
    if (filterText.trim() && canCreateNewTag()) {
      const success = await createNewTag(filterText.trim());
      if (success) {
        handleTagSelect(filterText.trim());
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showTagDropdown && (e.key === 'Escape' || e.key === 'Tab')) {
      setShowTagDropdown(false);
      setHashtagStart(-1);
      setFilterText('');
    }
  };

  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border border-[#E5E5EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none overflow-hidden ${className}`}
        style={{ minHeight: '128px' }}
        maxLength={maxLength}
      />
      
      {showTagDropdown && (
        <div 
          className="fixed z-50 bg-white border border-[#E5E5EA] rounded-lg shadow-sm py-2 min-w-[140px]"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left
          }}
        >
          {filteredTags.map((tag, index) => (
            <button
              key={index}
              onClick={() => handleTagSelect(tag)}
              className="w-full px-4 py-2 text-left hover:bg-[#fffef9] text-sm text-black"
            >
              #{tag}
            </button>
          ))}
          {filterText.trim() && !availableTags.some(tag => tag.toLowerCase() === filterText.toLowerCase()) && canCreateNewTag() && (
            <button
              onClick={handleCreateNewTag}
              className="w-full px-4 py-2 text-left hover:bg-[#fffef9] text-sm text-black border-t border-[#E5E5EA] flex items-center gap-2"
            >
              <Plus className="w-3 h-3" />
              Create "#{filterText}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};