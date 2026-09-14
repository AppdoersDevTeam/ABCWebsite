import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { isAdminUser } from '../../lib/constants';
import { completeAuthCallbackFromUrl } from '../../lib/authCallback';
import { clearPendingPublicBrowse } from '../../lib/pendingAccess';
import { hashRouterHref } from '../../lib/ensureHashRouterUrl';
import { User } from '../../types';

function destinationForUser(profile: Pick<User, 'is_approved' | 'role'>): string {
  if (!profile.is_approved) return '/pending-approval';
  if (isAdminUser(profile)) return '/admin';
  return '/dashboard';
}

function replaceToHashRoute(path: string) {
  window.history.replaceState({}, document.title, hashRouterHref(path));
}

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const redirectedRef = useRef(false);

  const finish = (path: string) => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    clearPendingPublicBrowse();
    navigate(path, { replace: true });
    replaceToHashRoute(path);
    window.setTimeout(() => {
      const hash = window.location.hash || '';
      if (hash.includes('auth/callback') || window.location.pathname.includes('auth/callback')) {
        replaceToHashRoute(path);
        window.location.hash = `#${path}`;
      }
    }, 250);
  };

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      const { error: callbackError } = await completeAuthCallbackFromUrl();
      if (cancelled) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (callbackError && !session?.user) {
        const lower = callbackError.toLowerCase();
        if (
          lower.includes('expired') ||
          lower.includes('invalid') ||
          lower.includes('already')
        ) {
          finish('/login?status=confirm_link_used');
        } else {
          finish('/login-error?error=confirm_failed');
        }
        return;
      }

      if (session?.user) {
        const loadProfile = async () => {
          const { data } = await supabase
            .from('users')
            .select('is_approved, role')
            .eq('id', session.user.id)
            .maybeSingle();
          return data;
        };

        let profile = await loadProfile();
        if (!profile) {
          await new Promise((resolve) => window.setTimeout(resolve, 1500));
          if (cancelled || redirectedRef.current) return;
          profile = await loadProfile();
        }

        if (cancelled || redirectedRef.current) return;

        if (profile) {
          finish(destinationForUser(profile as User));
          return;
        }

        finish('/pending-approval');
      }
    };

    void run();

    timeoutId = window.setTimeout(() => {
      if (cancelled || redirectedRef.current) return;
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled || redirectedRef.current) return;
        if (session?.user) {
          finish('/pending-approval');
          return;
        }
        finish('/login-error?error=no_session');
      });
    }, 8000);

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
    // finish uses navigate; run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoading || redirectedRef.current || !user) return;
    finish(destinationForUser(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary text-white font-serif">
      <div className="text-center">
        <div className="animate-pulse mb-4">Completing sign in...</div>
        <p className="text-sm opacity-75">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};
