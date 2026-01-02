-- ============================================
-- QUICK FIX: Add Description Column to team_members
-- ============================================
-- Copy and paste this entire SQL into your Supabase SQL Editor and run it
-- This will add the missing 'description' column to your team_members table

ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS description VARCHAR(300);

-- Verify the column was added (optional - you can run this to check)
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_name = 'team_members' AND column_name = 'description';

