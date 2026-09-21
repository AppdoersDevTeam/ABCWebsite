import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { useAuth } from '../../context/AuthContext';
import { displayInitials, displayName } from '../../lib/constants';
import { formatDdMmYyyy } from '../../lib/dateUtils';
import { supabase } from '../../lib/supabase';

type DirectoryFile = {
  img: string | null;
  staff_role: string | null;
  role: string | null;
  profile_type: string | null;
  description: string | null;
  is_baptised: boolean | null;
  baptism_date: string | null;
  membership_start_date: string | null;
  groups: string[];
  jobRoles: string[];
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral">{label}</dt>
      <dd className="mt-1 text-base text-charcoal">{value || '—'}</dd>
    </div>
  );
}

export const MyProfile = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const securityPath = isAdmin ? '/admin/security' : '/dashboard/security';
  const roleLabel = user?.is_super_admin ? 'Super admin' : user?.role === 'admin' ? 'Admin' : 'Member';
  const [directory, setDirectory] = useState<DirectoryFile | null>(null);
  const [authPhoto, setAuthPhoto] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    void Promise.all([
      supabase
        .from('team_members')
        .select(
          `
        img,
        staff_role,
        role,
        profile_type,
        description,
        is_baptised,
        baptism_date,
        membership_start_date,
        team_member_groups:team_member_groups(groups:groups(name)),
        team_member_job_roles:team_member_job_roles(job_roles:job_roles(name))
      `
        )
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase.auth.getUser(),
    ]).then(([{ data }, auth]) => {
        if (cancelled) return;
        const meta = auth.data.user?.user_metadata || {};
        setAuthPhoto(String(meta.avatar_url || meta.picture || ''));
        if (!data) {
          setDirectory(null);
          return;
        }
        const row = data as {
          img?: string | null;
          staff_role?: string | null;
          role?: string | null;
          profile_type?: string | null;
          description?: string | null;
          is_baptised?: boolean | null;
          baptism_date?: string | null;
          membership_start_date?: string | null;
          team_member_groups?: { groups?: { name?: string } | null }[] | null;
          team_member_job_roles?: { job_roles?: { name?: string } | null }[] | null;
        };
        setDirectory({
          img: row.img || null,
          staff_role: row.staff_role || null,
          role: row.role || null,
          profile_type: row.profile_type || null,
          description: row.description || null,
          is_baptised: row.is_baptised ?? null,
          baptism_date: row.baptism_date || null,
          membership_start_date: row.membership_start_date || null,
          groups: (row.team_member_groups || []).map((entry) => entry.groups?.name).filter((name): name is string => !!name),
          jobRoles: (row.team_member_job_roles || [])
            .map((entry) => entry.job_roles?.name)
            .filter((name): name is string => !!name),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const profileTypeLabel =
    directory?.profile_type === 'staff'
      ? 'Staff'
      : directory?.profile_type === 'member'
        ? 'Member'
        : directory?.profile_type === 'attendee'
          ? 'Attendee'
          : '';

  const avatarUrl = directory?.img || authPhoto || '';
  const initials = displayInitials(user);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="My Profile"
        subtitle="Your user file."
        icon={
          avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-semibold">{initials}</span>
          )
        }
      />

      <div className="rounded-[16px] border border-white/60 bg-white/80 p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/15 text-xl font-semibold text-gold">
              {initials}
            </span>
          )}
          <div>
            <p className="text-xl font-semibold text-charcoal">{displayName(user)}</p>
            {directory?.staff_role ? <p className="text-sm text-neutral">{directory.staff_role}</p> : null}
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={displayName(user)} />
          <Field label="Email" value={user?.email || ''} />
          <Field label="Phone" value={user?.phone || ''} />
          <Field label="Website role" value={roleLabel} />
          <Field label="Directory type" value={profileTypeLabel} />
          <Field label="Job title" value={directory?.staff_role || directory?.role || ''} />
          <Field label="Groups" value={directory?.groups.join(', ') || ''} />
          <Field label="Job roles" value={directory?.jobRoles.join(', ') || ''} />
          <Field
            label="Baptised"
            value={
              directory?.is_baptised == null ? '' : directory.is_baptised ? 'Yes' : 'No'
            }
          />
          <Field
            label="Baptism date"
            value={directory?.baptism_date ? formatDdMmYyyy(directory.baptism_date) : ''}
          />
          <Field
            label="Membership start"
            value={
              directory?.membership_start_date ? formatDdMmYyyy(directory.membership_start_date) : ''
            }
          />
        </dl>

        {directory?.description ? (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral">About</p>
            <p className="mt-1 whitespace-pre-wrap text-base text-charcoal">{directory.description}</p>
          </div>
        ) : null}

        <Link
          to={securityPath}
          className="mt-6 inline-flex items-center gap-2 rounded-[4px] bg-gold/15 px-4 py-2 text-sm font-semibold text-charcoal hover:bg-gold/25"
        >
          <Shield size={16} />
          Account Settings
        </Link>
      </div>
    </div>
  );
};
