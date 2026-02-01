import React, { useRef } from 'react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { CreditCard, Landmark, Gift, ArrowDownToLine } from 'lucide-react';

export const Giving = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="space-y-0 overflow-hidden">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/ABC background01.png" 
            alt="Ashburton Baptist Church" 
            className="w-full h-full object-cover brightness-110 saturate-125 contrast-105"
          />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gray-700/45"></div>
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 px-4 mx-auto pt-[224px] md:pt-[256px] pb-24 md:pb-28">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                Fuel the Mission
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">Generosity.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">Each of you should give what you have decided</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">in your heart to give, not reluctantly or under compulsion.</span>
              </p>
            </ScrollReveal>
          
          {/* Pulsing Down Arrow */}
          <div className="absolute bottom-[29px] left-1/2 -translate-x-1/2 z-20 pulse-arrow animate-ping-pong">
            <ArrowDownToLine size={32} className="text-gold" />
          </div>
        </div>
        </div>
      </section>
      
      <section className="section-plain py-12 md:py-20 relative z-10 w-full">
        <div className="container mx-auto px-4 max-w-4xl space-y-12">
        <ScrollReveal direction="down" delay={0}>
          <div className="text-center mb-12">
            <Gift className="text-gold mx-auto mb-6" size={64} />
            <span className="text-gold font-bold tracking-[0.3em] uppercase mb-4 block text-sm">Generosity</span>
            <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-6">Fuel the Mission</h2>
            <p className="text-charcoal text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
            </p>
            <p className="text-gold text-sm uppercase tracking-widest font-bold">- 2 Corinthians 9:7</p>
          </div>
        </ScrollReveal>
        
        <div className="grid md:grid-cols-2 gap-8">
          <ScrollReveal direction="right" delay={0}>
            <div id="direct-deposit" className="glass-card rounded-[16px] p-8 bg-white/80 text-center hover-lift scroll-mt-24 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-6 group-hover:bg-gold transition-colors duration-300">
                <Landmark size={32} />
              </div>
              <h3 className="text-2xl font-serif font-normal text-charcoal mb-4">Direct Deposit</h3>
              <p className="text-neutral mb-6">Give directly through bank transfer. Simple and secure.</p>
              <div className="space-y-4 text-neutral text-base bg-gray-50 p-6 rounded-[8px] border border-gray-100">
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
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={200}>
            <div id="credit-card" className="glass-card rounded-[16px] p-8 bg-white/80 text-center hover-lift scroll-mt-24 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-6 group-hover:bg-gold transition-colors duration-300">
                <CreditCard size={32} />
              </div>
              <h3 className="text-2xl font-serif font-normal text-charcoal mb-4">Credit Card</h3>
              <p className="text-neutral mb-6">Secure online giving via Stripe. Set up recurring giving or make a one-time impact.</p>
              <GlowingButton fullWidth size="sm" className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                Give Securely
              </GlowingButton>
            </div>
          </ScrollReveal>
        </div>
        </div>
      </section>
    </div>
  );
};