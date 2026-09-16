import { supabase } from './supabase';
import { Newsletter } from '../types';
import { monthYearFromWeekDate, resolveNewsletterWeekDate } from './dateUtils';

export type NewsletterMonthGroup = {
  key: string;
  label: string;
  items: Newsletter[];
};

export function groupNewslettersByMonth(items: Newsletter[]): NewsletterMonthGroup[] {
  const groups = new Map<string, NewsletterMonthGroup>();
  const order: string[] = [];

  for (const item of items) {
    const weekDate = resolveNewsletterWeekDate(item);
    const key = /^\d{4}-\d{2}/.test(weekDate) ? weekDate.slice(0, 7) : 'unknown';
    let group = groups.get(key);
    if (!group) {
      const { month, year } = monthYearFromWeekDate(weekDate);
      group = {
        key,
        label: key === 'unknown' || !month || !year ? 'Unknown date' : `${month} ${year}`,
        items: [],
      };
      groups.set(key, group);
      order.push(key);
    }
    group.items.push(item);
  }

  return order.map((key) => groups.get(key)!);
}

export function sortNewslettersLatestFirst(items: Newsletter[]): Newsletter[] {
  return [...items].sort((a, b) =>
    resolveNewsletterWeekDate(b).localeCompare(resolveNewsletterWeekDate(a))
  );
}

export async function fetchNewslettersOrdered(): Promise<Newsletter[]> {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return sortNewslettersLatestFirst(data || []);
}

export async function fetchLatestNewsletter(): Promise<Newsletter | null> {
  const items = await fetchNewslettersOrdered();
  return items[0] ?? null;
}
