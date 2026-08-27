import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { displayName, formatDisplayTitle } from '../../lib/constants';
import { OverviewStatCard } from '../../components/UI/OverviewStatCard';
import { Calendar, MessageSquare, BookOpen, Youtube } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getVerseOfTheDay } from '../../lib/getVerseOfTheDay';

export const DashboardHome = () => {
  const { user } = useAuth();
  const [prayerRequests24h, setPrayerRequests24h] = useState(0);
  const [nextService, setNextService] = useState<string | null>(null);
  const [lastNewsletterDate, setLastNewsletterDate] = useState<string | null>(null);
  const [lastDevotionalLabel, setLastDevotionalLabel] = useState<string | null>(null);
  const [lastDevotionalSubtitle, setLastDevotionalSubtitle] = useState<string | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const verseOfTheDay = useMemo(() => getVerseOfTheDay(), []);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const today = new Date();
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      // Parallelize all queries for faster loading
      const [prayerResult, newsletterResult, devotionalResult] = await Promise.allSettled([
        // Prayer requests query
        supabase
          .from('prayer_requests')
          .select('id')
          .eq('is_confidential', false)
          .gte('created_at', twentyFourHoursAgo.toISOString()),
        
        // Newsletter query
        supabase
          .from('newsletters')
          .select('created_at, month, year, title')
          .order('created_at', { ascending: false })
          .limit(1),

        supabase
          .from('devotionals')
          .select('title, subtitle, week_date')
          .order('week_date', { ascending: false })
          .limit(1),
      ]);

      // Process prayer requests
      if (prayerResult.status === 'fulfilled' && !prayerResult.value.error) {
        setPrayerRequests24h(prayerResult.value.data?.length || 0);
      } else {
        setPrayerRequests24h(0);
      }

      // Calculate next Sunday service (Sunday at 10AM)
      const currentDay = today.getDay();
      let daysUntilSunday;
      if (currentDay === 0) {
        const currentHour = today.getHours();
        daysUntilSunday = currentHour < 10 ? 0 : 7;
      } else {
        daysUntilSunday = 7 - currentDay;
      }
      
      const nextSunday = new Date(today);
      nextSunday.setDate(today.getDate() + daysUntilSunday);
      nextSunday.setHours(10, 0, 0, 0);

      // Always use calculated next Sunday - format as "dd month"
      const month = nextSunday.toLocaleDateString('en-US', { month: 'long' });
      const day = nextSunday.getDate();
      setNextService(`${day} ${month}`);

      // Process newsletter
      if (newsletterResult.status === 'fulfilled' && !newsletterResult.value.error && newsletterResult.value.data && newsletterResult.value.data.length > 0) {
        const newsletter = newsletterResult.value.data[0];
        if (newsletter.title) {
          setLastNewsletterDate(formatDisplayTitle(newsletter.title));
        } else if (newsletter.month && newsletter.year) {
          setLastNewsletterDate(`${newsletter.month} ${newsletter.year}`);
        } else {
          const lastNewsletter = new Date(newsletter.created_at);
          setLastNewsletterDate(lastNewsletter.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
        }
      }

      if (
        devotionalResult.status === 'fulfilled' &&
        !devotionalResult.value.error &&
        devotionalResult.value.data &&
        devotionalResult.value.data.length > 0
      ) {
        const d = devotionalResult.value.data[0];
        setLastDevotionalLabel(d.title ? formatDisplayTitle(d.title) : null);
        setLastDevotionalSubtitle(d.subtitle ? formatDisplayTitle(d.subtitle) : null);
      } else {
        setLastDevotionalLabel(null);
        setLastDevotionalSubtitle(null);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-gray-200 pb-6">
             <div>
                <h1 className="text-xl md:text-2xl font-serif font-normal text-charcoal">Welcome, {displayName(user)}</h1>
                <p className="text-neutral mt-1 text-sm">Here is what is happening in your community.</p>
             </div>
             <div className="hidden md:flex items-center gap-2">
                 <span className="text-xs font-bold text-charcoal bg-gold px-4 py-2 rounded-full border border-gold uppercase tracking-widest shadow-sm">
                   {user?.is_super_admin ? 'Super Admin' : user?.role === 'admin' ? 'Admin Access' : 'Member Access'}
                 </span>
             </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <Link to="/dashboard/events" className="block">
              <OverviewStatCard
                icon={<Calendar size={18} />}
                iconClassName="bg-green-50 text-green-600"
                label="Next Service"
                value={isLoadingStats ? '...' : (nextService || 'Sunday')}
                description={isLoadingStats ? 'Loading...' : 'Every Sunday at 10:00 AM'}
                footerLabel="View Events →"
              />
            </Link>

            <Link to="/dashboard/prayer" className="block">
              <OverviewStatCard
                icon={<MessageSquare size={18} />}
                iconClassName="bg-blue-50 text-blue-600"
                label="Prayer Wall"
                value={isLoadingStats ? '...' : prayerRequests24h}
                description={
                  isLoadingStats
                    ? 'Loading...'
                    : `${prayerRequests24h === 1 ? 'new request' : 'new requests'} in the last 24 hours`
                }
                footerLabel="View Requests →"
              />
            </Link>

            <Link to="/dashboard/newsletter" className="block">
              <OverviewStatCard
                icon={<BookOpen size={18} />}
                iconClassName="bg-orange-50 text-orange-600"
                label="Newsletter"
                value={isLoadingStats ? '...' : (lastNewsletterDate || 'None')}
                description={
                  isLoadingStats ? 'Loading...' : lastNewsletterDate ? 'Latest edition' : 'No newsletters yet'
                }
                footerLabel="Read Now →"
              />
            </Link>

            <Link to="/dashboard/devotional" className="block">
              <OverviewStatCard
                icon={<BookOpen size={18} />}
                iconClassName="bg-purple-50 text-purple-600"
                label="Devotional of the Week"
                value={isLoadingStats ? '...' : (lastDevotionalLabel || 'None')}
                valueClassName="line-clamp-2"
                description={
                  isLoadingStats
                    ? 'Loading...'
                    : lastDevotionalSubtitle
                      ? lastDevotionalSubtitle
                      : lastDevotionalLabel
                        ? 'Latest devotional'
                        : 'No devotionals yet'
                }
                footerLabel="Read Now →"
              />
            </Link>

            <Link to="/dashboard/sermons" className="block">
              <OverviewStatCard
                icon={<Youtube size={18} />}
                iconClassName="bg-red-50 text-red-600"
                label="Watch Sermons"
                value="YouTube"
                description="Catch up on our latest messages"
                footerLabel="Watch Now →"
              />
            </Link>
        </div>

        <div className="glass-card bg-white/60 p-5 md:p-8 rounded-[8px] relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="font-serif text-lg md:text-xl mb-3 text-charcoal font-normal">Verse of the Day</h3>
                <p className="text-base md:text-lg text-charcoal/80 italic font-serif leading-relaxed max-w-3xl">
                    &ldquo;{verseOfTheDay.text}&rdquo;
                </p>
                <p className="mt-4 text-charcoal font-semibold tracking-wider uppercase text-xs">{verseOfTheDay.reference}</p>
             </div>
        </div>
    </div>
  );
};