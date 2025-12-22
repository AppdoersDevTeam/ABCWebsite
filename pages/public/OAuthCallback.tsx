import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, refreshUserProfile } = useAuth();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);
  const redirectPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Check if this is an OAuth callback by looking for access_token in URL
    // Handle malformed hash (e.g., #/auth/callback#access_token=...)
    let hash = window.location.hash;
    const search = window.location.search;
    
    // Fix malformed hash - if hash contains #access_token after a route, extract it properly
    if (hash.includes('#access_token') && hash.includes('/auth/callback')) {
      // Split on the second # to get the route and the OAuth params
      const parts = hash.split('#');
      if (parts.length > 2) {
        // Reconstruct: first part is route, second part onwards is OAuth params
        const route = parts[1]; // /auth/callback
        hash = '#' + parts.slice(2).join('#');
        // Update URL to fix the hash immediately
        const baseUrl = window.location.origin.replace(/\/$/, '');
        const pathname = window.location.pathname.replace(/\/$/, '') || '';
        const newUrl = `${baseUrl}${pathname}${route}${hash}`;
        window.history.replaceState({}, document.title, newUrl);
        console.log('OAuthCallback - Fixed malformed hash, new URL:', newUrl);
      }
    }
    
    // Also check if we're on the callback route and have a session (OAuth might have completed)
    const hasOAuthParams = hash.includes('access_token') || search.includes('access_token') || 
                          hash.includes('error') || search.includes('error') ||
                          (location.pathname === '/auth/callback' && (hash === '#' || hash === '')); // Empty hash on callback route might mean OAuth completed
    
    setIsOAuthCallback(hasOAuthParams || location.pathname === '/auth/callback');
  }, [location]);

  useEffect(() => {
    // Only process if this is actually an OAuth callback
    if (!isOAuthCallback) {
      return;
    }

    const handleCallback = async () => {
      try {
        // If we already attempted redirect, don't try again
        if (redirectAttempted) {
          console.log('OAuthCallback - Redirect already attempted, skipping');
          return;
        }

        console.log('OAuthCallback - Processing callback');

        // Always check session first to get the most up-to-date state
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('OAuthCallback - Session error:', sessionError);
          setRedirectAttempted(true);
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/login-error?error=session_error', { replace: true });
          return;
        }

        if (!session?.user) {
          console.log('OAuthCallback - No session found, waiting for auth context...');
          // Wait a bit more for auth context to process
          if (!isLoading && !user) {
            setTimeout(() => {
              if (!redirectAttempted) {
                console.log('OAuthCallback - Still no session after wait, redirecting to error page');
                setRedirectAttempted(true);
                window.history.replaceState({}, document.title, window.location.pathname);
                navigate('/login-error?error=no_session', { replace: true });
              }
            }, 2000);
          }
          return;
        }

        console.log('OAuthCallback - Session found, user ID:', session.user.id);

        // Refresh user profile to get the latest approval status
        console.log('OAuthCallback - Refreshing user profile...');
        await refreshUserProfile();
        
        // Wait a moment for state to update
        await new Promise(resolve => setTimeout(resolve, 500));

        // Try to fetch user profile directly to ensure we have latest data
        const { data: userData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        console.log('OAuthCallback - Profile query result:', { 
          hasData: !!userData, 
          is_approved: userData?.is_approved,
          role: userData?.role,
          error: profileError?.message 
        });

        // Use the fetched data or fall back to context user
        // If userData is available, use it; otherwise wait a bit for context to update
        let userProfile = userData || user;
        
        // If we don't have userData but have a session, wait a moment for context to update
        if (!userProfile && session?.user) {
          console.log('OAuthCallback - Waiting for context user to update...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Try refreshing one more time
          await refreshUserProfile();
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check context user again
          const { data: { session: session2 } } = await supabase.auth.getSession();
          if (session2?.user) {
            const { data: retryData } = await supabase
              .from('users')
              .select('*')
              .eq('id', session2.user.id)
              .single();
            userProfile = retryData || user;
          }
        }
        
        if (!userProfile) {
          // Profile doesn't exist yet - might be waiting for trigger
          if (profileError && profileError.code === 'PGRST116') {
            console.log('OAuthCallback - User profile not found (PGRST116), waiting for trigger...');
            
            // Wait a bit for the trigger to create the profile, then check again
            setTimeout(async () => {
              if (redirectAttempted) return;
              
              const { data: retryUserData } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (retryUserData) {
                const retryProfile = retryUserData as User;
                setRedirectAttempted(true);
                // Clean up the URL hash before redirecting
                window.history.replaceState({}, document.title, window.location.pathname);
                
                if (!retryProfile.is_approved) {
                  console.log('OAuthCallback - User not approved after retry, redirecting to pending approval');
                  navigate('/pending-approval', { replace: true });
                } else if (retryProfile.role === 'admin') {
                  console.log('OAuthCallback - Admin user after retry, redirecting to admin dashboard');
                  navigate('/admin', { replace: true });
                } else {
                  console.log('OAuthCallback - Regular user approved after retry, redirecting to dashboard');
                  navigate('/dashboard', { replace: true });
                }
              } else {
                setRedirectAttempted(true);
                console.warn('OAuthCallback - Profile still not found after retry, redirecting to pending approval');
                window.history.replaceState({}, document.title, window.location.pathname);
                navigate('/pending-approval', { replace: true });
              }
            }, 3000);
            return;
          } else {
            setRedirectAttempted(true);
            console.warn('OAuthCallback - No user profile available, redirecting to pending approval');
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate('/pending-approval', { replace: true });
            return;
          }
        }

        // Profile found, redirect based on approval status
        setRedirectAttempted(true);
        const profile = userProfile as User;
        console.log('OAuthCallback - Profile found, redirecting. Profile:', {
          id: profile.id,
          email: profile.email,
          is_approved: profile.is_approved,
          role: profile.role
        });
        
        // Clean up the URL hash before redirecting
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Determine redirect path
        const redirectPath = !profile.is_approved 
          ? '/pending-approval'
          : profile.role === 'admin'
          ? '/admin'
          : '/dashboard';
        
        redirectPathRef.current = redirectPath;
        console.log('OAuthCallback - Redirecting to:', redirectPath);
        
        // Use a small delay to ensure state is updated before redirect
        setTimeout(() => {
          // Try React Router navigation first
          navigate(redirectPath, { replace: true });
          
          // Fallback: if navigation doesn't work after a short delay, use window.location
          setTimeout(() => {
            const currentHash = window.location.hash;
            const currentPath = window.location.pathname;
            if ((currentHash.includes('auth/callback') || currentPath.includes('auth/callback')) && redirectPathRef.current) {
              console.log('OAuthCallback - Navigation may have failed, using window.location fallback');
              // For HashRouter, we need to set the hash with the # prefix
              window.location.hash = `#${redirectPathRef.current}`;
            }
          }, 500);
        }, 100);
      } catch (error) {
        console.error('OAuth callback handler error:', error);
        if (!redirectAttempted) {
          setRedirectAttempted(true);
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/login-error?error=callback_failed', { replace: true });
        }
      }
    };

    // Process callback - wait for auth context if needed
    if (isOAuthCallback) {
      if (isLoading) {
        // Wait for auth context to finish loading
        console.log('OAuthCallback - Auth context still loading, waiting...');
        const timer = setTimeout(() => {
          handleCallback();
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        // Small delay to ensure everything is ready
        const timer = setTimeout(() => {
          handleCallback();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [navigate, user, isLoading, redirectAttempted, isOAuthCallback, refreshUserProfile]);

  // Safety mechanism: if we have a redirect path but are still on callback route, force redirect
  useEffect(() => {
    if (redirectPathRef.current && location.pathname === '/auth/callback') {
      const timer = setTimeout(() => {
        console.log('OAuthCallback - Safety redirect triggered to:', redirectPathRef.current);
        if (redirectPathRef.current) {
          navigate(redirectPathRef.current, { replace: true });
          // If still on callback route after navigation, use window.location
          setTimeout(() => {
            if (window.location.hash.includes('auth/callback') || window.location.pathname.includes('auth/callback')) {
              console.log('OAuthCallback - Force redirect using window.location');
              window.location.hash = `#${redirectPathRef.current}`;
            }
          }, 300);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary text-white font-serif">
      <div className="text-center">
        <div className="animate-pulse mb-4">Completing sign in...</div>
        <p className="text-sm opacity-75">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

