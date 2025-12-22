-- Fix RLS Policy for Users and Admins to Update Prayer Count
-- This allows authenticated users (including admins) to update the prayer_count field on any prayer request
-- This is needed so users and admins can increment/decrement prayer counts when they pray for requests
-- Run this in Supabase SQL Editor

-- Create a security definer function to check if user is admin (avoids RLS recursion)
-- This function is similar to the one in FIX_ADMIN_RLS_POLICY.sql but checks both email and users table
CREATE OR REPLACE FUNCTION public.is_admin_user_safe(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_email TEXT;
  user_role TEXT;
  user_approved BOOLEAN;
BEGIN
  -- First check email from auth.users (no RLS on auth schema)
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  -- If email matches admin email, allow access
  IF LOWER(COALESCE(user_email, '')) = 'devteam@appdoers.co.nz' THEN
    RETURN true;
  END IF;
  
  -- For other users, try to check users table (this might fail due to RLS, but we'll catch it)
  BEGIN
    SELECT role, is_approved INTO user_role, user_approved
    FROM public.users
    WHERE id = user_id;
    
    IF user_role = 'admin' AND user_approved = true THEN
      RETURN true;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- If we can't check (due to RLS), return false
      RETURN false;
  END;
  
  RETURN false;
END;
$$;

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can update prayer count" ON prayer_requests;

-- Policy: Authenticated users can update prayer_count on any request
-- This allows any authenticated user (including admins) to update the prayer_count field
-- Note: This policy allows UPDATE on the entire row, but the application should only update prayer_count
-- Admins are also authenticated users, so they're covered by this policy
-- We use OR to allow both regular authenticated users and admins
CREATE POLICY "Authenticated users can update prayer count" ON prayer_requests
  FOR UPDATE USING (
    auth.role() = 'authenticated' OR
    public.is_admin_user_safe(auth.uid()) = true
  )
  WITH CHECK (
    auth.role() = 'authenticated' OR
    public.is_admin_user_safe(auth.uid()) = true
  );

-- Also ensure admins can insert/delete prayer_counts (they should be covered by authenticated policies, but let's be explicit)
-- Drop existing admin prayer_counts policies if they exist
DROP POLICY IF EXISTS "Admins can insert prayer counts" ON prayer_counts;
DROP POLICY IF EXISTS "Admins can delete prayer counts for praying" ON prayer_counts;

-- Policy: Admins can insert prayer counts (in addition to authenticated users policy)
-- This ensures admins can definitely add prayer counts
-- Use the safe function to avoid RLS recursion
CREATE POLICY "Admins can insert prayer counts" ON prayer_counts
  FOR INSERT WITH CHECK (
    public.is_admin_user_safe(auth.uid()) = true
  );

-- Policy: Admins can delete their own prayer counts (for un-praying)
-- This ensures admins can remove prayer counts they added
-- Use the safe function to avoid RLS recursion
CREATE POLICY "Admins can delete prayer counts for praying" ON prayer_counts
  FOR DELETE USING (
    user_id = auth.uid() OR
    public.is_admin_user_safe(auth.uid()) = true
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
  AND cmd IN ('UPDATE', 'INSERT', 'DELETE')
ORDER BY tablename, cmd, policyname;

