import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import type { Event } from '../../types';
import { EventImage } from './EventImage';
import {
  formatEventCardSchedule,
  formatEventDateBadge,
  getEventStartDate,
} from '../../lib/eventDateUtils';

const DEFAULT_THUMB = '/ABC Logo.png';

interface EventCardImageProps {
  evt: Event;
}

export const EventCardImage: React.FC<EventCardImageProps> = ({ evt }) => {
  const hasImage = !!evt.image_url?.trim();
  const { day, month } = formatEventDateBadge(getEventStartDate(evt));
  const dayNumber = parseInt(day, 10);

  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-white">
      {hasImage ? (
        <EventImage src={String(evt.image_url)} alt={evt.title} loading="lazy" />
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

      <div className="absolute top-4 left-4 bg-white rounded-2xl px-3 py-2 shadow-md text-center min-w-[3.25rem]">
        <span className="block text-charcoal font-black text-lg leading-none">{dayNumber}</span>
        <span className="block text-neutral font-bold text-[10px] tracking-widest mt-1">{month}</span>
      </div>

      {evt.category && (
        <div className="absolute bottom-4 left-4">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gold text-white text-[11px] font-bold uppercase tracking-widest shadow-sm">
            {evt.category}
          </span>
        </div>
      )}
    </div>
  );
};

interface EventCardProps {
  evt: Event;
  showVisibilityBadges?: boolean;
  adminControls?: React.ReactNode;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  evt,
  showVisibilityBadges = false,
  adminControls,
  className = '',
}) => {
  const audienceLabel =
    (evt.audience || 'members').charAt(0).toUpperCase() + (evt.audience || 'members').slice(1);

  const cardBody = (
    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
      <div className="relative">
        <EventCardImage evt={evt} />
        {adminControls && (
          <div className="absolute top-3 right-3 z-20 flex gap-1.5">{adminControls}</div>
        )}
      </div>

      <div className="bg-[#f2f2eb] p-6 flex-1 flex flex-col">
        <h4 className="text-xl font-bold text-charcoal group-hover:text-gold transition-colors line-clamp-2">
          {evt.title}
        </h4>

        {showVisibilityBadges && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {evt.is_public ? (
              <span className="inline-block text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full uppercase tracking-wider font-bold border border-green-200">
                Public
              </span>
            ) : (
              <span className="inline-block text-[10px] bg-white text-gray-600 px-2 py-1 rounded-full uppercase tracking-wider font-bold border border-gray-200">
                {audienceLabel}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 space-y-2.5 flex-1">
          <div className="flex items-center text-sm text-neutral">
            <div className="w-9 h-9 bg-gold/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <Clock size={16} className="text-gold" />
            </div>
            <span className="group-hover:text-charcoal transition-colors">{formatEventCardSchedule(evt)}</span>
          </div>

          {evt.location && (
            <div className="flex items-center text-sm text-neutral">
              <div className="w-9 h-9 bg-gold/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <MapPin size={16} className="text-gold" />
              </div>
              <span className="group-hover:text-charcoal transition-colors line-clamp-1">{evt.location}</span>
            </div>
          )}
        </div>

        <div className="mt-5">
          {adminControls ? (
            <Link
              to={`/events/${evt.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-[#e6bc00] hover:shadow-md"
            >
              See More
              <ArrowRight size={18} />
            </Link>
          ) : (
            <span className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 group-hover:bg-[#e6bc00] group-hover:shadow-md">
              See More
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (adminControls) {
    return (
      <div className={`group block h-full ${className}`}>
        {cardBody}
      </div>
    );
  }

  return (
    <Link to={`/events/${evt.id}`} className={`group block h-full ${className}`}>
      {cardBody}
    </Link>
  );
};
