import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { Event } from '../../types';
import { ScrollReveal } from '../../components/UI/ScrollReveal';

const DEFAULT_EVENT_BANNER = '/ABC Logo.png';

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

  const bannerUrl = useMemo(() => {
    return event?.image_url?.trim() ? String(event.image_url) : DEFAULT_EVENT_BANNER;
  }, [event?.image_url]);

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
      <div className="space-y-6">
        <div className="h-10 w-40 bg-gray-100 rounded animate-pulse" />
        <div className="h-64 w-full bg-gray-100 rounded-[12px] animate-pulse" />
        <div className="h-8 w-2/3 bg-gray-100 rounded animate-pulse" />
        <div className="h-24 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/events" className="inline-flex items-center text-sm font-bold text-gold hover:text-charcoal transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Events
        </Link>
        <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-8">
          <p className="text-charcoal font-bold">Couldn’t load this event.</p>
          <p className="text-neutral text-sm mt-2">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
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
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-10 w-40 bg-gray-100 rounded animate-pulse" />
          <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-8">
            <p className="text-neutral">Loading…</p>
          </div>
        </div>
      );
    }

    if (!canViewPrivate) {
      return (
        <div className="max-w-3xl mx-auto space-y-6">
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
        <div className="max-w-3xl mx-auto space-y-6">
          <Link to="/events" className="inline-flex items-center text-sm font-bold text-gold hover:text-charcoal transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Events
          </Link>
          <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-8">
            <p className="text-charcoal font-bold">This event is restricted.</p>
            <p className="text-neutral text-sm mt-2">You don’t have permission to view this event.</p>
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
        // Unique index violation typically surfaces as a database error; message varies by environment.
        const msg = String((error as any).message || '');
        if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
          setRsvpStatus('duplicate');
          return;
        }
        throw error;
      }

      setRsvpStatus('success');
    } catch (e: unknown) {
      console.error('Error submitting RSVP:', e);
      setRsvpStatus('error');
      setRsvpError(
        (e instanceof Error ? e.message : 'Failed to RSVP') +
          '\n\nIf the database table is missing, run CREATE_EVENT_RSVPS_TABLE.sql in Supabase.'
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link to="/events" className="inline-flex items-center text-sm font-bold text-gold hover:text-charcoal transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Back to Events
      </Link>

      <ScrollReveal direction="up" delay={0}>
        <div className="rounded-[14px] overflow-hidden border border-white/60 shadow-sm bg-white/80">
          <div className="relative h-56 sm:h-72 md:h-80 bg-gray-100">
            <img src={bannerUrl} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10" />
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 text-gold font-bold text-xs uppercase tracking-widest">
              <Calendar size={16} />
              <span>{event.category || 'Event'}</span>
              {!event.is_public && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-[10px]">
                  Internal
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl md:text-4xl font-serif font-normal text-charcoal">{event.title}</h1>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 bg-white/70 border border-gray-100 rounded-[10px] p-4">
                <Calendar size={18} className="text-gold" />
                <div>
                  <p className="text-xs text-neutral font-bold uppercase tracking-widest">Date</p>
                  <p className="text-sm text-charcoal font-bold">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/70 border border-gray-100 rounded-[10px] p-4">
                <Clock size={18} className="text-gold" />
                <div>
                  <p className="text-xs text-neutral font-bold uppercase tracking-widest">Time</p>
                  <p className="text-sm text-charcoal font-bold">{event.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/70 border border-gray-100 rounded-[10px] p-4">
                <MapPin size={18} className="text-gold" />
                <div>
                  <p className="text-xs text-neutral font-bold uppercase tracking-widest">Location</p>
                  <p className="text-sm text-charcoal font-bold">{event.location}</p>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="mt-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-neutral">Description</h2>
                <p className="mt-2 text-neutral leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            )}

            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-charcoal">RSVP</p>
                  <p className="text-xs text-neutral">
                    {rsvpMode === 'required' ? 'RSVP is required.' : 'RSVP is optional.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsRsvpOpen((v) => !v);
                    setRsvpStatus('idle');
                    setRsvpError(null);
                  }}
                  className="bg-gold text-white px-6 py-3 rounded-[8px] font-bold hover:bg-[#A8B774] transition-colors"
                >
                  RSVP
                </button>
              </div>

              {isRsvpOpen && (
                <div className="mt-5 rounded-[12px] border border-gray-100 bg-white/70 p-5 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-neutral mb-2">Name</label>
                      <input
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        className="w-full p-3 rounded-[8px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-neutral mb-2">Email</label>
                      <input
                        value={rsvpEmail}
                        onChange={(e) => setRsvpEmail(e.target.value)}
                        className="w-full p-3 rounded-[8px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
                        placeholder="you@example.com"
                        inputMode="email"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {rsvpStatus === 'success' && (
                    <p className="text-sm font-bold text-green-700">Thanks — you’re RSVPed.</p>
                  )}
                  {rsvpStatus === 'duplicate' && (
                    <p className="text-sm font-bold text-gold">You’ve already RSVPed with this email.</p>
                  )}
                  {rsvpStatus === 'error' && (
                    <p className="text-sm font-bold text-red-600 whitespace-pre-line">{rsvpError || 'Failed to RSVP.'}</p>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRsvpOpen(false)}
                      className="px-5 py-2 rounded-[8px] border border-gray-200 text-charcoal font-bold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitRsvp}
                      disabled={rsvpStatus === 'submitting'}
                      className="px-5 py-2 rounded-[8px] bg-charcoal text-white font-bold hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-60"
                    >
                      {rsvpStatus === 'submitting' ? 'Submitting…' : 'Submit RSVP'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

