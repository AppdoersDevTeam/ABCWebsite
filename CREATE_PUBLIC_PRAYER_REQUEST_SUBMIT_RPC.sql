-- Public prayer form helper: insert into `prayer_requests` even when RLS blocks direct client INSERTs
--
-- If you still see: "new row violates row-level security policy for table prayer_requests"
-- it usually means the browser is inserting directly into the table, but the INSERT policy isn't present
-- (or is too strict). A common Supabase pattern is a SECURITY DEFINER function with EXECUTE granted to
-- `anon` + `authenticated`, while keeping table INSERT locked down.
--
-- Run in Supabase SQL editor.

CREATE OR REPLACE FUNCTION public.submit_prayer_request(
  p_name text,
  p_content text,
  p_is_anonymous boolean,
  p_is_confidential boolean,
  p_user_timezone text,
  p_attach_user boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id uuid;
  v_uid uuid;
  v_final_name text;
BEGIN
  IF p_content IS NULL OR btrim(p_content) = '' THEN
    RAISE EXCEPTION 'Prayer request content is required';
  END IF;

  v_uid := CASE
    WHEN auth.role() = 'authenticated' AND p_attach_user THEN auth.uid()
    ELSE NULL
  END;

  v_final_name := CASE
    WHEN p_is_anonymous THEN 'Anonymous'
    WHEN p_name IS NULL OR btrim(p_name) = '' THEN 'Anonymous'
    ELSE p_name
  END;

  INSERT INTO public.prayer_requests (
    user_id,
    name,
    content,
    is_anonymous,
    is_confidential,
    prayer_count,
    user_timezone
  )
  VALUES (
    v_uid,
    v_final_name,
    p_content,
    COALESCE(p_is_anonymous, false),
    COALESCE(p_is_confidential, false),
    0,
    NULLIF(btrim(p_user_timezone), '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_prayer_request(text, text, boolean, boolean, text, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_prayer_request(text, text, boolean, boolean, text, boolean) TO anon, authenticated;

-- Optional verification
SELECT
  routine_schema,
  routine_name,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'submit_prayer_request';
