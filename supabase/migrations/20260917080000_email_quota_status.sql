-- Daily (50) and monthly (1,000) church email caps in Pacific/Auckland.
-- Used by admin Overview / Emails UI and by Edge Functions before Resend.

CREATE OR REPLACE FUNCTION public.email_quota_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tz text := 'Pacific/Auckland';
  day_limit int := 50;
  month_limit int := 1000;
  day_count int;
  month_count int;
  local_now timestamp;
  blocked boolean;
  hit text;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  local_now := timezone(tz, now());

  SELECT count(*)::int INTO day_count
  FROM public.email_sends
  WHERE (timezone(tz, sent_at))::date = local_now::date;

  SELECT count(*)::int INTO month_count
  FROM public.email_sends
  WHERE date_trunc('month', timezone(tz, sent_at)) = date_trunc('month', local_now);

  blocked := day_count >= day_limit OR month_count >= month_limit;
  hit := CASE
    WHEN day_count >= day_limit AND month_count >= month_limit THEN 'both'
    WHEN day_count >= day_limit THEN 'day'
    WHEN month_count >= month_limit THEN 'month'
    ELSE NULL
  END;

  RETURN jsonb_build_object(
    'timezone', tz,
    'day_limit', day_limit,
    'month_limit', month_limit,
    'day_count', day_count,
    'month_count', month_count,
    'day_remaining', GREATEST(day_limit - day_count, 0),
    'month_remaining', GREATEST(month_limit - month_count, 0),
    'blocked', blocked,
    'hit', hit
  );
END;
$$;

REVOKE ALL ON FUNCTION public.email_quota_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_quota_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.email_quota_status() TO service_role;
