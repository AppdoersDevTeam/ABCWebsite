import { supabase } from './supabase';

export type NotifyUserIntroInquiryResult = {
  ok: boolean;
  emailed?: string;
  error?: string;
};

/**
 * Send an intro / get-to-know-you email to a pending signup via Edge Function.
 * Soft-fails: never throws.
 */
export async function notifyUserIntroInquiry(
  userId: string,
  subject: string,
  body: string
): Promise<NotifyUserIntroInquiryResult> {
  if (!userId) {
    return { ok: false, error: 'Missing userId' };
  }
  if (!subject.trim()) {
    return { ok: false, error: 'Subject is required' };
  }
  if (!body.trim()) {
    return { ok: false, error: 'Message body is required' };
  }

  try {
    const { data, error } = await supabase.functions.invoke(
      'notify-user-intro-inquiry',
      {
        body: {
          userId,
          subject: subject.trim(),
          body: body.trim(),
        },
      }
    );

    if (error) {
      console.error('notifyUserIntroInquiry invoke error:', error);
      return {
        ok: false,
        error: error.message || 'Failed to send intro email',
      };
    }

    if (data?.error) {
      console.error('notifyUserIntroInquiry function error:', data);
      return { ok: false, error: String(data.error) };
    }

    return {
      ok: true,
      emailed: data?.emailed,
    };
  } catch (err) {
    console.error('notifyUserIntroInquiry unexpected error:', err);
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : 'Failed to send intro email',
    };
  }
}
