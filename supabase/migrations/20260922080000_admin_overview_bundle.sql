-- Admin Overview bundle: counts + recent activity in one Rest round-trip.
-- Same data AdminOverview already showed via many sequential/parallel queries.

CREATE OR REPLACE FUNCTION public.admin_overview_bundle()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  cutoff timestamptz := now() - interval '30 days';
  prayer_7d timestamptz := now() - interval '7 days';
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'prayer_count', (SELECT count(*)::int FROM public.prayer_requests),
    'pending_prayer_7d', (
      SELECT count(*)::int FROM public.prayer_requests WHERE created_at >= prayer_7d
    ),
    'team_count', (
      SELECT count(*)::int FROM public.team_members
      WHERE is_archived IS DISTINCT FROM true
    ),
    'roster_count', (SELECT count(*)::int FROM public.roster),
    'events_count', (SELECT count(*)::int FROM public.events),
    'newsletter_count', (SELECT count(*)::int FROM public.newsletters),
    'devotionals_count', (SELECT count(*)::int FROM public.devotionals),
    'recent', COALESCE((
      SELECT jsonb_agg(row_to_json(x) ORDER BY x.sort_at DESC)
      FROM (
        SELECT * FROM (
          SELECT
            id::text AS id,
            'prayer'::text AS type,
            ('New prayer request: ' || COALESCE(name, 'Request'))::text AS title,
            created_at AS sort_at
          FROM public.prayer_requests
          WHERE created_at >= cutoff
          ORDER BY created_at DESC
          LIMIT 10
        ) p
        UNION ALL
        SELECT * FROM (
          SELECT
            id::text,
            'event'::text,
            CASE
              WHEN updated_at IS NOT NULL AND updated_at IS DISTINCT FROM created_at AND updated_at > created_at
                THEN 'Event updated: ' || COALESCE(title, 'Event')
              ELSE 'New event: ' || COALESCE(title, 'Event')
            END,
            GREATEST(created_at, COALESCE(updated_at, created_at))
          FROM public.events
          WHERE created_at >= cutoff OR updated_at >= cutoff
          ORDER BY GREATEST(created_at, COALESCE(updated_at, created_at)) DESC
          LIMIT 10
        ) e
        UNION ALL
        SELECT * FROM (
          SELECT
            id::text,
            'team_member'::text,
            CASE
              WHEN updated_at IS NOT NULL AND updated_at IS DISTINCT FROM created_at AND updated_at > created_at
                THEN 'People updated: ' || COALESCE(name, 'Person')
              ELSE 'People added: ' || COALESCE(name, 'Person')
            END,
            GREATEST(created_at, COALESCE(updated_at, created_at))
          FROM public.team_members
          WHERE created_at >= cutoff OR updated_at >= cutoff
          ORDER BY GREATEST(created_at, COALESCE(updated_at, created_at)) DESC
          LIMIT 10
        ) t
        UNION ALL
        SELECT * FROM (
          SELECT
            id::text,
            'newsletter'::text,
            CASE
              WHEN updated_at IS NOT NULL AND updated_at IS DISTINCT FROM created_at AND updated_at > created_at
                THEN 'Newsletter updated: ' || COALESCE(title, 'Newsletter')
              ELSE 'Newsletter uploaded: ' || COALESCE(title, 'Newsletter')
            END,
            GREATEST(created_at, COALESCE(updated_at, created_at))
          FROM public.newsletters
          WHERE created_at >= cutoff OR updated_at >= cutoff
          ORDER BY GREATEST(created_at, COALESCE(updated_at, created_at)) DESC
          LIMIT 10
        ) n
        UNION ALL
        SELECT * FROM (
          SELECT
            id::text,
            'devotional'::text,
            CASE
              WHEN updated_at IS NOT NULL AND updated_at IS DISTINCT FROM created_at AND updated_at > created_at
                THEN 'Devotional updated: ' || COALESCE(title, 'Devotional')
                  || CASE WHEN NULLIF(subtitle, '') IS NOT NULL THEN ' — ' || subtitle ELSE '' END
              ELSE 'Devotional uploaded: ' || COALESCE(title, 'Devotional')
                  || CASE WHEN NULLIF(subtitle, '') IS NOT NULL THEN ' — ' || subtitle ELSE '' END
            END,
            GREATEST(created_at, COALESCE(updated_at, created_at))
          FROM public.devotionals
          WHERE created_at >= cutoff OR updated_at >= cutoff
          ORDER BY GREATEST(created_at, COALESCE(updated_at, created_at)) DESC
          LIMIT 10
        ) d
        UNION ALL
        SELECT * FROM (
          SELECT
            id::text,
            'roster'::text,
            CASE
              WHEN updated_at IS NOT NULL AND updated_at IS DISTINCT FROM created_at AND updated_at > created_at
                THEN 'Roster updated: ' || COALESCE(name, '') || ' - ' || COALESCE(role, '')
              ELSE 'Roster assignment: ' || COALESCE(name, '') || ' - ' || COALESCE(role, '')
            END,
            GREATEST(created_at, COALESCE(updated_at, created_at))
          FROM public.roster
          WHERE created_at >= cutoff OR updated_at >= cutoff
          ORDER BY GREATEST(created_at, COALESCE(updated_at, created_at)) DESC
          LIMIT 10
        ) r
        ORDER BY sort_at DESC
        LIMIT 10
      ) x
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_overview_bundle() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_overview_bundle() TO authenticated;
