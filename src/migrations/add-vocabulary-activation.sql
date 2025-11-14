-- Migration: Add Active vs Passive Vocabulary Tracking
-- Created: 2025-10-21

-- Create vocabulary_status table for tracking passive vs active vocabulary
CREATE TABLE IF NOT EXISTS vocabulary_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'passive' CHECK (status IN ('passive', 'active')),
  activation_score INTEGER DEFAULT 0 CHECK (activation_score >= 0 AND activation_score <= 100),
  last_activation_date TIMESTAMPTZ,
  activation_count INTEGER DEFAULT 0,
  user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(note_id)
);

-- Create activation_exercises table for tracking exercise completions
CREATE TABLE IF NOT EXISTS activation_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('write_sentences', 'fill_blank', 'email_completion', 'scenario')),
  user_response TEXT NOT NULL,
  is_correct BOOLEAN,
  feedback TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vocabulary_status_note_id ON vocabulary_status(note_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_status_user_id ON vocabulary_status(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_status_status ON vocabulary_status(status);
CREATE INDEX IF NOT EXISTS idx_activation_exercises_note_id ON activation_exercises(note_id);
CREATE INDEX IF NOT EXISTS idx_activation_exercises_user_id ON activation_exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_activation_exercises_completed_at ON activation_exercises(completed_at DESC);

-- Create updated_at trigger for vocabulary_status
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vocabulary_status_updated_at
  BEFORE UPDATE ON vocabulary_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE vocabulary_status IS 'Tracks whether vocabulary notes are passive (recognized) or active (can be used)';
COMMENT ON TABLE activation_exercises IS 'Records vocabulary activation exercises completed by users';
COMMENT ON COLUMN vocabulary_status.activation_score IS 'Score from 0-100 indicating how well vocabulary has been activated';
COMMENT ON COLUMN vocabulary_status.activation_count IS 'Number of times user has practiced using this vocabulary';
