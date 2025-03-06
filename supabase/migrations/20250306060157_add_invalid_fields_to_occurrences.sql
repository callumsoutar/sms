-- Add is_invalid and invalid_reason fields to occurrences table
ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS is_invalid BOOLEAN DEFAULT FALSE;
ALTER TABLE occurrences ADD COLUMN IF NOT EXISTS invalid_reason TEXT;
