import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollText, Search, Download, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { StyledSelect } from '../../components/UI/StyledSelect';
import { supabase } from '../../lib/supabase';
import type { AuditLog, AuditLogCategory } from '../../types';
import { formatFullDateTimeInTimezone } from '../../lib/dateUtils';
import { downloadAuditLogsCsv } from '../../lib/exportAuditLogs';
import { SkeletonPageHeader } from '../../components/UI/Skeleton';

const PAGE_SIZE = 50;

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All categories' },
  { value: 'auth', label: 'Auth' },
  { value: 'users', label: 'Users' },
  { value: 'events', label: 'Events' },
  { value: 'team', label: 'Directory / Team' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'roster', label: 'Roster' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'settings', label: 'Settings' },
  { value: 'rsvp', label: 'RSVP' },
  { value: 'photos', label: 'Photos' },
  { value: 'system', label: 'System' },
];

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All actions' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'approve', label: 'Approve' },
  { value: 'reject', label: 'Reject' },
  { value: 'login', label: 'Login' },
  { value: 'login_failed', label: 'Login failed' },
  { value: 'logout', label: 'Logout' },
  { value: 'signup', label: 'Signup' },
  { value: 'archive', label: 'Archive' },
  { value: 'unarchive', label: 'Unarchive' },
  { value: 'link', label: 'Link' },
  { value: 'unlink', label: 'Unlink' },
  { value: 'pray', label: 'Pray' },
];

const CATEGORY_COLORS: Record<string, string> = {
  auth: 'bg-purple-100 text-purple-800',
  users: 'bg-blue-100 text-blue-800',
  events: 'bg-amber-100 text-amber-900',
  team: 'bg-teal-100 text-teal-800',
  prayer: 'bg-rose-100 text-rose-800',
  roster: 'bg-indigo-100 text-indigo-800',
  newsletter: 'bg-cyan-100 text-cyan-800',
  settings: 'bg-gray-100 text-gray-800',
  rsvp: 'bg-green-100 text-green-800',
  photos: 'bg-orange-100 text-orange-800',
  system: 'bg-slate-100 text-slate-700',
};

const CATEGORY_LABELS: Record<string, string> = {
  auth: 'Auth',
  users: 'Users',
  events: 'Events',
  team: 'Team',
  prayer: 'Prayer',
  roster: 'Roster',
  newsletter: 'Newsletter',
  settings: 'Settings',
  rsvp: 'RSVP',
  photos: 'Photos',
  system: 'System',
};

function actorDisplay(log: AuditLog): string {
  if (log.actor_label) return log.actor_label;
  if (log.actor_email) return log.actor_email;
  if (log.actor_role === 'anonymous') return 'Visitor';
  if (log.actor_role === 'system') return 'System';
  return '—';
}

function roleLabel(role: string): string {
  if (role === 'admin') return 'Admin';
  if (role === 'member') return 'Member';
  if (role === 'anonymous') return 'Visitor';
  if (role === 'system') return 'System';
  return role;
}

function actionLabel(action: string): string {
  return action.replace(/_/g, ' ');
}

function DetailsPanel({ details }: { details?: Record<string, unknown> }) {
  if (!details || Object.keys(details).length === 0) {
    return <span className="text-sm text-neutral italic">No additional details.</span>;
  }
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
      {Object.entries(details).map(([key, value]) => (
        <div key={key} className="min-w-0">
          <dt className="text-neutral font-medium capitalize text-xs">{key.replace(/_/g, ' ')}</dt>
          <dd className="text-charcoal break-words">
            {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export const AdminLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = useCallback(async (pageNum: number, append: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageNum * PAGE_SIZE, pageNum * PAGE_SIZE + PAGE_SIZE - 1);

      if (categoryFilter) query = query.eq('category', categoryFilter);
      if (actionFilter) query = query.eq('action', actionFilter);
      if (dateFrom) query = query.gte('created_at', new Date(dateFrom).toISOString());
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query = query.lte('created_at', end.toISOString());
      }
      if (searchQuery.trim()) {
        const q = `%${searchQuery.trim()}%`;
        query = query.or(`summary.ilike.${q},actor_email.ilike.${q},actor_label.ilike.${q}`);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const rows = (data || []) as AuditLog[];
      setLogs((prev) => (append ? [...prev, ...rows] : rows));
      setHasMore(rows.length === PAGE_SIZE);
    } catch (e: unknown) {
      console.error('AdminLogs fetch error:', e);
      setError(e instanceof Error ? e.message : 'Failed to load logs');
      if (!append) setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, actionFilter, searchQuery, dateFrom, dateTo]);

  useEffect(() => {
    setPage(0);
    void fetchLogs(0, false);
  }, [fetchLogs]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    void fetchLogs(next, true);
  };

  const handleRefresh = () => {
    setPage(0);
    setExpandedId(null);
    void fetchLogs(0, false);
  };

  const handleExport = async () => {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000);

      if (categoryFilter) query = query.eq('category', categoryFilter);
      if (actionFilter) query = query.eq('action', actionFilter);
      if (dateFrom) query = query.gte('created_at', new Date(dateFrom).toISOString());
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query = query.lte('created_at', end.toISOString());
      }
      if (searchQuery.trim()) {
        const q = `%${searchQuery.trim()}%`;
        query = query.or(`summary.ilike.${q},actor_email.ilike.${q},actor_label.ilike.${q}`);
      }

      const { data, error: exportError } = await query;
      if (exportError) throw exportError;
      const stamp = new Date().toISOString().slice(0, 10);
      downloadAuditLogsCsv((data || []) as AuditLog[], `abc-audit-logs-${stamp}`);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Export failed');
    }
  };

  const resultSummary = useMemo(() => {
    if (isLoading && logs.length === 0) return '';
    return `${logs.length}${hasMore ? '+' : ''} log${logs.length === 1 ? '' : 's'}`;
  }, [logs.length, hasMore, isLoading]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="System Logs"
        subtitle="Security and compliance audit trail for all significant activity on the website."
        icon={<ScrollText size={28} className="text-gold" />}
        rightSlot={
          <div className="flex flex-wrap gap-2">
            <GlowingButton variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </GlowingButton>
            <GlowingButton variant="outline" onClick={() => void handleExport()}>
              <Download size={16} />
              Export CSV
            </GlowingButton>
          </div>
        }
      />

      <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] overflow-hidden">
        <div className="p-4 md:p-5 border-b border-gray-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <StyledSelect
              label="Category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={CATEGORY_OPTIONS}
            />
            <StyledSelect
              label="Action"
              value={actionFilter}
              onChange={setActionFilter}
              options={ACTION_OPTIONS}
            />
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral mb-1.5">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral mb-1.5">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral mb-1.5">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral" />
                <input
                  type="search"
                  placeholder="Summary or email…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/40"
                />
              </div>
            </div>
          </div>
          {resultSummary && <p className="text-xs text-neutral">{resultSummary}</p>}
        </div>

        {error && (
          <div className="mx-4 md:mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
            {error.toLowerCase().includes('audit_logs') && (
              <p className="mt-1 text-red-700">Run CREATE_AUDIT_LOGS_TABLE.sql in Supabase if the table is missing.</p>
            )}
          </div>
        )}

        {isLoading && logs.length === 0 ? (
          <div className="p-6 space-y-3">
            <SkeletonPageHeader />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center">
            <ScrollText size={36} className="mx-auto text-gold/60 mb-3" />
            <p className="font-bold text-charcoal">No logs yet</p>
            <p className="text-neutral text-sm mt-2 max-w-md mx-auto">
              Activity is recorded from when this feature was enabled.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-white/60 sticky top-0 z-10">
                  <tr className="border-b border-gray-200">
                    <th className="w-8 px-2 py-2.5" aria-hidden="true" />
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral whitespace-nowrap">
                      When
                    </th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral whitespace-nowrap">
                      Category
                    </th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral whitespace-nowrap">
                      Action
                    </th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral min-w-[240px]">
                      Summary
                    </th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral whitespace-nowrap">
                      Actor
                    </th>
                    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral whitespace-nowrap">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => {
                    const isExpanded = expandedId === log.id;
                    const cat = log.category as AuditLogCategory;
                    const badgeClass = CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-700';
                    const hasDetails = log.details && Object.keys(log.details).length > 0;
                    return (
                      <React.Fragment key={log.id}>
                        <tr
                          className={`border-b border-gray-100 transition-colors cursor-pointer hover:bg-gold/5 ${
                            isExpanded ? 'bg-gold/10' : idx % 2 === 0 ? 'bg-white/40' : 'bg-white/20'
                          }`}
                          onClick={() => toggleExpand(log.id)}
                        >
                          <td className="px-2 py-2 text-neutral">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </td>
                          <td
                            className="px-3 py-2 text-charcoal whitespace-nowrap tabular-nums"
                            title={formatFullDateTimeInTimezone(log.created_at)}
                          >
                            {formatFullDateTimeInTimezone(log.created_at)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeClass}`}
                            >
                              {CATEGORY_LABELS[cat] || log.category}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-neutral whitespace-nowrap capitalize">
                            {actionLabel(log.action)}
                          </td>
                          <td className="px-3 py-2 text-charcoal font-medium leading-snug max-w-md">
                            <span className="line-clamp-2">{log.summary}</span>
                          </td>
                          <td className="px-3 py-2 text-charcoal whitespace-nowrap max-w-[160px] truncate" title={actorDisplay(log)}>
                            {actorDisplay(log)}
                          </td>
                          <td className="px-3 py-2 text-neutral whitespace-nowrap">
                            {roleLabel(log.actor_role)}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="border-b border-gray-100 bg-gray-50/80">
                            <td colSpan={7} className="px-4 py-3">
                              <div className="text-xs text-neutral mb-2 flex flex-wrap gap-x-4 gap-y-1">
                                {log.actor_email && log.actor_label && (
                                  <span>Email: {log.actor_email}</span>
                                )}
                                {log.entity_type && (
                                  <span>
                                    Entity: {log.entity_type}
                                    {log.entity_id ? ` · ${log.entity_id}` : ''}
                                  </span>
                                )}
                              </div>
                              {hasDetails ? (
                                <DetailsPanel details={log.details} />
                              ) : (
                                <span className="text-sm text-neutral italic">No additional details.</span>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div className="flex justify-center border-t border-gray-100 p-4">
                <GlowingButton variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                  {isLoading ? 'Loading…' : 'Load more'}
                </GlowingButton>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
