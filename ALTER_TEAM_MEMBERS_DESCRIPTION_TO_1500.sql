-- ============================================
-- Widen team_members.description to 1500 characters
-- ============================================
-- Run once in Supabase SQL Editor after deploying the admin UI change.
-- Safe if the column is already VARCHAR(1000) or VARCHAR(350); this only increases the limit.

ALTER TABLE public.team_members
  ALTER COLUMN description TYPE VARCHAR(1500);

-- Verify
SELECT column_name, character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'team_members'
  AND column_name = 'description';
