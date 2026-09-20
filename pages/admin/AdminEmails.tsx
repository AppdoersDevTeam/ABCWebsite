import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Mail, Users, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  EMAIL_QUOTA_TIMEZONE,
  emailQuotaBlockedMessage,
  emailQuotaNearLimit,
  emailTemplateLabel,
  fetchEmailQuotaStatus,
  fetchEmailSends,
  formatEmailQuotaUsed,
  formatEmailWhen,
  summariseEmailSends,
  type EmailQuotaStatus,
  type EmailRecipientKind,
  type EmailSendRow,
} from '../../lib/emailSends';
import { getUserTimezone } from '../../lib/dateUtils';
import { PEOPLE_LABEL } from '../../lib/constants';

type KindFilter = 'all' | EmailRecipientKind;

function PeriodPanel({
  title,
  total,
  users,
  leadership,
  limit,
  remaining,
  timezoneNote,
}: {
  title: string;
  total: number;
  users: number;
  leadership: number;
  limit?: number;
  remaining?: number;
  timezoneNote?: string;
}) {
  const capped = typeof limit === 'number';
  const pct = capped && limit > 0 ? Math.min(100, (total / limit) * 100) : 0;
  const atCap = capped && total >= limit;
  const near = capped && typeof remaining === 'number' && remaining <= Math.max(5, Math.floor(limit * 0.2));

  return (
    <div
      className={`h-full rounded-[12px] border bg-white p-5 md:p-6 shadow-sm ${
        atCap ? 'border-red-200' : near ? 'border-amber-200' : 'border-gray-100'
      }`}
    >
      <p className="text-[18px] font-semibold text-charcoal">{title}</p>
      <p className="mt-2 font-serif text-3xl text-charcoal leading-none">
        {capped ? formatEmailQuotaUsed(total, limit) : total}
      </p>
      <p className="mt-3 text-sm text-neutral">
        {capped
          ? atCap
            ? 'limit reached'
            : `${remaining} remaining`
          : 'emails sent'}
      </p>
      {capped ? (
        <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden" aria-hidden>
          <div
            className={`h-full rounded-full ${atCap ? 'bg-red-500' : near ? 'bg-amber-500' : 'bg-gold'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
      {timezoneNote ? <p className="mt-2 text-xs text-neutral">{timezoneNote}</p> : null}
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-sky-50 px-3 py-2">
          <dt className="text-sky-800 font-semibold">Users</dt>
          <dd className="text-xl font-serif text-charcoal mt-1">{users}</dd>
        </div>
        <div className="rounded-lg bg-teal-50 px-3 py-2">
          <dt className="text-teal-800 font-semibold">{PEOPLE_LABEL}</dt>
          <dd className="text-xl font-serif text-charcoal mt-1">{leadership}</dd>
        </div>
      </dl>
    </div>
  );
}

export const AdminEmails = () => {
  const { user } = useAuth();
  const timeZone = user?.user_timezone || getUserTimezone();
  const [rows, setRows] = useState<EmailSendRow[]>([]);
  const [quota, setQuota] = useState<EmailQuotaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');

  const load = useCallback(async () => {
    const [data, nextQuota] = await Promise.all([fetchEmailSends(), fetchEmailQuotaStatus()]);
    setRows(data);
    setQuota(nextQuota);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-email-sends')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'email_sends' }, () => {
        void load();
      })
      .subscribe();

    const onVisible = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  const filtered = useMemo(
    () => (kindFilter === 'all' ? rows : rows.filter((row) => row.recipient_kind === kindFilter)),
    [rows, kindFilter]
  );

  const stats = useMemo(() => summariseEmailSends(filtered, timeZone), [filtered, timeZone]);

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        title="Emails sent"
        subtitle={`Every email the church website has sent to users and ${PEOPLE_LABEL}. Daily and monthly limits use New Zealand time.`}
        icon={<Mail size={28} />}
        rightSlot={
          <Link
            to="/admin"
            className="bg-white border-2 border-gray-200 px-4 py-2 rounded-[4px] font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 text-sm text-charcoal"
          >
            <ArrowLeft size={16} />
            Overview
          </Link>
        }
      />

      {quota?.blocked ? (
        <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-semibold">Email sending is paused</p>
          <p className="mt-1">{emailQuotaBlockedMessage(quota)}</p>
        </div>
      ) : quota && emailQuotaNearLimit(quota) ? (
        <div className="rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          The church email allowance is getting low: {formatEmailQuotaUsed(quota.day_count, quota.day_limit)} today and{' '}
          {formatEmailQuotaUsed(quota.month_count, quota.month_limit)} this month ({EMAIL_QUOTA_TIMEZONE.replace('_', ' ')}).
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'all', label: 'All', icon: <Mail size={14} /> },
            { id: 'user', label: 'Users', icon: <User size={14} /> },
            { id: 'leadership', label: PEOPLE_LABEL, icon: <Users size={14} /> },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setKindFilter(opt.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              kindFilter === opt.id
                ? 'bg-gold text-charcoal border-gold'
                : 'bg-white text-charcoal border-gray-200 hover:border-gold'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <PeriodPanel
          title="Day"
          total={quota?.day_count ?? stats.day.total}
          users={stats.day.users}
          leadership={stats.day.leadership}
          limit={quota?.day_limit}
          remaining={quota?.day_remaining}
          timezoneNote="New Zealand time · 50 per day"
        />
        <PeriodPanel title="Week" total={stats.week.total} users={stats.week.users} leadership={stats.week.leadership} />
        <PeriodPanel
          title="Month"
          total={quota?.month_count ?? stats.month.total}
          users={stats.month.users}
          leadership={stats.month.leadership}
          limit={quota?.month_limit}
          remaining={quota?.month_remaining}
          timezoneNote="New Zealand time · 1,000 per month"
        />
      </div>

      <div className="rounded-[12px] border border-gray-100 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-[18px] font-semibold text-charcoal">All-time total</h2>
            <p className="text-sm text-neutral mt-1">
              {isLoading ? 'Loading…' : `${stats.allTime.total} email${stats.allTime.total === 1 ? '' : 's'} · ${stats.allTime.users} to users · ${stats.allTime.leadership} to ${PEOPLE_LABEL}`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-neutral py-8">Loading emails…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-neutral py-8">No emails in this view yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-neutral">
                  <th className="py-2 pr-4 font-semibold">When</th>
                  <th className="py-2 pr-4 font-semibold">To</th>
                  <th className="py-2 pr-4 font-semibold">Audience</th>
                  <th className="py-2 font-semibold">What was sent</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 text-sm text-charcoal whitespace-nowrap">
                      {formatEmailWhen(row.sent_at, timeZone)}
                    </td>
                    <td className="py-3 pr-4 text-sm text-charcoal break-all">{row.recipient_email}</td>
                    <td className="py-3 pr-4 text-sm">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          row.recipient_kind === 'leadership'
                            ? 'bg-teal-50 text-teal-800'
                            : 'bg-sky-50 text-sky-800'
                        }`}
                      >
                        {row.recipient_kind === 'leadership' ? PEOPLE_LABEL : 'User'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-charcoal">
                      <span className="font-medium">{emailTemplateLabel(row.template_key)}</span>
                      {row.subject ? (
                        <span className="block text-neutral mt-0.5">{row.subject}</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
