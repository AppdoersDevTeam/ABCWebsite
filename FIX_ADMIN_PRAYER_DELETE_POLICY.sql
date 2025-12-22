-- Fix RLS Policy for Admins to Edit and Delete Prayer Requests
-- This allows admins to edit and permanently delete prayer requests from the database
-- Run this in Supabase SQL Editor

-- Drop existing admin policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can update prayer requests" ON prayer_requests;
DROP POLICY IF EXISTS "Admins can delete prayer requests" ON prayer_requests;
DROP POLICY IF EXISTS "Admins can delete prayer counts" ON prayer_counts;

-- Policy: Admins can update any prayer request
-- This allows admins to edit any prayer request (users can still edit their own via existing policy)
CREATE POLICY "Admins can update prayer requests" ON prayer_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_approved = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_approved = true
    )
  );

-- Policy: Admins can delete any prayer request
-- This allows admins to permanently delete prayer requests from the database
CREATE POLICY "Admins can delete prayer requests" ON prayer_requests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_approved = true
    )
  );

-- Policy: Admins can delete prayer counts
-- This allows admins to delete prayer counts when deleting prayer requests
-- (Note: CASCADE should handle this automatically, but explicit permission is good)
CREATE POLICY "Admins can delete prayer counts" ON prayer_counts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_approved = true
    )
  );

-- Verify policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('prayer_requests', 'prayer_counts')
  AND cmd IN ('UPDATE', 'DELETE')
ORDER BY tablename, cmd, policyname;

