import { supabase } from './supabase';

export type NotifyUserApprovedResult = {
  ok: boolean;
  skipped?: boolean;
  emailed?: string;
  error?: string;
};

/**
 * Notify a newly approved user by email via the notify-user-approved Edge Function.
 * Soft-fails: never throws; callers should treat approval as successful even if email fails.
 */
export async function notifyUserApproved(
  userId: string
): Promise<NotifyUserApprovedResult> {
  if (!userId) {
    return { ok: false, error: 'Missing userId' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('notify-user-approved', {
      body: { userId },
    });

    if (error) {
      console.error('notifyUserApproved invoke error:', error);
      return { ok: false, error: error.message || 'Failed to send approval email' };
    }

    if (data?.error) {
      console.error('notifyUserApproved function error:', data);
      return { ok: false, error: String(data.error) };
    }

    return {
      ok: true,
      skipped: Boolean(data?.skipped),
      emailed: data?.emailed,
    };
  } catch (err) {
    console.error('notifyUserApproved unexpected error:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to send approval email',
    };
  }
}
