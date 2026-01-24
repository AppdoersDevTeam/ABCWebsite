-- ============================================
-- Add Public Read Policy for Team Members
-- ============================================
-- This allows public (unauthenticated) users to read team members
-- Run this in your Supabase SQL Editor

-- Add policy for public read access
CREATE POLICY "Public can read team members" ON team_members
  FOR SELECT USING (true);

-- Note: The existing "Authenticated users can read team members" policy
-- will still work for authenticated users. This new policy allows
-- anyone (including unauthenticated users) to read team members,
-- which is needed for the public About page.
