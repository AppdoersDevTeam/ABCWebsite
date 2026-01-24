import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/UI/PageHeader';
import { VibrantCard } from '../../../components/UI/VibrantCard';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { Calendar, Clock, MapPin, ArrowLeft, UtensilsCrossed, Heart, Users } from 'lucide-react';

export const CommunityLunch = () => {
  return (
    <div className="pb-32">
      <PageHeader title="COMMUNITY LUNCH" subtitle="Serving Our Neighbors" />
      
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
                    <UtensilsCrossed size={48} />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4 group-hover:text-gold transition-colors duration-300">Community Lunch</h2>
                  <p className="text-xl text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    A free lunch for our neighbors. Every first Sunday of the month, we open our doors 
                    to serve a hot meal and build community with those around us.
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
                        <h3 className="font-serif text-2xl font-normal text-charcoal mb-2 group-hover:text-gold transition-colors duration-300">When We Serve</h3>
                        <p className="text-neutral mb-2 group-hover:text-charcoal transition-colors"><strong className="text-charcoal">First Sunday of Each Month</strong></p>
                        <p className="text-neutral text-lg font-bold text-gold">12:00 PM</p>
                        <p className="text-neutral text-sm mt-2 group-hover:text-charcoal transition-colors">Following our morning service</p>
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

              {/* Our Mission */}
              <ScrollReveal direction="up" delay={300}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                      <Heart size={32} />
                    </div>
                    <h3 className="font-serif text-3xl font-normal text-charcoal group-hover:text-gold transition-colors duration-300">Our Mission</h3>
                  </div>
                  <div className="space-y-4 text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    <p>
                      Community Lunch is one of the ways we live out our mission to love and serve our neighbors. 
                      We believe that sharing a meal together is one of the most powerful ways to build community 
                      and show God's love in a practical way.
                    </p>
                    <p>
                      This is a free event open to everyone in our community - whether you're part of our church 
                      family or not. We welcome singles, families, seniors, and anyone who would like to join us 
                      for good food and good company.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* What to Expect */}
              <ScrollReveal direction="up" delay={400}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                  <h3 className="font-serif text-3xl font-normal text-charcoal mb-6 group-hover:text-gold transition-colors duration-300">What to Expect</h3>
                  <div className="space-y-4 text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    <p>
                      When you arrive, you'll be welcomed by our team and shown to a seat. We serve a hot, 
                      home-cooked meal that's prepared with care by our volunteers. The atmosphere is warm and 
                      friendly, and there's always plenty of food.
                    </p>
                    <p>
                      After the meal, we often have time for conversation, games, or simply enjoying each other's 
                      company. It's a relaxed, informal gathering where everyone is welcome.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Get Involved */}
              <ScrollReveal direction="up" delay={500}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 border-t border-white/50 animate-scale-in group hover-lift bg-white/80">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                      <Users size={32} />
                    </div>
                    <h3 className="font-serif text-3xl font-normal text-charcoal group-hover:text-gold transition-colors duration-300">Get Involved</h3>
                  </div>
                  <div className="space-y-4 text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    <p>
                      Community Lunch is made possible by our amazing team of volunteers who help with:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Food preparation and cooking</li>
                      <li>Serving and hospitality</li>
                      <li>Setup and cleanup</li>
                      <li>Welcoming and connecting with guests</li>
                    </ul>
                    <p>
                      If you'd like to get involved in serving at Community Lunch, we'd love to have you! 
                      Whether you can help once or regularly, your contribution makes a difference.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* CTA */}
              <ScrollReveal direction="up" delay={600}>
                <div className="text-center pt-8">
                  <Link to="/contact">
                    <GlowingButton variant="gold" size="lg" className="!rounded-full transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1">
                      Contact Us to Volunteer
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


