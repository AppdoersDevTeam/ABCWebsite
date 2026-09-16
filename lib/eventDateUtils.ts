import type { Event } from '../types';
import { formatDdMmYyyy } from './dateUtils';

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

export function isMultiDayEvent(event: Event): boolean {
  return getEventStartDate(event) !== getEventEndDate(event);
}

function formatDateCompact(dateString: string): string {
  return formatDdMmYyyy(dateString);
}

function formatDateLong(dateString: string, includeYear = true): string {
  const formatted = formatDdMmYyyy(dateString);
  if (!includeYear) {
    const parts = formatted.split('/');
    if (parts.length === 3) return `${parts[0]}/${parts[1]}`;
  }
  return formatted;
}

export function formatEventDateTimePoint(
  event: Event,
  point: 'start' | 'end',
  style: 'compact' | 'long' | 'card-date' | 'card-time' = 'compact'
): string {
  const date = point === 'start' ? getEventStartDate(event) : getEventEndDate(event);
  const time = formatTimeForDisplay(
    point === 'start' ? getEventStartTime(event) : getEventEndTime(event)
  );

  switch (style) {
    case 'long':
      return `${formatDateLong(date)} · ${time}`;
    case 'card-date':
      return formatDateLong(date, false);
    case 'card-time':
      return isMultiDayEvent(event) ? `${time} (${formatDateCompact(date)})` : time;
    default:
      return `${formatDateCompact(date)}, ${time}`;
  }
}

export type EventScheduleDisplay =
  | { type: 'single-day'; date: string; time: string }
  | { type: 'multi-day'; start: string; end: string };

export function getEventScheduleDisplay(event: Event): EventScheduleDisplay {
  if (isMultiDayEvent(event)) {
    return {
      type: 'multi-day',
      start: formatEventDateTimePoint(event, 'start', 'long'),
      end: formatEventDateTimePoint(event, 'end', 'long'),
    };
  }

  return {
    type: 'single-day',
    date: formatEventDateRange(event),
    time: formatEventTimeRange(event),
  };
}

export type EventDateCardDisplay =
  | { type: 'single-day'; text: string }
  | { type: 'multi-day'; start: string; end: string };

export function getEventDateCardDisplay(event: Event): EventDateCardDisplay {
  if (isMultiDayEvent(event)) {
    return {
      type: 'multi-day',
      start: formatEventDateTimePoint(event, 'start', 'card-date'),
      end: formatEventDateTimePoint(event, 'end', 'card-date'),
    };
  }

  return { type: 'single-day', text: formatEventDateRangeShort(event) };
}

export type EventTimeCardDisplay =
  | { type: 'single-day'; text: string }
  | { type: 'multi-day'; start: string; end: string };

export function getEventTimeCardDisplay(event: Event): EventTimeCardDisplay {
  if (isMultiDayEvent(event)) {
    return {
      type: 'multi-day',
      start: formatEventDateTimePoint(event, 'start', 'card-time'),
      end: formatEventDateTimePoint(event, 'end', 'card-time'),
    };
  }

  return { type: 'single-day', text: formatEventTimeRange(event) };
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
  _options?: Intl.DateTimeFormatOptions
): string {
  const start = getEventStartDate(event);
  const end = getEventEndDate(event);

  if (start === end) {
    return formatDdMmYyyy(start);
  }

  return `${formatDdMmYyyy(start)} – ${formatDdMmYyyy(end)}`;
}

export function formatEventDateRangeShort(event: Event): string {
  const start = getEventStartDate(event);
  const end = getEventEndDate(event);

  if (start === end) {
    return formatDdMmYyyy(start);
  }

  return `${formatDdMmYyyy(start)} – ${formatDdMmYyyy(end)}`;
}

export function formatEventTimeRange(event: Event): string {
  const start = formatTimeForDisplay(getEventStartTime(event));
  const end = formatTimeForDisplay(getEventEndTime(event));
  if (!end || start === end) return start;
  return `${start} – ${end}`;
}

export function formatEventDateBadge(dateString: string): { day: string; month: string } {
  const date = new Date(`${dateString}T12:00:00`);
  const formatted = formatDdMmYyyy(dateString);
  const [day] = formatted.split('/');
  const month = date.toLocaleDateString('en-NZ', { month: 'short' }).toUpperCase();
  return { day: day || date.getDate().toString().padStart(2, '0'), month };
}

/** Card row label, e.g. "Oct 12, 10:00 AM" or "Oct 2, 5:00 PM – Oct 4, 2:00 PM" */
export function formatEventCardSchedule(event: Event): string {
  if (isMultiDayEvent(event)) {
    return `${formatEventDateTimePoint(event, 'start', 'compact')} – ${formatEventDateTimePoint(event, 'end', 'compact')}`;
  }

  const startDate = getEventStartDate(event);
  return `${formatDateCompact(startDate)}, ${formatEventTimeRange(event)}`;
}

export function formatEventScheduleShort(event: Event): string {
  if (isMultiDayEvent(event)) {
    return formatEventCardSchedule(event);
  }

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

  return `${formatDateCompact(startDate)}, ${timeRange}`;
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
