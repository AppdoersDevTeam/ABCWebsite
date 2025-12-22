import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/UI/PageHeader';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { Calendar, Users, Music, ArrowRight, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types';
import { SkeletonCard } from '../../components/UI/Skeleton';

export const Events = () => {
  const [publicEvents, setPublicEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Static events for special pages
  const staticEvents = [
    { title: "Sunday Service", time: "Every Sunday, 10:00 AM", category: "Service", icon: <Music size={24}/>, desc: "Join us for worship and teaching.", link: "/events/sunday-service" },
    { title: "Young Adults", time: "Wednesdays, 7:00 PM", category: "Connect", icon: <Users size={24}/>, desc: "A space for 18-30s to connect.", link: "/events/young-adults" },
    { title: "Community Lunch", time: "First Sunday, 12:00 PM", category: "Community", icon: <Calendar size={24}/>, desc: "Free lunch for our neighbors.", link: "/events/community-lunch" },
    { title: "Kids Program", time: "Sundays, 10:30 AM", category: "Ministry", icon: <Users size={24}/>, desc: "Fun and faith for K-6.", link: "/events/kids-program" },
    { title: "Sermons", time: "Watch Anytime", category: "Media", icon: <Video size={24}/>, desc: "Catch up on the latest messages.", link: "/events/sermons" },
  ];

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
      default:
        return <Calendar size={24} />;
    }
  };

  const allEvents = [
    ...staticEvents,
    ...publicEvents.map(evt => ({
      title: evt.title,
      time: formatEventTime(evt.date, evt.time),
      category: evt.category,
      icon: getCategoryIcon(evt.category),
      desc: evt.description || '',
      link: undefined,
    })),
  ];

  return (
    <div className="pb-32">
      <PageHeader title="CALENDAR" subtitle="What's On" />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        {isLoading ? (
          <div className="grid gap-6 max-w-5xl mx-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 max-w-5xl mx-auto">
            {allEvents.map((evt, i) => {
              const eventId = evt.title.toLowerCase().replace(/\s+/g, '-');
              const content = (
                <div className="group relative bg-white border border-gray-100 shadow-sm p-8 md:p-10 rounded-[8px] flex flex-col md:flex-row items-start md:items-center hover:shadow-lg hover:border-gold/30 transition-all duration-300 animate-fade-in-up hover-lift" style={{ animationDelay: `${200 + i * 150}ms` }}>
                    
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

              if (evt.link) {
                return (
                  <Link key={i} to={evt.link}>
                    {content}
                  </Link>
                );
              }

              return (
                <div key={i} id={eventId} className="scroll-mt-24">
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};