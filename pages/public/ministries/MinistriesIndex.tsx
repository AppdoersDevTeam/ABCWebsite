import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, ArrowRight, Heart } from 'lucide-react';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { MINISTRIES, MINISTRIES_LABEL } from '../../../lib/ministries';

export const MinistriesIndex = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-0 overflow-hidden">
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
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

        <div className="container relative z-10 px-4 mx-auto pt-[224px] md:pt-[256px]">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal direction="up" delay={150}>
              <h1
                className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250"
                style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}
              >
                {MINISTRIES_LABEL}
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-24 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">Find your place.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">
                  Ways to belong, grow, and serve at Ashburton Baptist Church.
                </span>
              </p>
            </ScrollReveal>
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pulse-arrow animate-ping-pong">
          <ArrowDownToLine size={32} className="text-gold" />
        </div>
      </section>

      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {MINISTRIES.map((ministry, index) => (
              <ScrollReveal key={ministry.slug} direction="up" delay={Math.min(index * 40, 400)}>
                <Link
                  to={ministry.path}
                  className="glass-card rounded-[16px] p-8 border-t border-white/50 group hover-lift bg-white/80 h-full flex flex-col"
                >
                  <div className="p-3 bg-[#fbcb05] rounded-full w-14 h-14 mb-5 flex items-center justify-center text-white shadow-lg shadow-gold/30">
                    <Heart size={24} />
                  </div>
                  <h2 className="font-serif text-2xl font-normal text-charcoal mb-3 group-hover:text-gold transition-colors duration-300">
                    {ministry.label}
                  </h2>
                  <p className="text-neutral leading-relaxed mb-6 flex-1 group-hover:text-charcoal transition-colors">
                    {ministry.summary}
                  </p>
                  <span className="inline-flex items-center text-charcoal font-bold uppercase tracking-widest text-sm group-hover:text-gold transition-colors">
                    Learn more <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
