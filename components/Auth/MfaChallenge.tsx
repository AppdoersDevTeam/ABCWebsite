import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { GlowingButton } from '../UI/GlowingButton';
import {
  applyAuthSession,
  mfaLoginSendEmail,
  mfaLoginVerify,
  mfaSessionSendEmail,
  mfaSessionVerify,
  type MfaMethod,
} from '../../lib/mfaClient';

export type MfaChallengeProps = {
  methods: Array<'totp' | 'email'>;
  maskedEmail: string;
  mode: 'login' | 'session';
  challengeId?: string;
  onVerified: () => Promise<void> | void;
  onCancel: () => void;
};

function fieldInputClass(): string {
  return 'appearance-none rounded-[4px] relative block w-full px-4 py-4 border border-gray-300 bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold tracking-[0.4em] text-center text-lg';
}

export const MfaChallenge: React.FC<MfaChallengeProps> = ({
  methods,
  maskedEmail,
  mode,
  challengeId,
  onVerified,
  onCancel,
}) => {
  const hasTotp = methods.includes('totp');
  const hasEmail = methods.includes('email');
  const [method, setMethod] = useState<'totp' | 'email' | 'recovery'>(
    hasTotp ? 'totp' : hasEmail ? 'email' : 'recovery'
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    setCode('');
    setError(null);
  }, [method]);

  const sendEmail = async () => {
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') {
        if (!challengeId) throw new Error('Verification session expired. Please sign in again.');
        await mfaLoginSendEmail(challengeId);
      } else {
        await mfaSessionSendEmail();
      }
      setEmailSent(true);
      setInfo(`A verification code was sent to ${maskedEmail}.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Too many attempts. Please try again later.');
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const verifyMethod = method as MfaMethod;
      if (mode === 'login') {
        if (!challengeId) throw new Error('Verification session expired. Please sign in again.');
        const result = await mfaLoginVerify({
          challengeId,
          method: verifyMethod,
          code,
        });
        if (!result.session?.access_token || !result.session.refresh_token) {
          throw new Error('Verification failed.');
        }
        await applyAuthSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
      } else {
        await mfaSessionVerify({ method: verifyMethod, code });
      }
      await onVerified();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid verification code.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative pt-32 md:pt-40 pb-32 bg-[#A8B774]">
      <div className="max-w-md w-full space-y-6 glass-card bg-white/80 p-10 shadow-xl border border-white/50 rounded-[16px] relative z-10 backdrop-blur-xl">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gold/20 text-gold">
            <Shield size={32} aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-serif font-normal text-charcoal">Verify your identity</h2>
          <p className="text-sm text-neutral">
            Two-factor authentication is enabled on this account. Choose a verification method.
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[4px] text-sm">
            {error}
          </div>
        )}
        {info && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-[4px] text-sm">
            {info}
          </div>
        )}

        <div className="flex flex-col gap-2" role="tablist" aria-label="Verification method">
          {hasTotp && (
            <button
              type="button"
              role="tab"
              aria-selected={method === 'totp'}
              className={`text-left px-4 py-3 rounded-[4px] border ${
                method === 'totp' ? 'border-gold bg-gold/10 font-bold' : 'border-gray-200'
              }`}
              onClick={() => setMethod('totp')}
            >
              Authenticator App
            </button>
          )}
          {hasEmail && (
            <button
              type="button"
              role="tab"
              aria-selected={method === 'email'}
              className={`text-left px-4 py-3 rounded-[4px] border ${
                method === 'email' ? 'border-gold bg-gold/10 font-bold' : 'border-gray-200'
              }`}
              onClick={() => setMethod('email')}
            >
              Email verification code
              <span className="block text-xs font-normal text-neutral mt-1">Send a code to {maskedEmail}</span>
            </button>
          )}
          <button
            type="button"
            role="tab"
            aria-selected={method === 'recovery'}
            className={`text-left px-4 py-3 rounded-[4px] border ${
              method === 'recovery' ? 'border-gold bg-gold/10 font-bold' : 'border-gray-200'
            }`}
            onClick={() => setMethod('recovery')}
          >
            Recovery code
          </button>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          {method === 'email' && (
            <GlowingButton type="button" variant="outline" fullWidth disabled={busy} onClick={sendEmail}>
              {emailSent ? 'Resend code' : 'Send code'}
            </GlowingButton>
          )}

          <div>
            <label htmlFor="mfa-code" className="block text-sm font-bold text-charcoal mb-2">
              {method === 'recovery' ? 'Recovery code' : '6-digit code'}
            </label>
            <input
              id="mfa-code"
              name="mfa-code"
              inputMode={method === 'recovery' ? 'text' : 'numeric'}
              autoComplete="one-time-code"
              autoFocus
              maxLength={method === 'recovery' ? 12 : 6}
              className={fieldInputClass()}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-invalid={Boolean(error)}
            />
          </div>

          <GlowingButton type="submit" fullWidth disabled={busy || !code.trim()}>
            {busy ? 'Verifying...' : 'Verify'}
          </GlowingButton>
          <button
            type="button"
            className="w-full text-sm text-gold hover:text-charcoal font-bold"
            onClick={onCancel}
          >
            Back to sign in
          </button>
        </form>
      </div>
    </div>
  );
};
