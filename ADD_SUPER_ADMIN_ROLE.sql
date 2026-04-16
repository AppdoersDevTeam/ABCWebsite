-- Add Super Admin Role + First/Last Name Support
-- Run this in Supabase SQL Editor with service_role privileges
--
-- This migration:
-- 1. Adds is_super_admin column to public.users
-- 2. Adds first_name + last_name columns, migrates existing name data
-- 3. Sets devteam@appdoers.co.nz as the only super admin
-- 4. Updates is_admin_user() to recognise all admin-role users
-- 5. Adds is_super_admin_user() for super-admin-only operations
-- 6. Adds RLS policy so only super admins can change user roles

-- Step 1: Add new columns (safe to re-run)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT '';

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL DEFAULT '';

-- Step 2: Migrate existing name data into first_name + last_name
-- Splits on the first space: "John Doe" → first_name='John', last_name='Doe'
-- Single-word names go entirely into first_name
UPDATE public.users
SET first_name = CASE
      WHEN POSITION(' ' IN COALESCE(name, '')) > 0
        THEN LEFT(name, POSITION(' ' IN name) - 1)
      ELSE COALESCE(name, '')
    END,
    last_name = CASE
      WHEN POSITION(' ' IN COALESCE(name, '')) > 0
        THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
      ELSE ''
    END
WHERE first_name = '' OR first_name IS NULL;

-- Step 3: Set the super admin flag for devteam@appdoers.co.nz
UPDATE public.users
SET is_super_admin = true,
    role = 'admin',
    is_approved = true
WHERE LOWER(email) = 'devteam@appdoers.co.nz';

-- Step 4: Update the trigger for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_email TEXT := 'devteam@appdoers.co.nz';
  is_admin BOOLEAN := LOWER(COALESCE(NEW.email, '')) = LOWER(admin_email);
  user_first_name TEXT;
  user_last_name TEXT;
  user_full_name TEXT;
  user_email TEXT;
  user_phone TEXT;
  user_timezone TEXT;
BEGIN
  user_email := NEW.email;
  user_phone := NEW.phone;

  -- Extract first_name and last_name from metadata
  user_first_name := COALESCE(
    NEW.raw_user_meta_data->>'first_name',
    ''
  );
  user_last_name := COALESCE(
    NEW.raw_user_meta_data->>'last_name',
    ''
  );

  -- Fallback: if no first/last provided, try full_name and split it
  IF user_first_name = '' AND user_last_name = '' THEN
    user_full_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      SPLIT_PART(COALESCE(NEW.email, ''), '@', 1),
      'User'
    );
    IF POSITION(' ' IN user_full_name) > 0 THEN
      user_first_name := LEFT(user_full_name, POSITION(' ' IN user_full_name) - 1);
      user_last_name  := SUBSTRING(user_full_name FROM POSITION(' ' IN user_full_name) + 1);
    ELSE
      user_first_name := user_full_name;
      user_last_name  := '';
    END IF;
  END IF;

  -- Compose the legacy name column
  user_full_name := TRIM(user_first_name || ' ' || user_last_name);

  user_timezone := NEW.raw_user_meta_data->>'timezone';

  INSERT INTO public.users (id, email, phone, name, first_name, last_name, is_approved, role, is_super_admin, user_timezone)
  VALUES (
    NEW.id,
    user_email,
    user_phone,
    user_full_name,
    user_first_name,
    user_last_name,
    is_admin,
    CASE WHEN is_admin THEN 'admin' ELSE 'member' END,
    is_admin,
    user_timezone
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Replace is_admin_user() — now checks BOTH the hardcoded email
-- AND the role column so promoted admins also pass the check.
DROP FUNCTION IF EXISTS public.is_admin_user(UUID);

CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_email TEXT;
  user_role  TEXT;
BEGIN
  -- Get email from auth.users (no RLS)
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;

  -- Super admin email always passes
  IF LOWER(COALESCE(user_email, '')) = 'devteam@appdoers.co.nz' THEN
    RETURN true;
  END IF;

  -- Check role in public.users using a direct query (SECURITY DEFINER bypasses RLS)
  SELECT role INTO user_role
  FROM public.users
  WHERE id = user_id;

  RETURN user_role = 'admin';
END;
$$;

-- Step 5: New function — is_super_admin_user()
-- Only super admins can promote/demote other users' roles.
CREATE OR REPLACE FUNCTION public.is_super_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_is_super BOOLEAN;
BEGIN
  SELECT is_super_admin INTO v_is_super
  FROM public.users
  WHERE id = user_id;

  RETURN COALESCE(v_is_super, false);
END;
$$;

-- Step 6: Re-create admin RLS policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update user approvals" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update user approvals" ON users
  FOR UPDATE
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (public.is_admin_user(auth.uid()));

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, anon, authenticated, service_role;

-- Verify
SELECT id, email, first_name, last_name, name, role, is_super_admin
FROM public.users
ORDER BY is_super_admin DESC, role, email;
