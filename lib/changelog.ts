/** Product changelog shown only to Super Admins in the admin dashboard. */

import changelogDoc from '../CHANGELOG.json';
import { locationForDisplay } from './changelogLocations';

export type ChangelogKind = 'added' | 'changed' | 'fixed';

export type ChangelogArea =
  | 'admin'
  | 'auth'
  | 'calendar'
  | 'devotionals'
  | 'events'
  | 'leadership'
  | 'newsletters'
  | 'prayer'
  | 'public'
  | 'roster'
  | 'sermons'
  | 'system'
  | 'users';

export type ChangelogEntry = {
  id: string;
  /** ISO date-time when the change shipped */
  changedAt: string;
  /** Git author / team member who made the change */
  changedBy: string;
  kind: ChangelogKind;
  area: ChangelogArea;
  /** Display title, always `[CHG-YYYY-DDMM-NNN]` */
  title: string;
  /** Short human heading under the Change ID */
  heading?: string;
  summary: string;
  details?: string[];
};

type ChangelogJsonEntry = (typeof changelogDoc.entries)[number];

const CHANGELOG_AREAS: ChangelogArea[] = [
  'admin',
  'auth',
  'calendar',
  'devotionals',
  'events',
  'leadership',
  'newsletters',
  'prayer',
  'public',
  'roster',
  'sermons',
  'system',
  'users',
];

function isChangelogArea(value: string): value is ChangelogArea {
  return (CHANGELOG_AREAS as string[]).includes(value);
}

function toProductKind(type: string): ChangelogKind {
  if (type === 'added' || type === 'fixed') return type;
  return 'changed';
}

function finishDetailSentence(text: string): string {
  const trimmed = text.replace(/^[-*•]\s*/, '').replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function splitReadableBullets(text: string): string[] {
  const trimmed = finishDetailSentence(text);
  if (!trimmed) return [];
  if (trimmed.length > 140 && /;\s+/.test(trimmed)) {
    return trimmed.split(/;\s+/).flatMap(splitReadableBullets);
  }
  if (trimmed.length > 220) {
    const sentences = trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [trimmed];
    if (sentences.length > 1) return sentences.flatMap((part) => splitReadableBullets(part));
  }
  return [trimmed];
}

function expandChangelogDetails(details?: string[], fallbacks: string[] = []): string[] | undefined {
  const source = [...(details ?? []), ...fallbacks];
  const seen = new Set<string>();
  const expanded: string[] = [];
  for (const raw of source) {
    if (!raw?.trim() || /^github:/i.test(raw) || /github\.com\//i.test(raw)) continue;
    for (const part of splitReadableBullets(raw)) {
      const key = part.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      expanded.push(part);
      if (expanded.length >= 14) return expanded;
    }
  }
  return expanded.length ? expanded : undefined;
}

function toProductEntry(entry: ChangelogJsonEntry): ChangelogEntry {
  const request = entry.request?.trim() ?? '';
  const changes = Array.isArray(entry.changes) ? entry.changes.filter(Boolean) : [];
  const area = isChangelogArea(entry.area) ? entry.area : 'system';
  const heading = locationForDisplay({
    area,
    heading: entry.title,
    summary: request,
    title: entry.title,
    id: entry.id,
  });
  return {
    id: entry.id,
    changedAt: entry.changedAt || `${entry.date}T${entry.time}`,
    changedBy: entry.changedBy || 'Unknown',
    kind: toProductKind(entry.type),
    area,
    title: `[${entry.id}]`,
    heading,
    summary: request || entry.title,
    details: expandChangelogDetails(changes.length ? changes : [request || entry.title]),
  };
}

export const CHANGELOG_KIND_OPTIONS: { value: ChangelogKind | ''; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'added', label: 'Added' },
  { value: 'changed', label: 'Changed' },
  { value: 'fixed', label: 'Fixed' },
];

export const CHANGELOG_AREA_OPTIONS: { value: ChangelogArea | ''; label: string }[] = [
  { value: '', label: 'All areas' },
  { value: 'admin', label: 'Admin' },
  { value: 'auth', label: 'Auth' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'devotionals', label: 'Devotionals' },
  { value: 'events', label: 'Events' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'newsletters', label: 'Newsletters' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'public', label: 'Public site' },
  { value: 'roster', label: 'Rosters' },
  { value: 'sermons', label: 'Sermons' },
  { value: 'system', label: 'System' },
  { value: 'users', label: 'Users' },
];

export const CHANGELOG_KIND_LABELS: Record<ChangelogKind, string> = {
  added: 'Added',
  changed: 'Changed',
  fixed: 'Fixed',
};

export const CHANGELOG_KIND_COLORS: Record<ChangelogKind, string> = {
  added: 'bg-emerald-100 text-emerald-800',
  changed: 'bg-amber-100 text-amber-900',
  fixed: 'bg-sky-100 text-sky-800',
};

export const CHANGELOG_AREA_LABELS: Record<ChangelogArea, string> = {
  admin: 'Admin',
  auth: 'Auth',
  calendar: 'Calendar',
  devotionals: 'Devotionals',
  events: 'Events',
  leadership: 'Leadership',
  newsletters: 'Newsletters',
  prayer: 'Prayer',
  public: 'Public site',
  roster: 'Rosters',
  sermons: 'Sermons',
  system: 'System',
  users: 'Users',
};

/**
 * Curated product changelog. Source of truth: CHANGELOG.json (engineering history).
 * Newest entries first. GitHub commits are merged separately in the admin UI.
 */
export const CHANGELOG_ENTRIES: ChangelogEntry[] = changelogDoc.entries.map(toProductEntry);

export const CHANGELOG_MONTH_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All months' },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(2000, i, 1).toLocaleString('en-NZ', { month: 'long' }),
  })),
];

export function getChangelogYearOptions(entries: ChangelogEntry[]): { value: string; label: string }[] {
  const years = new Set<number>();
  for (const entry of entries) {
    years.add(new Date(entry.changedAt).getFullYear());
  }
  return [
    { value: '', label: 'All years' },
    ...Array.from(years)
      .sort((a, b) => b - a)
      .map((year) => ({ value: String(year), label: String(year) })),
  ];
}

export type ChangelogEntryFilters = {
  kind?: ChangelogKind | '';
  area?: ChangelogArea | '';
  search?: string;
  year?: string;
  month?: string;
  dateFrom?: string;
  dateTo?: string;
};

function changelogEntryInstantMs(changedAt: string): number {
  return new Date(changedAt).getTime();
}

function localDayStartMs(yyyyMmDd: string): number {
  return new Date(`${yyyyMmDd}T00:00:00`).getTime();
}

function localDayEndMs(yyyyMmDd: string): number {
  return new Date(`${yyyyMmDd}T23:59:59.999`).getTime();
}

function matchesChangelogDateFilters(changedAt: string, filters: ChangelogEntryFilters): boolean {
  const when = new Date(changedAt);
  const year = (filters.year ?? '').trim();
  const month = (filters.month ?? '').trim();
  if (year && when.getFullYear() !== Number(year)) return false;
  if (month && when.getMonth() + 1 !== Number(month)) return false;

  const from = (filters.dateFrom ?? '').trim();
  const to = (filters.dateTo ?? '').trim();
  const ms = changelogEntryInstantMs(changedAt);
  if (from && ms < localDayStartMs(from)) return false;
  if (to && ms > localDayEndMs(to)) return false;
  return true;
}

export function filterChangelogEntries(entries: ChangelogEntry[], filters: ChangelogEntryFilters): ChangelogEntry[] {
  const q = (filters.search ?? '').trim().toLowerCase();
  return entries.filter((entry) => {
    if (filters.kind && entry.kind !== filters.kind) return false;
    if (filters.area && entry.area !== filters.area) return false;
    if (!matchesChangelogDateFilters(entry.changedAt, filters)) return false;
    if (!q) return true;
    const haystack = [
      entry.title,
      entry.heading,
      entry.summary,
      entry.changedBy,
      CHANGELOG_AREA_LABELS[entry.area],
      CHANGELOG_KIND_LABELS[entry.kind],
      ...(entry.details ?? []),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function groupChangelogByMonth(entries: ChangelogEntry[]): { monthKey: string; label: string; entries: ChangelogEntry[] }[] {
  const groups = new Map<string, ChangelogEntry[]>();
  const sorted = [...entries].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );
  for (const entry of sorted) {
    const monthKey = entry.changedAt.slice(0, 7);
    const list = groups.get(monthKey);
    if (list) list.push(entry);
    else groups.set(monthKey, [entry]);
  }
  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([monthKey, monthEntries]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const label = new Date(year, month - 1, 1).toLocaleString('en-NZ', {
        month: 'long',
        year: 'numeric',
      });
      return { monthKey, label, entries: monthEntries };
    });
}

const CHANGE_CODE_RE = /^CHG-(\d{4})-(\d{2})(\d{2})-(\d{3})$/;

function aucklandDayParts(iso: string): { year: string; ddmm: string } {
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return { year: get('year'), ddmm: `${get('day')}${get('month')}` };
}

/** Ensure every visible row uses [CHG-YYYY-DDMM-NNN] and no GitHub URLs. */
export function presentChangelogEntries(entries: ChangelogEntry[]): ChangelogEntry[] {
  const used = new Map<string, number>();
  const sorted = [...entries].sort(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
  );

  for (const entry of sorted) {
    const match = CHANGE_CODE_RE.exec(entry.id);
    if (!match) continue;
    const key = `${match[1]}-${match[2]}${match[3]}`;
    used.set(key, Math.max(used.get(key) ?? 0, Number(match[4])));
  }

  const presented = sorted.map((entry) => {
    const { year, ddmm } = aucklandDayParts(entry.changedAt);
    const dayKey = `${year}-${ddmm}`;
    let id = entry.id;
    const match = CHANGE_CODE_RE.exec(entry.id);
    const idMatchesDay = match && `${match[1]}-${match[2]}${match[3]}` === dayKey;
    if (!idMatchesDay) {
      const next = (used.get(dayKey) ?? 0) + 1;
      used.set(dayKey, next);
      id = `CHG-${year}-${ddmm}-${String(next).padStart(3, '0')}`;
    }
    const heading = locationForDisplay({
      area: entry.area,
      heading: entry.heading,
      summary: entry.summary,
      title: entry.title,
      id,
    });
    return {
      ...entry,
      id,
      title: `[${id}]`,
      heading,
      details: expandChangelogDetails(entry.details),
    };
  });

  return presented.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
}
