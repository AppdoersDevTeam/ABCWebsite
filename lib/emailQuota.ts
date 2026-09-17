export const EMAIL_DAY_LIMIT = 50;
export const EMAIL_MONTH_LIMIT = 1000;
export const EMAIL_QUOTA_TIMEZONE = 'Pacific/Auckland';

export type EmailQuotaHit = 'day' | 'month' | 'both' | null;

export type EmailQuotaStatus = {
  timezone: string;
  day_limit: number;
  month_limit: number;
  day_count: number;
  month_count: number;
  day_remaining: number;
  month_remaining: number;
  blocked: boolean;
  hit: EmailQuotaHit;
};

export function emptyEmailQuotaStatus(): EmailQuotaStatus {
  return {
    timezone: EMAIL_QUOTA_TIMEZONE,
    day_limit: EMAIL_DAY_LIMIT,
    month_limit: EMAIL_MONTH_LIMIT,
    day_count: 0,
    month_count: 0,
    day_remaining: EMAIL_DAY_LIMIT,
    month_remaining: EMAIL_MONTH_LIMIT,
    blocked: false,
    hit: null,
  };
}

export function parseEmailQuotaHit(value: unknown): EmailQuotaHit {
  if (value === 'day' || value === 'month' || value === 'both') return value;
  return null;
}

export function emailQuotaBlockedMessage(
  status: Pick<EmailQuotaStatus, 'hit' | 'day_limit' | 'month_limit'>
): string {
  if (status.hit === 'month') {
    return `The church monthly email limit of ${status.month_limit.toLocaleString('en-NZ')} has been reached. Sending resumes at the start of next month, New Zealand time.`;
  }
  if (status.hit === 'both') {
    return `The church email limits have been reached (${status.day_limit} per day and ${status.month_limit.toLocaleString('en-NZ')} per month). Sending resumes at midnight New Zealand time, or the start of next month if the monthly limit is still full.`;
  }
  return `The church daily email limit of ${status.day_limit} has been reached. Sending resumes at midnight New Zealand time.`;
}

export function emailQuotaNearLimit(status: EmailQuotaStatus): boolean {
  if (status.blocked) return true;
  return status.day_remaining <= 10 || status.month_remaining <= 100;
}

export function formatEmailQuotaUsed(used: number, limit: number): string {
  return `${used.toLocaleString('en-NZ')} / ${limit.toLocaleString('en-NZ')}`;
}
