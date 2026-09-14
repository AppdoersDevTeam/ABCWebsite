import { supabase } from './supabase';

export type NotifyUserReviewKind = 'received' | 'denied';

export type NotifyUserReviewResult = {
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

  const err = error as { message?: string; context?: Response };
  if (err?.context && typeof err.context.json === 'function') {
    try {
      const body = await err.context.json();
      if (body?.error && typeof body.error === 'string') return body.error;
      if (body?.message && typeof body.message === 'string') return body.message;
    } catch {
      // ignore
    }
  }

  return err?.message || 'Failed to send email';
}

const RECEIVED_EMAIL_STORAGE_PREFIX = 'abc-review-received-email:';
const receivedEmailInFlight = new Set<string>();

/** Send the signup-received email at most once per browser for this user. */
export function notifySignupReceivedOnce(userId: string, createdAt?: string | null): void {
  if (!userId) return;

  if (createdAt) {
    const createdMs = new Date(createdAt).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (Number.isFinite(createdMs) && Date.now() - createdMs > sevenDaysMs) return;
  }

  const key = `${RECEIVED_EMAIL_STORAGE_PREFIX}${userId}`;
  if (receivedEmailInFlight.has(userId)) return;
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key)) return;

  receivedEmailInFlight.add(userId);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(key, 'pending');
  }

  void notifyUserReview(userId, 'received').then((result) => {
    if (result.ok) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, 'sent');
      }
      return;
    }
    receivedEmailInFlight.delete(userId);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  });
}

export async function notifyUserReview(
  userId: string,
  kind: NotifyUserReviewKind
): Promise<NotifyUserReviewResult> {
  if (!userId) {
    return { ok: false, error: 'Missing userId' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('notify-user-review', {
      body: { userId, kind },
    });

    if (error) {
      const message = await extractInvokeError(error, data);
      console.error('notifyUserReview invoke error:', error, data);
      return { ok: false, error: message };
    }

    if (data?.error) {
      return { ok: false, error: String(data.error) };
    }

    return {
      ok: true,
      skipped: Boolean(data?.skipped),
      emailed: data?.emailed,
    };
  } catch (err) {
    console.error('notifyUserReview unexpected error:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to send email',
    };
  }
}
