-- Member profile & registration fields for team_members (directory)
-- Run in Supabase SQL Editor after backup.

-- 1) Profile type + staff job title
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS profile_type TEXT NOT NULL DEFAULT 'staff';

ALTER TABLE team_members
  DROP CONSTRAINT IF EXISTS team_members_profile_type_check;

ALTER TABLE team_members
  ADD CONSTRAINT team_members_profile_type_check
  CHECK (profile_type IN ('staff', 'attendee', 'member'));

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS staff_role TEXT;

-- 2) Baptism + membership (members only in the app; nullable in DB for migration)
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS is_baptised BOOLEAN;

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS baptism_date DATE;

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS membership_start_date DATE;

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS has_membership_chip BOOLEAN NOT NULL DEFAULT false;

-- 3) Chip only allowed for actual members
ALTER TABLE team_members
  DROP CONSTRAINT IF EXISTS team_members_membership_chip_only_members;

ALTER TABLE team_members
  ADD CONSTRAINT team_members_membership_chip_only_members
  CHECK (NOT has_membership_chip OR profile_type = 'member');

-- 4) Backfill profile_type + staff_role from legacy `role` column
UPDATE team_members
SET profile_type = 'attendee'
WHERE lower(trim(role)) = 'attendee';

UPDATE team_members
SET profile_type = 'member'
WHERE lower(trim(role)) = 'member';

UPDATE team_members
SET staff_role = role
WHERE profile_type = 'staff' AND (staff_role IS NULL OR staff_role = '');

UPDATE team_members
SET staff_role = NULL
WHERE profile_type IN ('attendee', 'member');

-- 5) Clear invalid chips for non-members (safety)
UPDATE team_members
SET has_membership_chip = false
WHERE profile_type <> 'member';
