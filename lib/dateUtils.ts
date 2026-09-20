/**
 * Timezone-aware date formatting utilities
 *
 * Display dates as dd/mm/yyyy (day/month/year) across the site, PDFs, and CSVs.
 * HTML <input type="date"> still stores ISO yyyy-mm-dd; browsers follow the page locale (en-NZ).
 */

/** en-GB formats numeric dates as dd/mm/yyyy. */
export const DATE_DISPLAY_LOCALE = 'en-GB';

function parseDisplayDate(input: Date | string | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  const trimmed = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T12:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Calendar date as dd/mm/yyyy. */
export function formatDdMmYyyy(input: Date | string | undefined, timeZone?: string): string {
  const date = parseDisplayDate(input);
  if (!date) return '';
  return new Intl.DateTimeFormat(DATE_DISPLAY_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

/** Date and time as dd/mm/yyyy HH:mm (24-hour). */
export function formatDdMmYyyyHHmm(input: Date | string | undefined, timeZone?: string): string {
  const date = parseDisplayDate(input);
  if (!date) return '';
  const day = formatDdMmYyyy(date, timeZone);
  const time = new Intl.DateTimeFormat(DATE_DISPLAY_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
  return `${day} ${time}`;
}

/** Last-access display as dd/mm/yyyy and 12-hour time on separate lines. */
export function formatLastAccessParts(
  input: Date | string | undefined,
  timeZone?: string
): { date: string; time: string } | null {
  const date = parseDisplayDate(input);
  if (!date) return null;
  const day = formatDdMmYyyy(date, timeZone);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
  if (!day) return null;
  return { date: day, time };
}

/**
 * Get the user's current timezone (IANA timezone identifier)
 * e.g., 'America/New_York', 'Europe/London', 'Asia/Tokyo'
 */
export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    // Fallback to UTC if timezone detection fails
    console.warn('Failed to detect timezone, using UTC:', error);
    return 'UTC';
  }
};

/**
 * Format a date string for display in a specific timezone
 * @param dateString - ISO date string from database
 * @param targetTimezone - IANA timezone identifier (defaults to current user's timezone)
 * @param options - Intl.DateTimeFormatOptions
 */
export const formatDateInTimezone = (
  dateString: string | undefined,
  targetTimezone?: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const tz = targetTimezone || getUserTimezone();
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: tz,
      ...options,
    };
    
    return new Intl.DateTimeFormat(DATE_DISPLAY_LOCALE, defaultOptions).format(date);
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date for relative display (e.g., "2 days ago") in a specific timezone
 * This is used for admin views to show when something was created in the admin's timezone
 * @param dateString - ISO date string from database
 * @param originalTimezone - IANA timezone when the record was created (optional)
 * @param adminTimezone - IANA timezone of the admin viewing the record (defaults to current user's timezone)
 */
export const formatRelativeDateInTimezone = (
  dateString: string | undefined,
  originalTimezone?: string,
  adminTimezone?: string
): string => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    // Get the admin's current timezone
    const tz = adminTimezone || getUserTimezone();
    
    // Convert the date to the admin's timezone for comparison
    const adminDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
    
    const diffTime = Math.abs(now.getTime() - adminDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    // Show exact time if less than 1 hour ago
    if (diffMinutes < 60) {
      if (diffMinutes < 1) return 'Just now';
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
    
    // Show hours if less than 24 hours
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    
    // For older dates, show the formatted date in admin's timezone
    return formatDdMmYyyy(dateString, tz);
  } catch (error) {
    console.error('Error formatting relative date in timezone:', error);
    return 'Unknown';
  }
};

/**
 * Format a date with full date and time in a specific timezone
 * Used for admin views to show exact creation time
 * @param dateString - ISO date string from database
 * @param originalTimezone - IANA timezone when the record was created (optional, for display purposes)
 * @param adminTimezone - IANA timezone of the admin viewing the record (defaults to current user's timezone)
 */
export const formatFullDateTimeInTimezone = (
  dateString: string | undefined,
  originalTimezone?: string,
  adminTimezone?: string
): string => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const tz = adminTimezone || getUserTimezone();
    
    const formatted = formatDateInTimezone(dateString, tz, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
      timeZoneName: 'short',
    });
    
    // Optionally show original timezone if different from admin's timezone
    if (originalTimezone && originalTimezone !== tz) {
      const originalFormatted = formatDateInTimezone(dateString, originalTimezone, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZoneName: 'short',
      });
      return `${formatted} (created: ${originalFormatted})`;
    }
    
    return formatted;
  } catch (error) {
    console.error('Error formatting full date time in timezone:', error);
    return 'Invalid date';
  }
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/** Format a DATE-only value (YYYY-MM-DD) for display as dd/mm/yyyy */
export function formatWeekDate(weekDate: string): string {
  return formatDdMmYyyy(weekDate) || weekDate;
}

export function monthYearFromWeekDate(weekDate: string): { month: string; year: number } {
  const d = new Date(`${weekDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) {
    return { month: '', year: 0 };
  }
  return {
    month: MONTH_NAMES[d.getMonth()],
    year: d.getFullYear(),
  };
}

export function resolveNewsletterWeekDate(item: {
  week_date?: string | null;
  month?: string;
  year?: number;
  created_at?: string;
}): string {
  if (item.week_date) return item.week_date;
  if (item.month && item.year) {
    const idx = MONTH_NAMES.indexOf(item.month as (typeof MONTH_NAMES)[number]);
    if (idx >= 0) {
      return `${item.year}-${String(idx + 1).padStart(2, '0')}-01`;
    }
  }
  if (item.created_at) return item.created_at.slice(0, 10);
  return '';
}


