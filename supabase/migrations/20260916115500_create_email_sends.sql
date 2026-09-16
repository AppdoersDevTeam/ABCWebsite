-- Outbound church emails (Resend) for admin Overview totals and Day/Week/Month detail.
-- Backfills successful sends already recorded on audit_logs.details.emailed.

CREATE TABLE IF NOT EXISTS public.email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recipient_email TEXT NOT NULL,
  recipient_kind TEXT NOT NULL DEFAULT 'user'
    CHECK (recipient_kind IN ('user', 'leadership')),
  template_key TEXT NOT NULL,
  subject TEXT,
  recipient_user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  recipient_team_member_id UUID REFERENCES public.team_members (id) ON DELETE SET NULL,
  resend_id TEXT,
  source_audit_log_id UUID,
  actor_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS email_sends_resend_id_uidx
  ON public.email_sends (resend_id)
  WHERE resend_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS email_sends_source_audit_log_id_uidx
  ON public.email_sends (source_audit_log_id)
  WHERE source_audit_log_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS email_sends_sent_at_idx
  ON public.email_sends (sent_at DESC);

CREATE INDEX IF NOT EXISTS email_sends_kind_sent_at_idx
  ON public.email_sends (recipient_kind, sent_at DESC);

ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read email sends" ON public.email_sends;
CREATE POLICY "Admins can read email sends"
  ON public.email_sends
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

GRANT SELECT ON public.email_sends TO authenticated;
GRANT ALL ON public.email_sends TO postgres, service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'email_sends'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.email_sends;
  END IF;
END $$;

INSERT INTO public.email_sends (
  sent_at,
  recipient_email,
  recipient_kind,
  template_key,
  subject,
  recipient_user_id,
  recipient_team_member_id,
  source_audit_log_id,
  actor_id,
  metadata
)
SELECT
  al.created_at,
  lower(trim(al.details->>'emailed')),
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.email IS NOT NULL
        AND lower(trim(tm.email)) = lower(trim(al.details->>'emailed'))
    )
    OR EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE al.entity_id IS NOT NULL
        AND tm.user_id::text = al.entity_id
    )
      THEN 'leadership'
    ELSE 'user'
  END,
  CASE
    WHEN al.action = 'email_inquiry' THEN 'intro_inquiry'
    WHEN COALESCE(al.details->>'field', '') = 'is_access_held'
      AND COALESCE(al.details->>'value', '') IN ('true', 't') THEN 'access_hold'
    WHEN COALESCE(al.details->>'field', '') = 'is_access_held' THEN 'access_restored'
    WHEN COALESCE(al.details->>'field', '') = 'role'
      AND COALESCE(al.details->>'value', '') = 'admin' THEN 'admin_role_granted'
    WHEN COALESCE(al.details->>'field', '') = 'role' THEN 'admin_role_revoked'
    WHEN al.action = 'approve' THEN 'approval'
    WHEN al.action = 'reject' THEN 'denial'
    WHEN al.action IN ('delete', 'delete_user') THEN 'account_deleted'
    ELSE 'system'
  END,
  al.summary,
  (
    SELECT u.id
    FROM public.users u
    WHERE al.entity_id IS NOT NULL
      AND u.id::text = al.entity_id
    LIMIT 1
  ),
  (
    SELECT tm.id
    FROM public.team_members tm
    WHERE tm.email IS NOT NULL
      AND lower(trim(tm.email)) = lower(trim(al.details->>'emailed'))
    LIMIT 1
  ),
  al.id,
  al.actor_id,
  jsonb_build_object('source', 'audit_logs', 'action', al.action, 'category', al.category)
FROM public.audit_logs al
WHERE COALESCE(al.details->>'emailed', '') <> ''
ON CONFLICT DO NOTHING;
