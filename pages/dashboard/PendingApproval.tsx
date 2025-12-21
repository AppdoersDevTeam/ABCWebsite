import React from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { useAuth } from '../../context/AuthContext';
import { BackgroundBlobs } from '../../components/UI/BackgroundBlobs';

export const PendingApproval = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <BackgroundBlobs />
      
      <div className="relative z-10 max-w-lg w-full text-center glass-card bg-white/70 p-12 rounded-[16px] shadow-xl">
        
        {/* Animated Icon */}
        <div className="w-24 h-24 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-gold/20 animate-pulse-slow">
            <Lock size={40} className="text-gold" />
        </div>

        <h1 className="text-5xl font-serif font-bold text-charcoal mb-4">Access Pending</h1>
        <p className="text-xl text-neutral font-light mb-10 leading-relaxed">
            Your account is currently under administrative review.<br/> 
            We ensure our community stays safe and secure.
        </p>

        <div className="bg-white border border-gray-200 p-6 rounded-[8px] flex items-center justify-center gap-4 mb-8">
            <Loader2 className="text-gold animate-spin" />
            <span className="text-neutral font-bold uppercase tracking-widest text-sm">Review in Progress</span>
        </div>

        <GlowingButton onClick={logout} variant="outline" className="border-gray-300 text-neutral hover:border-charcoal hover:text-charcoal">
            Sign Out
        </GlowingButton>
      </div>
    </div>
  );
};