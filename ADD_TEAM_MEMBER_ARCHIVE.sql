-- ============================================
-- Add archive support for team_members (Directory / People)
-- ============================================
-- Run this in your Supabase SQL Editor after backup.
--
-- Adds soft-archive columns and updates SELECT policies so archived
-- people are hidden from public and non-admin users.

-- 1) Archive columns
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS archived_by UUID;

-- 2) Replace over-permissive read policies
DROP POLICY IF EXISTS "Public can read team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can read team members" ON team_members;

-- Non-admins (anon + authenticated members) only see active people
CREATE POLICY "Read non-archived team members" ON team_members
  FOR SELECT USING (is_archived = false);

-- Admins can read archived rows too (SELECT policies are OR'd)
CREATE POLICY "Admins can read all team members" ON team_members
  FOR SELECT USING (public.is_admin_user(auth.uid()));

-- Note: "Admins can manage team members" FOR ALL still allows admin insert/update/delete.

-- 3) Verify policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'team_members'
ORDER BY policyname;
