import { supabase } from './supabase';

export type ParsedAuthParams = {
  code: string | null;
  accessToken: string | null;
  type: string | null;
  error: string | null;
};

/** Parse Supabase auth params from both search and hash (HashRouter-safe). */
export function parseAuthParamsFromUrl(href: string = window.location.href): ParsedAuthParams {
  const url = new URL(href);
  let code = url.searchParams.get('code');
  let accessToken = url.searchParams.get('access_token');
  let type = url.searchParams.get('type');
  let error = url.searchParams.get('error_description') || url.searchParams.get('error');

  const absorbParams = (query: string) => {
    if (!query) return;
    const normalized = query.startsWith('?') ? query.slice(1) : query;
    const params = new URLSearchParams(normalized);
    code = code || params.get('code');
    accessToken = accessToken || params.get('access_token');
    type = type || params.get('type');
    error = error || params.get('error_description') || params.get('error');
  };

  const hash = url.hash || '';
  if (hash) {
    const segments = hash.split('#').filter(Boolean);
    for (const segment of segments) {
      if (segment.includes('?')) {
        absorbParams(segment.split('?').slice(1).join('?'));
      } else if (segment.includes('=')) {
        absorbParams(segment);
      }
    }
  }

  return { code, accessToken, type, error };
}

/** Build a URL Supabase can exchange when `code` lives in the hash route query. */
export function buildCodeExchangeUrl(href: string = window.location.href): string {
  const url = new URL(href);
  const { code } = parseAuthParamsFromUrl(href);
  if (!code || url.searchParams.get('code')) {
    return href;
  }

  const exchange = new URL(`${url.origin}${url.pathname}`);
  exchange.searchParams.set('code', code);
  return exchange.toString();
}

function decodeAuthError(error: string): string {
  return decodeURIComponent(error.replace(/\+/g, ' '));
}

async function waitForRecoverySession(timeoutMs = 3000): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return true;

  return new Promise((resolve) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY' || nextSession) {
        clearTimeout(timeout);
        subscription.unsubscribe();
        resolve(!!nextSession);
      }
    });

    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      resolve(false);
    }, timeoutMs);
  });
}

/** Detect auth redirect params from email confirmation, OAuth, or magic links. */
export function hasAuthCallbackParams(): boolean {
  const params = parseAuthParamsFromUrl();
  return !!(
    params.code ||
    params.accessToken ||
    params.error ||
    params.type === 'signup' ||
    params.type === 'email'
  );
}

/** Detect password recovery params in the current URL. */
export function hasRecoveryParams(): boolean {
  const params = parseAuthParamsFromUrl();
  return !!(
    params.code ||
    params.accessToken ||
    params.type === 'recovery' ||
    params.type === 'magiclink'
  );
}

/** Exchange PKCE code or apply tokens from the confirmation / OAuth redirect URL. */
export async function completeAuthCallbackFromUrl(): Promise<{ error: string | null }> {
  const params = parseAuthParamsFromUrl();

  if (params.error) {
    return { error: decodeAuthError(params.error) };
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(buildCodeExchangeUrl());
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }

  if (params.accessToken) {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }

  return { error: null };
}

/** Establish a recovery session from a password reset email link. */
export async function completeRecoveryFromUrl(): Promise<{ error: string | null }> {
  const params = parseAuthParamsFromUrl();

  if (params.error) {
    return { error: decodeAuthError(params.error) };
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(buildCodeExchangeUrl());
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }

  if (params.accessToken || params.type === 'recovery' || params.type === 'magiclink') {
    const hasSession = await waitForRecoverySession();
    if (!hasSession) {
      return { error: 'Unable to establish recovery session' };
    }
    return { error: null };
  }

  return { error: null };
}
