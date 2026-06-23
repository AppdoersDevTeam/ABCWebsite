-- Audit Logs Table + RPC + RLS
-- Run in Supabase SQL Editor with service_role privileges
--
-- Provides append-only system audit trail for admin compliance review.

-- Step 1: Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id UUID,
  actor_email TEXT,
  actor_label TEXT,
  actor_role TEXT NOT NULL DEFAULT 'anonymous'
    CHECK (actor_role IN ('admin', 'member', 'anonymous', 'system')),
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  summary TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx
  ON public.audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_category_created_at_idx
  ON public.audit_logs (category, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_actor_id_created_at_idx
  ON public.audit_logs (actor_id, created_at DESC);

-- Step 2: Enable RLS (no direct INSERT/UPDATE/DELETE for clients)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;
CREATE POLICY "Admins can read audit logs" ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- Step 3: log_audit_event RPC (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_category TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL,
  p_summary TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_actor_role_override TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor_id UUID;
  v_actor_email TEXT;
  v_actor_label TEXT;
  v_actor_role TEXT;
  v_user_role TEXT;
  v_log_id UUID;
BEGIN
  v_actor_id := auth.uid();

  IF v_actor_id IS NOT NULL THEN
    SELECT email, COALESCE(NULLIF(TRIM(name), ''), email), role
    INTO v_actor_email, v_actor_label, v_user_role
    FROM public.users
    WHERE id = v_actor_id;

    IF v_user_role = 'admin' THEN
      v_actor_role := 'admin';
    ELSE
      v_actor_role := 'member';
    END IF;
  ELSE
    v_actor_role := COALESCE(NULLIF(p_actor_role_override, ''), 'anonymous');
  END IF;

  IF p_actor_role_override IS NOT NULL AND p_actor_role_override <> '' THEN
    v_actor_role := p_actor_role_override;
  END IF;

  INSERT INTO public.audit_logs (
    actor_id,
    actor_email,
    actor_label,
    actor_role,
    action,
    category,
    entity_type,
    entity_id,
    summary,
    details
  ) VALUES (
    v_actor_id,
    v_actor_email,
    v_actor_label,
    v_actor_role,
    p_action,
    p_category,
    p_entity_type,
    p_entity_id,
    COALESCE(p_summary, p_action || ' on ' || COALESCE(p_entity_type, p_category)),
    COALESCE(p_details, '{}'::jsonb)
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_audit_event(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_audit_event(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) TO anon;

-- Step 4 (optional): DB triggers for safety-net logging are omitted in v1
-- to avoid duplicate entries alongside client-side log_audit_event calls.
-- Enable later if needed via audit_log_row_change() + per-table triggers.

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO postgres, service_role;
