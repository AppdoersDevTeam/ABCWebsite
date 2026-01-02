-- ============================================
-- ADD DESCRIPTION COLUMN TO team_members TABLE
-- ============================================
-- Copy and paste this ENTIRE script into Supabase SQL Editor and run it
-- This will safely add the description column and make it required

-- Step 1: Add the description column if it doesn't exist
-- First, check if column exists and add it with a default value
DO $$ 
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'team_members' 
        AND column_name = 'description'
    ) THEN
        -- Column doesn't exist, add it with a default value first
        ALTER TABLE team_members 
        ADD COLUMN description VARCHAR(350) DEFAULT '';
        
        -- Update all existing rows to have an empty string
        UPDATE team_members 
        SET description = '' 
        WHERE description IS NULL;
        
        -- Now make it NOT NULL
        ALTER TABLE team_members 
        ALTER COLUMN description SET NOT NULL;
        
        -- Remove the default value
        ALTER TABLE team_members 
        ALTER COLUMN description DROP DEFAULT;
        
        RAISE NOTICE 'Description column added successfully!';
    ELSE
        -- Column exists, but let's make sure it's set up correctly
        -- Update any NULL values
        UPDATE team_members 
        SET description = '' 
        WHERE description IS NULL;
        
        -- Ensure it's the right type and NOT NULL
        BEGIN
            ALTER TABLE team_members 
            ALTER COLUMN description TYPE VARCHAR(350);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Column type is already correct or cannot be changed: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE team_members 
            ALTER COLUMN description SET NOT NULL;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Column is already NOT NULL: %', SQLERRM;
        END;
        
        RAISE NOTICE 'Description column already exists and has been updated!';
    END IF;
END $$;

-- Step 2: Verify the column was added correctly
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'team_members' 
AND column_name = 'description';

-- If you see a row with:
-- column_name: description
-- data_type: character varying
-- character_maximum_length: 350
-- is_nullable: NO
-- Then the column was added successfully!

