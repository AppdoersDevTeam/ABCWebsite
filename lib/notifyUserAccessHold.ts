import { supabase } from './supabase';
import { dispatchAppNotification } from './dispatchNotification';

export type AccessHoldKind = 'held' | 'restored';

export type NotifyUserAccessHoldResult = {
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

  return err?.message || 'Failed to update website access';
}

/**
 * Place website access on hold, or restore it, and email the user.
 * The Edge Function applies the change and sends the matching email.
 */
export async function notifyUserAccessHold(
  userId: string,
  kind: AccessHoldKind = 'held'
): Promise<NotifyUserAccessHoldResult> {
  if (!userId) {
    return { ok: false, error: 'Missing userId' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('notify-user-access-hold', {
      body: { userId, kind, action: kind },
    });

    if (error) {
      const message = await extractInvokeError(error, data);
      console.error('notifyUserAccessHold invoke error:', error, data);
      return { ok: false, error: message };
    }

    if (data?.error) {
      console.error('notifyUserAccessHold function error:', data);
      return { ok: false, error: String(data.error) };
    }

    dispatchAppNotification({
      type: kind === 'restored' ? 'user.access_restored' : 'user.access_held',
      title: kind === 'restored' ? 'Website access restored' : 'Website access on hold',
      body:
        kind === 'restored'
          ? 'Your Ashburton Baptist Church website access has been restored.'
          : 'Your Ashburton Baptist Church website access has been placed on hold.',
      href: kind === 'restored' ? '/dashboard' : '/login',
      entityId: userId,
      targetUserId: userId,
    });

    return {
      ok: true,
      emailed: data?.emailed ?? null,
      emailSkipped: Boolean(data?.emailSkipped),
    };
  } catch (err) {
    console.error('notifyUserAccessHold unexpected error:', err);
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : 'Failed to update website access',
    };
  }
}

export function accessHoldEmailNote(
  result: NotifyUserAccessHoldResult,
  kind: AccessHoldKind = 'held'
): string {
  const actionLabel = kind === 'restored' ? 'restored' : 'placed on hold';
  if (!result.ok) {
    return ` Access was not ${actionLabel}${result.error ? ` (${result.error})` : ''}.`;
  }
  if (result.emailed) {
    return ` A confirmation email was sent to ${result.emailed}.`;
  }
  if (result.emailSkipped) {
    return ` Access was ${actionLabel}, but the confirmation email could not be sent.`;
  }
  return '';
}
