import React, { useRef } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowDownToLine, ArrowLeft, Clock, Heart, MapPin } from 'lucide-react';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { getMinistryBySlug, MINISTRIES_LABEL } from '../../../lib/ministries';

export const MinistryPage = ({ slug: slugProp }: { slug?: string }) => {
  const { slug: slugParam } = useParams();
  const ministry = getMinistryBySlug(slugProp || slugParam);
  const heroRef = useRef<HTMLDivElement>(null);

  if (!ministry || ministry.existingPage) {
    return <Navigate to="/ministries" replace />;
  }

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
                className="hero-title text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250"
              >
                {ministry.label}
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">{ministry.tagline}</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">{ministry.summary}</span>
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
                <Link to="/ministries" className="group">
                  <GlowingButton
                    variant="outline"
                    size="md"
                    className="!px-6 !py-[14px] !border-gold !bg-gold/20 !text-white hover:!bg-gold hover:!text-white !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:!border-gold active:scale-95 hover:-translate-y-1 !normal-case"
                  >
                    <ArrowLeft
                      size={18}
                      className="mr-2 text-gold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:h-5 group-hover:w-5 group-hover:translate-x-1 group-hover:text-white"
                    />
                    <span className="text-white font-normal text-base leading-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:font-semibold group-hover:tracking-wider">
                      Back to {MINISTRIES_LABEL}
                    </span>
                  </GlowingButton>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pulse-arrow animate-ping-pong">
          <ArrowDownToLine size={32} className="text-gold" />
        </div>
      </section>

      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <ScrollReveal direction="down" delay={100}>
              <div className="glass-card rounded-[16px] p-8 md:p-12 text-center border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                <div className="p-4 bg-[#fbcb05] rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-gold/30">
                  <Heart size={48} />
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4 group-hover:text-gold transition-colors duration-300">
                  {ministry.label}
                </h2>
                <p className="text-xl text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                  {ministry.summary}
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              <ScrollReveal direction="right" delay={200}>
                <div className="glass-card rounded-[16px] p-6 border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-normal text-charcoal mb-2 group-hover:text-gold transition-colors duration-300">
                        When
                      </h3>
                      <p className="text-neutral mb-2 group-hover:text-charcoal transition-colors">
                        <strong className="text-charcoal">{ministry.whenLabel}</strong>
                      </p>
                      <p className="text-neutral text-lg font-bold text-gold">{ministry.whenDetail}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={200}>
                <div className="glass-card rounded-[16px] p-6 border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-normal text-charcoal mb-2 group-hover:text-gold transition-colors duration-300">
                        Location
                      </h3>
                      <p className="text-neutral mb-2 group-hover:text-charcoal transition-colors">284 Havelock Street</p>
                      <p className="text-neutral group-hover:text-charcoal transition-colors">Ashburton 7700</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal direction="up" delay={300}>
              <div className="glass-card rounded-[16px] p-8 md:p-12 border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                <h3 className="font-serif text-3xl font-normal text-charcoal mb-6 group-hover:text-gold transition-colors duration-300">
                  About this ministry
                </h3>
                <div className="space-y-4 text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                  {ministry.description.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <div className="text-center pt-8">
                <Link to="/contact">
                  <GlowingButton
                    variant="gold"
                    size="lg"
                    className="!rounded-full transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1"
                  >
                    Get in touch
                  </GlowingButton>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
};
