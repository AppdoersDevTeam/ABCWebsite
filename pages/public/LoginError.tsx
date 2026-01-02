import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { BackgroundBlobs } from '../../components/UI/BackgroundBlobs';

export const LoginError = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get error message from URL params or use default
  const searchParams = new URLSearchParams(location.search);
  const errorType = searchParams.get('error') || 'unknown';
  
  const getErrorMessage = () => {
    switch (errorType) {
      case 'session_error':
        return 'There was an issue establishing your session. Please try logging in again.';
      case 'no_session':
        return 'No active session found. Please try logging in again.';
      case 'callback_failed':
        return 'The authentication process failed. Please try again.';
      case 'oauth_failed':
        return 'Google sign-in failed. Please try again or use email/password.';
      case 'login_failed':
        return 'Login failed. Please check your credentials and try again.';
      default:
        return 'An error occurred during login. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <BackgroundBlobs />
      
      <div className="relative z-10 max-w-lg w-full text-center glass-card bg-white/70 p-12 rounded-[16px] shadow-xl">
        
        {/* Error Icon */}
        <div className="w-24 h-24 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <AlertCircle size={40} className="text-red-500" />
        </div>

        <h1 className="text-5xl font-serif font-normal text-charcoal mb-4">Login Error</h1>
        <p className="text-xl text-neutral font-light mb-10 leading-relaxed">
          {getErrorMessage()}
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <GlowingButton 
            onClick={() => navigate('/login', { replace: true })} 
            className="bg-gold text-white hover:bg-gold/90"
          >
            <RefreshCw size={16} className="inline mr-2" />
            Try Again
          </GlowingButton>
          <GlowingButton 
            onClick={() => navigate('/', { replace: true })} 
            variant="outline" 
            className="border-gray-300 text-neutral hover:border-charcoal hover:text-charcoal"
          >
            <Home size={16} className="inline mr-2" />
            Go to Home
          </GlowingButton>
        </div>
      </div>
    </div>
  );
};


