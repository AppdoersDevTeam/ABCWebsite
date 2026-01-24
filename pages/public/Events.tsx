import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Music, ArrowRight, Video, Clock, MapPin, ArrowDownToLine } from 'lucide-react';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types';

export const Events = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [publicEvents, setPublicEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPublicEvents();
  }, []);

  const fetchPublicEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_public', true)
        .order('date', { ascending: true });

      if (error) throw error;
      setPublicEvents(data || []);
    } catch (error) {
      console.error('Error fetching public events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  const formatEventTime = (date: string, time: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return `Today, ${time}`;
    if (diffDays === 1) return `Tomorrow, ${time}`;
    if (diffDays < 7) return `${diffDays} days, ${time}`;
    
    return `${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'service':
      case 'worship':
        return <Music size={24} />;
      case 'meeting':
      case 'connect':
        return <Users size={24} />;
      case 'community':
        return <Calendar size={24} />;
      case 'ministry':
        return <Users size={24} />;
      case 'media':
        return <Video size={24} />;
      default:
        return <Calendar size={24} />;
    }
  };

  const featuredEvents = [
    {
      id: 'sunday-service',
      title: 'Sunday Service',
      description: 'Worship, teaching, and community every Sunday at 10:00 AM.',
      link: '/events/sunday-service',
      icon: <Music size={28} />
    },
    {
      id: 'young-adults',
      title: 'Young Adults',
      description: 'Connect and grow with other young adults through faith and friendship.',
      link: '/events/young-adults',
      icon: <Users size={28} />
    },
    {
      id: 'community-lunch',
      title: 'Community Lunch',
      description: 'Share a meal and build relationships with our church community.',
      link: '/events/community-lunch',
      icon: <Calendar size={28} />
    },
    {
      id: 'kids-program',
      title: 'Kids Program',
      description: 'Engaging programs that help kids learn about Jesus in a fun way.',
      link: '/events/kids-program',
      icon: <Users size={28} />
    }
  ];

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
            <ScrollReveal direction="up" delay={100}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-200" style={{ fontFamily: 'Inter', fontSize: '2.5rem', lineHeight: '1.2', marginTop: '63px' }}>
                What's On
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                Calendar
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-[1.5625rem] leading-6 text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300">
                <span className="block whitespace-nowrap font-raleway font-normal text-center">Join us this week</span>
                <span className="block whitespace-nowrap mt-[12px] font-raleway font-normal text-center">and be part of our community.</span>
              </p>
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
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-12 md:mb-16">
              <Calendar className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-charcoal mb-4">Event Highlights</h2>
              <p className="text-gold mt-2 text-base font-bold">Explore what is happening this season.</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {featuredEvents.map((event, i) => (
              <ScrollReveal key={event.id} direction="up" delay={i * 100}>
                <div id={event.id} className="scroll-mt-32">
                  <Link to={event.link} className="group block">
                    <div className="glass-card rounded-[16px] p-8 md:p-10 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/70 hover-lift">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-lg shadow-gold/30 group-hover:scale-105 transition-transform">
                          {event.icon}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-serif font-normal text-charcoal group-hover:text-gold transition-colors">
                          {event.title}
                        </h3>
                      </div>
                      <p className="text-neutral leading-relaxed text-lg group-hover:text-charcoal transition-colors">
                        {event.description}
                      </p>
                      <div className="mt-6 inline-flex items-center text-gold font-bold group-hover:text-charcoal transition-colors">
                        Learn more
                        <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      
      <section className="section-gradient py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-12">
              <Calendar className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-white mb-4">Upcoming Events</h2>
              <p className="text-gold mt-2 text-base font-bold">Join us this week.</p>
            </div>
          </ScrollReveal>
        {isLoading ? (
          <div className="flex justify-center">
            <div className="grid md:grid-cols-3 gap-8 w-full max-w-[80.5%]">
              {Array.from({ length: 3 }).map((_, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 100}>
                  <div className="glass-card border border-white/50 shadow-sm p-0 flex rounded-[8px] overflow-hidden bg-white/70 animate-pulse">
                    <div className="bg-gray-200 w-24 flex flex-col items-center justify-center p-4">
                      <div className="h-8 w-8 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 w-12 bg-gray-300 rounded"></div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                      <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        ) : publicEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="text-gray-300 mx-auto mb-4" size={48} />
            <p className="text-neutral text-lg">No upcoming events scheduled</p>
            <p className="text-neutral text-sm mt-2">Check back soon for new events!</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="grid md:grid-cols-3 gap-8 w-full max-w-[80.5%]">
              {publicEvents.map((evt, i) => {
                const { day, month } = formatEventDate(evt.date);
                return (
                  <ScrollReveal key={evt.id} direction="up" delay={i * 100}>
                    <Link to="/events">
                      <div className="glass-card border border-white/50 shadow-sm p-0 flex rounded-[8px] overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/70 hover-lift cursor-pointer">
                        <div className="bg-gold/35 group-hover:bg-gold transition-all duration-300 w-24 flex flex-col items-center justify-center p-4 text-charcoal group-hover:scale-105">
                          <span className="text-2xl md:text-3xl font-black group-hover:scale-110 transition-transform duration-300">{day}</span>
                          <span className="text-xs md:text-sm font-bold tracking-wider">{month}</span>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-center">
                          <h4 className="text-lg md:text-xl font-bold text-charcoal mb-1 group-hover:text-gold transition-colors duration-300">{evt.title}</h4>
                          <span className="text-neutral text-sm flex items-center group-hover:text-black transition-colors mb-1">
                            <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center mr-2 group-hover:bg-gold transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 icon-bounce">
                              <Clock size={16} className="text-gold group-hover:text-white"/>
                            </div>
                            {formatEventTime(evt.date, evt.time)}
                          </span>
                          {evt.location && (
                            <span className="text-neutral text-xs flex items-center mt-1">
                              <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center mr-2 group-hover:bg-gold transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 icon-bounce">
                                <MapPin size={16} className="text-gold group-hover:text-white"/>
                              </div>
                              {evt.location}
                            </span>
                          )}
                          {evt.category && (
                            <span className="text-gold text-xs uppercase tracking-widest mt-2 font-bold">{evt.category}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </section>
    </div>
  );
};