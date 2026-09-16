import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Download,
  History,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  User,
  Wrench,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { useAuth } from '../../context/AuthContext';
import { CHURCH_NAME, isSuperAdminUser } from '../../lib/constants';
import { formatDateInTimezone, formatFullDateTimeInTimezone } from '../../lib/dateUtils';
import {
  CHANGELOG_AREA_LABELS,
  CHANGELOG_AREA_OPTIONS,
  CHANGELOG_ENTRIES,
  CHANGELOG_KIND_COLORS,
  CHANGELOG_KIND_LABELS,
  CHANGELOG_KIND_OPTIONS,
  filterChangelogEntries,
  groupChangelogByMonth,
  type ChangelogArea,
  type ChangelogEntry,
  type ChangelogKind,
} from '../../lib/changelog';
import { downloadChangelogCsv, downloadChangelogPdf } from '../../lib/exportChangelog';

/** Explicit dark text — Tailwind utilities have been unreliable on light admin surfaces. */
const TEXT_PRIMARY = '#222222';
const TEXT_MUTED = '#4b5563';

const FILTER_INPUT_CLASS =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40';

const KIND_DOT: Record<ChangelogKind, string> = {
  added: 'bg-emerald-500 ring-emerald-100',
  changed: 'bg-amber-500 ring-amber-100',
  fixed: 'bg-sky-500 ring-sky-100',
};

const KIND_ICON: Record<ChangelogKind, React.ReactNode> = {
  added: <Plus size={12} strokeWidth={2.5} aria-hidden="true" />,
  changed: <RefreshCw size={12} strokeWidth={2.5} aria-hidden="true" />,
  fixed: <Wrench size={12} strokeWidth={2.5} aria-hidden="true" />,
};

function formatChangelogWhen(iso: string, timezone?: string): string {
  return formatDateInTimezone(iso, timezone, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ChangelogEntryRow({
  entry,
  viewerTimezone,
  isLast,
}: {
  entry: ChangelogEntry;
  viewerTimezone?: string;
  isLast: boolean;
}) {
  const whenLabel = formatChangelogWhen(entry.changedAt, viewerTimezone);
  const whenFull = formatFullDateTimeInTimezone(entry.changedAt, viewerTimezone);

  return (
    <li className="relative flex gap-4 md:gap-5">
      <div className="relative flex w-5 shrink-0 flex-col items-center" aria-hidden="true">
        <span className={`mt-1.5 h-3.5 w-3.5 rounded-full ring-4 ${KIND_DOT[entry.kind]}`} />
        {!isLast && <span className="mt-1 w-px flex-1 bg-gray-200" />}
      </div>

      <article className={`min-w-0 flex-1 pb-8 ${isLast ? 'pb-2' : ''}`} style={{ color: TEXT_PRIMARY }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <h3
            className="text-base md:text-lg font-bold leading-snug tracking-tight"
            style={{ color: TEXT_PRIMARY }}
          >
            {entry.title}
          </h3>
          <span
            className={`inline-flex items-center gap-1.5 self-start shrink-0 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${CHANGELOG_KIND_COLORS[entry.kind]}`}
          >
            {KIND_ICON[entry.kind]}
            {CHANGELOG_KIND_LABELS[entry.kind]}
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed max-w-3xl" style={{ color: TEXT_MUTED }}>
          {entry.summary}
        </p>

        {entry.details && entry.details.length > 0 && (
          <ul className="mt-3 space-y-1.5 border-l-2 border-gold/40 pl-3">
            {entry.details.map((detail) => (
              <li key={detail} className="text-sm leading-relaxed" style={{ color: TEXT_PRIMARY }}>
                {detail}
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs" style={{ color: TEXT_MUTED }}>
          <div className="inline-flex items-center gap-1.5 min-w-0">
            <Calendar size={13} className="shrink-0 text-gold" aria-hidden="true" />
            <dt className="sr-only">When</dt>
            <dd>
              <time dateTime={entry.changedAt} title={whenFull}>
                {whenLabel}
              </time>
            </dd>
          </div>
          <div className="inline-flex items-center gap-1.5 min-w-0">
            <User size={13} className="shrink-0 text-gold" aria-hidden="true" />
            <dt className="sr-only">Changed by</dt>
            <dd className="truncate font-medium" style={{ color: TEXT_PRIMARY }}>
              {entry.changedBy}
            </dd>
          </div>
          <div className="inline-flex items-center gap-1.5 min-w-0">
            <MapPin size={13} className="shrink-0 text-gold" aria-hidden="true" />
            <dt className="sr-only">Area</dt>
            <dd>{CHANGELOG_AREA_LABELS[entry.area]}</dd>
          </div>
        </dl>
      </article>
    </li>
  );
}

export const AdminChangelog = () => {
  const { user } = useAuth();
  const viewerTimezone = user?.user_timezone;
  const [kindFilter, setKindFilter] = useState<ChangelogKind | ''>('');
  const [areaFilter, setAreaFilter] = useState<ChangelogArea | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = useMemo(
    () =>
      filterChangelogEntries(CHANGELOG_ENTRIES, {
        kind: kindFilter,
        area: areaFilter,
        search: searchQuery,
      }),
    [kindFilter, areaFilter, searchQuery]
  );

  const monthGroups = useMemo(() => groupChangelogByMonth(filteredEntries), [filteredEntries]);

  const exportFilterSummary = useMemo(() => {
    const parts: string[] = [];
    if (kindFilter) parts.push(`Type: ${CHANGELOG_KIND_LABELS[kindFilter]}`);
    if (areaFilter) parts.push(`Area: ${CHANGELOG_AREA_LABELS[areaFilter]}`);
    if (searchQuery.trim()) parts.push(`Search: ${searchQuery.trim()}`);
    return parts.join(' · ');
  }, [kindFilter, areaFilter, searchQuery]);

  const filenameBase = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `abc-changelog-${yyyy}-${mm}-${dd}`;
  }, []);

  const exportMeta = () => ({
    churchName: CHURCH_NAME,
    exportedAt: new Date(),
    filterSummary: exportFilterSummary || undefined,
    viewerTimezone,
  });

  if (!isSuperAdminUser(user)) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="space-y-6 pb-12" style={{ color: TEXT_PRIMARY }}>
      <AdminPageHeader
        title="Changelog"
        subtitle="Product history of everything that has been changed on the website."
        icon={<History size={28} className="text-gold" />}
        rightSlot={
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => downloadChangelogCsv(filteredEntries, filenameBase, exportMeta())}
              disabled={filteredEntries.length === 0}
              className="bg-white border-2 border-gray-200 px-4 py-2 rounded-[4px] font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
              style={{ color: TEXT_PRIMARY }}
              title="Download Excel (CSV) for the filtered list"
            >
              <Download size={16} />
              Excel
            </button>
            <button
              type="button"
              onClick={() => downloadChangelogPdf(filteredEntries, filenameBase, exportMeta())}
              disabled={filteredEntries.length === 0}
              className="bg-white border-2 border-gray-200 px-4 py-2 rounded-[4px] font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
              style={{ color: TEXT_PRIMARY }}
              title="Download PDF for the filtered list"
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        }
      />

      <div className="glass-card bg-white border border-gray-100 rounded-[12px] overflow-hidden" style={{ color: TEXT_PRIMARY }}>
        <div className="p-4 md:p-5 border-b border-gray-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="changelog-kind"
                className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                style={{ color: TEXT_MUTED }}
              >
                Type
              </label>
              <select
                id="changelog-kind"
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value as ChangelogKind | '')}
                className={FILTER_INPUT_CLASS}
                style={{ color: TEXT_PRIMARY }}
              >
                {CHANGELOG_KIND_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all-kinds'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="changelog-area"
                className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                style={{ color: TEXT_MUTED }}
              >
                Area
              </label>
              <select
                id="changelog-area"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value as ChangelogArea | '')}
                className={FILTER_INPUT_CLASS}
                style={{ color: TEXT_PRIMARY }}
              >
                {CHANGELOG_AREA_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all-areas'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="changelog-search"
                className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                style={{ color: TEXT_MUTED }}
              >
                Search
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold" />
                <input
                  id="changelog-search"
                  type="search"
                  placeholder="Title, summary, user, or area…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${FILTER_INPUT_CLASS} pl-9 pr-3`}
                  style={{ color: TEXT_PRIMARY }}
                />
              </div>
            </div>
          </div>
          <p className="text-xs" style={{ color: TEXT_MUTED }}>
            {filteredEntries.length} change{filteredEntries.length === 1 ? '' : 's'}
            {filteredEntries.length !== CHANGELOG_ENTRIES.length ? ` of ${CHANGELOG_ENTRIES.length}` : ''}
          </p>
        </div>

        {monthGroups.length === 0 ? (
          <div className="p-10 text-center">
            <History size={36} className="mx-auto text-gold/60 mb-3" />
            <p className="font-bold" style={{ color: TEXT_PRIMARY }}>
              No matching changes
            </p>
            <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: TEXT_MUTED }}>
              Try a different type, area, or search term.
            </p>
          </div>
        ) : (
          <div className="p-4 md:p-8 space-y-10">
            {monthGroups.map((group) => (
              <div
                key={group.monthKey}
                role="region"
                aria-labelledby={`changelog-${group.monthKey}`}
                data-no-reveal
              >
                <div className="mb-5 flex items-baseline justify-between gap-3 border-b border-gray-100 pb-2">
                  <h2
                    id={`changelog-${group.monthKey}`}
                    className="text-sm font-bold uppercase tracking-[0.14em]"
                    style={{ color: TEXT_PRIMARY }}
                  >
                    {group.label}
                  </h2>
                  <span className="text-xs tabular-nums" style={{ color: TEXT_MUTED }}>
                    {group.entries.length} update{group.entries.length === 1 ? '' : 's'}
                  </span>
                </div>

                <ol className="ml-0.5">
                  {group.entries.map((entry, index) => (
                    <ChangelogEntryRow
                      key={entry.id}
                      entry={entry}
                      viewerTimezone={viewerTimezone}
                      isLast={index === group.entries.length - 1}
                    />
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
