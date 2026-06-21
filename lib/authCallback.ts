import { supabase } from './supabase';

export type ParsedAuthParams = {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenHash: string | null;
  type: string | null;
  error: string | null;
};

/** Parse Supabase auth params from both search and hash (HashRouter-safe). */
export function parseAuthParamsFromUrl(href: string = window.location.href): ParsedAuthParams {
  const url = new URL(href);
  let code = url.searchParams.get('code');
  let accessToken = url.searchParams.get('access_token');
  let refreshToken = url.searchParams.get('refresh_token');
  let tokenHash = url.searchParams.get('token_hash');
  let type = url.searchParams.get('type');
  let error = url.searchParams.get('error_description') || url.searchParams.get('error');

  const absorbParams = (query: string) => {
    if (!query) return;
    const normalized = query.startsWith('?') ? query.slice(1) : query;
    const params = new URLSearchParams(normalized);
    code = code || params.get('code');
    accessToken = accessToken || params.get('access_token');
    refreshToken = refreshToken || params.get('refresh_token');
    tokenHash = tokenHash || params.get('token_hash');
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

  return { code, accessToken, refreshToken, tokenHash, type, error };
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

function isRecoveryType(type: string | null): boolean {
  return type === 'recovery' || type === 'magiclink';
}

export function isPasswordRecoveryUrl(href: string = window.location.href): boolean {
  const params = parseAuthParamsFromUrl(href);
  return (
    href.includes('/reset-password') ||
    !!params.tokenHash ||
    isRecoveryType(params.type)
  );
}

function mapRecoveryError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('expired') ||
    lower.includes('invalid') ||
    lower.includes('already been used') ||
    lower.includes('otp_expired')
  ) {
    return 'This reset link is invalid or has expired. Please request a new one.';
  }
  if (lower.includes('code verifier') || lower.includes('non-empty')) {
    return 'This reset link must be opened in the same browser where you requested it, or please request a new reset email and open that link directly.';
  }
  return message;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
async function waitForRecoverySession(timeoutMs = 4000): Promise<boolean> {
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
  if (isPasswordRecoveryUrl()) {
    return false;
  }

  const params = parseAuthParamsFromUrl();
  return !!(
    params.code ||
    params.accessToken ||
    params.tokenHash ||
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
    params.tokenHash ||
    isRecoveryType(params.type)
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

  if (params.accessToken && params.refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });
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

/** Remove auth params from the URL after a successful recovery exchange. */
export function clearRecoveryParamsFromUrl(): void {
  const url = new URL(window.location.href);
  const hash = url.hash || '';
  if (!hash.includes('/reset-password')) return;

  const base = `${url.origin}${url.pathname}`;
  window.history.replaceState({}, document.title, `${base}#/reset-password`);
}

/** Establish a recovery session from a password reset email link. */
export async function completeRecoveryFromUrl(): Promise<{ error: string | null }> {
  const params = parseAuthParamsFromUrl();

  if (params.error) {
    return { error: mapRecoveryError(decodeAuthError(params.error)) };
  }

  // Preferred for email links: works in any browser (no PKCE verifier required).
  if (params.tokenHash && (isRecoveryType(params.type) || isPasswordRecoveryUrl())) {
    const { error } = await withTimeout(
      supabase.auth.verifyOtp({
        token_hash: params.tokenHash,
        type: 'recovery',
      }),
      15000,
      'Password reset verification timed out. Please request a new reset link and try again.',
    );
    if (error) {
      return { error: mapRecoveryError(error.message) };
    }
    return { error: null };
  }

  if (params.accessToken && params.refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });
    if (error) {
      return { error: mapRecoveryError(error.message) };
    }
    return { error: null };
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(buildCodeExchangeUrl());
    if (error) {
      return { error: mapRecoveryError(error.message) };
    }
    return { error: null };
  }

  if (params.accessToken || isRecoveryType(params.type)) {
    const hasSession = await waitForRecoverySession();
    if (!hasSession) {
      return { error: 'This reset link is invalid or has expired. Please request a new one.' };
    }
    return { error: null };
  }

  return { error: null };
}
