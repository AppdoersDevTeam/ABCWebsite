-- Test Queries to Verify the Trigger is Working
-- Run these in Supabase SQL Editor

-- 1. Verify the function exists
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- 2. Verify the trigger exists and is attached correctly
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 3. Check current users in public.users table
SELECT 
  id,
  email,
  name,
  is_approved,
  role,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check users in auth.users (to see if there are any without profiles)
SELECT 
  au.id,
  au.email,
  au.phone,
  au.created_at,
  CASE WHEN pu.id IS NULL THEN 'MISSING PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC
LIMIT 10;

