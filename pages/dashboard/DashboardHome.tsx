import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { displayName, formatDisplayTitle, WHATS_ON_LABEL } from '../../lib/constants';
import { formatWeekDate, formatDdMmYyyy, resolveNewsletterWeekDate } from '../../lib/dateUtils';
import { fetchLatestNewsletter } from '../../lib/newsletters';
import { OverviewStatCard } from '../../components/UI/OverviewStatCard';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { Calendar, CalendarDays, BookOpen, Youtube, Newspaper, HandHeart, Home } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getVerseOfTheDay } from '../../lib/getVerseOfTheDay';

export const DashboardHome = () => {
  const { user } = useAuth();
  const [prayerRequests24h, setPrayerRequests24h] = useState(0);
  const [nextService, setNextService] = useState<string | null>(null);
  const [lastNewsletterTitle, setLastNewsletterTitle] = useState<string | null>(null);
  const [lastNewsletterWeek, setLastNewsletterWeek] = useState<string | null>(null);
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
      const [prayerResult, newsletter, devotionalResult] = await Promise.allSettled([
        // Prayer requests query
        supabase
          .from('prayer_requests')
          .select('id')
          .eq('is_confidential', false)
          .gte('created_at', twentyFourHoursAgo.toISOString()),
        
        fetchLatestNewsletter(),

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
      setNextService(formatDdMmYyyy(nextSunday));

      // Process newsletter
      if (newsletter.status === 'fulfilled' && newsletter.value) {
        const latest = newsletter.value;
        if (latest.title) {
          setLastNewsletterTitle(formatDisplayTitle(latest.title));
        } else if (latest.month && latest.year) {
          setLastNewsletterTitle(`${latest.month} ${latest.year}`);
        } else {
          const lastNewsletter = new Date(latest.created_at);
          setLastNewsletterTitle(formatDdMmYyyy(lastNewsletter));
        }
        const weekDate = resolveNewsletterWeekDate(latest);
        setLastNewsletterWeek(weekDate ? formatWeekDate(weekDate) : null);
      } else {
        setLastNewsletterTitle(null);
        setLastNewsletterWeek(null);
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
        <AdminPageHeader
          title={`Welcome, ${displayName(user)}`}
          subtitle="Here is what is happening in your community."
          icon={<Home size={28} />}
          rightSlot={
            <span className="hidden md:inline-flex text-xs font-bold text-charcoal bg-gold px-4 py-2 rounded-full border border-gold uppercase tracking-widest shadow-sm">
              {user?.is_super_admin ? 'Super Admin' : user?.role === 'admin' ? 'Admin Access' : 'Member Access'}
            </span>
          }
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            <Link to="/dashboard/calendar" className="block h-full">
              <OverviewStatCard
                icon={<CalendarDays size={20} />}
                iconClassName="bg-emerald-50 text-emerald-600"
                label="Annual Calendar"
                value={new Date().getFullYear()}
                description="Year, month, or week — what's on, sermons, devotionals, and newsletters"
                footerLabel="Open Calendar →"
              />
            </Link>

            <Link to="/dashboard/events" className="block h-full">
              <OverviewStatCard
                icon={<Calendar size={20} />}
                iconClassName="bg-green-50 text-green-600"
                label="Next Service"
                value={isLoadingStats ? '...' : (nextService || 'Sunday')}
                description={isLoadingStats ? 'Loading...' : 'Every Sunday at 10:00 AM'}
                footerLabel={`View ${WHATS_ON_LABEL} →`}
              />
            </Link>

            <Link to="/dashboard/prayer" className="block h-full">
              <OverviewStatCard
                icon={<HandHeart size={20} />}
                iconClassName="bg-blue-50 text-blue-600"
                label="Prayers"
                value={isLoadingStats ? '...' : prayerRequests24h}
                description={
                  isLoadingStats
                    ? 'Loading...'
                    : `${prayerRequests24h === 1 ? 'new request' : 'new requests'} in the last 24 hours`
                }
                footerLabel="View Requests →"
              />
            </Link>

            <Link to="/dashboard/newsletter" className="block h-full">
              <OverviewStatCard
                icon={<Newspaper size={20} />}
                iconClassName="bg-orange-50 text-orange-600"
                label="Newsletter"
                value={isLoadingStats ? '...' : (lastNewsletterTitle || 'None')}
                valueSize="title"
                valueClassName="line-clamp-2"
                description={
                  isLoadingStats
                    ? 'Loading...'
                    : lastNewsletterWeek
                      ? `Week of ${lastNewsletterWeek}`
                      : lastNewsletterTitle
                        ? 'Latest edition'
                        : 'No newsletters yet'
                }
                footerLabel="Read Now →"
              />
            </Link>

            <Link to="/dashboard/devotional" className="block h-full">
              <OverviewStatCard
                icon={<BookOpen size={20} />}
                iconClassName="bg-purple-50 text-purple-600"
                label="Devotional of the Week"
                value={isLoadingStats ? '...' : (lastDevotionalLabel || 'None')}
                valueSize="title"
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

            <Link to="/dashboard/sermons" className="block h-full">
              <OverviewStatCard
                icon={<Youtube size={20} />}
                iconClassName="bg-red-50 text-red-600"
                label="Watch Sermons"
                value="YouTube"
                description="Catch up on our latest messages"
                footerLabel="Watch Now →"
              />
            </Link>
        </div>

        <div className="glass-card bg-white/60 p-6 md:p-9 rounded-[8px] relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="font-serif text-xl md:text-2xl mb-4 text-charcoal font-normal">Verse of the Day</h3>
                <p className="text-base md:text-lg text-charcoal/80 italic font-serif leading-relaxed max-w-3xl">
                    &ldquo;{verseOfTheDay.text}&rdquo;
                </p>
                <p className="mt-4 text-charcoal font-semibold tracking-wider uppercase text-xs">{verseOfTheDay.reference}</p>
             </div>
        </div>
    </div>
  );
};