-- Link Directory people (team_members) to website users (public.users / auth.uid)
-- Safe to re-run (idempotent). Run in Supabase SQL editor.

-- 1) Foreign key column: which auth user this directory row belongs to
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.team_members ADD COLUMN user_id UUID;
  END IF;
END $$;

-- Optional: true when this row was auto-created from login sync (empty directory shell)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'created_from_user_sync'
  ) THEN
    ALTER TABLE public.team_members ADD COLUMN created_from_user_sync BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- FK to users (auth uid matches users.id in this app)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'team_members_user_id_fkey'
  ) THEN
    ALTER TABLE public.team_members
      ADD CONSTRAINT team_members_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- At most one directory row per website user
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_user_id_unique
  ON public.team_members(user_id)
  WHERE user_id IS NOT NULL;

-- Speed lookups by email (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_team_members_email_lower
  ON public.team_members(lower(trim(email)))
  WHERE email IS NOT NULL AND trim(email) <> '';

-- 2) Backfill: unique email match between team_members and users (no user_id set yet)
UPDATE public.team_members tm
SET user_id = u.id
FROM public.users u
WHERE tm.user_id IS NULL
  AND tm.email IS NOT NULL
  AND lower(trim(tm.email)) = lower(trim(u.email))
  AND NOT EXISTS (
    SELECT 1 FROM public.team_members tm2
    WHERE tm2.id <> tm.id
      AND tm2.email IS NOT NULL
      AND lower(trim(tm2.email)) = lower(trim(u.email))
  );

COMMENT ON COLUMN public.team_members.user_id IS 'Links this directory person to public.users.id (Supabase auth user id).';
COMMENT ON COLUMN public.team_members.created_from_user_sync IS 'True if this row was auto-created when the user first logged in (no matching directory person).';
