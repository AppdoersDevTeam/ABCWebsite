import { supabase } from './supabase';

/** Detect auth redirect params from email confirmation, OAuth, or magic links. */
export function hasAuthCallbackParams(): boolean {
  const search = window.location.search || '';
  const hash = window.location.hash || '';
  return (
    search.includes('code=') ||
    search.includes('access_token=') ||
    search.includes('error=') ||
    hash.includes('access_token=') ||
    hash.includes('code=') ||
    hash.includes('error=') ||
    hash.includes('type=signup') ||
    hash.includes('type=email')
  );
}

/** Exchange PKCE code or apply tokens from the confirmation / OAuth redirect URL. */
export async function completeAuthCallbackFromUrl(): Promise<{ error: string | null }> {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }

  const hash = window.location.hash || '';
  if (hash.includes('access_token=')) {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }

  const authError = url.searchParams.get('error_description') || url.searchParams.get('error');
  if (authError) {
    return { error: decodeURIComponent(authError.replace(/\+/g, ' ')) };
  }

  return { error: null };
}
