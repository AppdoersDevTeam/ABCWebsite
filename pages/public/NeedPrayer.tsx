import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { HandHeart, ArrowDownToLine } from 'lucide-react';

export const NeedPrayer = () => {
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
                We are here for you
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">Prayer.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">Your request is handled with confidentiality</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">and care. We are ready to stand with you in prayer.</span>
              </p>
            </ScrollReveal>
          </div>
        </div>
        
        {/* Pulsing Down Arrow - positioned relative to section for proper centering */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pulse-arrow animate-ping-pong">
          <ArrowDownToLine size={32} className="text-gold" />
        </div>
      </section>
      
      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-12">
              <HandHeart className="text-gold mx-auto mb-6" size={64} />
              <span className="text-gold font-bold tracking-[0.3em] uppercase mb-4 block text-sm">Prayer</span>
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-6">We are here for you</h2>
              <p className="text-neutral text-lg leading-relaxed max-w-2xl mx-auto">
                Whether you need prayer for yourself, a loved one, or a difficult situation,
                our church family is ready to stand with you. Every request is treated with
                confidentiality and care.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="scale" delay={200}>
            <div className="glass-card rounded-[16px] p-8 md:p-12 bg-white/80 mb-10 hover-lift text-center">
              <p className="text-charcoal text-lg mb-6 italic">
                &ldquo;Bear one another&apos;s burdens, and so fulfill the law of Christ.&rdquo; &mdash; Galatians 6:2
              </p>
              <p className="text-neutral leading-relaxed">
                Prayer matters. You don&apos;t have to carry your burdens alone &mdash; let us pray
                with you and for you. Reach out through our contact page and share what&apos;s
                on your heart. A member of our pastoral team will respond with compassion and prayer.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={400}>
            <div className="text-center">
              <Link to="/contact">
                <GlowingButton variant="gold" size="lg" className="!rounded-full transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                  Get in touch with us
                </GlowingButton>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};
