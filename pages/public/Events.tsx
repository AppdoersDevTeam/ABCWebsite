import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Music, ArrowRight, Video, Clock, MapPin, ArrowDownToLine, Filter } from 'lucide-react';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types';
import { GlowingButton } from '../../components/UI/GlowingButton';

const ALL_CATEGORIES = [
  'All',
  'Sunday Service',
  'Members Meeting',
  'Fast & Prayer Meeting',
  'Young Adults',
  'Kids Programme',
  'Community Lunch',
  'Other',
] as const;

const DEFAULT_THUMB = '/ABC Logo.png';

export const Events = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [publicEvents, setPublicEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchPublicEvents();
  }, []);

  const fetchPublicEvents = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_public', true)
        .gte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      setPublicEvents(data || []);
    } catch (error) {
      console.error('Error fetching public events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    if (activeCategory === 'All') return publicEvents;
    return publicEvents.filter(
      (e) => (e.category || 'Other').toLowerCase() === activeCategory.toLowerCase()
    );
  }, [publicEvents, activeCategory]);

  const availableCategories = useMemo(() => {
    const cats = new Set(publicEvents.map((e) => e.category || 'Other'));
    return ALL_CATEGORIES.filter((c) => c === 'All' || cats.has(c));
  }, [publicEvents]);

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
      title: 'Kids Programme',
      description: 'Engaging programs that help kids learn about Jesus in a fun way.',
      link: '/events/kids-program',
      icon: <Users size={28} />
    }
  ];

  const EventCardImage = ({ evt }: { evt: Event }) => {
    const hasImage = !!evt.image_url?.trim();
    const { day, month } = formatEventDate(evt.date);

    return (
      <div className="relative aspect-[16/9] overflow-hidden">
        {hasImage ? (
          <img
            src={String(evt.image_url)}
            alt={evt.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#3a4a1f] via-[#4a5d2a] to-[#2d3a16] flex items-center justify-center">
            <img
              src={DEFAULT_THUMB}
              alt="Ashburton Baptist Church"
              className="h-14 md:h-16 w-auto opacity-90"
              loading="lazy"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-white/60 rounded-full px-3 py-2 shadow-sm">
          <span className="text-charcoal font-black text-sm leading-none">{day}</span>
          <span className="text-neutral font-bold text-[11px] tracking-widest">{month}</span>
        </div>

        {evt.category && (
          <div className="absolute bottom-4 left-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gold/90 text-white text-[11px] font-bold uppercase tracking-widest shadow-sm">
              {evt.category}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-0 overflow-hidden">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
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

        <div className="container relative z-10 px-4 mx-auto pt-[224px] md:pt-[256px] pb-24 md:pb-28">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal direction="up" delay={150}>
              <h1 className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250" style={{ fontFamily: 'Kaushan Script', fontSize: '4.25rem', lineHeight: '1.2' }}>
                Calendar
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">What's On.</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">Join us this week</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">and be part of our community.</span>
              </p>
            </ScrollReveal>
          </div>
        </div>
        
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pulse-arrow animate-ping-pong">
          <ArrowDownToLine size={32} className="text-gold" />
        </div>
      </section>

      {/* Event Highlights */}
      <section className="section-plain py-12 md:py-20 relative z-10">
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
      
      {/* Upcoming Events with Category Filter */}
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
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-8">
              <Calendar className="text-gold mx-auto mb-6" size={64} />
              <h2 className="text-4xl md:text-5xl font-serif font-normal text-white mb-4">Upcoming Events</h2>
              <p className="text-gold mt-2 text-base font-bold">Join us this week.</p>
            </div>
          </ScrollReveal>

          {/* Category Filter Pills */}
          {!isLoading && publicEvents.length > 0 && (
            <ScrollReveal direction="up" delay={50}>
              <div className="flex justify-center mb-10">
                <div className="inline-flex flex-wrap justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-full p-1.5 border border-white/20">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                        activeCategory === cat
                          ? 'bg-gold text-white shadow-lg shadow-gold/30'
                          : 'text-white/80 hover:bg-white/15 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

        {isLoading ? (
          <div className="flex justify-center">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-[16px] overflow-hidden bg-white/10 animate-pulse">
                  <div className="aspect-[16/9] bg-white/10" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 w-3/4 bg-white/10 rounded" />
                    <div className="h-4 w-1/2 bg-white/10 rounded" />
                    <div className="h-4 w-2/3 bg-white/10 rounded" />
                    <div className="h-10 w-full bg-white/10 rounded-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="text-white/40" size={40} />
            </div>
            <p className="text-white/80 text-lg font-serif">
              {activeCategory === 'All'
                ? 'No upcoming events scheduled'
                : `No upcoming ${activeCategory} events`}
            </p>
            <p className="text-white/50 text-sm mt-2">Check back soon for new events!</p>
            {activeCategory !== 'All' && (
              <button
                onClick={() => setActiveCategory('All')}
                className="mt-4 text-gold text-sm font-bold hover:underline"
              >
                View all events
              </button>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
              {filteredEvents.map((evt, i) => (
                <ScrollReveal key={evt.id} direction="up" delay={i * 90}>
                  <Link to={`/events/${evt.id}`} className="group block h-full">
                    <div className="glass-card bg-white/75 border border-white/55 shadow-sm rounded-[16px] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                      <EventCardImage evt={evt} />

                      <div className="p-6 flex-1 flex flex-col">
                        <h4 className="text-xl font-bold text-charcoal group-hover:text-gold transition-colors line-clamp-2">
                          {evt.title}
                        </h4>

                        <div className="mt-4 space-y-2 flex-1">
                          <div className="flex items-center text-sm text-neutral">
                            <div className="w-9 h-9 bg-gold/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-gold transition-colors">
                              <Clock size={16} className="text-gold group-hover:text-white" />
                            </div>
                            <span className="group-hover:text-charcoal transition-colors">
                              {formatEventTime(evt.date, evt.time)}
                            </span>
                          </div>

                          {evt.location && (
                            <div className="flex items-center text-sm text-neutral">
                              <div className="w-9 h-9 bg-gold/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-gold transition-colors">
                                <MapPin size={16} className="text-gold group-hover:text-white" />
                              </div>
                              <span className="group-hover:text-charcoal transition-colors line-clamp-1">
                                {evt.location}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-5">
                          <GlowingButton
                            variant="outline"
                            size="sm"
                            fullWidth
                            className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-gold/60 active:scale-95 hover:-translate-y-1 !normal-case !tracking-normal"
                          >
                            See More
                            <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                          </GlowingButton>
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}
        </div>
      </section>
    </div>
  );
};