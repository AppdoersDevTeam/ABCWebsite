-- Fix User Profile Creation Trigger
-- IMPORTANT: This must be run with service_role privileges to access auth.users table
-- 
-- OPTION 1: Run in Supabase Dashboard (Recommended)
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Make sure you're connected (the SQL editor should work with service_role automatically)
-- 3. Paste and run this entire script
--
-- OPTION 2: Run via psql (Local/CLI)
-- export SUPABASE_DB_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
-- psql "$SUPABASE_DB_URL" -c "/* paste SQL here */"
--
-- OPTION 3: Use Supabase CLI
-- supabase db execute --file FIX_USER_TRIGGER.sql

-- Step 1: Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_email TEXT := 'devteam@appdoers.co.nz';
  is_admin BOOLEAN := LOWER(COALESCE(NEW.email, '')) = LOWER(admin_email);
  user_name TEXT;
  user_email TEXT;
  user_phone TEXT;
  user_timezone TEXT;
BEGIN
  -- Extract email
  user_email := NEW.email;
  
  -- Extract phone
  user_phone := NEW.phone;
  
  -- Extract name from metadata or email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(COALESCE(NEW.email, ''), '@', 1),
    'User'
  );
  
  -- Extract timezone from metadata (if provided during signup)
  user_timezone := NEW.raw_user_meta_data->>'timezone';
  
  -- Insert into public.users table
  INSERT INTO public.users (id, email, phone, name, is_approved, role, user_timezone)
  VALUES (
    NEW.id,
    user_email,
    user_phone,
    user_name,
    is_admin, -- true for admin email, false for others
    CASE WHEN is_admin THEN 'admin' ELSE 'member' END,
    user_timezone -- Store timezone if available
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if user already exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, anon, authenticated, service_role;

-- Step 5: Verify the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Step 6: Test query to check if function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

