/**
 * Timezone-aware date formatting utilities
 * 
 * These functions handle displaying dates in the appropriate timezone:
 * - For admins: Display dates in the admin's current timezone
 * - For users: Display dates in their own timezone (if stored) or browser timezone
 */

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: tz,
      ...options,
    };
    
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
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
    return formatDateInTimezone(dateString, tz, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
    
    // Optionally show original timezone if different from admin's timezone
    if (originalTimezone && originalTimezone !== tz) {
      const originalFormatted = formatDateInTimezone(dateString, originalTimezone, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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


