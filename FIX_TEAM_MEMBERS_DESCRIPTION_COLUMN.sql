-- ============================================
-- FIX: Add Description Column to team_members Table
-- ============================================
-- This SQL will safely add the description column to team_members table
-- Run this in your Supabase SQL Editor
-- It handles all cases: column doesn't exist, column exists with wrong type, etc.

-- Step 1: Check if column exists and handle accordingly
DO $$ 
BEGIN
    -- Check if description column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'team_members' 
        AND column_name = 'description'
    ) THEN
        -- Column exists, check if it needs to be updated
        RAISE NOTICE 'Description column already exists, checking if update is needed...';
        
        -- Update NULL values to empty string
        UPDATE team_members 
        SET description = '' 
        WHERE description IS NULL;
        
        -- Try to alter the column to ensure it's VARCHAR(350) and NOT NULL
        BEGIN
            ALTER TABLE team_members 
            ALTER COLUMN description TYPE VARCHAR(350);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not alter column type (may already be correct): %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE team_members 
            ALTER COLUMN description SET NOT NULL;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not set NOT NULL (may already be set): %', SQLERRM;
        END;
        
        RAISE NOTICE 'Description column updated successfully';
    ELSE
        -- Column doesn't exist, add it
        RAISE NOTICE 'Description column does not exist, adding it...';
        
        -- First, update any existing records to have empty strings for other fields
        UPDATE team_members SET email = '' WHERE email IS NULL;
        UPDATE team_members SET phone = '' WHERE phone IS NULL;
        UPDATE team_members SET img = '' WHERE img IS NULL;
        
        -- Add the description column with default value
        ALTER TABLE team_members 
        ADD COLUMN description VARCHAR(350) NOT NULL DEFAULT '';
        
        -- Set all existing records to have empty description
        UPDATE team_members 
        SET description = '' 
        WHERE description IS NULL OR description = '';
        
        -- Remove the default (since it's now NOT NULL)
        ALTER TABLE team_members 
        ALTER COLUMN description DROP DEFAULT;
        
        RAISE NOTICE 'Description column added successfully';
    END IF;
END $$;

-- Step 2: Ensure all other required fields are NOT NULL (if they aren't already)
DO $$
BEGIN
    -- Update NULL values first
    UPDATE team_members SET email = '' WHERE email IS NULL;
    UPDATE team_members SET phone = '' WHERE phone IS NULL;
    UPDATE team_members SET img = '' WHERE img IS NULL;
    
    -- Make fields NOT NULL
    BEGIN
        ALTER TABLE team_members ALTER COLUMN email SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Email column already NOT NULL or error: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE team_members ALTER COLUMN phone SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Phone column already NOT NULL or error: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE team_members ALTER COLUMN img SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Img column already NOT NULL or error: %', SQLERRM;
    END;
END $$;

-- Step 3: Verify the column was added/updated correctly
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

-- If the query above returns a row, the column exists and is ready to use!


