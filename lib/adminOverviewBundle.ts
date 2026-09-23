import { supabase } from './supabase';

export type AdminOverviewActivity = {
  id: string;
  type: 'prayer' | 'event' | 'team_member' | 'newsletter' | 'devotional' | 'roster';
  title: string;
  date: string;
};

export type AdminOverviewBundle = {
  prayer_count: number;
  pending_prayer_7d: number;
  team_count: number;
  roster_count: number;
  events_count: number;
  newsletter_count: number;
  devotionals_count: number;
  recent: AdminOverviewActivity[];
};

export async function fetchAdminOverviewBundle(): Promise<AdminOverviewBundle | null> {
  const { data, error } = await supabase.rpc('admin_overview_bundle');
  if (error) {
    console.warn('admin_overview_bundle RPC unavailable, falling back:', error.message);
    return null;
  }
  const raw = data as Record<string, unknown> | null;
  if (!raw || typeof raw !== 'object') return null;

  const recentRaw = Array.isArray(raw.recent) ? raw.recent : [];
  const recent: AdminOverviewActivity[] = recentRaw
    .map((row) => {
      const r = row as Record<string, unknown>;
      const type = String(r.type || '');
      if (
        type !== 'prayer' &&
        type !== 'event' &&
        type !== 'team_member' &&
        type !== 'newsletter' &&
        type !== 'devotional' &&
        type !== 'roster'
      ) {
        return null;
      }
      return {
        id: String(r.id || ''),
        type,
        title: String(r.title || ''),
        date: String(r.sort_at || r.date || ''),
      };
    })
    .filter((row): row is AdminOverviewActivity => !!row && !!row.id);

  return {
    prayer_count: Number(raw.prayer_count) || 0,
    pending_prayer_7d: Number(raw.pending_prayer_7d) || 0,
    team_count: Number(raw.team_count) || 0,
    roster_count: Number(raw.roster_count) || 0,
    events_count: Number(raw.events_count) || 0,
    newsletter_count: Number(raw.newsletter_count) || 0,
    devotionals_count: Number(raw.devotionals_count) || 0,
    recent,
  };
}
