import { supabase } from './supabase';

export type DeleteUserAccountResult = {
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

  return err?.message || 'Failed to delete user';
}

/**
 * Delete a website user (login + related records) and email them.
 * Server enforces: caller must be an approved admin, and cannot delete themselves.
 */
export async function deleteUserAccount(userId: string): Promise<DeleteUserAccountResult> {
  if (!userId) {
    return { ok: false, error: 'Missing userId' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { userId },
    });

    if (error) {
      const message = await extractInvokeError(error, data);
      console.error('deleteUserAccount invoke error:', error, data);
      return { ok: false, error: message };
    }

    if (data?.error) {
      console.error('deleteUserAccount function error:', data);
      return { ok: false, error: String(data.error) };
    }

    return {
      ok: true,
      emailed: data?.emailed ?? null,
      emailSkipped: Boolean(data?.emailSkipped),
    };
  } catch (err) {
    console.error('deleteUserAccount unexpected error:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to delete user',
    };
  }
}
