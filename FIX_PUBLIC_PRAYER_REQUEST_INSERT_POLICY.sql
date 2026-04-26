-- Fix RLS: allow the public "Need Prayer" form to insert into `prayer_requests`
--
-- Symptom in the app:
--   new row violates row-level security policy for table "prayer_requests"
--
-- The public page `pages/public/NeedPrayer.tsx` inserts with the anon key while unauthenticated.
-- RLS must allow `anon` (and usually `authenticated`) to INSERT, with a safety check on `user_id`.
--
-- Run this in Supabase SQL Editor (as a project owner / postgres role).

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- Replace if you already created a similarly-named policy
DROP POLICY IF EXISTS "Public can insert prayer requests" ON public.prayer_requests;

-- Allow anonymous + authenticated users to create prayer requests
-- - If not logged in: `user_id` must be NULL (prevents spoofing other users' IDs)
-- - If logged in: `user_id` may be NULL or must equal the current user id
CREATE POLICY "Public can insert prayer requests" ON public.prayer_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.role() = 'anon' AND user_id IS NULL) OR
    (auth.role() = 'authenticated' AND (user_id IS NULL OR user_id = auth.uid()))
  );

-- Optional verification
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'prayer_requests' AND cmd = 'INSERT'
ORDER BY policyname;
