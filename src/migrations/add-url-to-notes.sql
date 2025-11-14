-- Add url column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS url TEXT;

-- Add index on url for faster lookups
CREATE INDEX IF NOT EXISTS idx_notes_url ON notes(url);
