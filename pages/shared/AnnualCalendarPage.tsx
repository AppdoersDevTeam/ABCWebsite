import React, { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import { AnnualCalendarView } from '../../components/calendar/AnnualCalendarView';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { SkeletonPageHeader, SkeletonCard } from '../../components/UI/Skeleton';
import { supabase } from '../../lib/supabase';
import { fetchCalendarItems, type CalendarAudience } from '../../lib/calendarItems';
import { useAuth } from '../../context/AuthContext';
import { queryKeys } from '../../lib/queryClient';

interface AnnualCalendarPageProps {
  audience: CalendarAudience;
}

export const AnnualCalendarPage: React.FC<AnnualCalendarPageProps> = ({ audience }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';
  const queryKey = queryKeys.calendar(audience, !!isAdmin);

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchCalendarItems(audience, !!isAdmin),
    staleTime: 60_000,
  });

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleInvalidate = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        invalidate();
      }, 400);
    };

    const channel = supabase
      .channel(`annual-calendar-${audience}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        scheduleInvalidate();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'devotionals' }, () => {
        scheduleInvalidate();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'newsletters' }, () => {
        scheduleInvalidate();
      })
      .subscribe();

    const onContentChanged = () => {
      scheduleInvalidate();
    };
    window.addEventListener('abc-calendar-changed', onContentChanged);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
      window.removeEventListener('abc-calendar-changed', onContentChanged);
    };
  }, [audience, invalidate]);

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
        subtitle="This years events, sermons, devotionals, and newsletters. Choose year, month, or week view."
        icon={<CalendarDays size={28} />}
      />
      <AnnualCalendarView items={items} audience={audience} />
    </div>
  );
};
