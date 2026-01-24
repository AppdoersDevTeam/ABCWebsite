import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { VibrantCard } from '../../../components/UI/VibrantCard';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { ArrowLeft, ArrowDownToLine, UserRound } from 'lucide-react';

export const DavidMiller = () => {
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
            <ScrollReveal direction="up" delay={100}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-200" style={{ fontFamily: 'Inter', fontSize: '2.5rem', lineHeight: '1.2', marginTop: '63px' }}>
                Senior Pastor
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                Rev. David Miller
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-[1.5625rem] leading-6 text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300">
                <span className="block whitespace-nowrap font-raleway font-normal text-center">Leading with passion for teaching God's Word</span>
                <span className="block whitespace-nowrap mt-[12px] font-raleway font-normal text-center">and a heart for community transformation.</span>
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
      
      <div className="container mx-auto px-4 relative z-10 max-w-4xl" style={{ backgroundColor: '#EEF2F3' }}>
        <section className="py-12 md:py-20">

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <ScrollReveal direction="right" delay={100}>
              <div className="aspect-[3/4] overflow-hidden rounded-[8px] bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80" 
                  alt="Rev. David Miller" 
                  className="w-full h-full object-cover"
                />
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="left" delay={200}>
              <div className="glass-card rounded-[16px] p-8 bg-white/70 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover-lift">
                <h3 className="text-3xl font-serif font-normal text-charcoal mb-4">Senior Pastor</h3>
                <div className="space-y-4 text-neutral leading-relaxed">
                  <p>
                    Rev. David Miller has been serving as Senior Pastor at Ashburton Baptist Church since 2015. 
                    With over 20 years of ministry experience, David brings a passion for teaching God's Word 
                    and a heart for community transformation.
                  </p>
                  <p>
                    David holds a Master of Divinity from the Baptist Theological College and has served in 
                    various pastoral roles throughout New Zealand. He is married to Sarah, and they have 
                    three children.
                  </p>
                  <p>
                    His vision for the church centers on seeing lives transformed by the gospel, equipping 
                    believers to impact their community with hope, love, and service. David is passionate 
                    about discipleship, community engagement, and seeing the church be a beacon of light 
                    in Ashburton.
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
                  <h4 className="font-bold text-charcoal mb-2">Preaching & Teaching</h4>
                  <p className="text-neutral text-sm">Leading Sunday services and Bible studies</p>
                </div>
                <div>
                  <h4 className="font-bold text-charcoal mb-2">Leadership Development</h4>
                  <p className="text-neutral text-sm">Mentoring and equipping church leaders</p>
                </div>
                <div>
                  <h4 className="font-bold text-charcoal mb-2">Community Outreach</h4>
                  <p className="text-neutral text-sm">Building relationships in Ashburton</p>
                </div>
                <div>
                  <h4 className="font-bold text-charcoal mb-2">Pastoral Care</h4>
                  <p className="text-neutral text-sm">Supporting and counseling church members</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
};


