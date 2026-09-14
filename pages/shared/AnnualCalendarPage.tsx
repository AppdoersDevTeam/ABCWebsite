import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { AnnualCalendarView } from '../../components/calendar/AnnualCalendarView';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { SkeletonPageHeader, SkeletonCard } from '../../components/UI/Skeleton';
import { supabase } from '../../lib/supabase';
import { fetchCalendarItems, type CalendarAudience, type CalendarItem } from '../../lib/calendarItems';
import { useAuth } from '../../context/AuthContext';

interface AnnualCalendarPageProps {
  audience: CalendarAudience;
}

export const AnnualCalendarPage: React.FC<AnnualCalendarPageProps> = ({ audience }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchCalendarItems(audience, user?.role === 'admin');
      setItems(data);
    } catch (error) {
      console.error('Error loading annual calendar:', error);
    } finally {
      setIsLoading(false);
    }
  }, [audience, user?.role]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel(`annual-calendar-${audience}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        void load();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'devotionals' }, () => {
        void load();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'newsletters' }, () => {
        void load();
      })
      .subscribe();

    const onVisible = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    const onContentChanged = () => {
      void load();
    };
    window.addEventListener('abc-calendar-changed', onContentChanged);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('abc-calendar-changed', onContentChanged);
    };
  }, [audience, load]);

  if (isLoading && items.length === 0) {
    return (
      <div className="space-y-6">
        <SkeletonPageHeader />
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 min-w-0">
      <AdminPageHeader
        title="Annual Calendar"
        subtitle="This year’s events, sermons, devotionals, and newsletters. Choose year, month, or week view."
        icon={<CalendarDays size={28} />}
      />
      <AnnualCalendarView items={items} isLoading={isLoading && items.length > 0} />
    </div>
  );
};
