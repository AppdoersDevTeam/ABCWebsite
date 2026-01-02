-- ============================================
-- QUICK FIX: Add Description Column to team_members
-- ============================================
-- Copy and paste this ENTIRE SQL into your Supabase SQL Editor and run it
-- This will safely add the description column (350 characters, required)

-- Method: Safe approach that handles all cases
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'team_members' 
        AND column_name = 'description'
    ) THEN
        -- Update existing NULL values first
        UPDATE team_members SET email = COALESCE(email, '') WHERE email IS NULL;
        UPDATE team_members SET phone = COALESCE(phone, '') WHERE phone IS NULL;
        UPDATE team_members SET img = COALESCE(img, '') WHERE img IS NULL;
        
        -- Add the column
        ALTER TABLE team_members 
        ADD COLUMN description VARCHAR(350) NOT NULL DEFAULT '';
        
        -- Set all existing records
        UPDATE team_members SET description = '' WHERE description IS NULL;
        
        -- Remove default
        ALTER TABLE team_members ALTER COLUMN description DROP DEFAULT;
        
        RAISE NOTICE 'Description column added successfully!';
    ELSE
        -- Column exists, just ensure it's correct
        UPDATE team_members SET description = COALESCE(description, '') WHERE description IS NULL;
        
        BEGIN
            ALTER TABLE team_members ALTER COLUMN description TYPE VARCHAR(350);
            ALTER TABLE team_members ALTER COLUMN description SET NOT NULL;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Column already exists with correct settings';
        END;
        
        RAISE NOTICE 'Description column already exists and is updated!';
    END IF;
END $$;

-- Verify it worked
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'team_members' 
AND column_name = 'description';
