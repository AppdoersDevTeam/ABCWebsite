import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Mail, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { loginWithEmail, loginWithPhone, signUpWithEmail, signUpWithPhone, signInWithGoogle, isLoading, user, refreshUserProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if user is already logged in when component mounts
    // (e.g., if they navigate to /login while already logged in)
    // Don't redirect if we're currently in the process of logging in (handleSubmit will handle that)
    if (user && !isLoading && !isLoggingIn) {
      console.log('Login - User already logged in, redirecting. User:', user);
      // Small delay to ensure state is fully set
      setTimeout(() => {
        // Check if user is approved first
        if (!user.is_approved) {
          navigate('/pending-approval', { replace: true });
          return;
        }
        
        // On successful login, redirect to appropriate dashboard
        if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 100);
    }
  }, [user, isLoading, navigate, isLoggingIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        if (authMethod === 'email') {
          if (!email || !password || !name) {
            setError('Please fill in all required fields');
            return;
          }
          await signUpWithEmail(email, password, name, phone || undefined);
          setSuccess('Account created! Please wait for admin approval.');
          // For sign up, redirect to pending approval
          setTimeout(() => {
            navigate('/pending-approval', { replace: true });
          }, 500);
        } else {
          if (!phone || !password || !name) {
            setError('Please fill in all required fields');
            return;
          }
          await signUpWithPhone(phone, password, name, email || undefined);
          setSuccess('Account created! Please wait for admin approval.');
          // For sign up, redirect to pending approval
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
          
          // After login, get session immediately and redirect
          // Don't wait for profile fetch - redirect immediately and let route guards handle it
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            console.log('Login - Session found, attempting to fetch user profile for redirect');
            
            // Try to get user profile with a short timeout
            const profilePromise = supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
              .then(result => result.data);
            
            const timeoutPromise = new Promise((resolve) => {
              setTimeout(() => resolve(null), 2000); // 2 second timeout
            });
            
            const userData = await Promise.race([profilePromise, timeoutPromise]) as any;
            
            let redirectPath = '/dashboard'; // Default to dashboard
            
            if (userData) {
              console.log('Login - User profile fetched, redirecting. User:', {
                id: userData.id,
                email: userData.email,
                is_approved: userData.is_approved,
                role: userData.role
              });
              
              if (!userData.is_approved) {
                redirectPath = '/pending-approval';
              } else if (userData.role === 'admin') {
                redirectPath = '/admin';
              }
            } else {
              // Profile fetch timed out or failed, use context user if available
              console.warn('Login - Profile fetch timed out, using context user or defaulting to dashboard');
              if (user) {
                if (!user.is_approved) {
                  redirectPath = '/pending-approval';
                } else if (user.role === 'admin') {
                  redirectPath = '/admin';
                }
              }
            }
            
            console.log('Login - Redirecting to:', redirectPath);
            
            // Redirect immediately - don't wait for profile refresh
            navigate(redirectPath, { replace: true });
            
            // Fallback: if navigation doesn't work after a short delay, use window.location
            setTimeout(() => {
              const currentHash = window.location.hash;
              if (currentHash.includes('login') || currentHash === '#/') {
                console.log('Login - Navigation may have failed, using window.location fallback');
                window.location.hash = `#${redirectPath}`;
              }
            }, 500);
            
            // Refresh profile in background (don't wait for it)
            refreshUserProfile().catch(err => {
              console.warn('Login - Background profile refresh failed:', err);
            });
          } else {
            console.error('Login - No session found after login');
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative pt-32 md:pt-40 pb-32">
      <div className="max-w-md w-full space-y-8 glass-card bg-white/80 p-10 shadow-xl border border-white/50 rounded-[16px] relative z-10 backdrop-blur-xl">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-serif font-bold text-charcoal">
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
          {isSignUp && (
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-charcoal mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required={isSignUp}
                className="appearance-none rounded-[4px] relative block w-full px-4 py-4 border border-gray-300 bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-gold focus:border-gold focus:z-10 shadow-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {authMethod === 'email' ? (
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

          {!isSignUp && (
            <div className="flex items-center justify-end">
              <Link
                to="#"
                className="text-sm text-gold hover:text-charcoal font-bold"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implement password reset
                  alert('Password reset functionality coming soon');
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
                ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                : (isSignUp ? 'Sign up' : 'Sign in')
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