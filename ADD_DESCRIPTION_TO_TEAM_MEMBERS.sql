-- Add Description column to team_members table
-- Maximum 300 characters

ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS description VARCHAR(300);

