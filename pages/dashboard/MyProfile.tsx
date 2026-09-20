import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, UserCircle } from 'lucide-react';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { useAuth } from '../../context/AuthContext';
import { displayInitials, displayName } from '../../lib/constants';
import { supabase } from '../../lib/supabase';

export const MyProfile = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const securityPath = isAdmin ? '/admin/security' : '/dashboard/security';
  const roleLabel = user?.is_super_admin ? 'Super admin' : user?.role === 'admin' ? 'Admin' : 'Member';
  const [directory, setDirectory] = useState<{ img: string | null; staff_role: string | null } | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    void supabase
      .from('team_members')
      .select('img, staff_role')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setDirectory(data || null);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="My Profile"
        subtitle="Your signed-in account details."
        icon={<UserCircle size={28} />}
      />

      <div className="rounded-[16px] border border-white/60 bg-white/80 p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          {directory?.img ? (
            <img src={directory.img} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-lg font-semibold text-gold">
              {displayInitials(user)}
            </span>
          )}
          <div>
            <p className="text-lg font-semibold text-charcoal">{displayName(user)}</p>
            {directory?.staff_role ? (
              <p className="text-sm text-neutral">{directory.staff_role}</p>
            ) : null}
          </div>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-neutral">Name</dt>
            <dd className="mt-1 text-base text-charcoal">{displayName(user)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-neutral">Email</dt>
            <dd className="mt-1 text-base text-charcoal">{user?.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-neutral">Phone</dt>
            <dd className="mt-1 text-base text-charcoal">{user?.phone || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-neutral">Role</dt>
            <dd className="mt-1 text-base text-charcoal">{roleLabel}</dd>
          </div>
        </dl>

        <Link
          to={securityPath}
          className="mt-6 inline-flex items-center gap-2 rounded-[4px] bg-gold/15 px-4 py-2 text-sm font-semibold text-charcoal hover:bg-gold/25"
        >
          <Shield size={16} />
          User Security
        </Link>
      </div>
    </div>
  );
};
