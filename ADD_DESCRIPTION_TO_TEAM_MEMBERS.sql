-- Add Description column to team_members table
-- Maximum 300 characters
-- Run this SQL in your Supabase SQL Editor

-- Check if column exists and add it if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'team_members' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE team_members 
        ADD COLUMN description VARCHAR(300);
        
        RAISE NOTICE 'Description column added successfully';
    ELSE
        RAISE NOTICE 'Description column already exists';
    END IF;
END $$;

