import React from 'react';
import type { Event } from '../../types';
import { EventCard } from '../UI/EventCard';

interface EventsCalendarGridProps {
  events: Event[];
  showVisibilityBadges?: boolean;
  adminControlsForEvent?: (evt: Event) => React.ReactNode;
}

export const EventsCalendarGrid: React.FC<EventsCalendarGridProps> = ({
  events,
  showVisibilityBadges = false,
  adminControlsForEvent,
}) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
    {events.map((evt) => (
      <EventCard
        key={evt.id}
        evt={evt}
        showVisibilityBadges={showVisibilityBadges}
        adminControls={adminControlsForEvent?.(evt)}
      />
    ))}
  </div>
);

export const EventsCalendarGridSkeleton: React.FC = () => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="rounded-[24px] overflow-hidden bg-white border border-gray-100 animate-pulse">
        <div className="aspect-[16/9] bg-gray-100" />
        <div className="bg-[#f2f2eb] p-6 space-y-3">
          <div className="h-6 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          <div className="h-4 w-2/3 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded-full mt-4" />
        </div>
      </div>
    ))}
  </div>
);
