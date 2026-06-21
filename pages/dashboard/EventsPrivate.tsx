import React, { useState, useEffect } from 'react';
import { Calendar as CalIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types';
import { SkeletonPageHeader } from '../../components/UI/Skeleton';
import { EventCard } from '../../components/UI/EventCard';
import { useAuth } from '../../context/AuthContext';

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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[24px] overflow-hidden bg-white border border-gray-100 animate-pulse">
              <div className="aspect-[16/9] bg-gray-100" />
              <div className="bg-[#f2f2eb] p-6 space-y-3">
                <div className="h-6 w-3/4 bg-gray-100 rounded" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
                <div className="h-4 w-2/3 bg-gray-100 rounded" />
                <div className="h-10 w-full bg-gray-100 rounded-full mt-4" />
              </div>
            </div>
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard key={evt.id} evt={evt} showVisibilityBadges />
          ))}
        </div>
      )}
    </div>
  );
};
