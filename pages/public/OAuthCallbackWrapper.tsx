import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from './Home';
import { OAuthCallback } from './OAuthCallback';
import { useAuth } from '../../context/AuthContext';
import { hasAuthCallbackParams } from '../../lib/authCallback';

export const OAuthCallbackWrapper = () => {
  const navigate = useNavigate();
  const [hasOAuthParams, setHasOAuthParams] = useState(false);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const isOAuth = hasAuthCallbackParams();
    
    setHasOAuthParams(isOAuth);
    
    if (isOAuth) {
      navigate('/auth/callback', { replace: true });
    }
  }, [navigate]);

  // Redirect logged-in users to their appropriate dashboard
  useEffect(() => {
    if (!isLoading && user && !hasOAuthParams) {
      console.log('OAuthCallbackWrapper - User is logged in, redirecting from home. User:', {
        id: user.id,
        email: user.email,
        is_approved: user.is_approved,
        role: user.role
      });
      
      if (!user.is_approved) {
        navigate('/pending-approval', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isLoading, navigate, hasOAuthParams]);

  // If OAuth callback detected, show callback component
  if (hasOAuthParams) {
    return <OAuthCallback />;
  }

  // If user is logged in, show loading while redirecting (the useEffect above will redirect)
  if (user && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base text-charcoal font-serif">
        <div className="animate-pulse text-xl">Redirecting...</div>
      </div>
    );
  }

  // Show home page for non-logged-in users
  return <Home />;
};

