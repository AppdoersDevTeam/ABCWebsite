-- Audit log triggers — safety net for all data mutations
-- Run after CREATE_AUDIT_LOGS_TABLE.sql

CREATE OR REPLACE FUNCTION public.audit_log_row_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_action TEXT;
  v_entity_id TEXT;
  v_summary TEXT;
  v_category TEXT;
  v_details JSONB;
  v_actor_id UUID;
  v_actor_email TEXT;
  v_actor_label TEXT;
  v_actor_role TEXT;
  v_user_role TEXT;
  v_label TEXT;
  v_person_name TEXT;
  v_related_name TEXT;
BEGIN
  IF TG_TABLE_NAME = 'audit_logs' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;

  v_actor_id := auth.uid();
  IF v_actor_id IS NOT NULL THEN
    SELECT email, COALESCE(NULLIF(TRIM(name), ''), email), role
    INTO v_actor_email, v_actor_label, v_user_role
    FROM public.users
    WHERE id = v_actor_id;
    v_actor_role := CASE WHEN v_user_role = 'admin' THEN 'admin' ELSE 'member' END;
  ELSE
    v_actor_role := 'system';
  END IF;

  v_category := CASE TG_TABLE_NAME
    WHEN 'users' THEN 'users'
    WHEN 'events' THEN 'events'
    WHEN 'groups' THEN 'settings'
    WHEN 'job_roles' THEN 'settings'
    WHEN 'event_categories' THEN 'settings'
    WHEN 'team_members' THEN 'team'
    WHEN 'team_member_groups' THEN 'team'
    WHEN 'team_member_job_roles' THEN 'team'
    WHEN 'prayer_requests' THEN 'prayer'
    WHEN 'prayer_counts' THEN 'prayer'
    WHEN 'event_rsvps' THEN 'rsvp'
    WHEN 'newsletters' THEN 'newsletter'
    WHEN 'roster_images' THEN 'roster'
    WHEN 'photos' THEN 'photos'
    WHEN 'photo_folders' THEN 'photos'
    ELSE 'system'
  END;

  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    IF TG_TABLE_NAME IN ('team_member_groups', 'team_member_job_roles') THEN
      v_entity_id := NEW.team_member_id::TEXT;
    ELSE
      v_entity_id := NEW.id::TEXT;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_entity_id := NEW.id::TEXT;
  ELSE
    v_action := 'delete';
    IF TG_TABLE_NAME IN ('team_member_groups', 'team_member_job_roles') THEN
      v_entity_id := OLD.team_member_id::TEXT;
    ELSE
      v_entity_id := OLD.id::TEXT;
    END IF;
  END IF;

  IF TG_TABLE_NAME = 'prayer_counts' THEN
    v_action := 'pray';
  END IF;

  -- Per-table labels (avoid cross-table OLD/NEW field references in CASE)
  IF TG_TABLE_NAME = 'events' THEN
    v_label := COALESCE(CASE WHEN TG_OP = 'DELETE' THEN OLD.title ELSE NEW.title END, v_entity_id);
  ELSIF TG_TABLE_NAME = 'newsletters' THEN
    v_label := COALESCE(CASE WHEN TG_OP = 'DELETE' THEN OLD.title ELSE NEW.title END, v_entity_id);
  ELSIF TG_TABLE_NAME = 'users' THEN
    v_label := COALESCE(CASE WHEN TG_OP = 'DELETE' THEN OLD.email ELSE NEW.email END, v_entity_id);
  ELSIF TG_TABLE_NAME = 'prayer_requests' THEN
    v_label := COALESCE(CASE WHEN TG_OP = 'DELETE' THEN OLD.name ELSE NEW.name END, 'prayer request');
  ELSIF TG_TABLE_NAME = 'event_rsvps' THEN
    v_label := COALESCE(CASE WHEN TG_OP = 'DELETE' THEN OLD.name ELSE NEW.name END, 'RSVP');
  ELSIF TG_TABLE_NAME IN ('groups', 'job_roles', 'event_categories', 'team_members', 'photo_folders') THEN
    v_label := COALESCE(CASE WHEN TG_OP = 'DELETE' THEN OLD.name ELSE NEW.name END, v_entity_id);
  ELSE
    v_label := v_entity_id;
  END IF;

  IF TG_TABLE_NAME = 'groups' THEN
    v_summary := format('Group "%s" was %s', v_label,
      CASE v_action WHEN 'create' THEN 'created' WHEN 'update' THEN 'updated' ELSE 'deleted' END);
  ELSIF TG_TABLE_NAME = 'job_roles' THEN
    v_summary := format('Job role "%s" was %s', v_label,
      CASE v_action WHEN 'create' THEN 'created' WHEN 'update' THEN 'updated' ELSE 'deleted' END);
  ELSIF TG_TABLE_NAME = 'event_categories' THEN
    v_summary := format('Event category "%s" was %s', v_label,
      CASE v_action WHEN 'create' THEN 'created' WHEN 'update' THEN 'updated' ELSE 'deleted' END);
  ELSIF TG_TABLE_NAME = 'events' THEN
    v_summary := format('Event "%s" was %s', v_label,
      CASE v_action WHEN 'create' THEN 'created' WHEN 'update' THEN 'updated' ELSE 'deleted' END);
  ELSIF TG_TABLE_NAME = 'team_members' THEN
    v_summary := format('Directory person "%s" was %s', v_label,
      CASE v_action WHEN 'create' THEN 'added' WHEN 'update' THEN 'updated' ELSE 'removed' END);
  ELSIF TG_TABLE_NAME = 'newsletters' THEN
    v_summary := format('Newsletter "%s" was %s', v_label,
      CASE v_action WHEN 'create' THEN 'uploaded' WHEN 'update' THEN 'updated' ELSE 'deleted' END);
  ELSIF TG_TABLE_NAME = 'roster_images' THEN
    v_summary := format('Roster PDF was %s',
      CASE v_action WHEN 'create' THEN 'uploaded' WHEN 'update' THEN 'updated' ELSE 'deleted' END);
  ELSIF TG_TABLE_NAME = 'prayer_requests' THEN
    v_summary := format('Prayer request from "%s" was %s', v_label,
      CASE v_action WHEN 'create' THEN 'submitted' WHEN 'update' THEN 'updated' ELSE 'deleted' END);
  ELSIF TG_TABLE_NAME = 'prayer_counts' THEN
    v_summary := 'A member marked that they are praying for a request';
  ELSIF TG_TABLE_NAME = 'event_rsvps' THEN
    v_summary := format('%s RSVP''d for an event', v_label);
  ELSIF TG_TABLE_NAME = 'users' THEN
    v_summary := format('User account %s was %s', v_label,
      CASE v_action WHEN 'create' THEN 'created' WHEN 'update' THEN 'updated' ELSE 'deleted' END);
  ELSIF TG_TABLE_NAME = 'photos' THEN
    v_summary := format('Photo was %s',
      CASE v_action WHEN 'create' THEN 'uploaded' WHEN 'update' THEN 'updated' ELSE 'deleted' END);
  ELSIF TG_TABLE_NAME = 'photo_folders' THEN
    v_summary := format('Photo folder "%s" was %s', v_label,
      CASE v_action WHEN 'create' THEN 'created' WHEN 'update' THEN 'updated' ELSE 'deleted' END);
  ELSIF TG_TABLE_NAME = 'team_member_groups' THEN
    SELECT tm.name INTO v_person_name FROM public.team_members tm
    WHERE tm.id = COALESCE(CASE WHEN TG_OP = 'DELETE' THEN OLD.team_member_id ELSE NEW.team_member_id END, NULL);
    SELECT g.name INTO v_related_name FROM public.groups g
    WHERE g.id = COALESCE(CASE WHEN TG_OP = 'DELETE' THEN OLD.group_id ELSE NEW.group_id END, NULL);
    v_summary := format('Group "%s" %s for "%s"', COALESCE(v_related_name, 'unknown'),
      CASE v_action WHEN 'create' THEN 'assigned' WHEN 'delete' THEN 'removed' ELSE 'updated' END,
      COALESCE(v_person_name, 'unknown person'));
  ELSIF TG_TABLE_NAME = 'team_member_job_roles' THEN
    SELECT tm.name INTO v_person_name FROM public.team_members tm
    WHERE tm.id = COALESCE(CASE WHEN TG_OP = 'DELETE' THEN OLD.team_member_id ELSE NEW.team_member_id END, NULL);
    SELECT jr.name INTO v_related_name FROM public.job_roles jr
    WHERE jr.id = COALESCE(CASE WHEN TG_OP = 'DELETE' THEN OLD.job_role_id ELSE NEW.job_role_id END, NULL);
    v_summary := format('Job role "%s" %s for "%s"', COALESCE(v_related_name, 'unknown'),
      CASE v_action WHEN 'create' THEN 'assigned' WHEN 'delete' THEN 'removed' ELSE 'updated' END,
      COALESCE(v_person_name, 'unknown person'));
  ELSE
    v_summary := format('%s on %s', v_action, TG_TABLE_NAME);
  END IF;

  v_details := jsonb_build_object('source', 'trigger', 'table', TG_TABLE_NAME, 'operation', TG_OP);

  INSERT INTO public.audit_logs (
    actor_id, actor_email, actor_label, actor_role,
    action, category, entity_type, entity_id, summary, details
  ) VALUES (
    v_actor_id, v_actor_email, v_actor_label, v_actor_role,
    v_action, v_category, TG_TABLE_NAME, NULLIF(v_entity_id, ''), v_summary, v_details
  );

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

-- Attach triggers (idempotent)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users', 'events', 'team_members', 'prayer_requests', 'prayer_counts',
    'event_rsvps', 'groups', 'job_roles', 'event_categories',
    'team_member_groups', 'team_member_job_roles',
    'newsletters', 'roster_images', 'photos', 'photo_folders'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS audit_log_%I ON public.%I', t, t);
      EXECUTE format(
        'CREATE TRIGGER audit_log_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_log_row_change()',
        t, t
      );
    END IF;
  END LOOP;
END;
$$;
