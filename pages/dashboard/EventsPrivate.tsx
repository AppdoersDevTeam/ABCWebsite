import React, { useState, useEffect } from 'react';
import { Calendar as CalIcon, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types';
import { SkeletonPageHeader, SkeletonEventCard } from '../../components/UI/Skeleton';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_THUMB = '/ABC Logo.png';

export const EventsPrivate = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const fetchEvents = async () => {
    try {
      const isAdmin = user?.role === 'admin';
      let query = supabase.from('events').select('*').order('date', { ascending: true });

      if (!isAdmin) {
        query = query.or('is_public.eq.true,audience.in.(all,members),audience.is.null');
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonEventCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-serif font-normal text-charcoal">Internal Calendar</h1>
        <p className="text-neutral mt-1">Meetings & Rehearsals.</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalIcon className="text-gray-300" size={28} />
          </div>
          <p className="text-neutral font-bold">No events scheduled yet.</p>
          <p className="text-neutral text-sm mt-1">Check back soon for new events.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((evt) => {
            const { day, month } = formatDate(evt.date);
            const hasImage = !!evt.image_url?.trim();
            return (
              <Link
                key={evt.id}
                to={`/events/${evt.id}`}
                className="block"
              >
                <div className="bg-white border border-gray-100 shadow-sm rounded-[14px] overflow-hidden hover:border-gold hover:shadow-md transition-all group">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-52 flex-shrink-0 overflow-hidden">
                      <div className="aspect-[16/10] sm:aspect-auto sm:h-full">
                        {hasImage ? (
                          <img
                            src={String(evt.image_url)}
                            alt={evt.title}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#3a4a1f] via-[#4a5d2a] to-[#2d3a16] flex items-center justify-center min-h-[120px]">
                            <img
                              src={DEFAULT_THUMB}
                              alt="ABC"
                              className="h-10 w-auto opacity-80"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur border border-white/60 rounded-full px-3 py-1.5 shadow-sm">
                        <span className="text-xs font-bold text-neutral uppercase tracking-widest">{month}</span>
                        <span className="ml-2 text-sm font-black text-charcoal">{day}</span>
                      </div>
                    </div>

                    <div className="flex-1 p-5 sm:p-6 flex flex-col">
                      <h3 className="text-xl font-bold text-charcoal group-hover:text-gold transition-colors line-clamp-2">
                        {evt.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-neutral">
                        <span className="inline-flex items-center">
                          <Clock size={14} className="text-gold mr-1.5" />
                          {evt.time}
                        </span>
                        <span className="inline-flex items-center">
                          <MapPin size={14} className="text-gold mr-1.5" />
                          <span className="line-clamp-1">{evt.location}</span>
                        </span>
                      </div>
                      {evt.description && (
                        <p className="text-neutral text-sm mt-3 line-clamp-2">{evt.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {evt.category && (
                          <span className="inline-block text-[10px] bg-gold/10 text-gold px-2 py-1 rounded-full uppercase tracking-wider font-bold border border-gold/20">
                            {evt.category}
                          </span>
                        )}
                        {evt.is_public ? (
                          <span className="inline-block text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full uppercase tracking-wider font-bold border border-green-200">
                            Public
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-full uppercase tracking-wider font-bold border border-gray-200">
                            {(evt.audience || 'members').charAt(0).toUpperCase() + (evt.audience || 'members').slice(1)}
                          </span>
                        )}
                      </div>
                      <div className="mt-auto pt-4 inline-flex items-center text-sm font-bold text-gold group-hover:text-charcoal transition-colors">
                        See More
                        <ArrowRight size={14} className="ml-1.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};