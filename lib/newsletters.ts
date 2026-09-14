import { supabase } from './supabase';
import { Newsletter } from '../types';
import { resolveNewsletterWeekDate } from './dateUtils';

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
