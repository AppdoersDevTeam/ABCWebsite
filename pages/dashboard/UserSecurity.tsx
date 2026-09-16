import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, KeyRound, Mail, Shield, Smartphone } from 'lucide-react';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { PasswordInput } from '../../components/UI/PasswordInput';
import { TurnstileField, type TurnstileFieldHandle } from '../../components/UI/TurnstileField';
import {
  mfaEmailDisable,
  mfaEmailDisableStart,
  mfaEmailEnableStart,
  mfaEmailEnableVerify,
  mfaPasswordChange,
  mfaRecoveryGenerate,
  mfaStatus,
  mfaTotpDisable,
  mfaTotpEnrollCancel,
  mfaTotpEnrollStart,
  mfaTotpEnrollVerify,
  type MfaStatus,
} from '../../lib/mfaClient';
import { otpauthQrSvg } from '../../lib/mfaQr';

type Dialog =
  | 'password'
  | 'totp-setup'
  | 'totp-disable'
  | 'email-enable'
  | 'email-disable'
  | 'recovery'
  | 'recovery-codes'
  | null;

function StatusPill({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
        enabled ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-neutral border border-gray-200'
      }`}
    >
      {enabled ? <CheckCircle2 size={14} aria-hidden="true" /> : null}
      {enabled ? 'Enabled' : 'Disabled'}
    </span>
  );
}

function DialogError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[4px] text-sm">
      {message}
    </div>
  );
}

function GoogleAccountNote() {
  return (
    <p className="text-sm text-neutral">
      You signed in with Google, so this website does not have a separate password. Your Google account password will not work here. Continue while signed in to confirm it is you.
    </p>
  );
}

export const UserSecurity = () => {
  const [status, setStatus] = useState<MfaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [secret, setSecret] = useState('');
  const [qrSvg, setQrSvg] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [recoveryWarning, setRecoveryWarning] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const turnstileRef = useRef<TurnstileFieldHandle>(null);
  const needsSitePassword = status?.hasPasswordProvider !== false;

  const resetCaptcha = () => {
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  };

  const closeDialog = () => {
    setDialog(null);
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setCode('');
    setSecret('');
    setQrSvg('');
    resetCaptcha();
    if (dialog === 'totp-setup') {
      void mfaTotpEnrollCancel();
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await mfaStatus();
      setStatus(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load security settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const showRecovery = (codes?: string[] | null, warning?: string) => {
    if (codes && codes.length) {
      setRecoveryCodes(codes);
      setRecoveryWarning(
        warning ||
          'Save these recovery codes somewhere secure. They can be used to access your account if you lose your authentication method.'
      );
      setDialog('recovery-codes');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('Please complete the CAPTCHA before continuing.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await mfaPasswordChange({
        currentPassword: password,
        newPassword,
        captchaToken,
      });
      setSuccess('Password updated.');
      closeDialog();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password.');
      resetCaptcha();
    } finally {
      setBusy(false);
    }
  };

  const startTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('Please complete the CAPTCHA before continuing.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await mfaTotpEnrollStart({ password, captchaToken });
      if (!result.secret || !result.otpauthUri) {
        throw new Error('Unable to start authenticator setup.');
      }
      setSecret(result.secret);
      setQrSvg(await otpauthQrSvg(result.otpauthUri));
      setPassword('');
      resetCaptcha();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to start authenticator setup.');
      resetCaptcha();
    } finally {
      setBusy(false);
    }
  };

  const verifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await mfaTotpEnrollVerify(code);
      setSuccess('Authenticator app enabled.');
      setDialog(null);
      setSecret('');
      setQrSvg('');
      setCode('');
      await load();
      showRecovery(result.recoveryCodes, result.recoveryWarning);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid verification code.');
    } finally {
      setBusy(false);
    }
  };

  const disableTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('Please complete the CAPTCHA before continuing.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await mfaTotpDisable({ password, code, captchaToken });
      setSuccess('Authenticator app disabled.');
      closeDialog();
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to disable authenticator.');
      resetCaptcha();
    } finally {
      setBusy(false);
    }
  };

  const startEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('Please complete the CAPTCHA before continuing.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await mfaEmailEnableStart({ password, captchaToken });
      setSuccess(null);
      setPassword('');
      resetCaptcha();
      setEmailSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to send verification email.');
      resetCaptcha();
    } finally {
      setBusy(false);
    }
  };

  const verifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await mfaEmailEnableVerify(code);
      setSuccess('Email verification enabled.');
      setDialog(null);
      setCode('');
      setEmailSent(false);
      await load();
      showRecovery(result.recoveryCodes, result.recoveryWarning);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid verification code.');
    } finally {
      setBusy(false);
    }
  };

  const startEmailDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('Please complete the CAPTCHA before continuing.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await mfaEmailDisableStart({ password, captchaToken });
      setEmailSent(true);
      resetCaptcha();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to send verification email.');
      resetCaptcha();
    } finally {
      setBusy(false);
    }
  };

  const disableEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken && !emailSent) {
      setError('Please complete the CAPTCHA before continuing.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await mfaEmailDisable({
        password,
        code,
        captchaToken: captchaToken || '',
        confirmMethod: status?.totpEnabled ? 'totp' : 'email',
      });
      setSuccess('Email verification disabled.');
      closeDialog();
      setEmailSent(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to disable email verification.');
      resetCaptcha();
    } finally {
      setBusy(false);
    }
  };

  const generateRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('Please complete the CAPTCHA before continuing.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await mfaRecoveryGenerate({ password, code, captchaToken });
      setDialog(null);
      await load();
      showRecovery(result.recoveryCodes, result.recoveryWarning);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to generate recovery codes.');
      resetCaptcha();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="User Security"
        subtitle="Protect your member account with a password and two-factor authentication."
        icon={<Shield size={28} />}
      />

      {error && !dialog && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[4px] text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-[4px] text-sm">
          {success}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-[12px] p-6 text-neutral">Loading security settings…</div>
      ) : !status ? (
        <div className="bg-white border border-gray-200 rounded-[12px] p-6 space-y-4">
          <p className="text-sm text-neutral">Security settings could not be loaded. You can try again.</p>
          <GlowingButton type="button" size="sm" onClick={() => { setError(null); void load(); }}>
            Try again
          </GlowingButton>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="bg-white border border-gray-200 rounded-[12px] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center">
                <KeyRound size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-charcoal">Password</h2>
                <p className="text-sm text-neutral">
                  {needsSitePassword
                    ? 'Change the password used to sign in with email.'
                    : 'Optionally set a password for this site. Google sign-in will still work.'}
                </p>
              </div>
            </div>
            <GlowingButton type="button" size="sm" onClick={() => { setError(null); setDialog('password'); }}>
              {needsSitePassword ? 'Change password' : 'Set a password'}
            </GlowingButton>
          </section>

          <section className="bg-white border border-gray-200 rounded-[12px] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-charcoal">Two-factor authentication</h2>
                <p className="text-sm text-neutral mt-1">
                  Protect your account with an additional verification step when signing in.
                </p>
              </div>
              <StatusPill enabled={status.mfaEnabled} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-gray-200 rounded-[12px] p-5 space-y-3">
                <div className="flex items-center gap-2 text-charcoal font-bold">
                  <Smartphone size={18} aria-hidden="true" />
                  Authenticator app
                </div>
                <p className="text-sm text-neutral">
                  Recommended. Works with Google Authenticator, Microsoft Authenticator, Authy, 1Password, and other TOTP apps.
                </p>
                <StatusPill enabled={status.totpEnabled} />
                <div className="flex flex-wrap gap-2">
                  <GlowingButton
                    type="button"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      setEmailSent(false);
                      setDialog('totp-setup');
                    }}
                  >
                    {status.totpEnabled ? 'Replace' : 'Set up'}
                  </GlowingButton>
                  {status.totpEnabled && (
                    <GlowingButton type="button" size="sm" variant="outline" onClick={() => { setError(null); setDialog('totp-disable'); }}>
                      Disable
                    </GlowingButton>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 rounded-[12px] p-5 space-y-3">
                <div className="flex items-center gap-2 text-charcoal font-bold">
                  <Mail size={18} aria-hidden="true" />
                  Email verification
                </div>
                <p className="text-sm text-neutral">
                  Send a one-time code to {status.maskedEmail} when you sign in.
                </p>
                <StatusPill enabled={status.emailEnabled} />
                <div className="flex flex-wrap gap-2">
                  {!status.emailEnabled ? (
                    <GlowingButton type="button" size="sm" onClick={() => { setError(null); setEmailSent(false); setDialog('email-enable'); }}>
                      Enable
                    </GlowingButton>
                  ) : (
                    <GlowingButton type="button" size="sm" variant="outline" onClick={() => { setError(null); setEmailSent(false); setDialog('email-disable'); }}>
                      Disable
                    </GlowingButton>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-[12px] p-6 space-y-4">
            <h2 className="text-xl font-bold text-charcoal">Recovery codes</h2>
            <p className="text-sm text-neutral">
              One-time codes for account access if you lose your authenticator or email. They are shown only when generated.
            </p>
            <p className="text-sm text-charcoal">
              Remaining unused codes: <strong>{status.recoveryRemaining}</strong>
            </p>
            <GlowingButton
              type="button"
              size="sm"
              variant="outline"
              disabled={!status.mfaEnabled}
              onClick={() => { setError(null); setDialog('recovery'); }}
            >
              Generate new codes
            </GlowingButton>
          </section>
        </div>
      )}

      <Modal isOpen={dialog === 'password'} onClose={closeDialog} title={needsSitePassword ? 'Change password' : 'Set a password'}>
        <form className="space-y-4" onSubmit={handlePasswordChange}>
          <DialogError message={error} />
          {needsSitePassword ? (
            <label className="block text-sm font-bold text-charcoal">
              Current password
              <PasswordInput wrapperClassName="mt-2" className="w-full border border-gray-300 rounded-[4px] px-4 py-3" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </label>
          ) : (
            <GoogleAccountNote />
          )}
          <label className="block text-sm font-bold text-charcoal">
            New password
            <PasswordInput wrapperClassName="mt-2" className="w-full border border-gray-300 rounded-[4px] px-4 py-3" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          </label>
          <label className="block text-sm font-bold text-charcoal">
            Confirm new password
            <PasswordInput wrapperClassName="mt-2" className="w-full border border-gray-300 rounded-[4px] px-4 py-3" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          </label>
          <TurnstileField ref={turnstileRef} onToken={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
          <GlowingButton type="submit" fullWidth disabled={busy || !captchaToken}>{busy ? 'Saving...' : needsSitePassword ? 'Update password' : 'Set password'}</GlowingButton>
        </form>
      </Modal>

      <Modal isOpen={dialog === 'totp-setup'} onClose={closeDialog} title={status?.totpEnabled ? 'Replace authenticator app' : 'Set up authenticator app'} closeOnBackdropClick={false}>
        {!secret ? (
          <form className="space-y-4" onSubmit={startTotp}>
            <DialogError message={error} />
            <p className="text-sm text-neutral">
              {needsSitePassword
                ? 'Confirm your password, then scan the QR code with your authenticator app. The method is not enabled until you enter a valid code.'
                : 'Scan the QR code with your authenticator app after you continue. The method is not enabled until you enter a valid code.'}
            </p>
            {needsSitePassword ? (
              <label className="block text-sm font-bold text-charcoal">
                Current password
                <PasswordInput wrapperClassName="mt-2" className="w-full border border-gray-300 rounded-[4px] px-4 py-3" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              </label>
            ) : (
              <GoogleAccountNote />
            )}
            <TurnstileField ref={turnstileRef} onToken={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
            <GlowingButton type="submit" fullWidth disabled={busy || !captchaToken}>{busy ? 'Preparing...' : 'Continue'}</GlowingButton>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={verifyTotp}>
            <DialogError message={error} />
            <p className="text-sm text-neutral">Scan this QR code, or enter the setup key manually. Then enter the 6-digit code from the app.</p>
            {qrSvg && (
              <div className="flex justify-center bg-white p-4 border border-gray-100 rounded-[8px]" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            )}
            <p className="text-xs text-neutral break-all">
              <span className="font-bold text-charcoal">Manual setup key:</span> {secret}
            </p>
            <label className="block text-sm font-bold text-charcoal">
              6-digit code
              <input id="totp-setup-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="mt-2 w-full border border-gray-300 rounded-[4px] px-4 py-3 tracking-[0.4em] text-center" value={code} onChange={(e) => setCode(e.target.value)} required />
            </label>
            <GlowingButton type="submit" fullWidth disabled={busy || code.length < 6}>{busy ? 'Verifying...' : 'Enable authenticator'}</GlowingButton>
          </form>
        )}
      </Modal>

      <Modal isOpen={dialog === 'totp-disable'} onClose={closeDialog} title="Disable authenticator app">
        <form className="space-y-4" onSubmit={disableTotp}>
          <DialogError message={error} />
          <p className="text-sm text-neutral">
            {needsSitePassword
              ? 'Confirm your password and a current authenticator code to disable this method.'
              : 'Enter a current authenticator code to disable this method.'}
          </p>
          {needsSitePassword ? (
            <label className="block text-sm font-bold text-charcoal">
              Current password
              <PasswordInput wrapperClassName="mt-2" className="w-full border border-gray-300 rounded-[4px] px-4 py-3" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </label>
          ) : (
            <GoogleAccountNote />
          )}
          <label className="block text-sm font-bold text-charcoal">
            Authenticator code
            <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="mt-2 w-full border border-gray-300 rounded-[4px] px-4 py-3 tracking-[0.4em] text-center" value={code} onChange={(e) => setCode(e.target.value)} required />
          </label>
          <TurnstileField ref={turnstileRef} onToken={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
          <GlowingButton type="submit" fullWidth disabled={busy || !captchaToken}>{busy ? 'Disabling...' : 'Disable'}</GlowingButton>
        </form>
      </Modal>

      <Modal isOpen={dialog === 'email-enable'} onClose={() => { closeDialog(); setEmailSent(false); }} title="Enable email verification" closeOnBackdropClick={false}>
        {!emailSent ? (
          <form className="space-y-4" onSubmit={startEmail}>
            <DialogError message={error} />
            <p className="text-sm text-neutral">A one-time code will be sent to {status?.maskedEmail}. Email MFA is not enabled until that code is verified.</p>
            {needsSitePassword ? (
              <label className="block text-sm font-bold text-charcoal">
                Current password
                <PasswordInput wrapperClassName="mt-2" className="w-full border border-gray-300 rounded-[4px] px-4 py-3" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              </label>
            ) : (
              <GoogleAccountNote />
            )}
            <TurnstileField ref={turnstileRef} onToken={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
            <GlowingButton type="submit" fullWidth disabled={busy || !captchaToken}>{busy ? 'Sending...' : 'Send code'}</GlowingButton>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={verifyEmail}>
            <DialogError message={error} />
            <p className="text-sm text-neutral">Enter the 6-digit code sent to {status?.maskedEmail}.</p>
            <label className="block text-sm font-bold text-charcoal">
              Verification code
              <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="mt-2 w-full border border-gray-300 rounded-[4px] px-4 py-3 tracking-[0.4em] text-center" value={code} onChange={(e) => setCode(e.target.value)} required />
            </label>
            <GlowingButton type="submit" fullWidth disabled={busy || code.length < 6}>{busy ? 'Verifying...' : 'Enable email verification'}</GlowingButton>
          </form>
        )}
      </Modal>

      <Modal isOpen={dialog === 'email-disable'} onClose={() => { closeDialog(); setEmailSent(false); }} title="Disable email verification" closeOnBackdropClick={false}>
        {!emailSent && !status?.totpEnabled ? (
          <form className="space-y-4" onSubmit={startEmailDisable}>
            <DialogError message={error} />
            <p className="text-sm text-neutral">
              {needsSitePassword
                ? 'Confirm your password. We will email a code before disabling this method.'
                : 'We will email a code before disabling this method.'}
            </p>
            {needsSitePassword ? (
              <label className="block text-sm font-bold text-charcoal">
                Current password
                <PasswordInput wrapperClassName="mt-2" className="w-full border border-gray-300 rounded-[4px] px-4 py-3" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              </label>
            ) : (
              <GoogleAccountNote />
            )}
            <TurnstileField ref={turnstileRef} onToken={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
            <GlowingButton type="submit" fullWidth disabled={busy || !captchaToken}>{busy ? 'Sending...' : 'Send code'}</GlowingButton>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={disableEmail}>
            <DialogError message={error} />
            <p className="text-sm text-neutral">
              {status?.totpEnabled
                ? needsSitePassword
                  ? 'Confirm your password and a current authenticator code.'
                  : 'Enter a current authenticator code.'
                : `Enter the code sent to ${status?.maskedEmail}.`}
            </p>
            {needsSitePassword ? (
              <label className="block text-sm font-bold text-charcoal">
                Current password
                <PasswordInput wrapperClassName="mt-2" className="w-full border border-gray-300 rounded-[4px] px-4 py-3" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              </label>
            ) : (
              <GoogleAccountNote />
            )}
            <label className="block text-sm font-bold text-charcoal">
              {status?.totpEnabled ? 'Authenticator code' : 'Email code'}
              <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="mt-2 w-full border border-gray-300 rounded-[4px] px-4 py-3 tracking-[0.4em] text-center" value={code} onChange={(e) => setCode(e.target.value)} required />
            </label>
            {status?.totpEnabled && (
              <TurnstileField ref={turnstileRef} onToken={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
            )}
            <GlowingButton type="submit" fullWidth disabled={busy || (Boolean(status?.totpEnabled) && !captchaToken)}>
              {busy ? 'Disabling...' : 'Disable'}
            </GlowingButton>
          </form>
        )}
      </Modal>

      <Modal isOpen={dialog === 'recovery'} onClose={closeDialog} title="Generate new recovery codes">
        <form className="space-y-4" onSubmit={generateRecovery}>
          <DialogError message={error} />
          <p className="text-sm text-neutral">
            {needsSitePassword
              ? 'This replaces all previous recovery codes. Confirm your password and a current MFA code.'
              : 'This replaces all previous recovery codes. Confirm with a current MFA code.'}
          </p>
          {needsSitePassword ? (
            <label className="block text-sm font-bold text-charcoal">
              Current password
              <PasswordInput wrapperClassName="mt-2" className="w-full border border-gray-300 rounded-[4px] px-4 py-3" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </label>
          ) : (
            <GoogleAccountNote />
          )}
          <label className="block text-sm font-bold text-charcoal">
            Current verification code
            <input inputMode="text" autoComplete="one-time-code" className="mt-2 w-full border border-gray-300 rounded-[4px] px-4 py-3 tracking-[0.3em] text-center" value={code} onChange={(e) => setCode(e.target.value)} required />
          </label>
          <TurnstileField ref={turnstileRef} onToken={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
          <GlowingButton type="submit" fullWidth disabled={busy || !captchaToken}>{busy ? 'Generating...' : 'Generate codes'}</GlowingButton>
        </form>
      </Modal>

      <Modal isOpen={dialog === 'recovery-codes'} onClose={() => { setDialog(null); setRecoveryCodes([]); }} title="Recovery codes" closeOnBackdropClick={false}>
        <div className="space-y-4">
          <p className="text-sm text-neutral">{recoveryWarning}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-sm bg-gray-50 border border-gray-200 rounded-[8px] p-4">
            {recoveryCodes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-xs text-neutral">These codes will not be shown again.</p>
          <GlowingButton type="button" fullWidth onClick={() => { setDialog(null); setRecoveryCodes([]); }}>
            I have saved these codes
          </GlowingButton>
        </div>
      </Modal>
    </div>
  );
};
