import React from 'react';
import { PageHeader } from '../../components/UI/PageHeader';
import { GlowingButton } from '../../components/UI/GlowingButton';

export const NeedPrayer = () => {
  return (
    <div className="pb-32">
      <PageHeader title="PRAYER" subtitle="We are here for you" />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10 max-w-2xl">
        <div className="glass-card p-6 md:p-16 rounded-[16px] shadow-xl relative overflow-hidden bg-white/80">
            
            <div className="text-center mb-12 relative z-10">
                <h3 className="text-3xl font-serif text-charcoal mb-4">How can we pray?</h3>
                <p className="text-neutral text-lg">Your request is handled with confidentiality and care.</p>
            </div>
            
            <form className="space-y-8 relative z-10">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal">Your Name (Optional)</label>
                    <input type="text" className="w-full p-4 rounded-[4px] input-sun text-lg" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal">Prayer Request</label>
                    <textarea rows={6} className="w-full p-4 rounded-[4px] input-sun text-lg" placeholder="Share your burden..."></textarea>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-[4px] border border-gray-100">
                    <input type="checkbox" id="private" className="rounded text-gold focus:ring-gold bg-white border-gray-300 h-5 w-5" />
                    <label htmlFor="private" className="text-base text-neutral cursor-pointer select-none">Keep confidential (Pastors only)</label>
                </div>
                <GlowingButton type="submit" fullWidth size="lg">Send Request</GlowingButton>
            </form>
        </div>
      </div>
    </div>
  );
};