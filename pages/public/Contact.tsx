import React from 'react';
import { PageHeader } from '../../components/UI/PageHeader';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { MapPin, Phone, Mail } from 'lucide-react';

export const Contact = () => {
  return (
    <div className="pb-32">
      <PageHeader title="CONNECT" subtitle="Get in Touch" />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
                {[
                    { icon: <MapPin />, title: "Visit", val: "284 Havelock Street, Ashburton 7700", id: "visit" },
                    { icon: <Phone />, title: "Call", val: "03-308 5409", id: "call" },
                    { icon: <Mail />, title: "Email", val: "office@ashburtonbaptist.co.nz", id: "email" }
                ].map((item, i) => (
                    <div key={i} id={item.id} className="bg-white border border-gray-100 shadow-sm p-6 md:p-8 flex items-center gap-6 rounded-[8px] hover:border-gold transition-all duration-300 group hover:shadow-md scroll-mt-24 animate-fade-in-left hover-lift" style={{ animationDelay: `${200 + i * 150}ms` }}>
                        <div className="p-4 bg-gray-50 rounded-full text-charcoal group-hover:bg-gold transition-all duration-300 flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 icon-bounce">
                            {React.cloneElement(item.icon, { size: 24 })}
                        </div>
                        <div>
                            <h4 className="font-serif text-xl text-charcoal mb-1 group-hover:text-gold transition-colors duration-300">{item.title}</h4>
                            <p className="text-neutral break-all group-hover:text-charcoal transition-colors duration-300">{item.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
                <div id="message" className="glass-card bg-white p-6 md:p-12 rounded-[8px] h-full scroll-mt-24 animate-fade-in-right delay-500 hover-lift">
                    <h3 className="text-3xl font-serif text-charcoal mb-8">Send a Message</h3>
                    <form className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <input type="text" placeholder="NAME" className="w-full p-4 rounded-[4px] input-sun" />
                            <input type="email" placeholder="EMAIL" className="w-full p-4 rounded-[4px] input-sun" />
                        </div>
                        <input type="text" placeholder="SUBJECT" className="w-full p-4 rounded-[4px] input-sun" />
                        <textarea rows={6} placeholder="MESSAGE" className="w-full p-4 rounded-[4px] input-sun"></textarea>
                        <GlowingButton type="submit" size="lg" fullWidth>Send Message</GlowingButton>
                    </form>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};