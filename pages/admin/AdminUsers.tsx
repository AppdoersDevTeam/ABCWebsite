import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, UserCheck, X, Shield, ShieldOff, Ban, Crown, KeyRound, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { displayName, displayInitial } from '../../lib/constants';
import { User } from '../../types';
import { CreateUserProfile } from './CreateUserProfile';
import { LinkDirectoryUserModal } from './LinkDirectoryUserModal';
import { SkeletonPageHeader, SkeletonStatsCard, SkeletonUserCard } from '../../components/UI/Skeleton';
import { formatRelativeDateInTimezone } from '../../lib/dateUtils';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { GlowingButton } from '../../components/UI/GlowingButton';

export const AdminUsers = () => {
  const { user, sendPasswordReset } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'admins'>('all');
  const [directoryByUserId, setDirectoryByUserId] = useState<
    Record<string, { id: string; created_from_user_sync?: boolean | null }>
  >({});
  const [linkModalUser, setLinkModalUser] = useState<User | null>(null);
  const [isRelinking, setIsRelinking] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    console.log('AdminUsers - fetchUsers called');
    setIsLoadingUsers(true);
    try {
      console.log('AdminUsers - Making Supabase query for all users');
      
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('AdminUsers - All users in database:', allUsers);
      if (allUsersError) {
        console.error('AdminUsers - Error fetching all users:', allUsersError);
        throw allUsersError;
      }

      const { data: pendingData, error: pendingError } = await supabase
        .from('users')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (pendingError) {
        console.error('AdminUsers - Error fetching pending users:', pendingError);
      }

      const list = allUsers || [];
      setAllUsers(list);
      setPendingUsers(pendingData || []);
      setPendingCount(pendingData?.length || 0);
      console.log('AdminUsers - Set users:', allUsers?.length || 0);

      const ids = list.map((u) => u.id).filter(Boolean);
      if (ids.length) {
        const { data: dirRows, error: dirErr } = await supabase
          .from('team_members')
          .select('id,user_id,created_from_user_sync')
          .in('user_id', ids);
        if (dirErr) {
          console.warn('AdminUsers - directory link lookup failed (run ADD_TEAM_MEMBERS_USER_ID.sql):', dirErr);
          setDirectoryByUserId({});
        } else {
          const map: Record<string, { id: string; created_from_user_sync?: boolean | null }> = {};
          (dirRows || []).forEach((r: any) => {
            if (r.user_id) {
              map[r.user_id] = { id: r.id, created_from_user_sync: r.created_from_user_sync };
            }
          });
          setDirectoryByUserId(map);
        }
      } else {
        setDirectoryByUserId({});
      }
    } catch (error) {
      console.error('AdminUsers - Error fetching users:', error);
      setAllUsers([]);
      setPendingUsers([]);
      setPendingCount(0);
      setDirectoryByUserId({});
    } finally {
      setIsLoadingUsers(false);
      console.log('AdminUsers - fetchUsers completed');
    }
  };

  const handleApproveUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to approve this user?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_approved: true })
        .eq('id', userId);

      if (error) throw error;
      alert('User approved successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to reject this user? They will need to sign up again.')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;
      alert('User rejected and removed');
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user');
    }
  };

  const handleRevokeApproval = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to revoke approval for ${userName}? They will lose access to the website.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_approved: false })
        .eq('id', userId);

      if (error) throw error;
      alert('User approval revoked successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error revoking approval:', error);
      alert('Failed to revoke approval');
    }
  };

  const handleMakeAdmin = async (userId: string, userName: string) => {
    if (!window.confirm(`Make ${userName} an admin? They will be able to access the admin dashboard.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin', is_approved: true })
        .eq('id', userId);

      if (error) throw error;
      alert(`${userName} is now an admin`);
      fetchUsers();
    } catch (error) {
      console.error('Error making user admin:', error);
      alert('Failed to make user an admin');
    }
  };

  const handleRevokeAdmin = async (userId: string, userName: string) => {
    if (!window.confirm(`Revoke admin rights from ${userName}? They will become a regular member.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'member' })
        .eq('id', userId);

      if (error) throw error;
      alert(`${userName} is now a member`);
      fetchUsers();
    } catch (error) {
      console.error('Error revoking admin:', error);
      alert('Failed to revoke admin rights');
    }
  };

  const handleSendPasswordReset = async (email: string | null | undefined) => {
    const normalizedEmail = (email || '').trim();
    if (!normalizedEmail) {
      alert('This user does not have an email address on file.');
      return;
    }

    if (!window.confirm(`Send password reset link to ${normalizedEmail}?`)) {
      return;
    }

    try {
      await sendPasswordReset(normalizedEmail);
      alert('Password reset email sent. Ask the user to check their inbox.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      alert('Failed to send password reset email');
    }
  };

  const isSuperAdmin = user?.is_super_admin === true;

  const formatDate = (dateString: string | undefined, userTimezone?: string) => {
    // For admin views, display dates in the admin's current timezone
    return formatRelativeDateInTimezone(dateString, userTimezone);
  };

  const directoryNeedsReviewCount = useMemo(() => {
    return allUsers.filter((u) => !directoryByUserId[u.id]).length;
  }, [allUsers, directoryByUserId]);

  const tryAutoLinkDirectoryForUser = async (u: User): Promise<boolean> => {
    const emailNorm = (u.email || '').trim().toLowerCase();
    if (!emailNorm) return false;

    // If already linked (based on current state), skip.
    if (directoryByUserId[u.id]) return true;

    const { data: byEmail, error } = await supabase
      .from('team_members')
      .select('id,name,user_id')
      .ilike('email', emailNorm);

    if (error) {
      console.warn('AdminUsers - auto-link lookup failed', error);
      return false;
    }

    const rows = (byEmail || []) as Array<{ id: string; name: string; user_id: string | null }>;
    if (rows.some((r) => r.user_id && r.user_id !== u.id)) {
      // Email already linked to another user; leave as needs-review.
      return false;
    }

    const unlinked = rows.filter((r) => !r.user_id);
    if (unlinked.length === 1) {
      const { error: updErr } = await supabase.from('team_members').update({ user_id: u.id }).eq('id', unlinked[0].id);
      if (updErr) {
        console.warn('AdminUsers - auto-link update failed', updErr);
        return false;
      }
      return true;
    }

    // If multiple candidates, only auto-link on exact name match when unique.
    const nameNorm = displayName(u).trim().toLowerCase().replace(/\s+/g, ' ');
    const nameMatches = unlinked.filter(
      (r) => (r.name || '').trim().toLowerCase().replace(/\s+/g, ' ') === nameNorm
    );
    if (nameMatches.length === 1) {
      const { error: updErr } = await supabase.from('team_members').update({ user_id: u.id }).eq('id', nameMatches[0].id);
      if (updErr) {
        console.warn('AdminUsers - auto-link update failed', updErr);
        return false;
      }
      return true;
    }

    return false;
  };

  const recheckDirectoryLinks = async () => {
    setIsRelinking(true);
    try {
      const candidates = allUsers.filter((u) => !directoryByUserId[u.id] && !!(u.email || '').trim());
      if (candidates.length === 0) {
        alert('All users with emails are already linked (or require manual review).');
        return;
      }

      // Do a safe best-effort pass; keep it sequential to avoid hammering Supabase.
      let linked = 0;
      for (const u of candidates) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await tryAutoLinkDirectoryForUser(u);
        if (ok) linked += 1;
      }
      await fetchUsers();
      alert(linked > 0 ? `Linked ${linked} user(s) to Directory.` : 'No safe matches found. Manual linking required.');
    } catch (e) {
      console.error(e);
      alert('Failed to recheck directory links.');
    } finally {
      setIsRelinking(false);
    }
  };

  const filteredUsers = () => {
    switch (filter) {
      case 'pending':
        return allUsers.filter(u => !u.is_approved);
      case 'approved':
        return allUsers.filter(u => u.is_approved);
      case 'admins':
        return allUsers.filter(u => u.role === 'admin');
      default:
        return allUsers;
    }
  };


  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="User Management"
        subtitle="Manage user permissions and approvals"
        icon={<Users size={28} />}
        rightSlot={
          <div className="flex gap-2 flex-wrap justify-end">
            <GlowingButton
              size="sm"
              variant="outline"
              className="md:w-auto"
              onClick={() => void recheckDirectoryLinks()}
              disabled={isRelinking || isLoadingUsers}
            >
              {isRelinking ? 'Checking…' : 'Check Directory Links'}
            </GlowingButton>
          </div>
        }
      />

      {/* Stats Cards */}
      {isLoadingUsers ? (
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonStatsCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 p-6 rounded-[12px] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral font-bold">Total Users</p>
                <p className="text-3xl font-bold text-charcoal mt-2">{allUsers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-[12px] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral font-bold">Pending Approval</p>
                <p className="text-3xl font-bold text-gold mt-2">{pendingCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <UserCheck size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-[12px] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral font-bold">Approved Users</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{allUsers.filter(u => u.is_approved).length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLoadingUsers && directoryNeedsReviewCount > 0 && (
        <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-red-700">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1">
              <p className="font-bold">
                {directoryNeedsReviewCount} user{directoryNeedsReviewCount === 1 ? '' : 's'} not linked to Directory
              </p>
              <p className="text-red-900 mt-1">
                Users need a linked Directory person to inherit ministry/group permissions (rosters). If they shouldn’t have one, you can ignore this. Otherwise click{' '}
                <span className="font-bold">Link Directory</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 font-bold transition-colors ${
            filter === 'all'
              ? 'text-charcoal border-b-2 border-gold'
              : 'text-neutral hover:text-charcoal'
          }`}
        >
          All Users ({allUsers.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-6 py-3 font-bold transition-colors ${
            filter === 'pending'
              ? 'text-charcoal border-b-2 border-gold'
              : 'text-neutral hover:text-charcoal'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-6 py-3 font-bold transition-colors ${
            filter === 'approved'
              ? 'text-charcoal border-b-2 border-gold'
              : 'text-neutral hover:text-charcoal'
          }`}
        >
          Approved ({allUsers.filter(u => u.is_approved).length})
        </button>
        <button
          onClick={() => setFilter('admins')}
          className={`px-6 py-3 font-bold transition-colors ${
            filter === 'admins'
              ? 'text-charcoal border-b-2 border-gold'
              : 'text-neutral hover:text-charcoal'
          }`}
        >
          Admins ({allUsers.filter(u => u.role === 'admin').length})
        </button>
      </div>

      {/* Users List */}
      {isLoadingUsers ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonUserCard key={i} />
          ))}
        </div>
      ) : filteredUsers().length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[12px] border border-gray-200">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-neutral text-lg font-medium">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers().map((u) => (
            <div
              key={u.id}
              className="bg-white border border-gray-200 p-6 rounded-[12px] hover:border-gold transition-all shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {displayInitial(u)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-xl text-charcoal">{displayName(u)}</h3>
                        {u.is_super_admin && (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded uppercase font-bold flex items-center gap-1">
                            <Crown size={12} />
                            Super Admin
                          </span>
                        )}
                        {u.role === 'admin' && !u.is_super_admin && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded uppercase font-bold flex items-center gap-1">
                            <Shield size={12} />
                            Admin
                          </span>
                        )}
                        {directoryByUserId[u.id] ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">
                            Directory linked
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold inline-flex items-center gap-1 border border-red-200">
                            <AlertTriangle size={12} />
                            Directory not linked
                          </span>
                        )}
                        {u.is_approved ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded uppercase font-bold">
                            Approved
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded uppercase font-bold">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {u.email && (
                          <p className="text-sm text-neutral flex items-center gap-2">
                            <span className="font-bold">Email:</span> {u.email}
                          </p>
                        )}
                        {u.phone && (
                          <p className="text-sm text-neutral flex items-center gap-2">
                            <span className="font-bold">Phone:</span> {u.phone}
                          </p>
                        )}
                        {u.created_at && (
                          <p className="text-xs text-neutral flex items-center gap-2 mt-2">
                            <span className="font-bold">Joined:</span> {formatDate(u.created_at, u.user_timezone)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setLinkModalUser(u)}
                    className="bg-blue-100 border-2 border-blue-300 text-blue-700 px-4 py-2 rounded-[4px] font-bold hover:bg-blue-200 transition-colors shadow-sm text-sm"
                    title="Link this website user to a Directory person"
                  >
                    Link Directory
                  </button>
                  {/* Password reset */}
                  <button
                    onClick={() => handleSendPasswordReset(u.email)}
                    className="bg-white border-2 border-gray-200 text-charcoal px-4 py-2 rounded-[4px] font-bold hover:border-gold hover:text-gold transition-colors shadow-sm flex items-center gap-2 text-sm"
                    title="Send a password reset email"
                  >
                    <KeyRound size={16} />
                    Reset Password
                  </button>

                  {/* Role Management — super admin only, cannot change own role or other super admins */}
                  {isSuperAdmin && u.id !== user?.id && !u.is_super_admin && (
                    <>
                      {u.role === 'member' ? (
                        <button
                          onClick={() => handleMakeAdmin(u.id, displayName(u))}
                          className="bg-purple-100 border-2 border-purple-300 text-purple-700 px-4 py-2 rounded-[4px] font-bold hover:bg-purple-200 transition-colors shadow-sm flex items-center gap-2 text-sm"
                          title="Promote to admin"
                        >
                          <Shield size={16} />
                          Make Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRevokeAdmin(u.id, displayName(u))}
                          className="bg-orange-100 border-2 border-orange-300 text-orange-700 px-4 py-2 rounded-[4px] font-bold hover:bg-orange-200 transition-colors shadow-sm flex items-center gap-2 text-sm"
                          title="Demote to member"
                        >
                          <ShieldOff size={16} />
                          Revoke Admin
                        </button>
                      )}
                    </>
                  )}

                  {/* Approval Management */}
                  {u.is_approved ? (
                    u.id !== user?.id && !u.is_super_admin && (
                      <button
                        onClick={() => handleRevokeApproval(u.id, displayName(u))}
                        className="bg-red-100 border-2 border-red-300 text-red-700 px-4 py-2 rounded-[4px] font-bold hover:bg-red-200 transition-colors shadow-sm flex items-center gap-2 text-sm"
                        title="Revoke user approval"
                      >
                        <Ban size={16} />
                        Revoke Access
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleApproveUser(u.id)}
                      className="bg-gold text-charcoal px-4 py-2 rounded-[4px] font-bold hover:bg-gold/80 transition-colors shadow-sm flex items-center gap-2 text-sm"
                      title="Approve user"
                    >
                      <UserCheck size={16} />
                      Approve
                    </button>
                  )}

                  {/* Reject Button (only for pending users) */}
                  {!u.is_approved && (
                    <button
                      onClick={() => handleRejectUser(u.id)}
                      className="bg-white border-2 border-red-200 text-red-600 px-4 py-2 rounded-[4px] font-bold hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2 text-sm"
                      title="Reject and delete user"
                    >
                      <X size={16} />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <LinkDirectoryUserModal
        isOpen={!!linkModalUser}
        onClose={() => setLinkModalUser(null)}
        targetUser={linkModalUser}
        onSuccess={() => {
          void fetchUsers();
        }}
      />
    </div>
  );
};

