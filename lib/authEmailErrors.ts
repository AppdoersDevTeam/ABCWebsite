import type { AuthError } from '@supabase/supabase-js';

export function getAuthEmailErrorMessage(error: unknown): string {
  const authError = error as AuthError | undefined;
  const code = authError?.code || '';
  const message = authError?.message || (error instanceof Error ? error.message : '');

  if (
    code === 'over_email_send_rate_limit' ||
    message.toLowerCase().includes('rate limit') ||
    message.toLowerCase().includes('email rate limit')
  ) {
    return 'Too many confirmation emails were sent recently. Please wait about an hour, check your spam folder for an earlier message, then try again.';
  }

  if (message.toLowerCase().includes('already confirmed') || message.toLowerCase().includes('already verified')) {
    return 'This email is already confirmed. Please sign in with your password.';
  }

  return message || 'Could not send confirmation email. Please try again.';
}
