import React, { useState, useEffect } from 'react';
import { Calendar as CalIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types';
import { SkeletonPageHeader } from '../../components/UI/Skeleton';
import { EventsCalendarGrid, EventsCalendarGridSkeleton } from '../../components/dashboard/EventsCalendarGrid';
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
        <EventsCalendarGridSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl md:text-4xl font-serif font-normal text-charcoal">Internal Calendar</h1>
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
        <EventsCalendarGrid events={events} showVisibilityBadges />
      )}
    </div>
  );
};
