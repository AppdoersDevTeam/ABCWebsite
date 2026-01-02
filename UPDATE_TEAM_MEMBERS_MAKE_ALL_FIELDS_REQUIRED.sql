-- ============================================
-- Update team_members table: Add description and make all fields required
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This will:
-- 1. Add the description column (if it doesn't exist)
-- 2. Make all fields NOT NULL (required)
-- 3. Set default values for existing NULL records

-- Step 1: Add description column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'team_members' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE team_members 
        ADD COLUMN description VARCHAR(350) NOT NULL DEFAULT '';
        
        RAISE NOTICE 'Description column added successfully';
    ELSE
        RAISE NOTICE 'Description column already exists';
    END IF;
END $$;

-- Step 2: Update existing NULL values to default values before making columns NOT NULL
-- Update email NULL values
UPDATE team_members 
SET email = '' 
WHERE email IS NULL;

-- Update phone NULL values
UPDATE team_members 
SET phone = '' 
WHERE phone IS NULL;

-- Update img NULL values
UPDATE team_members 
SET img = '' 
WHERE img IS NULL;

-- Update description NULL values (if column exists and has NULLs)
UPDATE team_members 
SET description = '' 
WHERE description IS NULL;

-- Step 3: Make all fields NOT NULL
ALTER TABLE team_members 
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN phone SET NOT NULL,
ALTER COLUMN img SET NOT NULL,
ALTER COLUMN description SET NOT NULL;

-- Step 4: Remove default values (since they're now required, we don't need defaults)
ALTER TABLE team_members 
ALTER COLUMN email DROP DEFAULT,
ALTER COLUMN phone DROP DEFAULT,
ALTER COLUMN img DROP DEFAULT,
ALTER COLUMN description DROP DEFAULT;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'team_members' 
ORDER BY ordinal_position;

