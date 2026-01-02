-- ============================================
-- QUICK FIX: Add Description Column and Make All Fields Required
-- ============================================
-- Copy and paste this entire SQL into your Supabase SQL Editor and run it
-- This will:
-- 1. Add the missing 'description' column
-- 2. Make all fields required (NOT NULL)

-- Step 1: Add description column if it doesn't exist (350 characters, required)
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS description VARCHAR(350) NOT NULL DEFAULT '';

-- Step 2: Update existing NULL values to empty strings
UPDATE team_members SET email = '' WHERE email IS NULL;
UPDATE team_members SET phone = '' WHERE phone IS NULL;
UPDATE team_members SET img = '' WHERE img IS NULL;
UPDATE team_members SET description = '' WHERE description IS NULL;

-- Step 3: Make all fields NOT NULL
ALTER TABLE team_members 
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN phone SET NOT NULL,
ALTER COLUMN img SET NOT NULL,
ALTER COLUMN description SET NOT NULL;

-- Step 4: Remove default values
ALTER TABLE team_members 
ALTER COLUMN email DROP DEFAULT,
ALTER COLUMN phone DROP DEFAULT,
ALTER COLUMN img DROP DEFAULT,
ALTER COLUMN description DROP DEFAULT;

