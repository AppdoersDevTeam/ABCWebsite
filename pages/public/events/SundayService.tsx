import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { GlowingButton } from '../../../components/UI/GlowingButton';
import { ScrollReveal } from '../../../components/UI/ScrollReveal';
import { Music, Clock, MapPin, Users, ArrowLeft, ArrowDownToLine } from 'lucide-react';

export const SundayService = () => {
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
                Join Us for Worship
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                Sunday Service
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-[1.5625rem] leading-6 text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300">
                <span className="block whitespace-nowrap font-raleway font-normal text-center">Every Sunday at 10:00 AM</span>
                <span className="block whitespace-nowrap mt-[12px] font-raleway font-normal text-center">Join us for worship, teaching, and community.</span>
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
          
          {/* Pulsing Down Arrow */}
          <div className="absolute bottom-[29px] left-1/2 -translate-x-1/2 z-20 pulse-arrow animate-ping-pong">
            <ArrowDownToLine size={32} className="text-gold" />
          </div>
        </div>
      </section>
      
      <section className="section-gradient-soft py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4">

          <div className="max-w-4xl mx-auto">
            {/* Main Content */}
            <div className="space-y-8">
              {/* Hero Section */}
              <ScrollReveal direction="down" delay={100}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 text-center border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group hover-lift bg-white/70">
                  <div className="p-4 bg-[#fbcb05] rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-gold/30">
                    <Music size={48} />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4 group-hover:text-gold transition-colors duration-300">Sunday Service</h2>
                  <p className="text-xl text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    Join us every Sunday for a time of worship, teaching, and community. 
                    We gather together to encounter God, connect with each other, and be equipped to impact our world.
                  </p>
                </div>
              </ScrollReveal>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <ScrollReveal direction="right" delay={200}>
                  <div className="glass-card rounded-[16px] p-6 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group hover-lift bg-white/70">
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                        <Clock size={24} />
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl font-normal text-charcoal mb-2 group-hover:text-gold transition-colors duration-300">Service Times</h3>
                        <p className="text-neutral mb-2 group-hover:text-charcoal transition-colors"><strong className="text-charcoal">Every Sunday</strong></p>
                        <p className="text-neutral text-lg font-bold text-gold">10:00 AM</p>
                        <p className="text-neutral text-sm mt-2 group-hover:text-charcoal transition-colors">Service duration: 90 minutes</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="left" delay={200}>
                  <div className="glass-card rounded-[16px] p-6 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group hover-lift bg-white/70">
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl font-normal text-charcoal mb-2 group-hover:text-gold transition-colors duration-300">Location</h3>
                        <p className="text-neutral mb-2 group-hover:text-charcoal transition-colors">284 Havelock Street</p>
                        <p className="text-neutral mb-4 group-hover:text-charcoal transition-colors">Ashburton 7700</p>
                        <a 
                          href="https://www.google.com/maps/search/?api=1&query=284+Havelock+Street+Ashburton+7700" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gold hover:text-charcoal font-bold transition-colors text-sm"
                        >
                          View on Map →
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* What to Expect */}
              <ScrollReveal direction="up" delay={300}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group hover-lift bg-white/70">
                  <h3 className="font-serif text-3xl font-normal text-charcoal mb-6 group-hover:text-gold transition-colors duration-300">What to Expect</h3>
                  <div className="space-y-4 text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    <p>
                      Our Sunday service is a vibrant gathering where people of all ages come together to worship God. 
                      We begin with a time of contemporary and traditional worship music, led by our worship team.
                    </p>
                    <p>
                      Following worship, we share announcements and updates about church life, then hear a message 
                      from God's Word that is practical, relevant, and applicable to everyday life.
                    </p>
                    <p>
                      After the service, we invite you to stay for refreshments in our Connect Café, where you can 
                      meet others and build relationships.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Music & Worship */}
              <ScrollReveal direction="up" delay={400}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group hover-lift bg-white/70">
                  <h3 className="font-serif text-3xl font-normal text-charcoal mb-6 group-hover:text-gold transition-colors duration-300">Music & Worship</h3>
                  <div className="space-y-4 text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    <p>
                      We enjoy a wide range of praise and worship music, from traditional hymns to contemporary songs. 
                      Our worship is sensitive to the Holy Spirit and sometimes includes times of free worship that 
                      flow naturally from our songs.
                    </p>
                    <p>
                      Our worship team is made up of talented musicians and vocalists who lead us in authentic, 
                      heartfelt worship. We believe worship is not just about the music, but about connecting with 
                      God and expressing our love and gratitude to Him.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Children's Programs */}
              <ScrollReveal direction="up" delay={500}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group hover-lift bg-white/70">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30">
                      <Users size={32} />
                    </div>
                    <h3 className="font-serif text-3xl font-normal text-charcoal group-hover:text-gold transition-colors duration-300">Children's Programs</h3>
                  </div>
                  <div className="space-y-4 text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    <p>
                      We are a family-friendly church and welcome children of all ages. During the service, we offer:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong className="text-charcoal">Kids Church</strong> - Fun and engaging programs for school-aged children (runs during school term)</li>
                      <li><strong className="text-charcoal">Parents Room</strong> - A comfortable space for parents with babies and toddlers</li>
                      <li><strong className="text-charcoal">Nursery</strong> - Care for the littlest ones</li>
                    </ul>
                    <p>
                      All our children's programs are run by trained, background-checked volunteers who love 
                      working with kids and helping them grow in their faith.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Parking */}
              <ScrollReveal direction="up" delay={600}>
                <div className="glass-card rounded-[16px] p-8 md:p-12 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group hover-lift bg-white/70">
                  <h3 className="font-serif text-3xl font-normal text-charcoal mb-6 group-hover:text-gold transition-colors duration-300">Parking</h3>
                  <div className="space-y-4 text-neutral leading-relaxed group-hover:text-charcoal transition-colors">
                    <p>
                      We have a dedicated car park on church grounds on Havelock Street. There is also ample 
                      free off-street parking available close to and in the vicinity of the church auditorium.
                    </p>
                    <p className="text-sm text-neutral/80">
                      <strong>Note:</strong> There may be roadworks happening around the church and in the 
                      Town Centre, so please plan your time to allow for extra time to find parking.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* CTA */}
              <ScrollReveal direction="up" delay={700}>
                <div className="text-center pt-8">
                  <Link to="/im-new">
                    <GlowingButton variant="gold" size="lg" className="!rounded-full transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1 group">
                      <span className="transition-all duration-300 group-hover:tracking-wider">I'm New - Learn More</span>
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


