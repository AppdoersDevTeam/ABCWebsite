import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { Calendar, MessageSquare, BookOpen, ArrowUpRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const DashboardHome = () => {
  const { user } = useAuth();
  const [prayerRequests24h, setPrayerRequests24h] = useState(0);
  const [nextService, setNextService] = useState<string | null>(null);
  const [lastNewsletterDate, setLastNewsletterDate] = useState<string | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

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
      const [prayerResult, newsletterResult] = await Promise.allSettled([
        // Prayer requests query
        supabase
          .from('prayer_requests')
          .select('id')
          .eq('is_confidential', false)
          .gte('created_at', twentyFourHoursAgo.toISOString()),
        
        // Newsletter query
        supabase
          .from('newsletters')
          .select('created_at, month, year')
          .order('created_at', { ascending: false })
          .limit(1)
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
        if (newsletter.month && newsletter.year) {
          setLastNewsletterDate(`${newsletter.month} ${newsletter.year}`);
        } else {
          const lastNewsletter = new Date(newsletter.created_at);
          setLastNewsletterDate(lastNewsletter.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-end border-b border-gray-200 pb-6">
             <div>
                <h1 className="text-4xl font-serif font-normal text-charcoal">Welcome, {user?.name}</h1>
                <p className="text-neutral mt-2">Here is what is happening in your community.</p>
             </div>
             <div className="hidden md:block">
                 <span className="text-xs font-bold text-charcoal bg-gold px-4 py-2 rounded-full border border-gold uppercase tracking-widest shadow-sm">
                   {user?.role === 'admin' ? 'Admin Access' : 'Member Access'}
                 </span>
             </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/dashboard/events" className="block">
              <VibrantCard className="group cursor-pointer bg-white hover:shadow-lg hover:border-gold transition-all">
                <div className="absolute top-4 right-4 text-gray-400 group-hover:text-gold transition-colors"><ArrowUpRight /></div>
                <div className="mb-4 text-charcoal p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-colors">
                    <Calendar size={32} />
                </div>
                <h3 className="font-bold text-xl mb-2 text-charcoal">Next Service</h3>
                <p className="text-4xl font-serif font-normal mb-1 text-charcoal">
                  {isLoadingStats ? '...' : (nextService || 'Sunday')}
                </p>
                <p className="text-neutral mb-4">
                  {isLoadingStats ? 'Loading...' : 'Every Sunday at 10:00 AM'}
                </p>
                <div className="pt-4 border-t border-gray-100">
                    <span className="text-gold font-bold text-sm">View Events →</span>
                </div>
              </VibrantCard>
            </Link>

            <Link to="/dashboard/prayer" className="block">
              <VibrantCard className="group cursor-pointer bg-white hover:shadow-lg hover:border-gold transition-all">
                 <div className="absolute top-4 right-4 text-gray-400 group-hover:text-gold transition-colors"><ArrowUpRight /></div>
                 <div className="mb-4 text-charcoal p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-colors">
                    <MessageSquare size={32} />
                </div>
                <h3 className="font-bold text-xl mb-2 text-charcoal">Prayer Wall</h3>
                <p className="text-4xl font-serif font-normal mb-1 text-charcoal">
                  {isLoadingStats ? '...' : prayerRequests24h}
                </p>
                <p className="text-neutral mb-4">
                  {isLoadingStats ? 'Loading...' : prayerRequests24h === 1 ? 'new request' : 'new requests'} in the last 24 hours
                </p>
                 <div className="pt-4 border-t border-gray-100">
                    <span className="text-gold font-bold text-sm">View Requests →</span>
                </div>
              </VibrantCard>
            </Link>

            <Link to="/dashboard/newsletter" className="block">
              <VibrantCard className="group cursor-pointer bg-white hover:shadow-lg hover:border-gold transition-all">
                 <div className="absolute top-4 right-4 text-gray-400 group-hover:text-gold transition-colors"><ArrowUpRight /></div>
                 <div className="mb-4 text-charcoal p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-colors">
                    <BookOpen size={32} />
                </div>
                <h3 className="font-bold text-xl mb-2 text-charcoal">Newsletter</h3>
                <p className="text-4xl font-serif font-normal mb-1 text-charcoal">
                  {isLoadingStats ? '...' : (lastNewsletterDate || 'None')}
                </p>
                <p className="text-neutral mb-4">
                  {isLoadingStats ? 'Loading...' : lastNewsletterDate ? 'Latest edition' : 'No newsletters yet'}
                </p>
                 <div className="pt-4 border-t border-gray-100">
                    <span className="text-gold font-bold text-sm">Read Now →</span>
                </div>
              </VibrantCard>
            </Link>
        </div>

        <div className="glass-card bg-white/60 p-10 rounded-[8px] relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="font-serif text-3xl mb-4 text-charcoal font-normal">Verse of the Day</h3>
                <p className="text-2xl text-charcoal/80 italic font-serif leading-relaxed max-w-3xl">
                    "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."
                </p>
                <p className="mt-6 text-charcoal font-black tracking-widest uppercase text-sm">Jeremiah 29:11</p>
             </div>
        </div>
    </div>
  );
};