import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from './Home';
import { OAuthCallback } from './OAuthCallback';

export const OAuthCallbackWrapper = () => {
  const navigate = useNavigate();
  const [hasOAuthParams, setHasOAuthParams] = useState(false);

  useEffect(() => {
    // Check if this is an OAuth callback by looking for access_token in URL
    const hash = window.location.hash;
    const search = window.location.search;
    const isOAuth = hash.includes('access_token') || search.includes('access_token') || 
                    hash.includes('error') || search.includes('error');
    
    setHasOAuthParams(isOAuth);
    
    if (isOAuth) {
      // Redirect to the OAuth callback route
      navigate('/auth/callback', { replace: true });
    }
  }, [navigate]);

  // If OAuth callback detected, show callback component, otherwise show home
  if (hasOAuthParams) {
    return <OAuthCallback />;
  }

  return <Home />;
};

