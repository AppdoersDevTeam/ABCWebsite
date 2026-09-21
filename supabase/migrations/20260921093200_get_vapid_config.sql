-- Service-role only lookup of Web Push VAPID keys stored in Vault.
-- Secret values themselves are not in this file; they live in vault.secrets.

CREATE OR REPLACE FUNCTION public.get_vapid_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = vault, public
AS $$
DECLARE
  result jsonb := '{}'::jsonb;
BEGIN
  IF current_user NOT IN ('postgres', 'supabase_admin', 'service_role')
     AND COALESCE(auth.jwt() ->> 'role', '') IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COALESCE(jsonb_object_agg(name, decrypted_secret), '{}'::jsonb)
  INTO result
  FROM vault.decrypted_secrets
  WHERE name IN ('VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT');

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_vapid_config() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_vapid_config() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_vapid_config() TO service_role;

COMMENT ON FUNCTION public.get_vapid_config() IS 'Service-role only lookup of Web Push VAPID keys stored in Vault.';
