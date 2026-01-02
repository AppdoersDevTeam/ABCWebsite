import React, { useState, useEffect } from 'react';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { Calendar as CalIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types';
import { SkeletonPageHeader, SkeletonEventCard } from '../../components/UI/Skeleton';

export const EventsPrivate = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        <div className="text-center py-12">
          <p className="text-neutral">No events scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((evt) => {
            const formattedDate = formatDate(evt.date);
            const dateParts = formattedDate.split(' ');
            return (
              <div
                key={evt.id}
                className="flex items-center p-6 bg-white border border-gray-100 shadow-sm rounded-[8px] hover:border-gold hover:shadow-md transition-all group"
              >
                <div className="flex-shrink-0 w-20 text-center border-r border-gray-100 pr-6 mr-6">
                  <span className="block text-xs text-gold uppercase font-bold tracking-widest">{dateParts[0]}</span>
                  <span className="block text-3xl font-serif text-charcoal font-normal">{dateParts[1]}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-charcoal group-hover:text-gold transition-colors">
                    {evt.title}
                  </h3>
                  <p className="text-neutral text-sm mt-1 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-gold mr-2"></span> {evt.time} • {evt.location}
                  </p>
                  {evt.description && (
                    <p className="text-neutral text-sm mt-2">{evt.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};