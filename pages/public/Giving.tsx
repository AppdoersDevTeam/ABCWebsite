import React from 'react';
import { PageHeader } from '../../components/UI/PageHeader';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { CreditCard, Landmark } from 'lucide-react';

export const Giving = () => {
  return (
    <div className="pb-32">
      <PageHeader title="GENEROSITY" subtitle="Giving" />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10 max-w-4xl space-y-12">
        
        <div className="glass-card p-8 md:p-12 text-center rounded-[8px] shadow-lg animate-fade-in-up hover-lift">
            <p className="text-2xl md:text-3xl font-serif text-charcoal mb-6 italic leading-relaxed">
                "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
            </p>
            <p className="text-gold text-sm uppercase tracking-widest font-bold animate-pulse-slow">- 2 Corinthians 9:7</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <VibrantCard id="direct-deposit" className="text-center group bg-white scroll-mt-24 animate-fade-in-left delay-200 hover-lift">
                <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-charcoal mx-auto mb-8 group-hover:border-gold group-hover:text-gold transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 icon-bounce">
                    <Landmark size={32} />
                </div>
                <h3 className="text-2xl font-serif text-charcoal mb-6 group-hover:text-gold transition-colors duration-300">Direct Deposit</h3>
                <div className="space-y-4 text-neutral text-base bg-gray-50 p-6 rounded-[4px] border border-gray-100">
                    <div className="flex justify-between border-b border-gray-200 pb-3">
                        <span>Account:</span>
                        <span className="font-bold text-charcoal text-right">Ashburton Baptist</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-3">
                        <span>BSB:</span>
                        <span className="font-bold text-charcoal text-right">000-000</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Number:</span>
                        <span className="font-bold text-charcoal text-right">1234 5678</span>
                    </div>
                </div>
            </VibrantCard>

            <VibrantCard id="credit-card" className="flex flex-col justify-between text-center group bg-white scroll-mt-24 animate-fade-in-right delay-400 hover-lift" glow>
                <div>
                    <div className="w-20 h-20 bg-gold text-charcoal rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-gold/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 icon-bounce animate-float">
                        <CreditCard size={32} />
                    </div>
                    <h3 className="text-2xl font-serif text-charcoal mb-6 group-hover:text-gold transition-colors duration-300">Credit Card</h3>
                    <p className="text-neutral text-base mb-8 leading-relaxed">
                        Secure online giving via Stripe. Set up recurring giving or make a one-time impact.
                    </p>
                </div>
                <GlowingButton fullWidth size="lg">Give Securely</GlowingButton>
            </VibrantCard>
        </div>
      </div>
    </div>
  );
};