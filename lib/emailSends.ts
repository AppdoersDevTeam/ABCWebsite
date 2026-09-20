import { supabase } from './supabase';
import { formatDdMmYyyyHHmm } from './dateUtils';
import {
  emptyEmailQuotaStatus,
  parseEmailQuotaHit,
  type EmailQuotaStatus,
} from './emailQuota';

export type { EmailQuotaStatus } from './emailQuota';
export {
  EMAIL_DAY_LIMIT,
  EMAIL_MONTH_LIMIT,
  EMAIL_QUOTA_TIMEZONE,
  emailQuotaBlockedMessage,
  emailQuotaNearLimit,
  emptyEmailQuotaStatus,
  formatEmailQuotaUsed,
} from './emailQuota';

export type EmailRecipientKind = 'user' | 'leadership';

export type EmailSendRow = {
  id: string;
  sent_at: string;
  recipient_email: string;
  recipient_kind: EmailRecipientKind;
  template_key: string;
  subject: string | null;
};

export const EMAIL_TEMPLATE_LABELS: Record<string, string> = {
  approval: 'Account approved',
  signup_received: 'Signup received',
  denial: 'Signup not approved',
  access_hold: 'Access on hold',
  access_restored: 'Access restored',
  admin_role_granted: 'Admin role granted',
  admin_role_revoked: 'Admin role ended',
  intro_inquiry: 'Intro inquiry',
  account_deleted: 'Account deleted',
  directory_added: 'People directory added',
  directory_archived: 'People directory archived',
  directory_deleted: 'People directory removed',
  mfa_verification: 'MFA verification',
  system: 'Other',
};

export function emailTemplateLabel(key: string): string {
  return EMAIL_TEMPLATE_LABELS[key] || key.replace(/_/g, ' ');
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function ymdInZone(date: Date, timeZone: string): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { y: get('year'), m: get('month'), d: get('day') };
}

function ymdKey(parts: { y: number; m: number; d: number }): string {
  return `${parts.y}-${pad2(parts.m)}-${pad2(parts.d)}`;
}

function weekdayMon0(date: Date, timeZone: string): number {
  const wd = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(date);
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  return map[wd] ?? 0;
}

export type EmailPeriodCounts = {
  total: number;
  users: number;
  leadership: number;
};

export type EmailSendStats = {
  allTime: EmailPeriodCounts;
  day: EmailPeriodCounts;
  week: EmailPeriodCounts;
  month: EmailPeriodCounts;
};

function emptyCounts(): EmailPeriodCounts {
  return { total: 0, users: 0, leadership: 0 };
}

function addKind(counts: EmailPeriodCounts, kind: EmailRecipientKind) {
  counts.total += 1;
  if (kind === 'leadership') counts.leadership += 1;
  else counts.users += 1;
}

export function summariseEmailSends(rows: EmailSendRow[], timeZone: string, now = new Date()): EmailSendStats {
  const today = ymdInZone(now, timeZone);
  const todayKey = ymdKey(today);
  const monthKey = `${today.y}-${pad2(today.m)}`;
  const weekAnchor = new Date(Date.UTC(today.y, today.m - 1, today.d, 12, 0, 0));
  weekAnchor.setUTCDate(weekAnchor.getUTCDate() - weekdayMon0(now, timeZone));
  const weekStartKey = `${weekAnchor.getUTCFullYear()}-${pad2(weekAnchor.getUTCMonth() + 1)}-${pad2(weekAnchor.getUTCDate())}`;

  const stats: EmailSendStats = {
    allTime: emptyCounts(),
    day: emptyCounts(),
    week: emptyCounts(),
    month: emptyCounts(),
  };

  for (const row of rows) {
    const sent = new Date(row.sent_at);
    if (Number.isNaN(sent.getTime())) continue;
    const parts = ymdInZone(sent, timeZone);
    const key = ymdKey(parts);
    const ym = `${parts.y}-${pad2(parts.m)}`;
    addKind(stats.allTime, row.recipient_kind);
    if (key === todayKey) addKind(stats.day, row.recipient_kind);
    if (key >= weekStartKey && key <= todayKey) addKind(stats.week, row.recipient_kind);
    if (ym === monthKey) addKind(stats.month, row.recipient_kind);
  }

  return stats;
}

export async function fetchEmailSends(): Promise<EmailSendRow[]> {
  const { data, error } = await supabase
    .from('email_sends')
    .select('id, sent_at, recipient_email, recipient_kind, template_key, subject')
    .order('sent_at', { ascending: false })
    .limit(2000);

  if (error) {
    console.error('fetchEmailSends', error);
    return [];
  }

  return (data ?? []) as EmailSendRow[];
}

export async function fetchEmailSendTotal(): Promise<number> {
  const { count, error } = await supabase
    .from('email_sends')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error('fetchEmailSendTotal', error);
    return 0;
  }

  return count ?? 0;
}

export async function fetchEmailQuotaStatus(): Promise<EmailQuotaStatus | null> {
  const { data, error } = await supabase.rpc('email_quota_status');
  if (error) {
    console.error('fetchEmailQuotaStatus', error);
    return null;
  }
  if (!data || typeof data !== 'object') return emptyEmailQuotaStatus();

  const row = data as Record<string, unknown>;
  const dayLimit = Number(row.day_limit) || 50;
  const monthLimit = Number(row.month_limit) || 1000;
  const dayCount = Number(row.day_count) || 0;
  const monthCount = Number(row.month_count) || 0;
  const blocked = Boolean(row.blocked) || dayCount >= dayLimit || monthCount >= monthLimit;
  const hit = parseEmailQuotaHit(row.hit);

  return {
    timezone: typeof row.timezone === 'string' ? row.timezone : 'Pacific/Auckland',
    day_limit: dayLimit,
    month_limit: monthLimit,
    day_count: dayCount,
    month_count: monthCount,
    day_remaining: Number.isFinite(Number(row.day_remaining))
      ? Math.max(0, Number(row.day_remaining))
      : Math.max(dayLimit - dayCount, 0),
    month_remaining: Number.isFinite(Number(row.month_remaining))
      ? Math.max(0, Number(row.month_remaining))
      : Math.max(monthLimit - monthCount, 0),
    blocked,
    hit: blocked ? hit || (dayCount >= dayLimit ? 'day' : 'month') : null,
  };
}

export function formatEmailWhen(iso: string, timeZone?: string): string {
  return formatDdMmYyyyHHmm(iso, timeZone);
}
