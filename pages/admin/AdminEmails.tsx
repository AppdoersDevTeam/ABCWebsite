import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Mail, Users, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  emailTemplateLabel,
  fetchEmailSends,
  formatEmailWhen,
  summariseEmailSends,
  type EmailRecipientKind,
  type EmailSendRow,
} from '../../lib/emailSends';
import { getUserTimezone } from '../../lib/dateUtils';

type KindFilter = 'all' | EmailRecipientKind;

function PeriodPanel({
  title,
  total,
  users,
  leadership,
}: {
  title: string;
  total: number;
  users: number;
  leadership: number;
}) {
  return (
    <div className="h-full rounded-[12px] border border-gray-100 bg-white p-5 md:p-6 shadow-sm">
      <p className="text-[18px] font-semibold text-charcoal">{title}</p>
      <p className="mt-2 font-serif text-3xl text-charcoal leading-none">{total}</p>
      <p className="mt-3 text-sm text-neutral">emails sent</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-sky-50 px-3 py-2">
          <dt className="text-sky-800 font-semibold">Users</dt>
          <dd className="text-xl font-serif text-charcoal mt-1">{users}</dd>
        </div>
        <div className="rounded-lg bg-teal-50 px-3 py-2">
          <dt className="text-teal-800 font-semibold">Leadership</dt>
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
  const [isLoading, setIsLoading] = useState(true);
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');

  const load = useCallback(async () => {
    const data = await fetchEmailSends();
    setRows(data);
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
        subtitle="Every email the church website has sent to users and Leadership, from the first Resend messages through to new sends."
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

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'all', label: 'All', icon: <Mail size={14} /> },
            { id: 'user', label: 'Users', icon: <User size={14} /> },
            { id: 'leadership', label: 'Leadership', icon: <Users size={14} /> },
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
        <PeriodPanel title="Day" total={stats.day.total} users={stats.day.users} leadership={stats.day.leadership} />
        <PeriodPanel title="Week" total={stats.week.total} users={stats.week.users} leadership={stats.week.leadership} />
        <PeriodPanel title="Month" total={stats.month.total} users={stats.month.users} leadership={stats.month.leadership} />
      </div>

      <div className="rounded-[12px] border border-gray-100 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-[18px] font-semibold text-charcoal">All-time total</h2>
            <p className="text-sm text-neutral mt-1">
              {isLoading ? 'Loading…' : `${stats.allTime.total} email${stats.allTime.total === 1 ? '' : 's'} · ${stats.allTime.users} to users · ${stats.allTime.leadership} to Leadership`}
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
                        {row.recipient_kind === 'leadership' ? 'Leadership' : 'User'}
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
