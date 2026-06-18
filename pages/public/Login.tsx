import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Shield, User as UserIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { displayName } from '../../lib/constants';
import {
  getSignupSummaryError,
  validateEmailSignupFields,
  type SignupField,
  type SignupFieldErrors,
} from '../../lib/validateSignupFields';
import { normalizePhoneForAuth, sanitizePhoneInput } from '../../lib/validatePhone';

function fieldInputClass(hasError: boolean): string {
  const base =
    'appearance-none rounded-[4px] relative block w-full px-4 py-4 border bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-gold focus:z-10 shadow-sm';
  return hasError
    ? `${base} border-red-400 focus:border-red-500`
    : `${base} border-gray-300 focus:border-gold`;
}

function FormField({
  error,
  children,
}: {
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      {children}
      {error && <p className="text-xs text-red-600 px-1">{error}</p>}
    </div>
  );
}

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginFlash, setLoginFlash] = useState<{ name: string; role: string } | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({});
  const [awaitingEmailVerification, setAwaitingEmailVerification] = useState(false);
  const {
    loginWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    isLoading,
    user,
    refreshUserProfile,
    sendPasswordReset,
  } = useAuth();
  const navigate = useNavigate();

  const clearFieldError = (field: SignupField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateSignup = (): boolean => {
    const errors = validateEmailSignupFields({
      firstName,
      lastName,
      email,
      phone,
      password,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(getSignupSummaryError(errors));
      return false;
    }

    setFieldErrors({});
    setError(null);
    return true;
  };

  const goToPendingApproval = () => {
    setTimeout(() => {
      navigate('/pending-approval', { replace: true });
    }, 500);
  };

  const getRedirectPath = (role: string, isApproved: boolean): string => {
    if (!isApproved) return '/pending-approval';
    sessionStorage.removeItem('testRoleOverride');
    return role === 'admin' ? '/admin' : '/dashboard';
  };

  useEffect(() => {
    if (user && !isLoading && !isLoggingIn) {
      setTimeout(() => {
        const redirectPath = getRedirectPath(user.role, user.is_approved);
        navigate(redirectPath, { replace: true });
      }, 100);
    }
  }, [user, isLoading, navigate, isLoggingIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (isResettingPassword) {
        const normalizedEmail = (resetEmail || email || '').trim();
        if (!normalizedEmail) {
          setError('Please enter your email address');
          return;
        }

        if (!window.confirm(`Send password reset link to ${normalizedEmail}?`)) {
          return;
        }

        await sendPasswordReset(normalizedEmail);
        setSuccess('Password reset email sent. Please check your inbox.');
        setIsResettingPassword(false);
        setResetEmail('');
        return;
      }

      if (isSignUp) {
        if (!validateSignup()) {
          return;
        }

        const normalizedPhone = phone.trim()
          ? normalizePhoneForAuth(phone) ?? undefined
          : undefined;
        const result = await signUpWithEmail(
          email.trim(),
          password,
          firstName.trim(),
          lastName.trim(),
          normalizedPhone
        );
        if (result.needsEmailVerification) {
          setAwaitingEmailVerification(true);
          setSuccess(
            `We sent a verification link to ${email.trim()}. Please check your inbox and click the link to confirm your email.`
          );
          return;
        }
        setSuccess('Account created! Please wait for admin approval.');
        goToPendingApproval();
      } else {
        setIsLoggingIn(true);
        try {
          if (!email || !password) {
            setError('Please enter email and password');
            setIsLoggingIn(false);
            return;
          }
          await loginWithEmail(email, password);

          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const profilePromise = supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
              .then(result => result.data);

            const timeoutPromise = new Promise((resolve) => {
              setTimeout(() => resolve(null), 2000);
            });

            const userData = await Promise.race([profilePromise, timeoutPromise]) as any;

            const role = userData?.role || user?.role || 'member';
            const isApproved = userData?.is_approved ?? user?.is_approved ?? false;
            const nameToShow = displayName(userData || user);

            setLoginFlash({ name: nameToShow, role });

            const redirectPath = getRedirectPath(role, isApproved);

            setTimeout(() => {
              navigate(redirectPath, { replace: true });

              setTimeout(() => {
                const currentHash = window.location.hash;
                if (currentHash.includes('login') || currentHash === '#/') {
                  window.location.hash = `#${redirectPath}`;
                }
              }, 500);
            }, 1200);

            refreshUserProfile().catch(err => {
              console.warn('Login - Background profile refresh failed:', err);
            });
          } else {
            throw new Error('Login failed - no session created');
          }
        } finally {
          setIsLoggingIn(false);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setIsLoggingIn(false);
      navigate(`/login-error?error=login_failed`, { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      navigate(`/login-error?error=oauth_failed`, { replace: true });
    }
  };

  if (loginFlash) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 relative pt-32 md:pt-40 pb-32 bg-[#A8B774]">
        <div className="max-w-md w-full glass-card bg-white/80 p-10 shadow-xl border border-white/50 rounded-[16px] relative z-10 backdrop-blur-xl text-center space-y-4 animate-pulse">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gold/20 text-gold">
            {loginFlash.role === 'admin' ? <Shield size={32} /> : <UserIcon size={32} />}
          </div>
          <h2 className="text-3xl font-serif font-normal text-charcoal">
            Welcome, {loginFlash.name}
          </h2>
          <span className="inline-block text-xs font-bold text-charcoal bg-gold px-4 py-2 rounded-full border border-gold uppercase tracking-widest shadow-sm">
            Signing in as {loginFlash.role === 'admin' ? 'Admin' : 'Member'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative pt-32 md:pt-40 pb-32 bg-[#A8B774]">
      <div className="max-w-md w-full space-y-8 glass-card bg-white/80 p-10 shadow-xl border border-white/50 rounded-[16px] relative z-10 backdrop-blur-xl">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-serif font-normal text-charcoal">
            {isSignUp ? 'Create Account' : 'Member Login'}
          </h2>
          <p className="mt-2 text-sm text-neutral">
            {isSignUp
              ? 'Sign up to access the directory, roster, and prayer wall.'
              : 'Access the directory, roster, and prayer wall.'
            }
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

        {awaitingEmailVerification ? (
          <div className="space-y-4 text-sm text-neutral">
            <p>
              Check your inbox for a verification email. After confirming, you can sign in and wait for admin approval.
            </p>
            <button
              type="button"
              onClick={() => {
                setAwaitingEmailVerification(false);
                setIsSignUp(false);
                setSuccess(null);
              }}
              className="text-gold hover:text-charcoal font-bold"
            >
              Back to sign in
            </button>
          </div>
        ) : (
        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
          {isResettingPassword && (
            <div className="bg-gray-50 border border-gray-200 rounded-[4px] p-4 space-y-3">
              <p className="text-sm text-neutral">
                Enter your email and we’ll send you a password reset link.
              </p>
              <div>
                <label htmlFor="reset-email" className="block text-sm font-bold text-charcoal mb-2">
                  Email address
                </label>
                <input
                  id="reset-email"
                  name="reset-email"
                  type="email"
                  required
                  className="appearance-none rounded-[4px] relative block w-full px-4 py-4 border border-gray-300 bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold focus:z-10 shadow-sm"
                  placeholder="Email address"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="text-sm text-neutral hover:text-charcoal font-bold"
                  onClick={() => {
                    setIsResettingPassword(false);
                    setResetEmail('');
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  Back to sign in
                </button>
              </div>
            </div>
          )}

          {isSignUp && (
            <div className="grid grid-cols-2 gap-3">
              <FormField error={fieldErrors.firstName}>
                <label htmlFor="first-name" className="block text-sm font-bold text-charcoal mb-2">
                  First Name *
                </label>
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  className={fieldInputClass(!!fieldErrors.firstName)}
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    clearFieldError('firstName');
                  }}
                />
              </FormField>
              <FormField error={fieldErrors.lastName}>
                <label htmlFor="last-name" className="block text-sm font-bold text-charcoal mb-2">
                  Last Name
                </label>
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  className={fieldInputClass(!!fieldErrors.lastName)}
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    clearFieldError('lastName');
                  }}
                />
              </FormField>
            </div>
          )}

          {!isResettingPassword && (
            <FormField error={fieldErrors.email}>
              <label htmlFor="email-address" className="block text-sm font-bold text-charcoal mb-2">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                className={fieldInputClass(!!fieldErrors.email)}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError('email');
                }}
              />
            </FormField>
          )}

          {isSignUp && (
            <FormField error={fieldErrors.phone}>
              <label htmlFor="phone-optional" className="block text-sm font-bold text-charcoal mb-2">
                Phone Number (Optional)
              </label>
              <input
                id="phone-optional"
                name="phone-optional"
                type="tel"
                className={fieldInputClass(!!fieldErrors.phone)}
                placeholder="021 123 4567"
                value={phone}
                onChange={(e) => {
                  setPhone(sanitizePhoneInput(e.target.value));
                  clearFieldError('phone');
                }}
              />
            </FormField>
          )}

          {!isResettingPassword && (
            <FormField error={fieldErrors.password}>
              <label htmlFor="password" className="block text-sm font-bold text-charcoal mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={fieldInputClass(!!fieldErrors.password)}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError('password');
                }}
              />
            </FormField>
          )}

          {!isSignUp && !isResettingPassword && (
            <div className="flex items-center justify-end">
              <Link
                to="#"
                className="text-sm text-gold hover:text-charcoal font-bold"
                onClick={(e) => {
                  e.preventDefault();
                  setIsResettingPassword(true);
                  setResetEmail(email);
                  setError(null);
                  setSuccess(null);
                }}
              >
                Forgot password?
              </Link>
            </div>
          )}

          <div>
            <GlowingButton
              type="submit"
              fullWidth
              disabled={isLoading}
            >
              {isLoading
                ? (isResettingPassword ? 'Sending...' : isSignUp ? 'Creating account...' : 'Signing in...')
                : (isResettingPassword ? 'Send reset link' : isSignUp ? 'Sign up' : 'Sign in')
              }
            </GlowingButton>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div>
            <GlowingButton
              type="button"
              variant="outline"
              fullWidth
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              Google
            </GlowingButton>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setIsResettingPassword(false);
                setResetEmail('');
                setError(null);
                setSuccess(null);
                setFieldErrors({});
                setAwaitingEmailVerification(false);
              }}
              className="text-sm text-gold hover:text-charcoal font-bold"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
