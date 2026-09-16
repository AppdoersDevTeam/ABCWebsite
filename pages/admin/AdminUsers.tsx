import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, UserCheck, X, Shield, ShieldOff, Crown, KeyRound, AlertTriangle, Mail, ChevronDown, Link2, Unlink, Trash2, PauseCircle, Download, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { displayName, displayInitials, filterUsersForAdminView, canChangeUserAdminRole, isAdminUser, isOwnUserAccount, isServiceAccountEmail, isPendingApproval, isAccessHeld, CHURCH_NAME } from '../../lib/constants';
import { User } from '../../types';
import { CreateUserProfile } from './CreateUserProfile';
import { LinkDirectoryUserModal } from './LinkDirectoryUserModal';
import { IntroInquiryEmailModal } from './IntroInquiryEmailModal';
import { SkeletonPageHeader, SkeletonStatsCard, SkeletonUserCard } from '../../components/UI/Skeleton';
import { formatRelativeDateInTimezone } from '../../lib/dateUtils';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { TurnstileField, type TurnstileFieldHandle } from '../../components/UI/TurnstileField';
import { logAuditEventSafe } from '../../lib/auditLog';
import { notifyUserApproved } from '../../lib/notifyUserApproved';
import { notifyUserReview } from '../../lib/notifyUserReview';
import { notifyUserAdminRole, adminRoleEmailNote } from '../../lib/notifyUserAdminRole';
import { notifyUserAccessHold, accessHoldEmailNote } from '../../lib/notifyUserAccessHold';
import { downloadAdminUsersCsv, downloadAdminUsersPdf } from '../../lib/exportAdminUsers';

type UserFilter = 'all' | 'pending' | 'held' | 'approved' | 'linked' | 'admins';

type LeadershipLink = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  img?: string | null;
  created_from_user_sync?: boolean | null;
};

function leadershipInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
  return letters || '?';
}

export const AdminUsers = () => {
  const { user, sendPasswordReset } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [filter, setFilter] = useState<UserFilter>('all');
  const [searchText, setSearchText] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [directoryByUserId, setDirectoryByUserId] = useState<Record<string, LeadershipLink>>({});
  const [linkModalUser, setLinkModalUser] = useState<User | null>(null);
  const [emailModalUser, setEmailModalUser] = useState<User | null>(null);
  const [isRelinking, setIsRelinking] = useState(false);
  const [passwordResetEmail, setPasswordResetEmail] = useState<string | null>(null);
  const [passwordResetCaptcha, setPasswordResetCaptcha] = useState<string | null>(null);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [actionsMenuUserId, setActionsMenuUserId] = useState<string | null>(null);
  const passwordResetTurnstileRef = useRef<TurnstileFieldHandle>(null);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!actionsMenuUserId) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target as Node)
      ) {
        setActionsMenuUserId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActionsMenuUserId(null);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [actionsMenuUserId]);

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
          .select('id,user_id,name,email,phone,img,created_from_user_sync')
          .in('user_id', ids);
        if (dirErr) {
          console.warn('AdminUsers - directory link lookup failed (run ADD_TEAM_MEMBERS_USER_ID.sql):', dirErr);
          setDirectoryByUserId({});
        } else {
          const map: Record<string, LeadershipLink> = {};
          (dirRows || []).forEach((r: LeadershipLink & { user_id?: string | null }) => {
            if (r.user_id) {
              map[r.user_id] = {
                id: r.id,
                name: r.name,
                email: r.email ?? null,
                phone: r.phone ?? null,
                img: r.img ?? null,
                created_from_user_sync: r.created_from_user_sync,
              };
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

  const handleApproveUser = async (userId: string, asAdmin = false) => {
    const target = allUsers.find((u) => u.id === userId);
    const restoringHold = isAccessHeld(target);
    if (
      !window.confirm(
        asAdmin
          ? restoringHold
            ? `Restore website access for ${displayName(target) || 'this user'} as an admin?`
            : 'Approve this user as an admin? They will get the full admin portal, including User Management.'
          : restoringHold
            ? `Restore website access for ${displayName(target) || 'this user'}? They will again have member access.`
            : 'Are you sure you want to approve this user?'
      )
    ) {
      return;
    }

    try {
      const wasUnapproved = target ? !target.is_approved : true;

      if (asAdmin) {
        const notifyResult = await notifyUserAdminRole(userId, 'granted');
        if (!notifyResult.ok) {
          alert(
            `Failed to ${restoringHold ? 'restore this user as an admin' : 'approve this user as an admin'}${
              notifyResult.error ? `: ${notifyResult.error}` : ''
            }`
          );
          return;
        }
        logAuditEventSafe({
          action: 'approve',
          category: 'users',
          entityType: 'users',
          entityId: userId,
          summary: restoringHold
            ? `Restored website access for ${target?.email || userId} as admin`
            : `Approved signup for ${target?.email || userId} as admin`,
          details: { email: target?.email, role: 'admin', emailed: notifyResult.emailed },
        });
        alert(
          restoringHold
            ? `${displayName(target) || 'User'}'s access has been restored as an admin.${adminRoleEmailNote(notifyResult)}`
            : `${displayName(target) || 'User'} is approved as an admin.${adminRoleEmailNote(notifyResult)}`
        );
        fetchUsers();
        return;
      }

      if (restoringHold) {
        const notifyResult = await notifyUserAccessHold(userId, 'restored');
        if (!notifyResult.ok || !notifyResult.emailed) {
          alert(
            `Access was not restored for ${displayName(target) || 'this user'} because the confirmation email could not be sent${
              notifyResult.error ? `: ${notifyResult.error}` : ''
            }. Please try again.`
          );
          return;
        }

        logAuditEventSafe({
          action: 'update',
          category: 'users',
          entityType: 'users',
          entityId: userId,
          summary: `Restored website access for ${displayName(target) || userId}`,
          details: { field: 'is_access_held', value: false, emailed: notifyResult.emailed },
        });
        alert(
          `${displayName(target) || 'User'}'s website access has been restored.${accessHoldEmailNote(notifyResult, 'restored')}`
        );
        fetchUsers();
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({ is_approved: true, is_access_held: false, access_held_at: null })
        .eq('id', userId);

      if (error) throw error;

      logAuditEventSafe({
        action: 'approve',
        category: 'users',
        entityType: 'users',
        entityId: userId,
        summary: `Approved signup for ${target?.email || userId}`,
        details: { email: target?.email, role: target?.role },
      });

      let emailNote = '';
      if (wasUnapproved) {
        const notifyResult = await notifyUserApproved(userId);
        if (!notifyResult.ok) {
          emailNote = ` User was approved, but the confirmation email may not have been sent${
            notifyResult.error ? ` (${notifyResult.error})` : ''
          }.`;
        }
      }

      alert(`User approved successfully.${emailNote}`);
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      alert(restoringHold ? 'Failed to restore access' : 'Failed to approve user');
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to reject this user? They will need to sign up again.')) {
      return;
    }

    try {
      const notifyResult = await notifyUserReview(userId, 'denied');
      let emailNote = '';
      if (!notifyResult.ok) {
        emailNote = ` The denial email may not have been sent${
          notifyResult.error ? ` (${notifyResult.error})` : ''
        }.`;
      }

      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;
      const target = allUsers.find((u) => u.id === userId);
      logAuditEventSafe({
        action: 'reject',
        category: 'users',
        entityType: 'users',
        entityId: userId,
        summary: `Rejected and removed signup for ${target?.email || userId}`,
        details: { email: target?.email, denialEmailSent: notifyResult.ok },
      });
      alert(`User rejected and removed.${emailNote}`);
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user');
    }
  };

  const handleDeleteUser = async (target: User) => {
    setActionsMenuUserId(null);

    if (!isAdminUser(user)) {
      alert('Only an admin can delete users.');
      return;
    }

    if (isOwnUserAccount(user, target)) {
      alert('You cannot delete your own account while you are logged in.');
      return;
    }

    if (target.is_super_admin || isServiceAccountEmail(target.email)) {
      alert('This account cannot be deleted.');
      return;
    }

    const label = `${displayName(target)}${target.email ? ` (${target.email})` : ''}`;
    const confirmed = window.confirm(
      `Delete ${label} from the Ashburton Baptist Church system?\n\nThis cannot be undone. Their login and related records will be removed, and they will receive a confirmation email.`
    );
    if (!confirmed) return;

    setDeletingUserId(target.id);
    try {
      const result = await deleteUserAccount(target.id);
      if (!result.ok) {
        alert(result.error || 'Failed to delete user');
        return;
      }

      logAuditEventSafe({
        action: 'delete',
        category: 'users',
        entityType: 'users',
        entityId: target.id,
        summary: `Deleted user ${target.email || target.id} from the system`,
        details: { email: target.email, emailed: result.emailed, emailSkipped: result.emailSkipped },
      });

      let message = `${displayName(target)} has been deleted from the Ashburton Baptist Church system.`;
      if (result.emailed) {
        message += ` A confirmation email was sent to ${result.emailed}.`;
      } else if (result.emailSkipped) {
        message += ' The account was removed, but the confirmation email could not be sent.';
      }
      alert(message);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleHoldAccess = async (userId: string, userName: string) => {
    if (
      !window.confirm(
        `Place ${userName}'s website access on hold? They will not be able to use member or admin areas until access is restored.`
      )
    ) {
      return;
    }

    try {
      const notifyResult = await notifyUserAccessHold(userId);
      if (!notifyResult.ok || !notifyResult.emailed) {
        alert(
          `Access was not placed on hold for ${userName} because the confirmation email could not be sent${
            notifyResult.error ? `: ${notifyResult.error}` : ''
          }. Please try again.`
        );
        return;
      }

      logAuditEventSafe({
        action: 'update',
        category: 'users',
        entityType: 'users',
        entityId: userId,
        summary: `Placed website access on hold for ${userName}`,
        details: { field: 'is_access_held', value: true, emailed: notifyResult.emailed },
      });
      alert(
        `${userName}'s access has been placed on hold for security reasons.${accessHoldEmailNote(notifyResult)}`
      );
      fetchUsers();
    } catch (error) {
      console.error('Error placing access on hold:', error);
      alert('Failed to place access on hold');
    }
  };

  const handleMakeAdmin = async (userId: string, userName: string) => {
    if (!window.confirm(`Make ${userName} an admin? They will be able to access the admin dashboard.`)) {
      return;
    }

    try {
      const notifyResult = await notifyUserAdminRole(userId, 'granted');
      if (!notifyResult.ok) {
        alert(
          `Failed to make ${userName} an admin${
            notifyResult.error ? `: ${notifyResult.error}` : ''
          }`
        );
        return;
      }

      logAuditEventSafe({
        action: 'update',
        category: 'users',
        entityType: 'users',
        entityId: userId,
        summary: `Granted admin access to ${userName}`,
        details: { field: 'role', value: 'admin', emailed: notifyResult.emailed },
      });

      alert(`${userName} is now an admin.${adminRoleEmailNote(notifyResult)}`);
      fetchUsers();
    } catch (error) {
      console.error('Error making user admin:', error);
      alert('Failed to make user an admin');
    }
  };

  const handleRevokeAdmin = async (userId: string, userName: string) => {
    if (
      !window.confirm(
        `Revoke the Administrative role from ${userName}? They will be returned to member access only.`
      )
    ) {
      return;
    }

    try {
      const notifyResult = await notifyUserAdminRole(userId, 'revoked');
      if (!notifyResult.ok || !notifyResult.emailed) {
        alert(
          `The Administrative role was not fully completed for ${userName} because the confirmation email could not be sent${
            notifyResult.error ? `: ${notifyResult.error}` : ''
          }. Please try again.`
        );
        return;
      }

      logAuditEventSafe({
        action: 'update',
        category: 'users',
        entityType: 'users',
        entityId: userId,
        summary: `Revoked admin access from ${userName}`,
        details: { field: 'role', value: 'member', emailed: notifyResult.emailed },
      });
      alert(
        `${userName} is no longer granted an Administrative role and has been returned to member access.${adminRoleEmailNote(notifyResult)}`
      );
      fetchUsers();
    } catch (error) {
      console.error('Error revoking admin:', error);
      alert('Failed to revoke admin rights');
    }
  };

  const openPasswordReset = (email: string | null | undefined) => {
    const normalizedEmail = (email || '').trim();
    if (!normalizedEmail) {
      alert('This user does not have an email address on file.');
      return;
    }
    setPasswordResetCaptcha(null);
    setPasswordResetEmail(normalizedEmail);
  };

  const closePasswordReset = () => {
    setPasswordResetEmail(null);
    setPasswordResetCaptcha(null);
    passwordResetTurnstileRef.current?.reset();
  };

  const handleSendPasswordReset = async () => {
    if (!passwordResetEmail) return;
    if (!passwordResetCaptcha) {
      alert('Please complete the CAPTCHA before sending the reset email.');
      return;
    }

    setIsSendingPasswordReset(true);
    try {
      await sendPasswordReset(passwordResetEmail, passwordResetCaptcha);
      alert('Password reset email sent. Ask the user to check their inbox.');
      closePasswordReset();
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setPasswordResetCaptcha(null);
      passwordResetTurnstileRef.current?.reset();
      alert('Failed to send password reset email');
    } finally {
      setIsSendingPasswordReset(false);
    }
  };

  const isSuperAdmin = user?.is_super_admin === true;

  const visibleUsers = useMemo(
    () => filterUsersForAdminView(allUsers, user),
    [allUsers, user]
  );

  const visiblePendingCount = useMemo(
    () => visibleUsers.filter((u) => isPendingApproval(u)).length,
    [visibleUsers]
  );

  const visibleHeldCount = useMemo(
    () => visibleUsers.filter((u) => isAccessHeld(u)).length,
    [visibleUsers]
  );

  const visibleApprovedCount = useMemo(
    () => visibleUsers.filter((u) => u.is_approved).length,
    [visibleUsers]
  );

  const visibleAdminCount = useMemo(
    () => visibleUsers.filter((u) => u.role === 'admin' && u.is_approved).length,
    [visibleUsers]
  );

  const visibleLinkedCount = useMemo(
    () => visibleUsers.filter((u) => !!directoryByUserId[u.id]).length,
    [visibleUsers, directoryByUserId]
  );

  const formatDate = (dateString: string | undefined, userTimezone?: string) => {
    // For admin views, display dates in the admin's current timezone
    return formatRelativeDateInTimezone(dateString, userTimezone);
  };

  const directoryNeedsReviewCount = useMemo(() => {
    return visibleUsers.filter((u) => !directoryByUserId[u.id]).length;
  }, [visibleUsers, directoryByUserId]);

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
      alert(linked > 0 ? `Linked ${linked} user(s) to Leadership.` : 'No safe matches found. Manual linking required.');
    } catch (e) {
      console.error(e);
      alert('Failed to recheck directory links.');
    } finally {
      setIsRelinking(false);
    }
  };

  const handleUnlinkLeadership = async (target: User) => {
    if (
      !window.confirm(
        `Unlink ${displayName(target) || 'this user'} from Leadership? They will lose roster access until linked again.`
      )
    ) {
      return;
    }
    try {
      const { error } = await supabase.from('team_members').update({ user_id: null }).eq('user_id', target.id);
      if (error) throw error;
      logAuditEventSafe({
        action: 'unlink',
        category: 'users',
        entityType: 'users',
        entityId: target.id,
        summary: `Removed leadership link for ${target.email}`,
      });
      await fetchUsers();
    } catch (e: unknown) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Failed to unlink');
    }
  };

  const listedUsers = useMemo(() => {
    let list = visibleUsers;
    switch (filter) {
      case 'pending':
        list = list.filter((u) => isPendingApproval(u));
        break;
      case 'held':
        list = list.filter((u) => isAccessHeld(u));
        break;
      case 'approved':
        list = list.filter((u) => u.is_approved);
        break;
      case 'linked':
        list = list.filter((u) => !!directoryByUserId[u.id]);
        break;
      case 'admins':
        list = list.filter((u) => u.role === 'admin' && u.is_approved);
        break;
      default:
        break;
    }

    const q = searchText.trim().toLowerCase();
    if (q) {
      list = list.filter((u) => {
        const link = directoryByUserId[u.id];
        const haystack = [
          displayName(u),
          u.email,
          u.phone,
          u.role,
          link?.name,
          link?.email,
          link?.phone,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    const sorted = [...list].sort((a, b) =>
      displayName(a).localeCompare(displayName(b), undefined, { sensitivity: 'base' })
    );
    return sortDir === 'desc' ? sorted.reverse() : sorted;
  }, [visibleUsers, filter, searchText, directoryByUserId, sortDir]);

  const filenameBase = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `user-management-${yyyy}-${mm}-${dd}`;
  }, []);

  const exportUsers = () => listedUsers;
  const exportMeta = () => ({ churchName: CHURCH_NAME, exportedAt: new Date() });
  const exportContext = () => ({ directoryByUserId });


  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="User Management"
        subtitle="Manage user permissions and approvals"
        icon={<Users size={28} />}
        rightSlot={
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() =>
                downloadAdminUsersCsv(exportUsers(), filenameBase, exportMeta(), exportContext())
              }
              disabled={isLoadingUsers || exportUsers().length === 0}
              className="bg-white border-2 border-gray-200 text-charcoal px-4 py-2 rounded-[4px] font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
              title="Download CSV (current view)"
            >
              <Download size={16} />
              CSV
            </button>
            <button
              type="button"
              onClick={() =>
                downloadAdminUsersPdf(exportUsers(), filenameBase, exportMeta(), exportContext())
              }
              disabled={isLoadingUsers || exportUsers().length === 0}
              className="bg-white border-2 border-gray-200 text-charcoal px-4 py-2 rounded-[4px] font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 text-sm disabled:opacity-60"
              title="Download PDF (current view)"
            >
              <Download size={16} />
              PDF
            </button>
            <GlowingButton
              size="sm"
              variant="outline"
              className="md:w-auto"
              onClick={() => void recheckDirectoryLinks()}
              disabled={isRelinking || isLoadingUsers}
            >
              {isRelinking ? 'Checking…' : 'Check Leadership Links'}
            </GlowingButton>
          </div>
        }
      />

      {!isLoadingUsers && directoryNeedsReviewCount > 0 && (
        <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-red-700">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1">
              <p className="font-bold">
                {directoryNeedsReviewCount} user{directoryNeedsReviewCount === 1 ? '' : 's'} not linked to Leadership
              </p>
              <p className="text-red-900 mt-1">
                Users need a linked Leadership person to inherit ministry/group permissions (rosters). If they shouldn’t have one, you can ignore this. Otherwise click{' '}
                <span className="font-bold">Link Leadership</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoadingUsers ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonStatsCard key={i} className="!p-3" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(
            [
              {
                id: 'all' as UserFilter,
                label: 'All Users',
                value: visibleUsers.length,
                valueClass: 'text-charcoal',
                iconWrap: 'bg-blue-100',
                icon: <Users size={16} className="text-blue-600" />,
              },
              {
                id: 'pending' as UserFilter,
                label: 'Pending Approval',
                value: visiblePendingCount,
                valueClass: 'text-gold',
                iconWrap: 'bg-yellow-100',
                icon: <UserCheck size={16} className="text-yellow-600" />,
              },
              {
                id: 'held' as UserFilter,
                label: 'Hold Access',
                value: visibleHeldCount,
                valueClass: 'text-orange-600',
                iconWrap: 'bg-orange-100',
                icon: <PauseCircle size={16} className="text-orange-600" />,
              },
              {
                id: 'approved' as UserFilter,
                label: 'Approved Users',
                value: visibleApprovedCount,
                valueClass: 'text-green-600',
                iconWrap: 'bg-green-100',
                icon: <UserCheck size={16} className="text-green-600" />,
              },
              {
                id: 'linked' as UserFilter,
                label: 'Linked Account',
                value: visibleLinkedCount,
                valueClass: 'text-teal-700',
                iconWrap: 'bg-gray-200',
                icon: <Link2 size={16} className="text-gray-600" />,
              },
              {
                id: 'admins' as UserFilter,
                label: 'Admin Users',
                value: visibleAdminCount,
                valueClass: 'text-purple-700',
                iconWrap: 'bg-purple-100',
                icon: <Shield size={16} className="text-purple-700" />,
              },
            ] as const
          ).map((card) => {
            const active = filter === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setFilter(card.id)}
                className={`text-left bg-white px-3 py-2 rounded-[12px] shadow-sm transition-all border min-w-0 w-full ${
                  active
                    ? 'border-gold ring-2 ring-gold/30'
                    : 'border-gray-200 hover:border-gold'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="min-w-0">
                    <p className="text-lg leading-tight text-charcoal font-bold">{card.label}</p>
                    <p className={`text-lg font-bold mt-0.5 ${card.valueClass}`}>{card.value}</p>
                  </div>
                  <div className={`p-1.5 rounded-full flex-shrink-0 ${card.iconWrap}`}>{card.icon}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="glass-card bg-white/80 border border-white/60 rounded-[12px] p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold text-charcoal mb-2">Search</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-[6px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
                placeholder="Search name, email, phone, or linked Leadership…"
              />
              {searchText.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchText('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral hover:text-charcoal transition-colors"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral mb-1">Sort by</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as UserFilter)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-[6px] text-sm font-bold text-charcoal hover:border-gold focus:border-gold focus:outline-none transition-colors min-w-[160px]"
              >
                <option value="all">All users</option>
                <option value="pending">Pending</option>
                <option value="held">Holding</option>
                <option value="approved">Approved</option>
                <option value="linked">Linked</option>
                <option value="admins">Admin users</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              className="px-3 py-2 bg-white border border-gray-200 rounded-[6px] text-sm font-bold text-neutral hover:text-charcoal hover:border-gold transition-colors"
              title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortDir === 'asc' ? 'A→Z' : 'Z→A'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter('all');
                setSearchText('');
                setSortDir('asc');
              }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-[6px] text-sm font-bold text-neutral hover:text-charcoal hover:border-gold transition-colors"
              title="Clear all filters"
            >
              Clear
            </button>
          </div>
        </div>
        <p className="text-xs text-neutral mt-3">
          Showing <span className="font-bold text-charcoal">{listedUsers.length}</span> of{' '}
          <span className="font-bold text-charcoal">{visibleUsers.length}</span> users
        </p>
      </div>

      {/* Users List */}
      {isLoadingUsers ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonUserCard key={i} />
          ))}
        </div>
      ) : listedUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[12px] border border-gray-200">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-neutral text-lg font-medium">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listedUsers.map((u) => {
            const link = directoryByUserId[u.id];
            const isLinked = !!link;
            const completedCardClass =
              'bg-purple-100 border-2 border-purple-400 p-6 rounded-[12px] shadow-sm transition-all';
            const plainCardClass =
              'bg-white border border-gray-200 p-6 rounded-[12px] hover:border-gold transition-all shadow-sm';
            return (
            <div key={u.id} className={isLinked ? completedCardClass : plainCardClass}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm tracking-wide flex-shrink-0 ${
                        isLinked ? 'bg-purple-200 text-purple-900' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {displayInitials(u)}
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
                        {isLinked ? (
                          <span className="bg-purple-200 text-purple-900 text-xs px-2 py-1 rounded font-bold">
                            Linked
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold inline-flex items-center gap-1 border border-red-200">
                            <AlertTriangle size={12} />
                            Leadership not linked
                          </span>
                        )}
                        {u.is_approved ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded uppercase font-bold">
                            Approved
                          </span>
                        ) : isAccessHeld(u) ? (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded uppercase font-bold">
                            Hold Access
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
                <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-center">
                  {!u.is_approved && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApproveUser(u.id)}
                        className="bg-gold text-charcoal px-4 py-2 rounded-[4px] font-bold hover:bg-gold/80 transition-colors shadow-sm flex items-center gap-2 text-sm"
                        title={isAccessHeld(u) ? 'Restore member access' : 'Approve as member'}
                      >
                        <UserCheck size={16} />
                        {isAccessHeld(u) ? 'Restore Access' : 'Approve'}
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleApproveUser(u.id, true)}
                          className="bg-white border-2 border-purple-200 text-purple-700 px-4 py-2 rounded-[4px] font-bold hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-2 text-sm"
                          title="Approve as admin"
                        >
                          <Shield size={16} />
                          Approve as Admin
                        </button>
                      )}
                    </>
                  )}

                  <div
                    className="relative"
                    ref={actionsMenuUserId === u.id ? actionsMenuRef : undefined}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setActionsMenuUserId((current) =>
                          current === u.id ? null : u.id
                        )
                      }
                      className="bg-white border-2 border-gray-200 text-charcoal px-4 py-2 rounded-[4px] font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 text-sm"
                      aria-expanded={actionsMenuUserId === u.id}
                      aria-haspopup="menu"
                    >
                      Actions
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          actionsMenuUserId === u.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {actionsMenuUserId === u.id && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full mt-2 z-30 w-56 rounded-[8px] border border-gray-200 bg-white py-1 shadow-lg"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-charcoal hover:bg-gray-50"
                          onClick={() => {
                            setActionsMenuUserId(null);
                            setLinkModalUser(u);
                          }}
                        >
                          <Link2 size={16} className="text-blue-600" />
                          Link Leadership
                        </button>
                        {directoryByUserId[u.id] && (
                          <button
                            type="button"
                            role="menuitem"
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setActionsMenuUserId(null);
                              void handleUnlinkLeadership(u);
                            }}
                          >
                            <Unlink size={16} />
                            Unlink Leadership
                          </button>
                        )}

                        <button
                          type="button"
                          role="menuitem"
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-charcoal hover:bg-gray-50"
                          onClick={() => {
                            setActionsMenuUserId(null);
                            openPasswordReset(u.email);
                          }}
                        >
                          <KeyRound size={16} />
                          Reset Password
                        </button>

                        {!u.is_approved && (
                          <button
                            type="button"
                            role="menuitem"
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-charcoal hover:bg-gray-50"
                            onClick={() => {
                              setActionsMenuUserId(null);
                              setEmailModalUser(u);
                            }}
                          >
                            <Mail size={16} />
                            Email
                          </button>
                        )}

                        {canChangeUserAdminRole(user, u) &&
                          !isAccessHeld(u) &&
                          (u.role === 'member' ? (
                            <button
                              type="button"
                              role="menuitem"
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-purple-700 hover:bg-purple-50"
                              onClick={() => {
                                setActionsMenuUserId(null);
                                void handleMakeAdmin(u.id, displayName(u));
                              }}
                            >
                              <Shield size={16} />
                              Make Admin
                            </button>
                          ) : (
                            <button
                              type="button"
                              role="menuitem"
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-orange-700 hover:bg-orange-50"
                              onClick={() => {
                                setActionsMenuUserId(null);
                                void handleRevokeAdmin(u.id, displayName(u));
                              }}
                            >
                              <ShieldOff size={16} />
                              Revoke Admin
                            </button>
                          ))}

                        {u.is_approved &&
                          canChangeUserAdminRole(user, u) && (
                            <button
                              type="button"
                              role="menuitem"
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-orange-700 hover:bg-orange-50 border-t border-gray-100 mt-1"
                              onClick={() => {
                                setActionsMenuUserId(null);
                                void handleHoldAccess(
                                  u.id,
                                  displayName(u)
                                );
                              }}
                            >
                              <PauseCircle size={16} />
                              Hold Access
                            </button>
                          )}

                        {isPendingApproval(u) && (
                          <button
                            type="button"
                            role="menuitem"
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                            onClick={() => {
                              setActionsMenuUserId(null);
                              void handleRejectUser(u.id);
                            }}
                          >
                            <X size={16} />
                            Reject
                          </button>
                        )}

                        <button
                          type="button"
                          role="menuitem"
                          disabled={deletingUserId === u.id}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1 disabled:opacity-60"
                          onClick={() => {
                            void handleDeleteUser(u);
                          }}
                        >
                          <Trash2 size={16} />
                          {deletingUserId === u.id ? 'Deleting…' : 'Delete user'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {link && (
                <div className="mt-5 pt-5 border-t-2 border-purple-300">
                  <div className="flex items-center gap-2 mb-3 text-purple-800 text-xs font-bold uppercase tracking-wider">
                    <Link2 size={14} />
                    Linked to Leadership
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center font-bold text-sm tracking-wide flex-shrink-0 overflow-hidden">
                        {link.img ? (
                          <img src={link.img} alt={link.name} className="w-full h-full object-cover" />
                        ) : (
                          leadershipInitials(link.name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-xl text-charcoal">{link.name}</h3>
                          <span className="bg-purple-200 text-purple-900 text-xs px-2 py-1 rounded font-bold">
                            Linked
                          </span>
                          <span className="bg-purple-200 text-purple-900 text-xs px-2 py-1 rounded uppercase font-bold">
                            Leadership
                          </span>
                        </div>
                        {link.email && (
                          <p className="text-sm text-neutral">
                            <span className="font-bold">Email:</span> {link.email}
                          </p>
                        )}
                        {link.phone && (
                          <p className="text-sm text-neutral">
                            <span className="font-bold">Phone:</span> {link.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleUnlinkLeadership(u)}
                      className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-[4px] font-bold hover:bg-red-50 inline-flex items-center justify-center gap-2 text-sm shrink-0"
                    >
                      <Unlink size={16} />
                      Unlink
                    </button>
                  </div>
                </div>
              )}
            </div>
            );
          })}
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

      <IntroInquiryEmailModal
        isOpen={!!emailModalUser}
        onClose={() => setEmailModalUser(null)}
        targetUser={emailModalUser}
      />

      <Modal
        isOpen={!!passwordResetEmail}
        onClose={closePasswordReset}
        title="Send password reset"
      >
        <div className="space-y-4 p-2">
          <p className="text-sm text-neutral">
            Send a password reset link to <strong className="text-charcoal">{passwordResetEmail}</strong>.
            Complete the CAPTCHA to continue.
          </p>
          <TurnstileField
            ref={passwordResetTurnstileRef}
            onToken={setPasswordResetCaptcha}
            onExpire={() => setPasswordResetCaptcha(null)}
            onError={() => setPasswordResetCaptcha(null)}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closePasswordReset}
              className="px-4 py-2 text-sm font-bold text-neutral hover:text-charcoal"
            >
              Cancel
            </button>
            <GlowingButton
              type="button"
              disabled={isSendingPasswordReset || !passwordResetCaptcha}
              onClick={handleSendPasswordReset}
            >
              {isSendingPasswordReset ? 'Sending...' : 'Send reset email'}
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

