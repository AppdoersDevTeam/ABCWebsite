import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, Ban, Mail, RefreshCw } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { useAuth } from '../../context/AuthContext';
import { BackgroundBlobs } from '../../components/UI/BackgroundBlobs';

export const PendingApproval = () => {
  const { logout, user, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isRevoked, setIsRevoked] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Check if user was previously approved (indicates they were revoked)
    // If user has been created more than 1 day ago and is not approved, likely revoked
    if (user?.created_at) {
      const createdDate = new Date(user.created_at);
      const now = new Date();
      const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // If account is older than 1 day and not approved, likely revoked
      // Also check if they have an email (indicates they were set up properly)
      if (daysSinceCreation > 1 && user.email) {
        setIsRevoked(true);
      }
    }
  }, [user]);

  // Periodically check if user has been approved (with exponential backoff)
  useEffect(() => {
    if (!user || isRevoked) return;

    let checkCount = 0;
    let timeoutId: NodeJS.Timeout | null = null;

    const checkApproval = async () => {
      try {
        await refreshUserProfile();
        checkCount++;
        
        // Exponential backoff: 10s, 20s, 30s, then 30s intervals
        const delay = checkCount <= 1 ? 10000 : checkCount <= 2 ? 20000 : 30000;
        
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(checkApproval, delay);
      } catch (error) {
        console.error('Error checking approval status:', error);
        // On error, retry after 30 seconds
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(checkApproval, 30000);
      }
    };

    // Check immediately, then use exponential backoff
    checkApproval();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, isRevoked, refreshUserProfile]);

  // Redirect if user becomes approved
  useEffect(() => {
    if (user?.is_approved) {
      console.log('PendingApproval - User approved, redirecting to dashboard');
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

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

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <BackgroundBlobs />
      
      <div className="relative z-10 max-w-lg w-full text-center glass-card bg-white/70 p-12 rounded-[16px] shadow-xl">
        
        {/* Animated Icon */}
        <div className={`w-24 h-24 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg ${isRevoked ? 'shadow-red-200' : 'shadow-gold/20'} animate-pulse-slow`}>
            {isRevoked ? (
              <Ban size={40} className="text-red-500" />
            ) : (
              <Lock size={40} className="text-gold" />
            )}
        </div>

        {isRevoked ? (
          <>
            <h1 className="text-5xl font-serif font-normal text-charcoal mb-4">Access Revoked</h1>
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
            <h1 className="text-5xl font-serif font-normal text-charcoal mb-4">Access Pending</h1>
            <p className="text-xl text-neutral font-light mb-10 leading-relaxed">
              Your account is currently under administrative review.<br/> 
              We ensure our community stays safe and secure.
            </p>

            <div className="bg-white border border-gray-200 p-6 rounded-[8px] flex items-center justify-center gap-4 mb-8">
              <Loader2 className="text-gold animate-spin" />
              <span className="text-neutral font-bold uppercase tracking-widest text-sm">Review in Progress</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-[8px] mb-6">
              <p className="text-sm text-blue-800 text-center">
                We're checking your approval status automatically. If you've been approved, you'll be redirected shortly.
              </p>
            </div>
          </>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          <GlowingButton 
            onClick={handleManualRefresh} 
            variant="outline" 
            disabled={isRefreshing}
            className="border-gray-300 text-neutral hover:border-charcoal hover:text-charcoal"
          >
            <RefreshCw size={16} className={`inline mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Checking...' : 'Check Status'}
          </GlowingButton>
          <GlowingButton 
            onClick={() => window.location.href = '/'} 
            variant="outline" 
            className="border-gray-300 text-neutral hover:border-charcoal hover:text-charcoal"
          >
            Go to Home
          </GlowingButton>
          <GlowingButton 
            onClick={logout} 
            variant="outline" 
            className="border-gray-300 text-neutral hover:border-charcoal hover:text-charcoal"
          >
            Sign Out
          </GlowingButton>
        </div>
      </div>
    </div>
  );
};