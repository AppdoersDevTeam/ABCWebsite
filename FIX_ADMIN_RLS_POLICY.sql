-- Fix RLS Policy for Admins to Read All Users
-- This allows admins to see all users in the admin dashboard
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update user approvals" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Create a security definer function to check if user is admin
-- This function bypasses RLS to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Only check email from auth.users (no RLS on auth schema)
  -- This completely avoids querying public.users which has RLS
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  -- If email matches admin email, allow access
  -- This is the primary admin check and doesn't require querying public.users
  IF LOWER(COALESCE(user_email, '')) = 'devteam@appdoers.co.nz' THEN
    RETURN true;
  END IF;
  
  -- For other users, we can't safely check public.users here without recursion
  -- So we only allow access if email matches admin email
  -- Other admins would need to be checked differently or have their email added
  RETURN false;
END;
$$;

-- Add policy for admins to read all users (using the function to avoid recursion)
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (public.is_admin_user(auth.uid()));

-- Also allow admins to update user approval status and role
-- This allows admins to grant/revoke admin privileges and approve/revoke users
CREATE POLICY "Admins can update user approvals" ON users
  FOR UPDATE 
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Allow admins to delete users (for rejection)
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (public.is_admin_user(auth.uid()));

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
WHERE tablename = 'users'
ORDER BY policyname;

