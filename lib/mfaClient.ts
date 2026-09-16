import { supabase } from './supabase';

export type MfaMethod = 'totp' | 'email' | 'recovery';

export type MfaStatus = {
  totpEnabled: boolean;
  emailEnabled: boolean;
  mfaEnabled: boolean;
  totpPending: boolean;
  recoveryRemaining: number;
  recoveryGeneratedAt: string | null;
  maskedEmail: string;
  methods: Array<'totp' | 'email'>;
  hasPasswordProvider?: boolean;
};

export type MfaLoginChallenge = {
  challengeId: string;
  methods: Array<'totp' | 'email'>;
  maskedEmail: string;
};

export class MfaRequiredError extends Error {
  challengeId: string;
  methods: Array<'totp' | 'email'>;
  maskedEmail: string;

  constructor(challenge: MfaLoginChallenge) {
    super('mfa_required');
    this.name = 'MfaRequiredError';
    this.challengeId = challenge.challengeId;
    this.methods = challenge.methods;
    this.maskedEmail = challenge.maskedEmail;
  }
}

type InvokeResult<T> = T & { error?: string };

async function invokeMfa<T extends Record<string, unknown>>(
  body: Record<string, unknown>,
  fn: 'mfa' | 'mfa-login' = 'mfa'
): Promise<InvokeResult<T>> {
  const { data: sessionData } = await supabase.auth.getSession();
  let accessToken = sessionData.session?.access_token || '';
  const expiresAtMs = (sessionData.session?.expires_at || 0) * 1000;
  if (!accessToken || (expiresAtMs && expiresAtMs < Date.now() + 30_000)) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    accessToken = refreshed.session?.access_token || accessToken;
  }

  const { data, error } = await supabase.functions.invoke(fn, {
    body,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (data && typeof data === 'object' && data !== null && 'error' in data) {
    const msg = (data as { error?: unknown }).error;
    if (typeof msg === 'string' && msg.trim()) {
      throw new Error(msg);
    }
  }

  if (error) {
    const err = error as { message?: string; context?: Response };
    if (err.context && typeof err.context.json === 'function') {
      try {
        const parsed = await err.context.json();
        const msg =
          (typeof parsed?.error === 'string' && parsed.error) ||
          (typeof parsed?.message === 'string' && parsed.message) ||
          (typeof parsed?.msg === 'string' && parsed.msg) ||
          '';
        if (msg.trim()) {
          throw new Error(msg);
        }
      } catch (inner) {
        if (inner instanceof Error && inner.message && inner.message !== error.message) {
          throw inner;
        }
      }
    }
    throw new Error(err.message || 'Request failed');
  }

  return (data || {}) as InvokeResult<T>;
}

export async function mfaLoginBegin(params: {
  email: string;
  password: string;
  captchaToken: string;
}): Promise<{ session?: { access_token: string; refresh_token: string } }> {
  const data = await invokeMfa<{
    mfaRequired?: boolean;
    challengeId?: string;
    methods?: Array<'totp' | 'email'>;
    maskedEmail?: string;
    session?: { access_token: string; refresh_token: string };
  }>({
    action: 'login_begin',
    ...params,
  }, 'mfa-login');

  if (data.mfaRequired && data.challengeId) {
    throw new MfaRequiredError({
      challengeId: data.challengeId,
      methods: data.methods || [],
      maskedEmail: data.maskedEmail || '',
    });
  }

  return { session: data.session };
}

export async function mfaLoginSendEmail(challengeId: string) {
  return invokeMfa<{ ok: boolean; maskedEmail?: string }>({
    action: 'login_send_email',
    challengeId,
  }, 'mfa-login');
}

export async function mfaLoginVerify(params: {
  challengeId: string;
  method: MfaMethod;
  code: string;
}) {
  return invokeMfa<{ session?: { access_token: string; refresh_token: string } }>({
    action: 'login_verify',
    ...params,
  }, 'mfa-login');
}

export async function mfaSessionStatus() {
  return invokeMfa<{
    mfaRequired: boolean;
    methods: Array<'totp' | 'email'>;
    maskedEmail: string;
    approved?: boolean;
  }>({ action: 'session_status' });
}

export async function mfaSessionSendEmail() {
  return invokeMfa<{ ok: boolean; maskedEmail?: string }>({ action: 'session_send_email' });
}

export async function mfaSessionVerify(params: { method: MfaMethod; code: string }) {
  return invokeMfa<{ ok: boolean }>({ action: 'session_verify', ...params });
}

export async function mfaStatus() {
  return invokeMfa<MfaStatus>({ action: 'status' });
}

export async function mfaTotpEnrollStart(params: { password: string; captchaToken: string }) {
  return invokeMfa<{ secret: string; otpauthUri: string; replacing?: boolean }>({
    action: 'totp_enroll_start',
    ...params,
  });
}

export async function mfaTotpEnrollVerify(code: string) {
  return invokeMfa<{ recoveryCodes?: string[] | null; recoveryWarning?: string }>({
    action: 'totp_enroll_verify',
    code,
  });
}

export async function mfaTotpEnrollCancel() {
  return invokeMfa<{ ok: boolean }>({ action: 'totp_enroll_cancel' });
}

export async function mfaTotpDisable(params: {
  password: string;
  code: string;
  captchaToken: string;
}) {
  return invokeMfa<{ ok: boolean }>({ action: 'totp_disable', ...params });
}

export async function mfaEmailEnableStart(params: { password: string; captchaToken: string; resend?: boolean }) {
  return invokeMfa<{ maskedEmail?: string }>({ action: 'email_enable_start', ...params });
}

export async function mfaEmailEnableVerify(code: string) {
  return invokeMfa<{ recoveryCodes?: string[] | null; recoveryWarning?: string }>({
    action: 'email_enable_verify',
    code,
  });
}

export async function mfaEmailDisableStart(params: { password: string; captchaToken: string }) {
  return invokeMfa<{ maskedEmail?: string }>({ action: 'email_disable_start', ...params });
}

export async function mfaEmailDisable(params: {
  password: string;
  code: string;
  captchaToken: string;
  confirmMethod?: 'email' | 'totp';
}) {
  return invokeMfa<{ ok: boolean }>({ action: 'email_disable', ...params });
}

export async function mfaRecoveryGenerate(params: {
  password: string;
  code: string;
  captchaToken: string;
}) {
  return invokeMfa<{ recoveryCodes: string[]; recoveryWarning?: string }>({
    action: 'recovery_generate',
    ...params,
  });
}

export async function mfaPasswordChange(params: {
  currentPassword: string;
  newPassword: string;
  captchaToken: string;
}) {
  return invokeMfa<{ ok: boolean }>({ action: 'password_change', ...params });
}

export async function applyAuthSession(session: { access_token: string; refresh_token: string }) {
  const { error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (error) throw error;
}
