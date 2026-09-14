-- Ensure every approved admin can use the full admin portal
-- (User Management, events, devotionals, logs, etc.)
-- Run this in the Supabase SQL Editor.

-- 1) is_admin_user(): any approved admin, plus the Appdoers service account
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_email TEXT;
  user_role  TEXT;
  user_approved BOOLEAN;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;

  IF LOWER(COALESCE(user_email, '')) = 'devteam@appdoers.co.nz' THEN
    RETURN true;
  END IF;

  SELECT role, is_approved INTO user_role, user_approved
  FROM public.users
  WHERE id = user_id;

  RETURN user_role = 'admin' AND COALESCE(user_approved, false) = true;
END;
$$;

-- 2) Own-profile access (needed so admins can load their role on login)
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Members may update their own profile (timezone, name) but cannot grant themselves admin.
CREATE OR REPLACE FUNCTION public.prevent_self_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role
     OR OLD.is_approved IS DISTINCT FROM NEW.is_approved
     OR OLD.is_super_admin IS DISTINCT FROM NEW.is_super_admin THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin_user(auth.uid()) THEN
      RAISE EXCEPTION 'Only an approved admin can change role or approval';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_self_privilege_escalation ON public.users;
CREATE TRIGGER prevent_self_privilege_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_privilege_escalation();

-- 3) All approved admins can read / update / delete user rows
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT
  USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can update user approvals" ON public.users;
CREATE POLICY "Admins can update user approvals" ON public.users
  FOR UPDATE
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE
  USING (public.is_admin_user(auth.uid()));

-- 4) Audit logs readable by every approved admin
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;
CREATE POLICY "Admins can read audit logs" ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated, service_role;
