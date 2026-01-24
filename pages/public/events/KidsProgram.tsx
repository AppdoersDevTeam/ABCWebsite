import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/UI/PageHeader';
import { VibrantCard } from '../../../components/UI/VibrantCard';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { Users, Clock, MapPin, ArrowLeft, Heart, Sparkles } from 'lucide-react';

export const KidsProgram = () => {
  return (
    <div className="pb-32">
      <PageHeader title="KIDS PROGRAM" subtitle="Fun & Faith for Kids" />
      
      <section className="py-12 md:py-20 relative z-10" style={{ backgroundColor: '#EEF2F3' }}>
        <div className="container mx-auto px-4">
          <ScrollReveal direction="right" delay={0}>
            <div className="max-w-4xl mx-auto mb-8">
              <Link to="/events" className="inline-flex items-center gap-2 text-gold hover:text-charcoal transition-colors font-bold">
                <ArrowLeft size={20} />
                Back to Events
              </Link>
            </div>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Hero Section */}
              <ScrollReveal direction="down" delay={100}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 text-center border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                  <div className="p-4 bg-[#fbcb05] rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-gold/30">
                    <Users size={48} />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4 group-hover:text-gold transition-colors duration-300">Kids Program</h2>
                  <p className="text-xl text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    Fun and faith for K-6. We create engaging, age-appropriate programs where children 
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
                      Our Kids Program is designed to make learning about Jesus fun and engaging. 
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


