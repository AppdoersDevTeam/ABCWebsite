import { supabase } from './supabase';
import type { AuditLogActorRole, AuditLogCategory, AuditLogAction } from '../types';

export type LogAuditEventInput = {
  action: AuditLogAction | string;
  category: AuditLogCategory | string;
  entityType?: string | null;
  entityId?: string | null;
  summary: string;
  details?: Record<string, unknown>;
  actorRoleOverride?: AuditLogActorRole | null;
};

export async function logAuditEvent(input: LogAuditEventInput): Promise<void> {
  try {
    const { error } = await supabase.rpc('log_audit_event', {
      p_action: input.action,
      p_category: input.category,
      p_entity_type: input.entityType ?? null,
      p_entity_id: input.entityId ?? null,
      p_summary: input.summary,
      p_details: { ...(input.details ?? {}), source: 'client' },
      p_actor_role_override: input.actorRoleOverride ?? null,
    });
    if (error) {
      console.warn('[auditLog]', error.message, input);
    }
  } catch (err) {
    console.warn('[auditLog] failed to write log', err, input);
  }
}

/** Fire-and-forget wrapper — prefer await logAuditEvent in admin handlers */
export function logAuditEventSafe(input: LogAuditEventInput): void {
  void logAuditEvent(input);
}

export function formatActorSummary(label: string, role: string): string {
  const roleLabel =
    role === 'admin' ? 'Admin' : role === 'member' ? 'Member' : role === 'anonymous' ? 'Visitor' : 'System';
  return `${label} (${roleLabel})`;
}
