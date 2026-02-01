import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { Users, Clock, MapPin, ArrowLeft, Heart, Sparkles, ArrowDownToLine } from 'lucide-react';

export const KidsProgram = () => {
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
                Kids Programme
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">Fun & Faith for Kids.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">Safe, engaging programmes for K-6.</span>
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
                <Link to="/events" className="group">
                  <GlowingButton variant="outline" size="md" className="!px-6 !py-[14px] !border-gold !bg-gold/20 !text-white hover:!bg-gold hover:!text-white !rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:!border-gold active:scale-95 hover:-translate-y-1 !normal-case">
                    <ArrowLeft size={18} className="mr-2 text-gold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:h-5 group-hover:w-5 group-hover:translate-x-1 group-hover:text-white" />
                    <span className="text-white font-normal text-base leading-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:font-semibold group-hover:tracking-wider">Back to Events</span>
                  </GlowingButton>
                </Link>
              </div>
            </ScrollReveal>
          </div>
          
        </div>
        
        {/* Pulsing Down Arrow - positioned relative to section for proper centering */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pulse-arrow animate-ping-pong">
          <ArrowDownToLine size={32} className="text-gold" />
        </div>
      </section>

      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Hero Section */}
              <ScrollReveal direction="down" delay={100}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 text-center border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                  <div className="p-4 bg-[#fbcb05] rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-gold/30">
                    <Users size={48} />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4 group-hover:text-gold transition-colors duration-300">Kids Programme</h2>
                  <p className="text-xl text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    Fun and faith for K-6. We create engaging, age-appropriate programmes where children 
                    can learn about Jesus, build friendships, and grow in their faith in a safe and 
                    welcoming environment.
                  </p>
                </div>
              </ScrollReveal>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <ScrollReveal direction="right" delay={200}>
                  <div className="glass-card rounded-[16px] p-6 border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                        <Clock size={24} />
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl font-normal text-charcoal mb-2 group-hover:text-gold transition-colors duration-300">When We Meet</h3>
                        <p className="text-neutral mb-2 group-hover:text-charcoal transition-colors"><strong className="text-charcoal">Every Sunday</strong></p>
                        <p className="text-neutral text-lg font-bold text-gold">10:30 AM</p>
                        <p className="text-neutral text-sm mt-2 group-hover:text-charcoal transition-colors">During the morning service (school term)</p>
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
                        <h3 className="font-serif text-2xl font-normal text-charcoal mb-2 group-hover:text-gold transition-colors duration-300">Location</h3>
                        <p className="text-neutral mb-2 group-hover:text-charcoal transition-colors">284 Havelock Street</p>
                        <p className="text-neutral group-hover:text-charcoal transition-colors">Ashburton 7700</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* What We Do */}
              <ScrollReveal direction="up" delay={300}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                  <h3 className="font-serif text-3xl font-normal text-charcoal mb-6 group-hover:text-gold transition-colors duration-300">What We Do</h3>
                  <div className="space-y-4 text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    <p>
                      Our Kids Programme is designed to make learning about Jesus fun and engaging. 
                      We use age-appropriate activities, games, music, and Bible stories to help 
                      children understand God's love for them.
                    </p>
                    <p>
                      Each week, children participate in interactive lessons, creative activities, 
                      and games that reinforce biblical truths. We believe in creating a safe, 
                      welcoming environment where every child feels valued and loved.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Age Groups */}
              <ScrollReveal direction="up" delay={400}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                      <Sparkles size={32} />
                    </div>
                    <h3 className="font-serif text-3xl font-normal text-charcoal group-hover:text-gold transition-colors duration-300">Age Groups</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-charcoal mb-2">Preschool (Ages 3-5)</h4>
                      <p className="text-neutral text-sm group-hover:text-charcoal transition-colors">Simple Bible stories, songs, and play-based learning</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-charcoal mb-2">Primary (Ages 6-8)</h4>
                      <p className="text-neutral text-sm group-hover:text-charcoal transition-colors">Interactive Bible lessons, crafts, and games</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-charcoal mb-2">Intermediate (Ages 9-11)</h4>
                      <p className="text-neutral text-sm group-hover:text-charcoal transition-colors">Deeper Bible study, discussions, and activities</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-charcoal mb-2">All Ages Welcome</h4>
                      <p className="text-neutral text-sm group-hover:text-charcoal transition-colors">We welcome children of all ages and abilities</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Safety & Care */}
              <ScrollReveal direction="up" delay={500}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                      <Heart size={32} />
                    </div>
                    <h3 className="font-serif text-3xl font-normal text-charcoal group-hover:text-gold transition-colors duration-300">Safety & Care</h3>
                  </div>
                  <div className="space-y-4 text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    <p>
                      The safety and wellbeing of children is our top priority. All our volunteers 
                      are background-checked and trained in child protection policies. We maintain 
                      appropriate child-to-adult ratios and follow strict safety protocols.
                    </p>
                    <p>
                      We also have a dedicated Parents Room for caregivers with babies and toddlers, 
                      where you can watch the service while caring for your little ones.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* CTA */}
              <ScrollReveal direction="up" delay={600}>
                <div className="text-center pt-8">
                  <Link to="/im-new">
                    <GlowingButton variant="gold" size="lg" className="!rounded-full transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                      I'm New - Learn More
                    </GlowingButton>
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


