import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import type { Event } from '../../types';
import { EventImage } from './EventImage';
import { GlowingButton } from './GlowingButton';
import {
  formatEventDateBadge,
  formatEventScheduleShort,
  getEventStartDate,
} from '../../lib/eventDateUtils';

const DEFAULT_THUMB = '/ABC Logo.png';

interface EventCardImageProps {
  evt: Event;
}

export const EventCardImage: React.FC<EventCardImageProps> = ({ evt }) => {
  const hasImage = !!evt.image_url?.trim();
  const { day, month } = formatEventDateBadge(getEventStartDate(evt));

  return (
    <div className="relative aspect-[16/9] overflow-hidden">
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

interface EventCardProps {
  evt: Event;
  showVisibilityBadges?: boolean;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  evt,
  showVisibilityBadges = false,
  className = '',
}) => {
  const audienceLabel =
    (evt.audience || 'members').charAt(0).toUpperCase() + (evt.audience || 'members').slice(1);

  return (
    <Link to={`/events/${evt.id}`} className={`group block h-full ${className}`}>
      <div className="glass-card bg-white/75 border border-white/55 shadow-sm rounded-[16px] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        <EventCardImage evt={evt} />

        <div className="p-6 flex-1 flex flex-col">
          <h4 className="text-xl font-bold text-charcoal group-hover:text-gold transition-colors line-clamp-2">
            {evt.title}
          </h4>

          {showVisibilityBadges && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {evt.is_public ? (
                <span className="inline-block text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full uppercase tracking-wider font-bold border border-green-200">
                  Public
                </span>
              ) : (
                <span className="inline-block text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-full uppercase tracking-wider font-bold border border-gray-200">
                  {audienceLabel}
                </span>
              )}
            </div>
          )}

          <div className="mt-4 space-y-2 flex-1">
            <div className="flex items-center text-sm text-neutral">
              <div className="w-9 h-9 bg-gold/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-gold transition-colors">
                <Clock size={16} className="text-gold group-hover:text-white" />
              </div>
              <span className="group-hover:text-charcoal transition-colors">
                {formatEventScheduleShort(evt)}
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
  );
};
