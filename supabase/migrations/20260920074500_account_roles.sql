-- Named account roles for Admin Users & Roles (labels only — no permission matrix).
-- System roles Owner / Admin / Member stay in sync with users.role and is_super_admin.

CREATE TABLE IF NOT EXISTS public.account_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  role_type text NOT NULL DEFAULT 'account'
    CHECK (role_type IN ('account', 'member', 'group_leader')),
  is_system boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS account_roles_slug_key
  ON public.account_roles (slug);

CREATE UNIQUE INDEX IF NOT EXISTS account_roles_name_lower_key
  ON public.account_roles (lower(name));

ALTER TABLE public.account_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage account roles" ON public.account_roles;
CREATE POLICY "Admins can manage account roles"
  ON public.account_roles
  FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

INSERT INTO public.account_roles (name, slug, role_type, is_system, sort_order)
VALUES
  ('Owner', 'owner', 'account', true, 1),
  ('Admin', 'admin', 'account', true, 2),
  ('Member', 'member', 'member', true, 3),
  ('Group Leader', 'group-leader', 'group_leader', true, 4)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS account_role_id uuid REFERENCES public.account_roles(id);

CREATE INDEX IF NOT EXISTS users_account_role_id_idx
  ON public.users (account_role_id);

UPDATE public.users u
SET account_role_id = r.id
FROM public.account_roles r
WHERE u.account_role_id IS NULL
  AND (
    (u.is_super_admin = true AND r.slug = 'owner')
    OR (COALESCE(u.is_super_admin, false) = false AND u.role = 'admin' AND r.slug = 'admin')
    OR (COALESCE(u.is_super_admin, false) = false AND COALESCE(u.role, 'member') = 'member' AND r.slug = 'member')
  );

CREATE OR REPLACE FUNCTION public.prevent_system_account_role_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.is_system THEN
    RAISE EXCEPTION 'System roles cannot be deleted';
  END IF;
  RETURN OLD;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'account_roles_no_delete_system'
  ) THEN
    CREATE TRIGGER account_roles_no_delete_system
    BEFORE DELETE ON public.account_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_system_account_role_delete();
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_user_last_access()
RETURNS TABLE (user_id uuid, last_access_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT u.id, au.last_sign_in_at
  FROM public.users u
  JOIN auth.users au ON au.id = u.id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_user_last_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_user_last_access() TO authenticated;
