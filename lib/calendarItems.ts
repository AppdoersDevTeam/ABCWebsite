import { supabase } from './supabase';
import { fetchNewslettersOrdered } from './newsletters';
import { resolveNewsletterWeekDate } from './dateUtils';
import { getEventEndDate, getEventStartDate } from './eventDateUtils';
import { WHATS_ON_LABEL } from './constants';
import {
  fetchChannelPlaylistData,
  fetchPlaylistVideos,
  isYouTubeApiConfigured,
} from './youtube';

export type CalendarKind = 'event' | 'sermon' | 'devotional' | 'newsletter';
export type CalendarAudience = 'member' | 'admin';

export interface CalendarItem {
  id: string;
  kind: CalendarKind;
  title: string;
  subtitle?: string;
  date: string;
  endDate?: string;
  href: string;
}

const CHANNEL_HANDLE = 'AshburtonBaptistChurchNZ';

export const CALENDAR_KIND_META: Record<
  CalendarKind,
  { label: string; dotClass: string; chipClass: string }
> = {
  event: {
    label: WHATS_ON_LABEL,
    dotClass: 'bg-green-600',
    chipClass: 'bg-green-50 text-green-700 border-green-200',
  },
  sermon: {
    label: 'Sermons',
    dotClass: 'bg-red-600',
    chipClass: 'bg-red-50 text-red-700 border-red-200',
  },
  devotional: {
    label: 'Devotionals',
    dotClass: 'bg-purple-600',
    chipClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  newsletter: {
    label: 'Newsletters',
    dotClass: 'bg-orange-600',
    chipClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
};

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  return new Date(`${key}T12:00:00`);
}

export function isoToDateKey(iso: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso.slice(0, 10);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return toDateKey(d);
}

export function eachDateInclusive(start: string, end?: string): string[] {
  const from = parseDateKey(start);
  const to = parseDateKey(end || start);
  if (Number.isNaN(from.getTime())) return start ? [start] : [];
  const keys: string[] = [];
  const cursor = new Date(from);
  const last = Number.isNaN(to.getTime()) ? from : to;
  while (cursor.getTime() <= last.getTime()) {
    keys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

export function startOfWeekMonday(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function itemHref(kind: CalendarKind, id: string, audience: CalendarAudience): string {
  if (kind === 'event') return `/events/${id}`;
  if (kind === 'sermon') {
    return audience === 'admin' ? `/events/sermons?watch=${id}` : `/dashboard/sermons?watch=${id}`;
  }
  if (kind === 'devotional') {
    return audience === 'admin' ? `/admin/devotional?id=${id}` : `/dashboard/devotional?id=${id}`;
  }
  return audience === 'admin' ? `/admin/newsletter?id=${id}` : `/dashboard/newsletter?id=${id}`;
}

async function fetchSermonItems(audience: CalendarAudience): Promise<CalendarItem[]> {
  if (!isYouTubeApiConfigured()) return [];
  try {
    const { uploadsPlaylistId } = await fetchChannelPlaylistData(CHANNEL_HANDLE);
    if (!uploadsPlaylistId) return [];
    const videos = await fetchPlaylistVideos(uploadsPlaylistId, 50);
    return videos
      .filter((video) => video.id && !video.id.startsWith('PLACEHOLDER'))
      .map((video) => ({
        id: video.id,
        kind: 'sermon' as const,
        title: video.title,
        date: isoToDateKey(video.publishedAt),
        href: itemHref('sermon', video.id, audience),
      }));
  } catch (error) {
    console.error('Error fetching sermons for calendar:', error);
    return [];
  }
}

export async function fetchCalendarItems(
  audience: CalendarAudience,
  isAdmin: boolean
): Promise<CalendarItem[]> {
  const eventsQuery = supabase.from('events').select('*').order('date', { ascending: true });
  const scopedEvents = isAdmin
    ? eventsQuery
    : eventsQuery.or('is_public.eq.true,audience.in.(all,members),audience.is.null');

  const [eventsResult, devotionalsResult, newsletters, sermons] = await Promise.all([
    scopedEvents,
    supabase.from('devotionals').select('id, title, subtitle, week_date'),
    fetchNewslettersOrdered(),
    fetchSermonItems(audience),
  ]);

  const items: CalendarItem[] = [...sermons];

  if (!eventsResult.error && eventsResult.data) {
    eventsResult.data.forEach((event) => {
      items.push({
        id: event.id,
        kind: 'event',
        title: event.title,
        subtitle: event.location || event.time,
        date: isoToDateKey(getEventStartDate(event)),
        endDate: isoToDateKey(getEventEndDate(event)),
        href: itemHref('event', event.id, audience),
      });
    });
  }

  if (!devotionalsResult.error && devotionalsResult.data) {
    devotionalsResult.data.forEach((item) => {
      if (!item.week_date) return;
      items.push({
        id: item.id,
        kind: 'devotional',
        title: item.title,
        subtitle: item.subtitle || undefined,
        date: isoToDateKey(item.week_date),
        href: itemHref('devotional', item.id, audience),
      });
    });
  }

  newsletters.forEach((item) => {
    const date = resolveNewsletterWeekDate(item);
    if (!date) return;
    items.push({
      id: item.id,
      kind: 'newsletter',
      title: item.title,
      date: isoToDateKey(date),
      href: itemHref('newsletter', item.id, audience),
    });
  });

  return items;
}

export function notifyCalendarChanged() {
  window.dispatchEvent(new Event('abc-calendar-changed'));
}

export function itemsOnDate(items: CalendarItem[], dateKey: string): CalendarItem[] {
  return items.filter((item) => eachDateInclusive(item.date, item.endDate).includes(dateKey));
}
