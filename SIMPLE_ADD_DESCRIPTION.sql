-- ============================================
-- SIMPLE: Add Description Column (Copy & Paste This)
-- ============================================
-- Run this in Supabase SQL Editor - it's the simplest working version

-- Add column with default first
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS description VARCHAR(350) DEFAULT '';

-- Update existing NULL values
UPDATE team_members 
SET description = '' 
WHERE description IS NULL;

-- Make it NOT NULL
ALTER TABLE team_members 
ALTER COLUMN description SET NOT NULL;

-- Remove default
ALTER TABLE team_members 
ALTER COLUMN description DROP DEFAULT;

-- Verify it worked
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'team_members' 
AND column_name = 'description';

