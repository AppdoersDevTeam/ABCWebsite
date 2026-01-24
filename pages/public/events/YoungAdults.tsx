import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/UI/PageHeader';
import { VibrantCard } from '../../../components/UI/VibrantCard';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { Users, Clock, MapPin, ArrowLeft, Coffee, Heart } from 'lucide-react';

export const YoungAdults = () => {
  return (
    <div className="pb-32">
      <PageHeader title="YOUNG ADULTS" subtitle="Connect. Grow. Serve." />
      
      <section className="py-12 md:py-20 relative z-10" style={{ backgroundColor: '#EEF2F3' }}>
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <ScrollReveal direction="right" delay={0}>
            <div className="max-w-4xl mx-auto mb-8">
              <Link to="/events" className="inline-flex items-center gap-2 text-gold hover:text-charcoal transition-colors font-bold">
                <ArrowLeft size={20} />
                Back to Events
              </Link>
            </div>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto">
            {/* Main Content */}
            <div className="space-y-8">
              {/* Hero Section */}
              <ScrollReveal direction="down" delay={100}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 text-center border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                  <div className="p-4 bg-[#fbcb05] rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-gold/30">
                    <Users size={48} />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4 group-hover:text-gold transition-colors duration-300">Young Adults</h2>
                  <p className="text-xl text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    A space for 18-30 year olds to connect, grow in faith, and build meaningful relationships. 
                    Whether you're studying, working, or figuring out life, you're welcome here.
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
                        <p className="text-neutral mb-2 group-hover:text-charcoal transition-colors"><strong className="text-charcoal">Every Wednesday</strong></p>
                        <p className="text-neutral text-lg font-bold text-gold">7:00 PM</p>
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
                      Our Young Adults group is a vibrant community where you can be yourself, ask questions, 
                      and explore faith in a safe and welcoming environment. We gather weekly to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Study the Bible together and discuss how it applies to our lives</li>
                      <li>Worship and pray together</li>
                      <li>Build genuine friendships and support each other</li>
                      <li>Serve our community and make a difference</li>
                      <li>Have fun together through social events and activities</li>
                    </ul>
                  </div>
                </div>
              </ScrollReveal>

              {/* Community & Connection */}
              <ScrollReveal direction="up" delay={400}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                      <Heart size={32} />
                    </div>
                    <h3 className="font-serif text-3xl font-normal text-charcoal group-hover:text-gold transition-colors duration-300">Community & Connection</h3>
                  </div>
                  <div className="space-y-4 text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    <p>
                      Life in your 20s can be challenging - navigating studies, careers, relationships, and 
                      figuring out who you are and what you believe. Our Young Adults group is a place where 
                      you don't have to have it all figured out.
                    </p>
                    <p>
                      We're a diverse group of people from different backgrounds, but we share a common desire 
                      to grow, learn, and support each other. Whether you're new to faith or have been following 
                      Jesus for years, you'll find a place here.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Social Events */}
              <ScrollReveal direction="up" delay={500}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                      <Coffee size={32} />
                    </div>
                    <h3 className="font-serif text-3xl font-normal text-charcoal group-hover:text-gold transition-colors duration-300">Social Events</h3>
                  </div>
                  <div className="space-y-4 text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    <p>
                      Beyond our weekly gatherings, we regularly organize social events including:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>BBQs and outdoor activities</li>
                      <li>Game nights and movie nights</li>
                      <li>Service projects in the community</li>
                      <li>Weekend retreats and camps</li>
                      <li>Social outings and adventures</li>
                    </ul>
                    <p>
                      These events are great opportunities to build friendships and have fun together outside 
                      of our regular meeting times.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* CTA */}
              <ScrollReveal direction="up" delay={600}>
                <div className="text-center pt-8">
                  <Link to="/contact">
                    <GlowingButton variant="gold" size="lg" className="!rounded-full transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                      Get In Touch
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


