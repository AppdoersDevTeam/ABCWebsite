-- Member MFA / 2FA: TOTP, email verification codes, recovery codes, login challenges.
-- Secrets are not readable via the Data API (RLS on, no authenticated policies).
-- Restrictive policies require a verified MFA session when the user has MFA enabled.

CREATE TABLE IF NOT EXISTS public.user_mfa_settings (
  user_id UUID PRIMARY KEY REFERENCES public.users (id) ON DELETE CASCADE,
  totp_enabled BOOLEAN NOT NULL DEFAULT false,
  email_enabled BOOLEAN NOT NULL DEFAULT false,
  totp_secret_enc TEXT,
  totp_pending_secret_enc TEXT,
  totp_confirmed_at TIMESTAMPTZ,
  totp_last_used_at TIMESTAMPTZ,
  totp_last_timestep BIGINT,
  email_confirmed_at TIMESTAMPTZ,
  email_last_used_at TIMESTAMPTZ,
  recovery_generated_at TIMESTAMPTZ,
  recovery_remaining INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mfa_recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  salt TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mfa_recovery_codes_user_id_idx
  ON public.mfa_recovery_codes (user_id)
  WHERE consumed_at IS NULL;

CREATE TABLE IF NOT EXISTS public.mfa_email_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (
    purpose IN ('login', 'enable', 'disable', 'reauth')
  ),
  salt TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mfa_email_challenges_user_purpose_idx
  ON public.mfa_email_challenges (user_id, purpose, created_at DESC);

CREATE TABLE IF NOT EXISTS public.mfa_login_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  access_token_enc TEXT NOT NULL,
  refresh_token_enc TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 8,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mfa_login_challenges_user_id_idx
  ON public.mfa_login_challenges (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.mfa_verified_sessions (
  session_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (
    method IN ('totp', 'email', 'recovery', 'setup')
  ),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS mfa_verified_sessions_user_id_idx
  ON public.mfa_verified_sessions (user_id)
  WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS public.mfa_rate_limits (
  bucket TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ
);

ALTER TABLE public.user_mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_recovery_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_email_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_login_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_verified_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.user_mfa_settings FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.mfa_recovery_codes FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.mfa_email_challenges FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.mfa_login_challenges FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.mfa_verified_sessions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.mfa_rate_limits FROM PUBLIC, anon, authenticated;

GRANT ALL ON TABLE public.user_mfa_settings TO postgres, service_role;
GRANT ALL ON TABLE public.mfa_recovery_codes TO postgres, service_role;
GRANT ALL ON TABLE public.mfa_email_challenges TO postgres, service_role;
GRANT ALL ON TABLE public.mfa_login_challenges TO postgres, service_role;
GRANT ALL ON TABLE public.mfa_verified_sessions TO postgres, service_role;
GRANT ALL ON TABLE public.mfa_rate_limits TO postgres, service_role;

CREATE OR REPLACE FUNCTION public.mfa_session_satisfied()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid UUID;
  sid UUID;
  mfa_on BOOLEAN;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RETURN TRUE;
  END IF;

  SELECT COALESCE(totp_enabled, false) OR COALESCE(email_enabled, false)
    INTO mfa_on
  FROM public.user_mfa_settings
  WHERE user_id = uid;

  IF COALESCE(mfa_on, false) IS NOT TRUE THEN
    RETURN TRUE;
  END IF;

  BEGIN
    sid := NULLIF(auth.jwt() ->> 'session_id', '')::UUID;
  EXCEPTION
    WHEN invalid_text_representation THEN
      sid := NULL;
  END;

  IF sid IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.mfa_verified_sessions s
    WHERE s.session_id = sid
      AND s.user_id = uid
      AND s.revoked_at IS NULL
  );
END;
$$;

REVOKE ALL ON FUNCTION public.mfa_session_satisfied() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mfa_session_satisfied() TO anon, authenticated, service_role;

-- Own profile can be read before MFA (needed for the challenge screen). Writes still require MFA.
DROP POLICY IF EXISTS mfa_select_own_or_verified ON public.users;
CREATE POLICY mfa_select_own_or_verified
  ON public.users
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (
    (SELECT public.mfa_session_satisfied())
    OR id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS mfa_write_verified ON public.users;
CREATE POLICY mfa_write_verified
  ON public.users
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.mfa_session_satisfied()))
  WITH CHECK ((SELECT public.mfa_session_satisfied()));

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'prayer_requests',
    'prayer_counts',
    'events',
    'newsletters',
    'photo_folders',
    'photos',
    'team_members',
    'roster_images',
    'groups',
    'job_roles',
    'team_member_groups',
    'team_member_job_roles',
    'event_categories',
    'devotionals',
    'email_sends',
    'audit_logs',
    'contact_submissions'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = t
        AND c.relkind = 'r'
    ) THEN
      EXECUTE format('DROP POLICY IF EXISTS mfa_session_required ON public.%I', t);
      EXECUTE format(
        'CREATE POLICY mfa_session_required ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING ((SELECT public.mfa_session_satisfied())) WITH CHECK ((SELECT public.mfa_session_satisfied()))',
        t
      );
    END IF;
  END LOOP;
END $$;

COMMENT ON TABLE public.user_mfa_settings IS 'Per-user MFA method state. TOTP secrets are encrypted at rest by the MFA Edge Function.';
COMMENT ON TABLE public.mfa_recovery_codes IS 'One-time MFA recovery codes stored as salted hashes only.';
COMMENT ON TABLE public.mfa_email_challenges IS 'Hashed email MFA codes with expiry and attempt limits.';
COMMENT ON FUNCTION public.mfa_session_satisfied() IS 'True when the caller has no MFA enabled, or the current auth session has completed MFA.';
