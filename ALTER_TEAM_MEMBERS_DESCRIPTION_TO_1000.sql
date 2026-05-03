-- ============================================
-- Widen team_members.description to 1000 characters
-- ============================================
-- Run once in Supabase SQL Editor after deploying the admin UI change.
-- Without this, inserts/updates over 350 chars may fail if the column is still VARCHAR(350).

ALTER TABLE public.team_members
  ALTER COLUMN description TYPE VARCHAR(1000);

-- Verify
SELECT column_name, character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'team_members'
  AND column_name = 'description';
