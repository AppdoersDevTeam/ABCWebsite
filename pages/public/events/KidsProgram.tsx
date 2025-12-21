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
      
      <div className="container mx-auto px-4 -mt-10 relative z-10 max-w-4xl">
        <ScrollReveal direction="right" delay={0}>
          <Link to="/events" className="inline-flex items-center gap-2 text-gold hover:text-charcoal mb-8 transition-colors font-bold">
            <ArrowLeft size={20} />
            Back to Events
          </Link>
        </ScrollReveal>

        <div className="space-y-8">
          {/* Hero Section */}
          <ScrollReveal direction="down" delay={100}>
            <VibrantCard className="p-8 md:p-12 text-center border-t-4 border-t-gold hover-lift">
              <div className="bg-gold/10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Users size={48} className="text-gold" />
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4">Kids Program</h2>
              <p className="text-xl text-neutral leading-relaxed">
                Fun and faith for K-6. We create engaging, age-appropriate programs where children 
                can learn about Jesus, build friendships, and grow in their faith in a safe and 
                welcoming environment.
              </p>
            </VibrantCard>
          </ScrollReveal>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal direction="right" delay={200}>
              <VibrantCard className="p-6 bg-white/80 hover-lift">
                <div className="flex items-start gap-4">
                  <Clock className="text-gold flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">When We Meet</h3>
                    <p className="text-neutral mb-2"><strong className="text-charcoal">Every Sunday</strong></p>
                    <p className="text-neutral text-lg font-bold text-gold">10:30 AM</p>
                    <p className="text-neutral text-sm mt-2">During the morning service (school term)</p>
                  </div>
                </div>
              </VibrantCard>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={200}>
              <VibrantCard className="p-6 bg-white/80 hover-lift">
                <div className="flex items-start gap-4">
                  <MapPin className="text-gold flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">Location</h3>
                    <p className="text-neutral mb-2">284 Havelock Street</p>
                    <p className="text-neutral">Ashburton 7700</p>
                  </div>
                </div>
              </VibrantCard>
            </ScrollReveal>
          </div>

          {/* What We Do */}
          <ScrollReveal direction="up" delay={300}>
            <VibrantCard className="p-8 md:p-12 bg-white/80 hover-lift">
              <h3 className="font-serif text-3xl font-bold text-charcoal mb-6">What We Do</h3>
              <div className="space-y-4 text-neutral leading-relaxed">
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
            </VibrantCard>
          </ScrollReveal>

          {/* Age Groups */}
          <ScrollReveal direction="up" delay={400}>
            <VibrantCard className="p-8 md:p-12 bg-white/80 hover-lift">
              <div className="flex items-start gap-4 mb-6">
                <Sparkles className="text-gold flex-shrink-0 mt-1" size={32} />
                <h3 className="font-serif text-3xl font-bold text-charcoal">Age Groups</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-charcoal mb-2">Preschool (Ages 3-5)</h4>
                  <p className="text-neutral text-sm">Simple Bible stories, songs, and play-based learning</p>
                </div>
                <div>
                  <h4 className="font-bold text-charcoal mb-2">Primary (Ages 6-8)</h4>
                  <p className="text-neutral text-sm">Interactive Bible lessons, crafts, and games</p>
                </div>
                <div>
                  <h4 className="font-bold text-charcoal mb-2">Intermediate (Ages 9-11)</h4>
                  <p className="text-neutral text-sm">Deeper Bible study, discussions, and activities</p>
                </div>
                <div>
                  <h4 className="font-bold text-charcoal mb-2">All Ages Welcome</h4>
                  <p className="text-neutral text-sm">We welcome children of all ages and abilities</p>
                </div>
              </div>
            </VibrantCard>
          </ScrollReveal>

          {/* Safety & Care */}
          <ScrollReveal direction="up" delay={500}>
            <VibrantCard className="p-8 md:p-12 bg-white/80 hover-lift">
              <div className="flex items-start gap-4 mb-6">
                <Heart className="text-gold flex-shrink-0 mt-1" size={32} />
                <h3 className="font-serif text-3xl font-bold text-charcoal">Safety & Care</h3>
              </div>
              <div className="space-y-4 text-neutral leading-relaxed">
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
            </VibrantCard>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal direction="up" delay={600}>
            <div className="text-center pt-8">
              <Link to="/im-new">
                <GlowingButton variant="gold" size="lg">
                  I'm New - Learn More
                </GlowingButton>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

