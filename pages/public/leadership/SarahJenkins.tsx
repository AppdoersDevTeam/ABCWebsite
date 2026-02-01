import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { ArrowLeft, ArrowDownToLine } from 'lucide-react';

export const SarahJenkins = () => {
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
        <div className="container relative z-10 px-4 mx-auto pt-[224px] md:pt-[256px]">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                Sarah Jenkins
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">Executive Pastor.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">Organizational excellence</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">and a heart for service.</span>
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
                <Link to="/about#leadership" className="group">
                  <GlowingButton variant="outline" size="md" className="!px-6 !py-[14px] !border-gold !bg-gold/20 !text-white hover:!bg-gold hover:!text-white !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:!border-gold active:scale-95 hover:-translate-y-1 !normal-case">
                    <ArrowLeft size={18} className="mr-2 text-gold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:h-5 group-hover:w-5 group-hover:translate-x-1 group-hover:text-white" />
                    <span className="text-white font-normal text-base leading-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:font-semibold group-hover:tracking-wider">Back to Leadership</span>
                  </GlowingButton>
                </Link>
              </div>
            </ScrollReveal>
          </div>
          
          {/* Pulsing Down Arrow */}
          <div className="absolute bottom-[29px] left-1/2 -translate-x-1/2 z-20 pulse-arrow animate-ping-pong">
            <ArrowDownToLine size={32} className="text-gold" />
          </div>
        </div>
      </section>
      
      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <ScrollReveal direction="right" delay={100}>
              <div className="aspect-[3/4] overflow-hidden rounded-[8px] bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1573496359-136d475583dc?auto=format&fit=crop&w=800&q=80" 
                  alt="Sarah Jenkins" 
                  className="w-full h-full object-cover"
                />
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="left" delay={200}>
              <div className="glass-card rounded-[16px] p-8 bg-white/70 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover-lift">
                <h3 className="text-3xl font-serif font-normal text-charcoal mb-4">Executive Pastor</h3>
                <div className="space-y-4 text-neutral leading-relaxed">
                  <p>
                    Sarah Jenkins serves as Executive Pastor, overseeing the day-to-day operations and 
                    strategic planning of the church. With a background in business administration and 
                    ministry, Sarah brings organizational excellence and a heart for service.
                  </p>
                  <p>
                    Sarah joined the team in 2018 and has been instrumental in developing our community 
                    programs and outreach initiatives. She holds a Bachelor of Business Administration 
                    and a Master of Ministry.
                  </p>
                  <p>
                    Her passion lies in creating systems that enable the church to effectively serve 
                    our community and support our members in their faith journey. Sarah is married 
                    and has two children.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal direction="up" delay={300}>
            <div className="glass-card rounded-[16px] p-8 md:p-12 bg-white/70 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover-lift">
              <h3 className="text-2xl font-serif font-normal text-charcoal mb-6">Ministry Focus</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-charcoal mb-2">Operations</h4>
                  <p className="text-neutral text-sm">Managing church administration and facilities</p>
                </div>
                <div>
                  <h4 className="font-bold text-charcoal mb-2">Community Programs</h4>
                  <p className="text-neutral text-sm">Developing outreach and service initiatives</p>
                </div>
                <div>
                  <h4 className="font-bold text-charcoal mb-2">Strategic Planning</h4>
                  <p className="text-neutral text-sm">Vision casting and goal setting</p>
                </div>
                <div>
                  <h4 className="font-bold text-charcoal mb-2">Volunteer Coordination</h4>
                  <p className="text-neutral text-sm">Mobilizing and supporting volunteers</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};


