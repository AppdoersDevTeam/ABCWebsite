import React from 'react';
import { PageHeader } from '../../components/UI/PageHeader';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { Calendar, Users, Music, ArrowRight } from 'lucide-react';

export const Events = () => {
  const events = [
    { title: "Sunday Service", time: "Every Sunday, 10:00 AM", category: "Service", icon: <Music size={24}/>, desc: "Join us for worship and teaching." },
    { title: "Young Adults", time: "Wednesdays, 7:00 PM", category: "Connect", icon: <Users size={24}/>, desc: "A space for 18-30s to connect." },
    { title: "Community Lunch", time: "First Sunday, 12:00 PM", category: "Community", icon: <Calendar size={24}/>, desc: "Free lunch for our neighbors." },
    { title: "Kids Program", time: "Sundays, 10:30 AM", category: "Ministry", icon: <Users size={24}/>, desc: "Fun and faith for K-6." },
  ];

  return (
    <div className="pb-32">
      <PageHeader title="CALENDAR" subtitle="What's On" />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid gap-6 max-w-5xl mx-auto">
            {events.map((evt, i) => {
              const eventId = evt.title.toLowerCase().replace(/\s+/g, '-');
              return (
                <div key={i} id={eventId} className="group relative bg-white border border-gray-100 shadow-sm p-8 md:p-10 rounded-[8px] flex flex-col md:flex-row items-start md:items-center hover:shadow-lg hover:border-gold/30 transition-all duration-300 scroll-mt-24 animate-fade-in-up hover-lift" style={{ animationDelay: `${200 + i * 150}ms` }}>
                    
                    <div className="bg-gold/10 p-6 rounded-full text-charcoal mb-6 md:mb-0 md:mr-10 group-hover:bg-gold transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 icon-bounce">
                        {evt.icon}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                             <span className="text-gold font-bold text-xs uppercase tracking-widest bg-gold/5 px-2 py-1 rounded-[4px] border border-gold/20 group-hover:bg-gold group-hover:text-charcoal transition-colors duration-300">{evt.category}</span>
                             <span className="text-neutral text-sm font-bold">{evt.time}</span>
                        </div>
                        <h3 className="text-3xl font-serif font-bold text-charcoal mb-2 group-hover:text-gold transition-colors duration-300">{evt.title}</h3>
                        <p className="text-neutral group-hover:text-charcoal transition-colors duration-300">{evt.desc}</p>
                    </div>

                    <div className="mt-6 md:mt-0 relative opacity-0 group-hover:opacity-100 transform translate-x-10 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight size={32} className="text-gold animate-pulse-slow" />
                    </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};