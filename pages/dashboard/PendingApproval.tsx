import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Ban, Mail, AlertTriangle, RefreshCw } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { useAuth } from '../../context/AuthContext';
import { isAdminUser } from '../../lib/constants';
import { BackgroundBlobs } from '../../components/UI/BackgroundBlobs';
import { supabase } from '../../lib/supabase';
import { notifySignupReceivedOnce } from '../../lib/notifyUserReview';
import { allowPendingPublicBrowse, clearPendingPublicBrowse } from '../../lib/pendingAccess';

export const PendingApproval = () => {
  const { logout, user, isLoading, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isRevoked, setIsRevoked] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (user?.created_at) {
      const createdDate = new Date(user.created_at);
      const now = new Date();
      const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation > 1 && user.email) {
        setIsRevoked(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id || user.is_approved || isRevoked) return;
    notifySignupReceivedOnce(user.id, user.created_at);
  }, [user?.id, user?.is_approved, user?.created_at, isRevoked]);

  useEffect(() => {
    if (!user || isRevoked) return;

    let checkCount = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const checkApproval = async () => {
      try {
        await refreshUserProfile();
        checkCount += 1;
        const delay = checkCount <= 1 ? 30000 : 60000;
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(checkApproval, delay);
      } catch (error) {
        console.error('Error checking approval status:', error);
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(checkApproval, 60000);
      }
    };

    checkApproval();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, isRevoked, refreshUserProfile]);

  useEffect(() => {
    if (isLoading || isSigningOut) return;
    if (!user) {
      let cancelled = false;
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled || session?.user) return;
        navigate('/', { replace: true });
      });
      return () => {
        cancelled = true;
      };
    }
    if (user.is_approved) {
      if (isAdminUser(user)) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isLoading, isSigningOut, navigate]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUserProfile();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const goHome = () => {
    allowPendingPublicBrowse();
    navigate('/');
  };

  const handleLogout = async () => {
    setIsSigningOut(true);
    clearPendingPublicBrowse();
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen page-shell page-shell-image flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <BackgroundBlobs />

      <div className="page-shell-content max-w-lg w-full text-center glass-card bg-white/70 p-6 sm:p-12 rounded-[16px] shadow-xl">
        <div className={`w-24 h-24 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg ${isRevoked ? 'shadow-red-200' : 'shadow-gold/20'} animate-pulse-slow`}>
          {isRevoked ? (
            <Ban size={40} className="text-red-500" />
          ) : (
            <Lock size={40} className="text-gold" />
          )}
        </div>

        {isRevoked ? (
          <>
            <h1 className="text-3xl sm:text-5xl font-serif font-normal text-charcoal mb-4">Access Revoked</h1>
            <p className="text-xl text-neutral font-light mb-6 leading-relaxed">
              Your access to this website has been revoked by an administrator.
            </p>
            <p className="text-lg text-neutral font-light mb-10 leading-relaxed">
              If you believe this is an error, please contact support for assistance.
            </p>

            <div className="bg-red-50 border border-red-200 p-6 rounded-[8px] mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Mail className="text-red-600" size={20} />
                <span className="text-red-800 font-bold">Contact Support</span>
              </div>
              <p className="text-sm text-red-700">
                Please reach out to the church administration for help with your account access.
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl sm:text-5xl font-serif font-normal text-charcoal mb-4">Access Pending</h1>
            <p className="text-base sm:text-lg text-neutral font-light mb-10 leading-relaxed">
              Your account is currently under administrative review.<br />
              We ensure our community stays safe and secure.
            </p>

            <div className="bg-white border border-red-200 p-6 rounded-[8px] flex items-center justify-center gap-2 mb-8">
              <span className="text-red-600 font-bold uppercase tracking-widest text-sm">Review in Progress</span>
              <AlertTriangle className="text-red-600 shrink-0" size={18} aria-hidden="true" />
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-[8px] mb-6">
              <p className="text-sm text-blue-800 text-center">
                We&apos;re checking your approval status. We will update you by e-mail. God bless you!.
              </p>
            </div>
          </>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          {isRevoked && (
            <GlowingButton
              onClick={handleManualRefresh}
              variant="outline"
              disabled={isRefreshing}
              className="border-gray-300 text-neutral hover:border-charcoal hover:text-charcoal"
            >
              <RefreshCw size={16} className={`inline mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Checking...' : 'Check Status'}
            </GlowingButton>
          )}
          <GlowingButton
            onClick={goHome}
            variant="outline"
            className="border-gray-300 text-neutral hover:border-charcoal hover:text-charcoal"
          >
            Go to Home
          </GlowingButton>
          <GlowingButton
            onClick={handleLogout}
            variant="outline"
            disabled={isSigningOut}
            className="border-gray-300 text-neutral hover:border-charcoal hover:text-charcoal"
          >
            {isSigningOut ? 'Signing out...' : 'Log Out'}
          </GlowingButton>
        </div>
      </div>
    </div>
  );
};
