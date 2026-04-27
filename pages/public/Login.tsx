import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Mail, Phone, Shield, User as UserIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { displayName } from '../../lib/constants';

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
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
  const { loginWithEmail, loginWithPhone, signUpWithEmail, signUpWithPhone, signInWithGoogle, isLoading, user, refreshUserProfile, sendPasswordReset } = useAuth();
  const navigate = useNavigate();

  const getRedirectPath = (role: string, isApproved: boolean): string => {
    if (!isApproved) return '/pending-approval';
    // Clear any leftover test override on fresh login
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
        if (authMethod === 'email') {
          if (!email || !password || !firstName) {
            setError('Please fill in all required fields');
            return;
          }
          await signUpWithEmail(email, password, firstName, lastName, phone || undefined);
          setSuccess('Account created! Please wait for admin approval.');
          setTimeout(() => {
            navigate('/pending-approval', { replace: true });
          }, 500);
        } else {
          if (!phone || !password || !firstName) {
            setError('Please fill in all required fields');
            return;
          }
          await signUpWithPhone(phone, password, firstName, lastName, email || undefined);
          setSuccess('Account created! Please wait for admin approval.');
          setTimeout(() => {
            navigate('/pending-approval', { replace: true });
          }, 500);
        }
      } else {
        // Handle login
        setIsLoggingIn(true);
        try {
          if (authMethod === 'email') {
            if (!email || !password) {
              setError('Please enter email and password');
              setIsLoggingIn(false);
              return;
            }
            await loginWithEmail(email, password);
          } else {
            if (!phone || !password) {
              setError('Please enter phone and password');
              setIsLoggingIn(false);
              return;
            }
            await loginWithPhone(phone, password);
          }
          
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
            
            // Brief delay so the user sees the flash
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
      // Redirect to error page instead of showing error in form
      navigate(`/login-error?error=login_failed`, { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      // OAuth will redirect, so we don't need to handle success here
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      // Redirect to error page
      navigate(`/login-error?error=oauth_failed`, { replace: true });
    }
  };

  // Login flash overlay — shown briefly after successful login
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

        {/* Auth Method Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-[4px]">
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`flex-1 py-2 px-4 rounded-[4px] text-sm font-bold transition-colors ${
              authMethod === 'email'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-neutral hover:text-charcoal'
            }`}
          >
            <Mail size={16} className="inline mr-2" />
            Email
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('phone')}
            className={`flex-1 py-2 px-4 rounded-[4px] text-sm font-bold transition-colors ${
              authMethod === 'phone'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-neutral hover:text-charcoal'
            }`}
          >
            <Phone size={16} className="inline mr-2" />
            Phone
          </button>
        </div>

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
              <div>
                <label htmlFor="first-name" className="block text-sm font-bold text-charcoal mb-2">
                  First Name *
                </label>
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  required={isSignUp}
                  className="appearance-none rounded-[4px] relative block w-full px-4 py-4 border border-gray-300 bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold focus:z-10 shadow-sm"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="last-name" className="block text-sm font-bold text-charcoal mb-2">
                  Last Name
                </label>
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  className="appearance-none rounded-[4px] relative block w-full px-4 py-4 border border-gray-300 bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold focus:z-10 shadow-sm"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
          )}

          {!isResettingPassword && (
            authMethod === 'email' ? (
              <div>
                <label htmlFor="email-address" className="block text-sm font-bold text-charcoal mb-2">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-[4px] relative block w-full px-4 py-4 border border-gray-300 bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold focus:z-10 shadow-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-charcoal mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="appearance-none rounded-[4px] relative block w-full px-4 py-4 border border-gray-300 bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold focus:z-10 shadow-sm"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )
          )}

          {isSignUp && authMethod === 'email' && (
            <div>
              <label htmlFor="phone-optional" className="block text-sm font-bold text-charcoal mb-2">
                Phone Number (Optional)
              </label>
              <input
                id="phone-optional"
                name="phone-optional"
                type="tel"
                className="appearance-none rounded-[4px] relative block w-full px-4 py-4 border border-gray-300 bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold focus:z-10 shadow-sm"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}

          {isSignUp && authMethod === 'phone' && (
            <div>
              <label htmlFor="email-optional" className="block text-sm font-bold text-charcoal mb-2">
                Email (Optional)
              </label>
              <input
                id="email-optional"
                name="email-optional"
                type="email"
                className="appearance-none rounded-[4px] relative block w-full px-4 py-4 border border-gray-300 bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold focus:z-10 shadow-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {!isResettingPassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-charcoal mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-[4px] relative block w-full px-4 py-4 border border-gray-300 bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold focus:z-10 shadow-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
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
      </div>
    </div>
  );
};