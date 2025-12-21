import React, { useState } from 'react';
import { PageHeader } from '../../components/UI/PageHeader';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Download, ChevronDown, MapPin } from 'lucide-react';

export const ImNew = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <div className="pb-32">
      <PageHeader title="WELCOME HOME" subtitle="I'm New" />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10 max-w-4xl space-y-12">
        {/* Welcome Text */}
        <div id="welcome" className="bg-white p-8 md:p-12 rounded-[8px] text-center border-t-4 border-gold shadow-lg scroll-mt-24 animate-fade-in-up hover-lift">
            <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-6">We're glad you're here</h2>
            <p className="text-neutral leading-relaxed text-lg">
                Visiting a new church can be intimidating. We want to make your first experience at Ashburton Baptist as welcoming as possible. 
                Whether you're just visiting or looking for a place to call home, you belong here.
            </p>
        </div>

        {/* Welcome Pack Download */}
        <div id="welcome-pack" className="glass-card bg-white/60 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 rounded-[8px] scroll-mt-24 animate-fade-in-up delay-300 hover-lift">
            <div className="text-center md:text-left">
                <h3 className="text-3xl font-serif text-charcoal mb-2 font-bold">Welcome Pack</h3>
                <p className="text-neutral">Everything you need to know about our community.</p>
            </div>
            <GlowingButton variant="dark" className="flex items-center whitespace-nowrap shadow-none w-full md:w-auto group">
                <Download size={18} className="mr-2 group-hover:animate-bounce" /> Download PDF
            </GlowingButton>
        </div>

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
                    <div key={i} className="bg-white border border-gray-200 rounded-[8px] shadow-sm animate-fade-in-up hover-lift overflow-hidden transition-all duration-300 hover:border-gold" style={{ animationDelay: `${600 + i * 100}ms` }}>
                        <button
                            onClick={() => setOpenFaq(isOpen ? null : i)}
                            className="w-full p-6 flex justify-between items-center text-left cursor-pointer group"
                        >
                            <h4 className="font-serif text-lg md:text-xl text-charcoal font-bold pr-4 group-hover:text-gold transition-colors duration-300">{item.q}</h4>
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
                );
            })}
        </div>
      </div>
    </div>
  );
};