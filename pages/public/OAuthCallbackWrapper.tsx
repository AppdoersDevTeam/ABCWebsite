import { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OAuthCallback } from './OAuthCallback';
import { useAuth } from '../../context/AuthContext';
import { isAdminUser } from '../../lib/constants';
import { hasAuthCallbackParams } from '../../lib/authCallback';
import { canPendingUserBrowsePublic } from '../../lib/pendingAccess';

const Home = lazy(() => import('./Home').then((m) => ({ default: m.Home })));

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

  useEffect(() => {
    if (isLoading || !user || hasOAuthParams) return;

    if (!user.is_approved) {
      if (canPendingUserBrowsePublic()) return;
      navigate('/pending-approval', { replace: true });
      return;
    }

    if (isAdminUser(user)) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate, hasOAuthParams]);

  if (hasOAuthParams) {
    return <OAuthCallback />;
  }

  if (user && !isLoading && user.is_approved) {
    return (
      <div className="min-h-[100vh] min-h-[100dvh] flex items-center justify-center bg-[#A8B774] text-charcoal font-serif px-4">
        <div className="animate-pulse text-xl">Redirecting...</div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen page-shell page-shell-image flex items-center justify-center text-charcoal font-serif">
          <div className="page-shell-content animate-pulse text-xl">Loading...</div>
        </div>
      }
    >
      <Home />
    </Suspense>
  );
};
