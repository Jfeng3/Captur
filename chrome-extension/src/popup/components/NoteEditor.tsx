import React from 'react';

interface NoteEditorProps {
  title: string;
  note: string;
  selectedText: string;
  onTitleChange: (title: string) => void;
  onNoteChange: (note: string) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  title,
  note,
  selectedText,
  onTitleChange,
  onNoteChange
}) => {
  const wordCount = note.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <>
      {selectedText && (
        <div className="selected-text">
          <small>Selected text captured</small>
        </div>
      )}

      <input
        type="text"
        placeholder="Note title (optional)"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="title-input"
      />

      <textarea
        placeholder="Write your note here..."
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        className="note-textarea"
        rows={8}
        autoFocus
      />

      <div className="word-count">
        {wordCount} / 300 words
      </div>
    </>
  );
};