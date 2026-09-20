import { supabase } from './supabase';

export type DirectoryPersonEmailKind = 'added' | 'archived' | 'deleted';

export type NotifyDirectoryPersonResult = {
  ok: boolean;
  emailed?: string;
  error?: string;
};

async function extractInvokeError(error: unknown, data: unknown): Promise<string> {
  if (data && typeof data === 'object' && data !== null && 'error' in data) {
    const msg = (data as { error?: unknown }).error;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }

  const err = error as { message?: string; context?: Response };
  if (err?.context && typeof err.context.json === 'function') {
    try {
      const body = await err.context.json();
      if (body?.error && typeof body.error === 'string') return body.error;
      if (body?.message && typeof body.message === 'string') return body.message;
    } catch {
      // ignore parse failures
    }
  }

  return err?.message || 'Failed to send directory email';
}

/**
 * Email a person when their People directory record is added, archived, or deleted.
 * Admin-only Edge Function; never throws.
 */
export async function notifyDirectoryPerson(input: {
  kind: DirectoryPersonEmailKind;
  email: string;
  name: string;
  teamMemberId?: string | null;
  userId?: string | null;
}): Promise<NotifyDirectoryPersonResult> {
  const email = (input.email || '').trim();
  const name = (input.name || '').trim();
  if (!email || !name) {
    return { ok: false, error: 'Missing email or name' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('notify-directory-person', {
      body: {
        kind: input.kind,
        email,
        name,
        teamMemberId: input.teamMemberId || null,
        userId: input.userId || null,
      },
    });

    if (error) {
      const message = await extractInvokeError(error, data);
      console.error('notifyDirectoryPerson invoke error:', error, data);
      const friendly =
        /failed to send a request to the edge function/i.test(message)
          ? 'The directory email service is not available yet. Please try again in a moment.'
          : message;
      return { ok: false, error: friendly };
    }

    if (data?.error) {
      console.error('notifyDirectoryPerson function error:', data);
      return { ok: false, error: String(data.error) };
    }

    return {
      ok: true,
      emailed: data?.emailed ?? email,
    };
  } catch (err) {
    console.error('notifyDirectoryPerson unexpected error:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to send directory email',
    };
  }
}

export function directoryPersonEmailNote(result: NotifyDirectoryPersonResult): string {
  if (!result.ok) {
    return ` The confirmation email could not be sent${result.error ? ` (${result.error})` : ''}.`;
  }
  if (result.emailed) {
    return ` A confirmation email was sent to ${result.emailed}.`;
  }
  return '';
}
