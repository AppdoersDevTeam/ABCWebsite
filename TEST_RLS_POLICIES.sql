-- Test RLS Policies for Users Table
-- Run this in Supabase SQL Editor to verify policies are working

-- 1. Check all policies on users table
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

-- 2. Check if current user can read all users (run as the admin user)
-- This should return all users if RLS is working correctly
SELECT 
  id,
  email,
  name,
  is_approved,
  role,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- 3. Check pending users specifically
SELECT 
  id,
  email,
  name,
  is_approved,
  role,
  created_at
FROM public.users
WHERE is_approved = false
ORDER BY created_at DESC;

-- 4. Verify admin user exists and is approved
SELECT 
  id,
  email,
  name,
  is_approved,
  role
FROM public.users
WHERE email = 'devteam@appdoers.co.nz';

-- 5. Check current authenticated user (if running from client)
-- Note: This won't work in SQL Editor, but useful for debugging in app
-- SELECT auth.uid() as current_user_id;

