-- Hold Access: distinct from pending first-time approval.
-- Applied remotely as migration add_users_is_access_held.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_access_held boolean NOT NULL DEFAULT false;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS access_held_at timestamptz;

COMMENT ON COLUMN public.users.is_access_held IS 'When true, website access is on hold for security. Distinct from pending first-time approval.';
COMMENT ON COLUMN public.users.access_held_at IS 'When website access was placed on hold.';
