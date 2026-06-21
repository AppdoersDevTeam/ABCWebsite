import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { completeRecoveryFromUrl, hasRecoveryParams } from '../../lib/authCallback';
import { GlowingButton } from '../../components/UI/GlowingButton';

/** Fix malformed HashRouter recovery URLs like `#/reset-password#access_token=...`. */
function normalizeRecoveryUrl(): void {
  const hash = window.location.hash || '';
  if (!hash.includes('/reset-password')) return;

  if (hash.includes('#access_token') || hash.includes('#type=recovery')) {
    const parts = hash.split('#');
    if (parts.length > 2) {
      const route = parts[1];
      const authParams = parts.slice(2).join('#');
      const baseUrl = window.location.origin.replace(/\/$/, '');
      const pathname = window.location.pathname.replace(/\/$/, '') || '';
      const newUrl = `${baseUrl}${pathname}#${route}#${authParams}`;
      window.history.replaceState({}, document.title, newUrl);
    }
  }
}

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const recoveryLinkPresent = hasRecoveryParams();

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setError(null);
      normalizeRecoveryUrl();

      try {
        if (recoveryLinkPresent) {
          const { error: recoveryError } = await completeRecoveryFromUrl();
          if (recoveryError) {
            throw new Error(recoveryError);
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!cancelled) {
          if (!session && recoveryLinkPresent) {
            setError('This reset link is invalid or has expired. Please request a new one.');
          }
          setIsReady(true);
        }
      } catch (e: unknown) {
        console.error('ResetPassword init error:', e);
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'Unable to validate reset link. Please request a new one.';
          setError(message);
          setIsReady(true);
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [recoveryLinkPresent]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess('Password updated successfully. You can now sign in.');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } catch (e: unknown) {
      console.error('ResetPassword update error:', e);
      setError('Failed to update password. Please request a new reset link and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative pt-32 md:pt-40 pb-32 bg-[#A8B774]">
      <div className="max-w-md w-full space-y-6 glass-card bg-white/80 p-10 shadow-xl border border-white/50 rounded-[16px] relative z-10 backdrop-blur-xl">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-serif font-normal text-charcoal">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-neutral">
            Choose a new password for your account.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[4px] text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-[4px] text-sm">
            {success}
          </div>
        )}

        {!isReady ? (
          <div className="text-neutral font-bold">Loading…</div>
        ) : (
          <form className="space-y-5" onSubmit={handleSave}>
            <div>
              <label htmlFor="new-password" className="block text-sm font-bold text-charcoal mb-2">
                New password
              </label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                required
                className="appearance-none rounded-[4px] relative block w-full px-4 py-4 border border-gray-300 bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold focus:z-10 shadow-sm"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-2 text-xs text-neutral">Minimum 8 characters.</p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-bold text-charcoal mb-2">
                Confirm password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="appearance-none rounded-[4px] relative block w-full px-4 py-4 border border-gray-300 bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold focus:z-10 shadow-sm"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <GlowingButton type="submit" fullWidth disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Update password'}
            </GlowingButton>

            <div className="text-center">
              <Link to="/login" className="text-sm text-gold hover:text-charcoal font-bold">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
