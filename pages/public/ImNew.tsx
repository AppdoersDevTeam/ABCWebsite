import React, { useState, useRef } from 'react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { Download, ChevronDown, MapPin, Heart, ArrowDownToLine, Clock } from 'lucide-react';

export const ImNew = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
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
        <div className="container relative z-10 px-4 mx-auto pt-[224px] md:pt-[256px] pb-24 md:pb-28">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                Welcome Home
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">I'm New.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">We're glad you're here.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">Welcome to our family.</span>
              </p>
            </ScrollReveal>
          </div>
          
          {/* Pulsing Down Arrow */}
          <div className="absolute bottom-[29px] left-1/2 -translate-x-1/2 z-20 pulse-arrow animate-ping-pong">
            <ArrowDownToLine size={32} className="text-gold" />
          </div>
        </div>
      </section>
      
      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl space-y-12">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-12">
              <Heart className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4">We're glad you're here</h2>
              <p className="text-gold mt-2 text-base font-bold">Welcome to our family.</p>
            </div>
          </ScrollReveal>
        {/* Welcome Text */}
        <ScrollReveal direction="up" delay={0}>
          <div id="welcome" className="glass-card bg-white/70 p-8 md:p-12 rounded-[16px] text-center border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 scroll-mt-24 hover-lift">
            <h2 className="text-3xl md:text-4xl font-serif font-normal text-charcoal mb-6">We're glad you're here</h2>
            <p className="text-neutral leading-relaxed text-lg">
              Visiting a new church can be intimidating. We want to make your first experience at Ashburton Baptist as welcoming as possible. 
              Whether you're just visiting or looking for a place to call home, you belong here.
            </p>
          </div>
        </ScrollReveal>
        </div>
      </section>

      <section className="section-gradient py-12 md:py-20 relative z-10 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27%3E%3Cpath d=%27M20 6v28M6 20h28%27 stroke=%27%23cbd5e1%27 stroke-width=%271%27/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Welcome Pack Download */}
        <ScrollReveal direction="up" delay={100}>
          <div id="welcome-pack" className="glass-card bg-white/70 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 rounded-[16px] border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 scroll-mt-24 hover-lift">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-serif font-normal text-charcoal mb-2">Welcome Pack</h3>
              <p className="text-neutral">Everything you need to know about our community.</p>
              <p className="text-neutral mt-2">Service times, locations, ministries, and next steps to help you feel at home.</p>
            </div>
            <GlowingButton variant="outline" className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1 w-full md:w-auto group">
              <Download size={18} className="mr-2 transition-all duration-300 group-hover:animate-bounce" />
              <span className="transition-all duration-300 group-hover:tracking-wider">Download PDF</span>
            </GlowingButton>
          </div>
        </ScrollReveal>
        </div>
      </section>

      <section className="section-plain py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
        {/* FAQ Accordion */}
        <div id="faq" className="space-y-4 scroll-mt-24">
            <h3 className="text-3xl font-serif text-charcoal text-center mb-8 animate-fade-in-up delay-500">Frequently Asked Questions</h3>
            {[
                { 
                    q: "What to expect at your 1st Service", 
                    a: "If it is your 1st time with us, we recommend that you arrive 15 minutes before the service commences to meet with the worship team and settle in. When you arrive you'll be met by one of our Worship/Prayer Team who will be on hand to welcome you and show you to a place to sit in the auditorium." 
                },
                { 
                    q: "How long are the Services?", 
                    a: "Our services are all 90 minutes long. Please join us afterwards in the Connect Café in the foyer to mingle and enjoy a hot drink." 
                },
                { 
                    q: "Can I bring my children?", 
                    a: "We are a family-friendly church and welcome babies and children of all ages. We have a dedicated Parents room for caregivers and parents and their little ones. As well as some fantastic kids church programs that run during the morning service in the school term. Find out all of the details about the Ashburton Baptist Church Kids programs and facilities here." 
                },
                { 
                    q: "What is the music like?", 
                    a: "We enjoy a wide range of praise and worship music from hymns to contemporary songs and we cater for all ages. Our services are sensitive to the Holy Spirit and sometimes have free worship that flows on from our songs." 
                },
                { 
                    q: "Where can I Park?", 
                    a: "We have a dedicated car park on Church grounds on Havelock Street. There is also ample free off-street parking available close to and in the vicinity of the Church auditorium. Please Note: that there are roadworks happening around the Church and all over the Town Centre, so please plan your time to allow for extra time to find parking." 
                },
                { 
                    q: "How to Find Us", 
                    a: "Ashburton Baptist Church is located at 284 Havelock Street, Ashburton." 
                },
            ].map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <ScrollReveal key={i} direction="up" delay={300 + i * 100}>
                    <div className="glass-card bg-white/70 border border-white/50 rounded-[16px] shadow-sm hover:shadow-xl hover:-translate-y-1 hover-lift overflow-hidden transition-all duration-300 hover:border-gold">
                        <button
                            onClick={() => setOpenFaq(isOpen ? null : i)}
                            className="w-full p-6 flex justify-between items-center text-left cursor-pointer group"
                        >
                            <h4 className="font-serif text-lg md:text-xl text-charcoal font-normal pr-4 group-hover:text-gold transition-colors duration-300">{item.q}</h4>
                            <ChevronDown 
                                className={`text-gold flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                                size={20} 
                            />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="px-6 pb-6">
                                <p className="text-neutral text-sm leading-relaxed">{item.a}</p>
                                {item.q === "How to Find Us" && (
                                    <div className="mt-4">
                                        <a 
                                            href="https://www.google.com/maps/search/?api=1&query=284+Havelock+Street+Ashburton+7700" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-gold hover:text-charcoal font-bold transition-colors duration-300 group/link"
                                        >
                                            <MapPin size={18} className="group-hover/link:scale-110 transition-transform" />
                                            View Map & Directions
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                  </ScrollReveal>
                );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};