import { supabase } from './supabase';

export type NotifyUserAdminRoleResult = {
  ok: boolean;
  skipped?: boolean;
  emailed?: string;
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

  return err?.message || 'Failed to send administrative role email';
}

/**
 * Notify a user that they have been granted an Administrative role.
 * Soft-fails: never throws; callers should treat the role change as successful even if email fails.
 */
export async function notifyUserAdminRole(
  userId: string
): Promise<NotifyUserAdminRoleResult> {
  if (!userId) {
    return { ok: false, error: 'Missing userId' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('notify-user-admin-role', {
      body: { userId },
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
      skipped: Boolean(data?.skipped),
      emailed: data?.emailed,
    };
  } catch (err) {
    console.error('notifyUserAdminRole unexpected error:', err);
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : 'Failed to send administrative role email',
    };
  }
}
