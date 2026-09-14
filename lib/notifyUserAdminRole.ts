import { supabase } from './supabase';

export type AdminRoleKind = 'granted' | 'revoked';

export type NotifyUserAdminRoleResult = {
  ok: boolean;
  emailed?: string | null;
  emailSkipped?: boolean;
  error?: string;
};

async function extractInvokeError(error: unknown, data: unknown): Promise<string> {
  if (data && typeof data === 'object' && data !== null && 'error' in data) {
    const msg = (data as { error?: unknown }).error;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }

  const err = error as {
    message?: string;
    context?: Response;
  };

  if (err?.context && typeof err.context.json === 'function') {
    try {
      const body = await err.context.json();
      if (body?.error && typeof body.error === 'string') return body.error;
      if (body?.message && typeof body.message === 'string') return body.message;
    } catch {
      // ignore parse failures
    }
  }

  return err?.message || 'Failed to update administrative role';
}

/**
 * Grant or revoke an Administrative role and email the user.
 * The Edge Function applies the role change and sends the matching email.
 */
export async function notifyUserAdminRole(
  userId: string,
  kind: AdminRoleKind = 'granted'
): Promise<NotifyUserAdminRoleResult> {
  if (!userId) {
    return { ok: false, error: 'Missing userId' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('notify-user-admin-role', {
      body: { userId, kind, action: kind },
    });

    if (error) {
      const message = await extractInvokeError(error, data);
      console.error('notifyUserAdminRole invoke error:', error, data);
      return { ok: false, error: message };
    }

    if (data?.error) {
      console.error('notifyUserAdminRole function error:', data);
      return { ok: false, error: String(data.error) };
    }

    return {
      ok: true,
      emailed: data?.emailed ?? null,
      emailSkipped: Boolean(data?.emailSkipped),
    };
  } catch (err) {
    console.error('notifyUserAdminRole unexpected error:', err);
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : 'Failed to update administrative role',
    };
  }
}

export function adminRoleEmailNote(result: NotifyUserAdminRoleResult): string {
  if (!result.ok) {
    return ` The role was not changed${result.error ? ` (${result.error})` : ''}.`;
  }
  if (result.emailed) {
    return ` A confirmation email was sent to ${result.emailed}.`;
  }
  if (result.emailSkipped) {
    return ' The role was updated, but the confirmation email could not be sent.';
  }
  return '';
}
