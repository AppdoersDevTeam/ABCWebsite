import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowLeft, Users, FileText, Tag, CheckCircle, ArrowDownToLine } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { Event } from '../../types';
import { ScrollReveal } from '../../components/UI/ScrollReveal';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { EventPosterImage } from '../../components/UI/EventPosterImage';
import {
  formatEventDateRange,
  formatEventDateRangeShort,
  formatEventTimeRange,
} from '../../lib/eventDateUtils';
import { usePageMeta } from '../../lib/usePageMeta';
import { logAuditEventSafe } from '../../lib/auditLog';

export const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'submitting' | 'success' | 'duplicate' | 'error'>('idle');
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setIsLoading(true);
      setLoadError(null);

      try {
        const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
        if (error) throw error;
        setEvent((data as Event) || null);
      } catch (e: unknown) {
        console.error('Error fetching event:', e);
        setLoadError(e instanceof Error ? e.message : 'Failed to load event');
        setEvent(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const eventImageUrl = useMemo(() => {
    return event?.image_url?.trim() ? String(event.image_url) : '';
  }, [event?.image_url]);
  const hasEventImage = !!eventImageUrl;

  usePageMeta(
    event
      ? {
          title: event.title,
          description: event.description?.trim()
            ? event.description.slice(0, 160)
            : `${event.title} — an event at Ashburton Baptist Church.`,
        }
      : { title: 'Event', description: 'Event details at Ashburton Baptist Church.' }
  );

  const needsAuthForPrivate = !!event && event.is_public === false;
  const isApproved = !!user && !!user.is_approved;
  const isAdmin = user?.role === 'admin';
  const audience = (event?.audience || (event?.is_public ? 'all' : 'members')) as
    | 'all'
    | 'staff'
    | 'members'
    | 'attendees';
  const canViewPrivate = !needsAuthForPrivate || isApproved;
  const audienceOkForPrivate = !needsAuthForPrivate
    ? true
    : audience === 'all'
      ? true
      : audience === 'members'
        ? true
        : audience === 'staff'
          ? isAdmin
          : false;
  const rsvpMode = (event?.rsvp_mode || 'optional') as 'optional' | 'required';

  if (isLoading) {
    return (
      <div className="space-y-0 overflow-hidden">
        <div className="w-full min-h-screen bg-gray-100 animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
          <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
          <div className="grid md:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-[16px] animate-pulse" />
            ))}
          </div>
          <div className="h-40 bg-gray-100 rounded-[16px] animate-pulse" />
          <div className="h-28 bg-gray-100 rounded-[16px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 space-y-6">
        <Link to="/events" className="inline-flex items-center text-sm font-bold text-gold hover:text-charcoal transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Events
        </Link>
        <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-8">
          <p className="text-charcoal font-bold">Couldn't load this event.</p>
          <p className="text-neutral text-sm mt-2">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 space-y-6">
        <Link to="/events" className="inline-flex items-center text-sm font-bold text-gold hover:text-charcoal transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Events
        </Link>
        <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-8">
          <p className="text-charcoal font-bold">Event not found.</p>
          <p className="text-neutral text-sm mt-2">It may have been removed.</p>
        </div>
      </div>
    );
  }

  if (needsAuthForPrivate) {
    if (authLoading) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-20 space-y-6">
          <div className="h-10 w-40 bg-gray-100 rounded animate-pulse" />
          <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-8">
            <p className="text-neutral">Loading…</p>
          </div>
        </div>
      );
    }

    if (!canViewPrivate) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-20 space-y-6">
          <Link to="/events" className="inline-flex items-center text-sm font-bold text-gold hover:text-charcoal transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Events
          </Link>
          <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-8">
            <p className="text-charcoal font-bold">This event is for approved members only.</p>
            <p className="text-neutral text-sm mt-2">Please log in to view this event.</p>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center bg-gold text-white px-6 py-3 rounded-[8px] font-bold hover:bg-[#A8B774] transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (!audienceOkForPrivate) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-20 space-y-6">
          <Link to="/events" className="inline-flex items-center text-sm font-bold text-gold hover:text-charcoal transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Events
          </Link>
          <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-8">
            <p className="text-charcoal font-bold">This event is restricted.</p>
            <p className="text-neutral text-sm mt-2">You don't have permission to view this event.</p>
          </div>
        </div>
      );
    }
  }

  const handleSubmitRsvp = async () => {
    if (!event) return;
    setRsvpError(null);
    setRsvpStatus('submitting');

    const name = rsvpName.trim();
    const email = rsvpEmail.trim().toLowerCase();
    if (!name || !email) {
      setRsvpStatus('error');
      setRsvpError('Please enter your name and email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setRsvpStatus('error');
      setRsvpError('Please enter a valid email address.');
      return;
    }

    try {
      const { error } = await supabase.from('event_rsvps').insert([
        {
          event_id: event.id,
          name,
          email,
        },
      ]);

      if (error) {
        const msg = String((error as any).message || '');
        if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
          setRsvpStatus('duplicate');
          return;
        }
        throw error;
      }

      setRsvpStatus('success');
      logAuditEventSafe({
        action: 'create',
        category: 'rsvp',
        entityType: 'event_rsvps',
        entityId: event.id,
        summary: `${name} RSVP'd for "${event.title}"`,
        details: { email, event_id: event.id },
        actorRoleOverride: user ? undefined : 'anonymous',
      });
    } catch (e: unknown) {
      console.error('Error submitting RSVP:', e);
      setRsvpStatus('error');
      setRsvpError(
        (e instanceof Error ? e.message : 'Failed to RSVP') +
          '\n\nIf the database table is missing, run CREATE_EVENT_RSVPS_TABLE.sql in Supabase.'
      );
    }
  };

  const eventDateFormatted = formatEventDateRange(event);
  const eventTimeFormatted = formatEventTimeRange(event);

  return (
    <div className="space-y-0 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {event.category && (
                <span className="inline-flex items-center bg-gold/90 text-white rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest shadow-sm">
                  {event.category}
                </span>
              )}
              {!event.is_public && (
                <span className="inline-flex items-center bg-white/20 backdrop-blur text-white rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border border-white/30">
                  Internal
                </span>
              )}
              <span className="inline-flex items-center bg-white/20 backdrop-blur text-white rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border border-white/30">
                RSVP {rsvpMode}
              </span>
            </div>
            <ScrollReveal direction="up" delay={150}>
              <h1
                className="text-white text-center max-w-5xl mx-auto mb-4 transition-all duration-1000 delay-250"
                style={{ fontFamily: 'Kaushan Script', fontSize: 'clamp(2rem, 5vw, 4.25rem)', lineHeight: '1.2' }}
              >
                {event.title}
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-base sm:text-lg md:text-[1.375rem] lg:text-[1.5625rem] leading-relaxed text-white text-center max-w-5xl mx-auto mb-6 transition-all duration-1000 delay-300 px-2 sm:px-0">
                <span className="block font-raleway font-normal text-center">{eventDateFormatted}</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">{eventTimeFormatted}</span>
                <span className="block mt-3 sm:mt-4 font-raleway font-normal text-center">{event.location}</span>
              </p>
            </ScrollReveal>
          </div>
        </div>

        {/* Pulsing Down Arrow */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pulse-arrow animate-ping-pong">
          <ArrowDownToLine size={32} className="text-gold" />
        </div>
      </section>

      {/* Content */}
      <section className="section-plain py-10 md:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <Link
              to="/events"
              className="inline-flex items-center text-sm font-bold text-gold hover:text-charcoal transition-colors group"
            >
              <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Events
            </Link>

            {hasEventImage && (
              <ScrollReveal direction="up" delay={0}>
                <div className="glass-card rounded-[16px] border border-white/50 shadow-sm bg-white/70 p-3 md:p-5">
                  <EventPosterImage src={eventImageUrl} alt={event.title} />
                </div>
              </ScrollReveal>
            )}

            {/* Event Details Grid */}
            <div className="grid md:grid-cols-3 gap-5">
              <ScrollReveal direction="up" delay={0}>
                <div className="glass-card rounded-[16px] p-6 border border-white/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group bg-white/70 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-md shadow-gold/20">
                      <Calendar size={20} />
                    </div>
                    <h3 className="font-serif text-xl font-normal text-charcoal group-hover:text-gold transition-colors">Date</h3>
                  </div>
                  <p className="text-neutral text-sm leading-relaxed">
                    {formatEventDateRangeShort(event)}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={60}>
                <div className="glass-card rounded-[16px] p-6 border border-white/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group bg-white/70 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-md shadow-gold/20">
                      <Clock size={20} />
                    </div>
                    <h3 className="font-serif text-xl font-normal text-charcoal group-hover:text-gold transition-colors">Time</h3>
                  </div>
                  <p className="text-neutral text-sm">{eventTimeFormatted}</p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={120}>
                <div className="glass-card rounded-[16px] p-6 border border-white/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group bg-white/70 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-md shadow-gold/20">
                      <MapPin size={20} />
                    </div>
                    <h3 className="font-serif text-xl font-normal text-charcoal group-hover:text-gold transition-colors">Location</h3>
                  </div>
                  <p className="text-neutral text-sm break-words">{event.location}</p>
                </div>
              </ScrollReveal>
            </div>

            {/* Description */}
            <ScrollReveal direction="up" delay={80}>
              <div className="glass-card rounded-[16px] p-8 md:p-10 border border-white/50 shadow-sm bg-white/70">
                <h2 className="text-2xl md:text-3xl font-serif font-normal text-charcoal mb-5">About This Event</h2>
                <p className="text-neutral text-base md:text-lg leading-relaxed break-words whitespace-pre-line">
                  {event.description?.trim() ? event.description : 'No description has been added for this event yet.'}
                </p>
              </div>
            </ScrollReveal>

            {/* RSVP Section */}
            <ScrollReveal direction="up" delay={120}>
              <div className="glass-card rounded-[16px] p-6 md:p-8 border border-white/50 shadow-sm bg-white/70">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#fbcb05] rounded-full text-white flex-shrink-0 shadow-md shadow-gold/20">
                      <Tag size={20} />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-normal text-charcoal">RSVP</h3>
                      <p className="text-neutral text-sm mt-0.5">{rsvpMode === 'required' ? 'RSVP is required for this event.' : 'RSVP is optional.'}</p>
                    </div>
                  </div>

                  <div className="w-full md:w-auto">
                    <GlowingButton
                      variant="outline"
                      size="md"
                      fullWidth
                      className="!rounded-full !bg-gold !text-white !border-gold transition-all duration-500 ease-out hover:scale-105 hover:shadow-xl hover:shadow-gold/40 active:scale-95 !normal-case !tracking-normal"
                      onClick={() => {
                        setIsRsvpOpen((v) => !v);
                        setRsvpStatus('idle');
                        setRsvpError(null);
                      }}
                    >
                      {isRsvpOpen ? 'Close' : 'RSVP Now'}
                    </GlowingButton>
                  </div>
                </div>

                {isRsvpOpen && (
                  <div className="mt-6 rounded-[14px] border border-gray-200 bg-white p-6 space-y-4">
                    {rsvpStatus === 'success' ? (
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="text-green-600" size={32} />
                        </div>
                        <p className="text-lg font-bold text-charcoal">You're RSVPed!</p>
                        <p className="text-neutral text-sm mt-1">We look forward to seeing you there.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-charcoal mb-2">Name</label>
                            <input
                              value={rsvpName}
                              onChange={(e) => setRsvpName(e.target.value)}
                              className="w-full p-3 rounded-[8px] border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none bg-white transition-all"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-charcoal mb-2">Email</label>
                            <input
                              value={rsvpEmail}
                              onChange={(e) => setRsvpEmail(e.target.value)}
                              className="w-full p-3 rounded-[8px] border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none bg-white transition-all"
                              placeholder="you@example.com"
                              inputMode="email"
                              autoComplete="email"
                            />
                          </div>
                        </div>

                        {rsvpStatus === 'duplicate' && (
                          <div className="flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-[8px] px-4 py-3">
                            <CheckCircle size={16} className="text-gold flex-shrink-0" />
                            <p className="text-sm font-bold text-charcoal">You've already RSVPed with this email.</p>
                          </div>
                        )}
                        {rsvpStatus === 'error' && (
                          <div className="bg-red-50 border border-red-200 rounded-[8px] px-4 py-3">
                            <p className="text-sm font-bold text-red-600 whitespace-pre-line">{rsvpError || 'Failed to RSVP.'}</p>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                          <GlowingButton
                            variant="ghost"
                            size="sm"
                            className="!rounded-full !normal-case !tracking-normal"
                            onClick={() => setIsRsvpOpen(false)}
                            type="button"
                          >
                            Cancel
                          </GlowingButton>
                          <GlowingButton
                            variant="dark"
                            size="sm"
                            className="!rounded-full !normal-case !tracking-normal"
                            onClick={handleSubmitRsvp}
                            disabled={rsvpStatus === 'submitting'}
                            type="button"
                          >
                            {rsvpStatus === 'submitting' ? 'Submitting…' : 'Submit RSVP'}
                          </GlowingButton>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
};
