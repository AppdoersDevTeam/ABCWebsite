-- ============================================
-- ADD DESCRIPTION COLUMN - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================
-- Copy this ENTIRE block and paste into Supabase SQL Editor, then click RUN

-- Step 1: Add the column (if it doesn't exist) with a default value
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS description VARCHAR(350) DEFAULT '';

-- Step 2: Update any existing NULL values to empty string
UPDATE team_members 
SET description = '' 
WHERE description IS NULL;

-- Step 3: Make the column NOT NULL (required)
ALTER TABLE team_members 
ALTER COLUMN description SET NOT NULL;

-- Step 4: Remove the default value (since it's now required)
ALTER TABLE team_members 
ALTER COLUMN description DROP DEFAULT;

-- Step 5: Verify it worked (you should see a row with description column)
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'team_members' 
AND column_name = 'description';

-- If the query above returns a row showing:
-- - column_name: description
-- - data_type: character varying  
-- - character_maximum_length: 350
-- - is_nullable: NO
-- Then it worked! The description column is now ready to use.
