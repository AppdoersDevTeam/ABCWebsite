import type { Event } from '../types';

export function getEventStartDate(event: Event): string {
  return event.start_date || event.date;
}

export function getEventEndDate(event: Event): string {
  return event.end_date || event.start_date || event.date;
}

export function getEventStartTime(event: Event): string {
  return event.start_time || event.time;
}

export function getEventEndTime(event: Event): string {
  return event.end_time || event.start_time || event.time;
}

/** Normalize stored time values to HH:MM for `<input type="time">`. */
export function parseTimeToInputValue(time: string): string {
  if (!time) return '';

  const trimmed = time.trim();
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const [hours, minutes] = trimmed.split(':');
    return `${hours.padStart(2, '0')}:${minutes}`;
  }

  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  return '';
}

export function formatTimeForDisplay(time: string): string {
  if (!time) return '';

  const inputVal = parseTimeToInputValue(time);
  if (!inputVal) return time;

  const [hoursStr, minutes] = inputVal.split(':');
  const hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
}

export function formatEventDateRange(
  event: Event,
  options?: Intl.DateTimeFormatOptions
): string {
  const start = getEventStartDate(event);
  const end = getEventEndDate(event);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...options,
  };

  if (start === end) {
    return new Date(`${start}T12:00:00`).toLocaleDateString('en-US', defaultOptions);
  }

  const startFormatted = new Date(`${start}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const endFormatted = new Date(`${end}T12:00:00`).toLocaleDateString('en-US', defaultOptions);
  return `${startFormatted} – ${endFormatted}`;
}

export function formatEventDateRangeShort(event: Event): string {
  const start = getEventStartDate(event);
  const end = getEventEndDate(event);

  if (start === end) {
    return new Date(`${start}T12:00:00`).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  const startFormatted = new Date(`${start}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
  const endFormatted = new Date(`${end}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  return `${startFormatted} – ${endFormatted}`;
}

export function formatEventTimeRange(event: Event): string {
  const start = formatTimeForDisplay(getEventStartTime(event));
  const end = formatTimeForDisplay(getEventEndTime(event));
  if (!end || start === end) return start;
  return `${start} – ${end}`;
}

export function formatEventDateBadge(dateString: string): { day: string; month: string } {
  const date = new Date(`${dateString}T12:00:00`);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  return { day, month };
}

/** Card row label, e.g. "Oct 12, 10:00 AM" */
export function formatEventCardSchedule(event: Event): string {
  const startDate = getEventStartDate(event);
  const eventDate = new Date(`${startDate}T12:00:00`);
  const datePart = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${datePart}, ${formatEventTimeRange(event)}`;
}

export function formatEventScheduleShort(event: Event): string {
  const startDate = getEventStartDate(event);
  const timeRange = formatEventTimeRange(event);
  const eventDate = new Date(`${startDate}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return `Today, ${timeRange}`;
  if (diffDays === 1) return `Tomorrow, ${timeRange}`;
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days, ${timeRange}`;

  return `${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeRange}`;
}

export function buildEventDateTimePayload(form: {
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
}) {
  const startTimeDisplay = formatTimeForDisplay(form.start_time);
  const endTimeDisplay = formatTimeForDisplay(form.end_time);
  const timeDisplay =
    endTimeDisplay && endTimeDisplay !== startTimeDisplay
      ? `${startTimeDisplay} – ${endTimeDisplay}`
      : startTimeDisplay;

  return {
    start_date: form.start_date,
    end_date: form.end_date,
    start_time: form.start_time,
    end_time: form.end_time,
    date: form.start_date,
    time: timeDisplay,
  };
}
