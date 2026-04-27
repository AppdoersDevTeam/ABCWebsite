import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { GlowingButton } from '../../components/UI/GlowingButton';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const hasRecoveryIndicators = useMemo(() => {
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    return (
      search.includes('code=') ||
      hash.includes('access_token=') ||
      hash.includes('type=recovery') ||
      hash.includes('type=magiclink')
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setError(null);
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        // For PKCE flows, Supabase provides `code` and we must exchange it.
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (exchangeError) throw exchangeError;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!cancelled) {
          if (!session && hasRecoveryIndicators) {
            setError('This reset link is invalid or has expired. Please request a new one.');
          }
          setIsReady(true);
        }
      } catch (e: any) {
        console.error('ResetPassword init error:', e);
        if (!cancelled) {
          setError('Unable to validate reset link. Please request a new one.');
          setIsReady(true);
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [hasRecoveryIndicators]);

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
    } catch (e: any) {
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

