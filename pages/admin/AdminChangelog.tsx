import React, { useMemo, useState } from 'react';
import { Download, History, Search } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { useAuth } from '../../context/AuthContext';
import { CHURCH_NAME, isSuperAdminUser } from '../../lib/constants';
import { formatFullDateTimeInTimezone } from '../../lib/dateUtils';
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
  type ChangelogKind,
} from '../../lib/changelog';
import { downloadChangelogCsv, downloadChangelogPdf } from '../../lib/exportChangelog';

const FILTER_INPUT_CLASS =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/40';

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
    <div className="space-y-6 pb-12">
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
              className="bg-white border-2 border-gray-200 text-charcoal px-4 py-2 rounded-[4px] font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
              title="Download Excel (CSV) for the filtered list"
            >
              <Download size={16} />
              Excel
            </button>
            <button
              type="button"
              onClick={() => downloadChangelogPdf(filteredEntries, filenameBase, exportMeta())}
              disabled={filteredEntries.length === 0}
              className="bg-white border-2 border-gray-200 text-charcoal px-4 py-2 rounded-[4px] font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
              title="Download PDF for the filtered list"
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        }
      />

      <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] overflow-hidden">
        <div className="p-4 md:p-5 border-b border-gray-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label htmlFor="changelog-kind" className="block text-xs font-bold uppercase tracking-wider text-neutral mb-1.5">
                Type
              </label>
              <select
                id="changelog-kind"
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value as ChangelogKind | '')}
                className={FILTER_INPUT_CLASS}
              >
                {CHANGELOG_KIND_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all-kinds'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="changelog-area" className="block text-xs font-bold uppercase tracking-wider text-neutral mb-1.5">
                Area
              </label>
              <select
                id="changelog-area"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value as ChangelogArea | '')}
                className={FILTER_INPUT_CLASS}
              >
                {CHANGELOG_AREA_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all-areas'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="changelog-search" className="block text-xs font-bold uppercase tracking-wider text-neutral mb-1.5">
                Search
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral" />
                <input
                  id="changelog-search"
                  type="search"
                  placeholder="Title, summary, user, or area…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${FILTER_INPUT_CLASS} pl-9 pr-3`}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral">
            {filteredEntries.length} change{filteredEntries.length === 1 ? '' : 's'}
            {filteredEntries.length !== CHANGELOG_ENTRIES.length ? ` of ${CHANGELOG_ENTRIES.length}` : ''}
          </p>
        </div>

        {monthGroups.length === 0 ? (
          <div className="p-10 text-center">
            <History size={36} className="mx-auto text-gold/60 mb-3" />
            <p className="font-bold text-charcoal">No matching changes</p>
            <p className="text-neutral text-sm mt-2 max-w-md mx-auto">
              Try a different type, area, or search term.
            </p>
          </div>
        ) : (
          <div className="p-4 md:p-6 space-y-10">
            {monthGroups.map((group) => (
              <section key={group.monthKey} aria-labelledby={`changelog-${group.monthKey}`}>
                <h2
                  id={`changelog-${group.monthKey}`}
                  className="text-lg font-serif font-normal text-gold mb-4"
                >
                  {group.label}
                </h2>
                <ol className="space-y-4">
                  {group.entries.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-[12px] border border-gray-100 bg-white/70 p-4 md:p-5"
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2 text-xs text-neutral">
                        <time
                          dateTime={entry.changedAt}
                          className="tabular-nums whitespace-nowrap"
                          title={formatFullDateTimeInTimezone(entry.changedAt, viewerTimezone)}
                        >
                          {formatFullDateTimeInTimezone(entry.changedAt, viewerTimezone)}
                        </time>
                        <span className="text-charcoal font-medium whitespace-nowrap">
                          by {entry.changedBy}
                        </span>
                        <span
                          className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${CHANGELOG_KIND_COLORS[entry.kind]}`}
                        >
                          {CHANGELOG_KIND_LABELS[entry.kind]}
                        </span>
                        <span className="inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {CHANGELOG_AREA_LABELS[entry.area]}
                        </span>
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-charcoal">{entry.title}</h3>
                      <p className="mt-1 text-sm text-neutral leading-relaxed">{entry.summary}</p>
                      {entry.details && entry.details.length > 0 && (
                        <ul className="mt-3 text-sm text-charcoal space-y-1.5 list-disc list-inside marker:text-gold">
                          {entry.details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
