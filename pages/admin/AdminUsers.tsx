import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, UserCheck, X, Shield, ShieldOff, KeyRound, AlertTriangle, ChevronDown, Link2, Unlink, Trash2, PauseCircle, Download, Search, Plus, MoreVertical, Bell, Pencil, Building2, User as UserIcon, UsersRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { appConfirm } from '../../lib/appDialog';
import { cannotComplete, cannotDelete, cannotSave, errorDetail, namedPerson, withSystemDetail } from '../../lib/systemMessage';
import { displayName, displayNameLastFirst, displayInitials, filterUsersForAdminView, canChangeUserAdminRole, isAdminUser, isOwnUserAccount, isServiceAccountEmail, isPendingApproval, isAccessHeld, CHURCH_NAME, PEOPLE_LABEL } from '../../lib/constants';
import { User } from '../../types';
import { CreateUserProfile } from './CreateUserProfile';
import { LinkDirectoryUserModal } from './LinkDirectoryUserModal';
import { IntroInquiryEmailModal } from './IntroInquiryEmailModal';
import { formatLastAccessParts } from '../../lib/dateUtils';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { LinkedToBadge } from '../../components/UI/LinkedToBadge';
import { PortalDropdown } from '../../components/UI/PortalDropdown';
import { TableScroll } from '../../components/UI/TableScroll';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { TurnstileField, type TurnstileFieldHandle } from '../../components/UI/TurnstileField';
import { logAuditEventSafe } from '../../lib/auditLog';
import { notifyUserApproved } from '../../lib/notifyUserApproved';
import { notifyUserReview } from '../../lib/notifyUserReview';
import { notifyUserAdminRole, adminRoleEmailNote } from '../../lib/notifyUserAdminRole';
import { notifyUserAccessHold, accessHoldEmailNote } from '../../lib/notifyUserAccessHold';
import { downloadAdminUsersCsv, downloadAdminUsersPdf } from '../../lib/exportAdminUsers';
import { deleteUserAccount } from '../../lib/deleteUserAccount';
import { roleForUser, userMatchesRoleFilter, websiteAccessForSlug, type AccountRole, type AccountRoleType } from '../../lib/accountRoles';

type UserFilter = 'all' | 'pending' | 'held' | 'approved' | 'linked' | 'admins';

type LeadershipLink = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  img?: string | null;
  created_from_user_sync?: boolean | null;
  profile_type?: string | null;
  groups?: string[];
};

function leadershipInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
  return letters || '?';
}

function ministryGroupLabel(link?: LeadershipLink): string {
  if (!link) return '';
  const groups = (link.groups || []).filter(Boolean);
  if (link.profile_type === 'staff') {
    return groups.length ? `${CHURCH_NAME} ${groups.join(', ')}` : `${CHURCH_NAME} Staff`;
  }
  return groups.length ? groups.join(', ') : CHURCH_NAME;
}

function RoleGlyph({ roleType }: { roleType?: AccountRoleType }) {
  if (roleType === 'member') return <UserIcon size={14} className="text-gold" />;
  if (roleType === 'group_leader') return <UsersRound size={14} className="text-gold" />;
  return <Building2 size={14} className="text-gold" />;
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
  const [accountRoles, setAccountRoles] = useState<AccountRole[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [lastAccessByUserId, setLastAccessByUserId] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [addUserMenuOpen, setAddUserMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [roleAssignUser, setRoleAssignUser] = useState<User | null>(null);
  const [roleAssignId, setRoleAssignId] = useState('');
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [linkModalUser, setLinkModalUser] = useState<User | null>(null);
  const [emailModalUser, setEmailModalUser] = useState<User | null>(null);
  const [isRelinking, setIsRelinking] = useState(false);
  const [passwordResetEmail, setPasswordResetEmail] = useState<string | null>(null);
  const [passwordResetCaptcha, setPasswordResetCaptcha] = useState<string | null>(null);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [actionsMenuUserId, setActionsMenuUserId] = useState<string | null>(null);
  const passwordResetTurnstileRef = useRef<TurnstileFieldHandle>(null);

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

      const [{ data: roleRows }, { data: lastAccessRows }] = await Promise.all([
        supabase.from('account_roles').select('id,name,slug,role_type,is_system,sort_order').order('sort_order'),
        supabase.rpc('admin_list_user_last_access'),
      ]);
      setAccountRoles((roleRows || []) as AccountRole[]);
      const lastMap: Record<string, string> = {};
      (lastAccessRows || []).forEach((row: { user_id?: string; last_access_at?: string | null }) => {
        if (row.user_id && row.last_access_at) lastMap[row.user_id] = row.last_access_at;
      });
      setLastAccessByUserId(lastMap);

      if (ids.length) {
        const { data: dirRows, error: dirErr } = await supabase
          .from('team_members')
          .select('id,user_id,name,email,phone,img,created_from_user_sync,profile_type,team_member_groups(groups(name))')
          .in('user_id', ids);
        if (dirErr) {
          console.warn('AdminUsers - directory link lookup failed (run ADD_TEAM_MEMBERS_USER_ID.sql):', dirErr);
          setDirectoryByUserId({});
        } else {
          const map: Record<string, LeadershipLink> = {};
          (dirRows || []).forEach((r: LeadershipLink & {
            user_id?: string | null;
            team_member_groups?: { groups?: { name?: string } | null }[] | null;
          }) => {
            if (r.user_id) {
              map[r.user_id] = {
                id: r.id,
                name: r.name,
                email: r.email ?? null,
                phone: r.phone ?? null,
                img: r.img ?? null,
                created_from_user_sync: r.created_from_user_sync,
                profile_type: r.profile_type,
                groups: (r.team_member_groups || [])
                  .map((row) => row.groups?.name)
                  .filter((name): name is string => !!name),
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
    const person = namedPerson(displayName(target), 'this person');
    if (
      !await appConfirm(
        asAdmin
          ? restoringHold
            ? `Please confirm you want to restore website access for ${person} as an administrator. They will again have the full admin portal, including Users & Roles.`
            : `Please confirm you want to approve ${person} as an administrator. They will receive the full admin portal, including Users & Roles.`
          : restoringHold
            ? `Please confirm you want to restore website access for ${person}. They will again have member access.`
            : `Please confirm you want to approve website access for ${person}.`,
        { confirmLabel: restoringHold ? 'Restore access' : 'Approve' },
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
            withSystemDetail(
              restoringHold
                ? `We could not restore administrator access for ${person}.`
                : `We could not approve ${person} as an administrator.`,
              notifyResult.error,
            ),
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

      alert(`${namedPerson(displayName(target), 'This person')} has been approved.${emailNote}`);
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      alert(restoringHold ? cannotComplete('restore website access') : cannotComplete('approve this person'));
    }
  };

  const handleRejectUser = async (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    const person = namedPerson(displayName(target), 'this person');
    if (
      !await appConfirm(
        `Please confirm you want to decline ${person}'s access request. They will need to sign up again if they still need access.`,
        { confirmLabel: 'Decline request' },
      )
    ) {
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
      logAuditEventSafe({
        action: 'reject',
        category: 'users',
        entityType: 'users',
        entityId: userId,
        summary: `Rejected and removed signup for ${target?.email || userId}`,
        details: { email: target?.email, denialEmailSent: notifyResult.ok },
      });
      alert(`${person}'s access request has been declined and their signup has been removed.${emailNote}`);
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert(cannotComplete("decline this access request"));
    }
  };

  const handleDeleteUser = async (target: User) => {
    setActionsMenuUserId(null);

    if (!isAdminUser(user)) {
      alert('Only an administrator can delete website accounts.');
      return;
    }

    if (isOwnUserAccount(user, target)) {
      alert('You cannot delete your own account while you are signed in.');
      return;
    }

    if (target.is_super_admin || isServiceAccountEmail(target.email)) {
      alert('This account is protected and cannot be deleted.');
      return;
    }

    const label = `${displayName(target)}${target.email ? ` (${target.email})` : ''}`;
    const confirmed = await appConfirm(
      `Please confirm you want to permanently delete ${label} from the ${CHURCH_NAME} website.\n\nTheir login and related records will be removed, and they will receive a confirmation email.`,
      { confirmLabel: 'Delete account' },
    );
    if (!confirmed) return;

    setDeletingUserId(target.id);
    try {
      const result = await deleteUserAccount(target.id);
      if (!result.ok) {
        alert(withSystemDetail(cannotDelete('this website account'), result.error));
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

      let message = `${displayName(target)} has been removed from the ${CHURCH_NAME} website.`;
      if (result.emailed) {
        message += ` A confirmation email was sent to ${result.emailed}.`;
      } else if (result.emailSkipped) {
        message += result.emailSkipReason
          ? ` The account was removed, but the confirmation email was not sent (${result.emailSkipReason}).`
          : ' The account was removed, but the confirmation email could not be sent.';
      }
      alert(message);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(cannotDelete('this website account'));
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleHoldAccess = async (userId: string, userName: string) => {
    if (
      !await appConfirm(
        `Please confirm you want to place ${userName}'s website access on hold. They will not be able to use member or admin areas until access is restored.`,
        { confirmLabel: 'Place on hold' },
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
      alert(cannotComplete('place this access on hold'));
    }
  };

  const handleMakeAdmin = async (userId: string, userName: string) => {
    if (
      !await appConfirm(
        `Please confirm you want to grant ${userName} administrator access. They will be able to use the admin dashboard.`,
        { confirmLabel: 'Grant admin' },
      )
    ) {
      return;
    }

    try {
      const notifyResult = await notifyUserAdminRole(userId, 'granted');
      if (!notifyResult.ok) {
        alert(
          withSystemDetail(`We could not grant administrator access to ${userName}.`, notifyResult.error),
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

      alert(`${userName} now has administrator access.${adminRoleEmailNote(notifyResult)}`);
      const adminRole = accountRoles.find((role) => role.slug === 'admin');
      if (adminRole) {
        await supabase.from('users').update({ account_role_id: adminRole.id }).eq('id', userId);
      }
      fetchUsers();
    } catch (error) {
      console.error('Error making user admin:', error);
      alert(cannotComplete('grant administrator access'));
    }
  };

  const handleRevokeAdmin = async (userId: string, userName: string) => {
    if (
      !await appConfirm(
        `Please confirm you want to remove the Administrative role from ${userName}. They will be returned to member access only.`,
        { confirmLabel: 'Remove admin' },
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
      const memberRole = accountRoles.find((role) => role.slug === 'member');
      if (memberRole) {
        await supabase.from('users').update({ account_role_id: memberRole.id }).eq('id', userId);
      }
      fetchUsers();
    } catch (error) {
      console.error('Error revoking admin:', error);
      alert(cannotComplete('remove administrator access'));
    }
  };

  const openPasswordReset = (email: string | null | undefined) => {
    const normalizedEmail = (email || '').trim();
    if (!normalizedEmail) {
      alert('This person does not have an email address on file.');
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
      alert('Please complete the security check before sending the reset email.');
      return;
    }

    setIsSendingPasswordReset(true);
    try {
      await sendPasswordReset(passwordResetEmail, passwordResetCaptcha);
      alert('A password reset email has been sent. Please ask them to check their inbox.');
      closePasswordReset();
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setPasswordResetCaptcha(null);
      passwordResetTurnstileRef.current?.reset();
      alert(cannotComplete('send the password reset email'));
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
        alert('Everyone with an email address is already linked, or needs a manual review.');
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
      alert(
        linked > 0
          ? `${linked} ${linked === 1 ? 'login has' : 'logins have'} been linked to ${PEOPLE_LABEL}.`
          : 'No safe automatic matches were found. Please link remaining people manually.',
      );
    } catch (e) {
      console.error(e);
      alert(cannotComplete('recheck People links'));
    } finally {
      setIsRelinking(false);
    }
  };

  const handleUnlinkLeadership = async (target: User) => {
    if (
      !await appConfirm(
        `Please confirm you want to unlink ${displayName(target) || 'this person'} from ${PEOPLE_LABEL}. Roster access for this login will pause until it is linked again.`,
        { confirmLabel: 'Unlink', cancelLabel: 'Keep linked' },
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
      alert(cannotComplete('unlink this People record', errorDetail(e)));
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

    list = list.filter((u) => userMatchesRoleFilter(u, roleFilter, accountRoles));

    const q = searchText.trim().toLowerCase();
    if (q) {
      list = list.filter((u) => {
        const link = directoryByUserId[u.id];
        const assigned = roleForUser(u, accountRoles);
        const haystack = [
          displayName(u),
          displayNameLastFirst(u),
          u.email,
          u.phone,
          u.role,
          assigned?.name,
          ministryGroupLabel(link),
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
      displayNameLastFirst(a).localeCompare(displayNameLastFirst(b), undefined, { sensitivity: 'base' })
    );
    return sortDir === 'desc' ? sorted.reverse() : sorted;
  }, [visibleUsers, filter, roleFilter, accountRoles, searchText, directoryByUserId, sortDir]);

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

  const listedIds = listedUsers.map((u) => u.id);
  const selectedCount = listedIds.filter((id) => selectedIds[id]).length;
  const allListedSelected = listedIds.length > 0 && listedIds.every((id) => selectedIds[id]);

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => ({ ...current, [id]: !current[id] }));
  };

  const toggleAllListed = () => {
    setSelectedIds((current) => {
      const next = { ...current };
      const select = !allListedSelected;
      listedIds.forEach((id) => {
        next[id] = select;
      });
      return next;
    });
  };

  const openEditUser = (target: User) => {
    setActionsMenuUserId(null);
    setEditUser(target);
    setEditForm({
      first_name: target.first_name || '',
      last_name: target.last_name || '',
      phone: target.phone || '',
    });
  };

  const saveEditUser = async () => {
    if (!editUser) return;
    setIsSavingEdit(true);
    try {
      const first_name = editForm.first_name.trim();
      const last_name = editForm.last_name.trim();
      const phone = editForm.phone.trim();
      const { error } = await supabase
        .from('users')
        .update({
          first_name,
          last_name,
          phone: phone || null,
          name: [first_name, last_name].filter(Boolean).join(' '),
        })
        .eq('id', editUser.id);
      if (error) throw error;
      logAuditEventSafe({
        action: 'update',
        category: 'users',
        entityType: 'users',
        entityId: editUser.id,
        summary: `Updated profile for ${editUser.email}`,
      });
      setEditUser(null);
      await fetchUsers();
    } catch (error: unknown) {
      alert(cannotSave('this profile', errorDetail(error)));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const openRoleAssign = (target: User) => {
    setActionsMenuUserId(null);
    const current = roleForUser(target, accountRoles);
    setRoleAssignUser(target);
    setRoleAssignId(current?.id || '');
  };

  const saveRoleAssign = async () => {
    if (!roleAssignUser || !roleAssignId) return;
    const nextRole = accountRoles.find((role) => role.id === roleAssignId);
    if (!nextRole) return;
    if (nextRole.slug === 'owner' && !roleAssignUser.is_super_admin) {
      alert('The Owner role is reserved for the site owner and cannot be assigned here.');
      return;
    }
    setIsSavingRole(true);
    try {
      const access = websiteAccessForSlug(nextRole.slug);
      const payload: Record<string, unknown> = { account_role_id: nextRole.id };
      if (access && !roleAssignUser.is_super_admin) {
        payload.role = access.role;
      }
      const { error } = await supabase.from('users').update(payload).eq('id', roleAssignUser.id);
      if (error) throw error;
      logAuditEventSafe({
        action: 'update',
        category: 'users',
        entityType: 'users',
        entityId: roleAssignUser.id,
        summary: `Set role ${nextRole.name} for ${roleAssignUser.email}`,
        details: { role: nextRole.slug },
      });
      setRoleAssignUser(null);
      await fetchUsers();
    } catch (error: unknown) {
      alert(cannotComplete('update this role', errorDetail(error)));
    } finally {
      setIsSavingRole(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        subtitle="Search, filter, and manage website logins and their roles."
        icon={<Users size={28} />}
      />

      {!isLoadingUsers && directoryNeedsReviewCount > 0 && (
        <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-red-700">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1">
              <p className="font-bold">
                {directoryNeedsReviewCount} user{directoryNeedsReviewCount === 1 ? '' : 's'} not linked to {PEOPLE_LABEL}
              </p>
              <p className="text-red-900 mt-1">
                Users need a linked {PEOPLE_LABEL} record to inherit ministry/group permissions (rosters). If they shouldn’t have one, you can ignore this. Otherwise use Actions → Link {PEOPLE_LABEL}.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative inline-flex">
          <button
            type="button"
            onClick={() => {
              setAddUserMenuOpen(false);
              setShowCreateUser(true);
            }}
            className="inline-flex items-center gap-2 rounded-l-lg border-2 border-gold px-4 py-2.5 font-semibold text-gold transition-colors hover:bg-gold hover:text-charcoal"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gold">
              <Plus size={14} />
            </span>
            Add User
          </button>
          <button
            type="button"
            className="rounded-r-lg border-2 border-l-0 border-gold px-2 py-2.5 text-gold transition-colors hover:bg-gold hover:text-charcoal"
            aria-label="More add-user actions"
            onClick={() => setAddUserMenuOpen((open) => !open)}
          >
            <ChevronDown size={16} />
          </button>
          {addUserMenuOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-charcoal hover:bg-gray-200"
                onClick={() => {
                  setAddUserMenuOpen(false);
                  void recheckDirectoryLinks();
                }}
              >
                <Link2 size={16} className="text-blue-600" />
                {isRelinking ? 'Checking…' : `Check ${PEOPLE_LABEL} Links`}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="sm:w-40">
            <span className="mb-1 block text-sm font-bold text-charcoal">Role</span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="w-full border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-sm text-charcoal focus:border-gold focus:outline-none"
            >
              <option value="all">All</option>
              {accountRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:w-80">
            <span className="mb-1 block text-sm font-bold text-charcoal">Search by name, username, email or mobile</span>
            <div className="relative">
              <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral" />
              <input
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="w-full border-0 border-b border-gray-300 bg-transparent py-2 pl-6 pr-8 text-sm text-charcoal focus:border-gold focus:outline-none"
                placeholder="Search"
              />
              {searchText.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchText('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral hover:text-charcoal"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
        <div className="flex justify-end px-4 py-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen((open) => !open)}
              disabled={isLoadingUsers || listedUsers.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-gold bg-white px-3 py-1.5 text-sm font-semibold text-gold hover:bg-gold/10 disabled:opacity-50"
            >
              <Download size={16} />
              Export
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-200"
                  onClick={() => {
                    setExportMenuOpen(false);
                    downloadAdminUsersCsv(exportUsers(), filenameBase, exportMeta(), exportContext());
                  }}
                >
                  CSV
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-200"
                  onClick={() => {
                    setExportMenuOpen(false);
                    downloadAdminUsersPdf(exportUsers(), filenameBase, exportMeta(), exportContext());
                  }}
                >
                  PDF
                </button>
              </div>
            )}
          </div>
        </div>

        <TableScroll>
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-y border-gray-200 bg-white text-[11px] font-bold uppercase tracking-wider text-neutral">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allListedSelected}
                    onChange={toggleAllListed}
                    aria-label="Select all users"
                    className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
                  />
                </th>
                <th className="px-3 py-3">
                  <button type="button" onClick={() => setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))}>
                    Name {sortDir === 'asc' ? '↑' : '↓'}
                  </button>
                </th>
                <th className="px-3 py-3">Username</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Ministry Group</th>
                <th className="px-3 py-3">Last Access Date</th>
                <th className="w-12 px-2 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral">
                    Loading users…
                  </td>
                </tr>
              ) : listedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral">
                    No users found
                  </td>
                </tr>
              ) : (
                listedUsers.map((u) => {
                  const link = directoryByUserId[u.id];
                  const assigned = roleForUser(u, accountRoles);
                  const lastAccess = formatLastAccessParts(lastAccessByUserId[u.id], u.user_timezone);
                  return (
                    <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-200">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={!!selectedIds[u.id]}
                          onChange={() => toggleSelected(u.id)}
                          aria-label={`Select ${displayNameLastFirst(u)}`}
                          className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100 text-xs font-bold text-neutral flex items-center justify-center">
                            {link?.img ? (
                              <img src={link.img} alt="" className="h-full w-full object-cover" />
                            ) : (
                              displayInitials(u)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gold">{displayNameLastFirst(u)}</p>
                            {link ? <LinkedToBadge name={link.name} /> : null}
                            {isPendingApproval(u) && (
                              <p className="text-[11px] font-bold uppercase text-red-600">Pending</p>
                            )}
                            {isAccessHeld(u) && (
                              <p className="text-[11px] font-bold uppercase text-orange-700">Hold Access</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-charcoal">{u.email || '—'}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-gold">
                          <RoleGlyph roleType={assigned?.role_type} />
                          {assigned?.name || (u.is_super_admin ? 'Owner' : u.role === 'admin' ? 'Admin' : 'Member')}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-charcoal">{ministryGroupLabel(link) || '—'}</td>
                      <td className="px-3 py-3 text-sm text-charcoal whitespace-nowrap">
                        {lastAccess ? (
                          <span>
                            {lastAccess.date}
                            <br />
                            {lastAccess.time}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-2 py-3 text-right">
                        <PortalDropdown
                          open={actionsMenuUserId === u.id}
                          onClose={() => setActionsMenuUserId(null)}
                          menuClassName="w-60"
                          trigger={
                            <button
                              type="button"
                              className="rounded-full p-1.5 text-neutral hover:bg-gray-100 hover:text-charcoal"
                              aria-label={`${displayName(u)} actions`}
                              aria-expanded={actionsMenuUserId === u.id}
                              onClick={() =>
                                setActionsMenuUserId((current) => (current === u.id ? null : u.id))
                              }
                            >
                              <MoreVertical size={18} />
                            </button>
                          }
                        >
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gold hover:bg-gray-200"
                                onClick={() => {
                                  setActionsMenuUserId(null);
                                  setEmailModalUser(u);
                                }}
                              >
                                <Bell size={16} />
                                Send Push Notifications
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gold hover:bg-gray-200"
                                onClick={() => openRoleAssign(u)}
                              >
                                <Users size={16} />
                                Roles
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gold hover:bg-gray-200"
                                onClick={() => openEditUser(u)}
                              >
                                <Pencil size={16} />
                                Edit
                              </button>
                              <div className="my-1 border-t border-gray-100" />
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-charcoal hover:bg-gray-200"
                                onClick={() => {
                                  setActionsMenuUserId(null);
                                  setLinkModalUser(u);
                                }}
                              >
                                <Link2 size={16} className="text-blue-600" />
                                Link {PEOPLE_LABEL}
                              </button>
                              {directoryByUserId[u.id] && (
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setActionsMenuUserId(null);
                                    void handleUnlinkLeadership(u);
                                  }}
                                >
                                  <Unlink size={16} />
                                  Unlink {PEOPLE_LABEL}
                                </button>
                              )}
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-charcoal hover:bg-gray-200"
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
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-charcoal hover:bg-gray-200"
                                  onClick={() => {
                                    setActionsMenuUserId(null);
                                    void handleApproveUser(u.id);
                                  }}
                                >
                                  <UserCheck size={16} />
                                  {isAccessHeld(u) ? 'Restore Access' : 'Approve'}
                                </button>
                              )}
                              {canChangeUserAdminRole(user, u) &&
                                !isAccessHeld(u) &&
                                (u.role === 'member' ? (
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-purple-700 hover:bg-purple-50"
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
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-orange-700 hover:bg-orange-50"
                                    onClick={() => {
                                      setActionsMenuUserId(null);
                                      void handleRevokeAdmin(u.id, displayName(u));
                                    }}
                                  >
                                    <ShieldOff size={16} />
                                    Revoke Admin
                                  </button>
                                ))}
                              {u.is_approved && canChangeUserAdminRole(user, u) && (
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-orange-700 hover:bg-orange-50"
                                  onClick={() => {
                                    setActionsMenuUserId(null);
                                    void handleHoldAccess(u.id, displayName(u));
                                  }}
                                >
                                  <PauseCircle size={16} />
                                  Hold Access
                                </button>
                              )}
                              {isPendingApproval(u) && (
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setActionsMenuUserId(null);
                                    void handleRejectUser(u.id);
                                  }}
                                >
                                  <X size={16} />
                                  Reject
                                </button>
                              )}
                              <div className="my-1 border-t border-gray-100" />
                              <button
                                type="button"
                                disabled={deletingUserId === u.id}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                                onClick={() => void handleDeleteUser(u)}
                              >
                                <Trash2 size={16} />
                                {deletingUserId === u.id ? 'Deleting…' : 'Delete'}
                              </button>
                        </PortalDropdown>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </TableScroll>
        <div className="border-t border-gray-100 bg-white px-6 py-3 text-right text-sm text-neutral">
          {listedUsers.length} {listedUsers.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      <CreateUserProfile
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSuccess={() => void fetchUsers()}
      />

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        <div className="space-y-4 p-1">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-charcoal">First Name</span>
            <input
              type="text"
              value={editForm.first_name}
              onChange={(event) => setEditForm((current) => ({ ...current, first_name: event.target.value }))}
              className="w-full rounded-md border border-gray-200 px-3 py-2 focus:border-gold focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-charcoal">Last Name</span>
            <input
              type="text"
              value={editForm.last_name}
              onChange={(event) => setEditForm((current) => ({ ...current, last_name: event.target.value }))}
              className="w-full rounded-md border border-gray-200 px-3 py-2 focus:border-gold focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-charcoal">Mobile</span>
            <input
              type="tel"
              value={editForm.phone}
              onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-md border border-gray-200 px-3 py-2 focus:border-gold focus:outline-none"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 text-sm font-bold text-neutral">
              Cancel
            </button>
            <GlowingButton type="button" onClick={() => void saveEditUser()} disabled={isSavingEdit}>
              {isSavingEdit ? 'Saving…' : 'Save'}
            </GlowingButton>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!roleAssignUser} onClose={() => setRoleAssignUser(null)} title="Roles">
        <div className="space-y-4 p-1">
          <p className="text-sm text-neutral">
            Choose a named role for {roleAssignUser ? displayName(roleAssignUser) : 'this user'}. Owner, Admin, and Member also update website access. Other roles are labels only.
          </p>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-charcoal">Role</span>
            <select
              value={roleAssignId}
              onChange={(event) => setRoleAssignId(event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2 focus:border-gold focus:outline-none"
            >
              {accountRoles
                .filter((role) => role.slug !== 'owner' || roleAssignUser?.is_super_admin)
                .map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setRoleAssignUser(null)} className="px-4 py-2 text-sm font-bold text-neutral">
              Cancel
            </button>
            <GlowingButton type="button" onClick={() => void saveRoleAssign()} disabled={isSavingRole || !roleAssignId}>
              {isSavingRole ? 'Saving…' : 'Save Role'}
            </GlowingButton>
          </div>
        </div>
      </Modal>

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

