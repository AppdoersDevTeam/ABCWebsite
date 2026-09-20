import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { OverviewStatCard } from '../../components/UI/OverviewStatCard';
import { OverviewUserBreakdown } from '../../components/UI/OverviewUserBreakdown';
import { Calendar, CalendarDays, Church, BookOpen, Users, ClipboardList, UserCheck, UserCog, X, Plus, Shield, Mail, Newspaper, HandHeart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { appConfirm } from '../../lib/appDialog';
import { cannotComplete, namedPerson, withSystemDetail } from '../../lib/systemMessage';
import { displayName, displayNameLastFirst, displayInitials, EVENTS_LABEL, PEOPLE_LABEL, filterUsersForAdminView, isPendingApproval } from '../../lib/constants';
import { User } from '../../types';
import { SkeletonPageHeader, SkeletonCard, SkeletonUserCard, SkeletonStatsCard } from '../../components/UI/Skeleton';
import { formatRelativeDateInTimezone, formatFullDateTimeInTimezone, formatDdMmYyyy } from '../../lib/dateUtils';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { logAuditEventSafe } from '../../lib/auditLog';
import { notifyUserApproved } from '../../lib/notifyUserApproved';
import { notifyUserReview } from '../../lib/notifyUserReview';
import { notifyUserAdminRole, adminRoleEmailNote } from '../../lib/notifyUserAdminRole';
import { IntroInquiryEmailModal } from './IntroInquiryEmailModal';
import { SURFACE_HOVER_CLASS } from '../../lib/uiHover';
import {
  emailQuotaNearLimit,
  fetchEmailQuotaStatus,
  formatEmailQuotaUsed,
  type EmailQuotaStatus,
} from '../../lib/emailSends';

export const AdminOverview = () => {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [photoByUserId, setPhotoByUserId] = useState<Record<string, string>>({});
  const [linkedByUserId, setLinkedByUserId] = useState<Record<string, true>>({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [emailModalUser, setEmailModalUser] = useState<User | null>(null);
  const [prayerRequestsCount, setPrayerRequestsCount] = useState(0);
  const [nextService, setNextService] = useState<string | null>(null);
  const [newsletterCount, setNewsletterCount] = useState(0);
  const [devotionalsCount, setDevotionalsCount] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [teamMembersCount, setTeamMembersCount] = useState(0);
  const [rosterAssignmentsCount, setRosterAssignmentsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [pendingPrayerRequestsCount, setPendingPrayerRequestsCount] = useState(0);
  const [emailsQuota, setEmailsQuota] = useState<EmailQuotaStatus | null>(null);
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string;
    type: 'prayer' | 'event' | 'team_member' | 'newsletter' | 'devotional' | 'roster';
    title: string;
    date: string;
  }>>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  useEffect(() => {
    console.log('AdminOverview - useEffect triggered, fetching pending users');
    fetchPendingUsers();
    fetchStats();
    fetchRecentActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('overview-email-sends')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'email_sends' }, () => {
        void fetchEmailQuotaStatus().then(setEmailsQuota);
      })
      .subscribe();

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void fetchEmailQuotaStatus().then(setEmailsQuota);
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);


  const fetchPendingUsers = async () => {
    console.log('AdminOverview - fetchPendingUsers called');
    setIsLoadingUsers(true);
    try {
      console.log('AdminOverview - Making Supabase query for pending users');
      
      // First, let's check ALL users to see what we have
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('AdminOverview - All users in database:', allUsers);
      if (allUsersError) {
        console.error('AdminOverview - Error fetching all users:', allUsersError);
      }

      // Now get pending users
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_approved', false)
        .or('is_access_held.eq.false,is_access_held.is.null')
        .order('created_at', { ascending: false });

      console.log('AdminOverview - Supabase response for pending users:', { data, error });
      console.log('AdminOverview - Query filter: is_approved = false');

      if (error) {
        console.error('AdminOverview - Supabase error:', error);
        throw error;
      }
      
      // Log each user's approval status
      if (allUsers && allUsers.length > 0) {
        console.log('AdminOverview - User approval statuses:');
        allUsers.forEach((u: User) => {
          console.log(`  - ${u.email}: is_approved=${u.is_approved}, role=${u.role}, created_at=${u.created_at}`);
        });
        setAllUsers(allUsers);
      }
      
      setPendingUsers(data || []);
      setPendingCount(data?.length || 0);
      console.log('AdminOverview - Set pending users:', data?.length || 0);

      const photoIds = [...new Set((allUsers || data || []).map((u) => u.id).filter(Boolean))];
      if (photoIds.length) {
        const { data: dirRows, error: dirErr } = await supabase
          .from('team_members')
          .select('user_id, img')
          .in('user_id', photoIds);
        if (dirErr) {
          console.warn('AdminOverview - directory photo lookup failed:', dirErr);
          setPhotoByUserId({});
          setLinkedByUserId({});
        } else {
          const map: Record<string, string> = {};
          const linked: Record<string, true> = {};
          (dirRows || []).forEach((row: { user_id?: string | null; img?: string | null }) => {
            if (row.user_id) {
              linked[row.user_id] = true;
              if (row.img) map[row.user_id] = row.img;
            }
          });
          setPhotoByUserId(map);
          setLinkedByUserId(linked);
        }
      } else {
        setPhotoByUserId({});
        setLinkedByUserId({});
      }
    } catch (error) {
      console.error('AdminOverview - Error fetching pending users:', error);
      setPendingUsers([]);
      setPendingCount(0);
      setPhotoByUserId({});
      setLinkedByUserId({});
    } finally {
      setIsLoadingUsers(false);
      console.log('AdminOverview - fetchPendingUsers completed');
    }
  };

  const handleApproveUser = async (userId: string, asAdmin = false) => {
    const target =
      pendingUsers.find((u) => u.id === userId) || allUsers.find((u) => u.id === userId);
    const person = namedPerson(displayName(target), 'this person');
    if (
      !await appConfirm(
        asAdmin
          ? `Please confirm you want to approve ${person} as an administrator. They will receive the full admin portal, including Users & Roles.`
          : `Please confirm you want to approve website access for ${person}.`,
        { confirmLabel: 'Approve' },
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
            withSystemDetail(`We could not approve ${person} as an administrator.`, notifyResult.error),
          );
          return;
        }
        logAuditEventSafe({
          action: 'approve',
          category: 'users',
          entityType: 'users',
          entityId: userId,
          summary: `Approved signup for ${target?.email || userId} as admin`,
          details: { email: target?.email, role: 'admin', emailed: notifyResult.emailed },
        });
        alert(`${person} has been approved as an administrator.${adminRoleEmailNote(notifyResult)}`);
        fetchPendingUsers();
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

      alert(`${person} has been approved.${emailNote}`);
      fetchPendingUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      alert(cannotComplete('approve this person'));
    }
  };

  const handleRejectUser = async (userId: string) => {
    const target =
      pendingUsers.find((u) => u.id === userId) || allUsers.find((u) => u.id === userId);
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
      fetchPendingUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert(cannotComplete("decline this access request"));
    }
  };


  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const { count: prayerTotal, error: prayerError } = await supabase
        .from('prayer_requests')
        .select('id', { count: 'exact', head: true });

      if (prayerError) {
        console.error('Error fetching prayer requests:', prayerError);
        setPrayerRequestsCount(0);
      } else {
        setPrayerRequestsCount(prayerTotal || 0);
      }

      // Fetch pending prayer requests (recent ones from last 7 days for "pending review")
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: recentPrayerRequests, error: recentPrayerError } = await supabase
        .from('prayer_requests')
        .select('id')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (!recentPrayerError) {
        setPendingPrayerRequestsCount(recentPrayerRequests?.length || 0);
      }

      // Fetch active People directory count (exclude archived)
      const { count: teamCount, error: teamError } = await supabase
        .from('team_members')
        .select('id', { count: 'exact', head: true })
        .or('is_archived.eq.false,is_archived.is.null');

      if (!teamError) {
        setTeamMembersCount(teamCount || 0);
      }

      // Fetch roster assignments count
      const { count: rosterCount, error: rosterError } = await supabase
        .from('roster')
        .select('*', { count: 'exact', head: true });

      if (!rosterError) {
        setRosterAssignmentsCount(rosterCount || 0);
      }

      const { count: eventsTotal, error: eventsCountError } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true });

      if (eventsCountError) {
        console.error('Error counting events:', eventsCountError);
        setEventsCount(0);
      } else {
        setEventsCount(eventsTotal || 0);
      }

      // Calculate next Sunday service (Sunday at 10AM)
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Calculate days until next Sunday
      let daysUntilSunday;
      if (currentDay === 0) {
        // If today is Sunday, check if it's before 10 AM
        const currentHour = today.getHours();
        if (currentHour < 10) {
          // Today's service hasn't happened yet
          daysUntilSunday = 0;
        } else {
          // Today's service already happened, get next Sunday
          daysUntilSunday = 7;
        }
      } else {
        // Get next Sunday
        daysUntilSunday = 7 - currentDay;
      }
      
      const nextSunday = new Date(today);
      nextSunday.setDate(today.getDate() + daysUntilSunday);
      nextSunday.setHours(10, 0, 0, 0); // 10 AM
      
      // Always use calculated next Sunday - format as "dd month"
      setNextService(formatDdMmYyyy(nextSunday));

      const { count: newsletterTotal, error: newsletterCountError } = await supabase
        .from('newsletters')
        .select('id', { count: 'exact', head: true });
      if (newsletterCountError) {
        console.error('Error counting newsletters:', newsletterCountError);
        setNewsletterCount(0);
      } else {
        setNewsletterCount(newsletterTotal || 0);
      }

      const { count: devotionalsTotal, error: devotionalsCountError } = await supabase
        .from('devotionals')
        .select('id', { count: 'exact', head: true });
      if (devotionalsCountError) {
        console.error('Error counting devotionals:', devotionalsCountError);
        setDevotionalsCount(0);
      } else {
        setDevotionalsCount(devotionalsTotal || 0);
      }

      const quota = await fetchEmailQuotaStatus();
      setEmailsQuota(quota);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchRecentActivities = async () => {
    setIsLoadingActivities(true);
    try {
      // Fetch recent activities from multiple tables
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoffDate = thirtyDaysAgo.toISOString();

      // Parallel fetch from all tables
      const [
        prayerRequestsResult,
        eventsResult,
        teamMembersResult,
        newslettersResult,
        devotionalsResult,
        rosterResult
      ] = await Promise.allSettled([
        // Recent prayer requests
        supabase
          .from('prayer_requests')
          .select('id, name, created_at')
          .gte('created_at', cutoffDate)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Recent events (created or updated)
        supabase
          .from('events')
          .select('id, title, created_at, updated_at')
          .or(`created_at.gte.${cutoffDate},updated_at.gte.${cutoffDate}`)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Recent team members
        supabase
          .from('team_members')
          .select('id, name, created_at, updated_at')
          .or(`created_at.gte.${cutoffDate},updated_at.gte.${cutoffDate}`)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Recent newsletters
        supabase
          .from('newsletters')
          .select('id, title, created_at, updated_at')
          .or(`created_at.gte.${cutoffDate},updated_at.gte.${cutoffDate}`)
          .order('created_at', { ascending: false })
          .limit(10),

        supabase
          .from('devotionals')
          .select('id, title, subtitle, week_date, created_at, updated_at')
          .or(`created_at.gte.${cutoffDate},updated_at.gte.${cutoffDate}`)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Recent roster updates
        supabase
          .from('roster')
          .select('id, name, role, date, created_at, updated_at')
          .or(`created_at.gte.${cutoffDate},updated_at.gte.${cutoffDate}`)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      const activities: Array<{
        id: string;
        type: 'prayer' | 'event' | 'team_member' | 'newsletter' | 'devotional' | 'roster';
        title: string;
        date: string;
      }> = [];

      // Process prayer requests
      if (prayerRequestsResult.status === 'fulfilled' && !prayerRequestsResult.value.error) {
        const requests = prayerRequestsResult.value.data || [];
        requests.forEach((req: any) => {
          activities.push({
            id: req.id,
            type: 'prayer',
            title: `New prayer request: ${req.name}`,
            date: req.created_at
          });
        });
      }

      // Process events
      if (eventsResult.status === 'fulfilled' && !eventsResult.value.error) {
        const events = eventsResult.value.data || [];
        events.forEach((event: any) => {
          const mostRecentDate = event.updated_at && new Date(event.updated_at) > new Date(event.created_at) 
            ? event.updated_at 
            : event.created_at;
          const isUpdate = event.updated_at && event.updated_at !== event.created_at && 
            new Date(event.updated_at) > new Date(event.created_at);
          activities.push({
            id: event.id,
            type: 'event',
            title: isUpdate ? `Event updated: ${event.title}` : `New event: ${event.title}`,
            date: mostRecentDate
          });
        });
      }

      // Process team members
      if (teamMembersResult.status === 'fulfilled' && !teamMembersResult.value.error) {
        const members = teamMembersResult.value.data || [];
        members.forEach((member: any) => {
          const mostRecentDate = member.updated_at && new Date(member.updated_at) > new Date(member.created_at) 
            ? member.updated_at 
            : member.created_at;
          const isUpdate = member.updated_at && member.updated_at !== member.created_at && 
            new Date(member.updated_at) > new Date(member.created_at);
          activities.push({
            id: member.id,
            type: 'team_member',
            title: isUpdate ? `${PEOPLE_LABEL} updated: ${member.name}` : `${PEOPLE_LABEL} added: ${member.name}`,
            date: mostRecentDate
          });
        });
      }

      // Process newsletters
      if (newslettersResult.status === 'fulfilled' && !newslettersResult.value.error) {
        const newsletters = newslettersResult.value.data || [];
        newsletters.forEach((newsletter: any) => {
          const mostRecentDate = newsletter.updated_at && new Date(newsletter.updated_at) > new Date(newsletter.created_at) 
            ? newsletter.updated_at 
            : newsletter.created_at;
          const isUpdate = newsletter.updated_at && newsletter.updated_at !== newsletter.created_at && 
            new Date(newsletter.updated_at) > new Date(newsletter.created_at);
          activities.push({
            id: newsletter.id,
            type: 'newsletter',
            title: isUpdate ? `Newsletter updated: ${newsletter.title}` : `Newsletter uploaded: ${newsletter.title}`,
            date: mostRecentDate
          });
        });
      }

      if (devotionalsResult.status === 'fulfilled' && !devotionalsResult.value.error) {
        const items = devotionalsResult.value.data || [];
        items.forEach((item: any) => {
          const mostRecentDate = item.updated_at && new Date(item.updated_at) > new Date(item.created_at)
            ? item.updated_at
            : item.created_at;
          const isUpdate = item.updated_at && item.updated_at !== item.created_at &&
            new Date(item.updated_at) > new Date(item.created_at);
          activities.push({
            id: item.id,
            type: 'devotional',
            title: isUpdate
              ? `Devotional updated: ${item.title}${item.subtitle ? ` — ${item.subtitle}` : ''}`
              : `Devotional uploaded: ${item.title}${item.subtitle ? ` — ${item.subtitle}` : ''}`,
            date: mostRecentDate
          });
        });
      }

      // Process roster
      if (rosterResult.status === 'fulfilled' && !rosterResult.value.error) {
        const rosterItems = rosterResult.value.data || [];
        rosterItems.forEach((item: any) => {
          const mostRecentDate = item.updated_at && new Date(item.updated_at) > new Date(item.created_at) 
            ? item.updated_at 
            : item.created_at;
          const isUpdate = item.updated_at && item.updated_at !== item.created_at && 
            new Date(item.updated_at) > new Date(item.created_at);
          activities.push({
            id: item.id,
            type: 'roster',
            title: isUpdate ? `Roster updated: ${item.name} - ${item.role}` : `Roster assignment: ${item.name} - ${item.role}`,
            date: mostRecentDate
          });
        });
      }

      // Sort all activities by date (most recent first) and take top 10
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivities(activities.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const visibleUsers = useMemo(
    () => filterUsersForAdminView(allUsers, user),
    [allUsers, user]
  );

  const visiblePendingUsers = useMemo(
    () => filterUsersForAdminView(pendingUsers, user).filter((u) => isPendingApproval(u)),
    [pendingUsers, user]
  );

  const visiblePendingCount = visiblePendingUsers.length;

  const visibleApprovedCount = useMemo(
    () => visibleUsers.filter((u) => u.is_approved === true).length,
    [visibleUsers]
  );

  const visibleNotLinkedCount = useMemo(
    () => visibleUsers.filter((u) => !linkedByUserId[u.id]).length,
    [visibleUsers, linkedByUserId]
  );

  const formatDate = (dateString: string | undefined, userTimezone?: string) => {
    // For admin views, display dates in the admin's current timezone
    return formatRelativeDateInTimezone(dateString, userTimezone);
  };

  const stats = useMemo(() => [
    { 
      label: 'Users', 
      value: isLoadingUsers ? '...' : visibleUsers.length.toString(), 
      icon: <UserCog size={20} />, 
      path: '/admin/users', 
      color: 'text-gold', 
      highlight: false,
      subtitle: isLoadingUsers
        ? undefined
        : (
            <OverviewUserBreakdown
              approved={visibleApprovedCount}
              pending={visiblePendingCount}
              notLinked={visibleNotLinkedCount}
            />
          ),
    },
    { 
      label: "People's Directory", 
      value: isLoadingStats ? '...' : teamMembersCount.toString(), 
      icon: <Users size={20} />, 
      path: '/admin/team', 
      color: 'text-teal-600',
      subtitle: undefined,
    },
    { 
      label: 'Prayer Requests', 
      value: isLoadingStats ? '...' : prayerRequestsCount.toString(), 
      icon: <HandHeart size={20} />, 
      path: '/admin/prayer', 
      color: 'text-blue-600',
      subtitle: isLoadingStats ? 'Loading...' : undefined
    },
    { 
      label: 'Next Service', 
      value: isLoadingStats ? '...' : (nextService || 'Sunday 10AM'), 
      icon: <Church size={20} />, 
      path: '/admin/events', 
      color: 'text-gray-700',
      subtitle: isLoadingStats ? 'Loading...' : undefined
    },
    {
      label: EVENTS_LABEL,
      value: isLoadingStats ? '...' : eventsCount.toString(),
      icon: <Calendar size={20} />,
      path: '/admin/events',
      color: 'text-green-600',
      subtitle: isLoadingStats ? 'Loading...' : undefined,
    },
    { 
      label: 'Newsletters', 
      value: isLoadingStats ? '...' : newsletterCount.toString(), 
      icon: <Newspaper size={20} />,
      path: '/admin/newsletter',
      color: 'text-orange-600',
      subtitle: isLoadingStats ? 'Loading...' : undefined,
    },
    { 
      label: 'Devotionals', 
      value: isLoadingStats ? '...' : devotionalsCount.toString(), 
      icon: <BookOpen size={20} />,
      path: '/admin/devotional', 
      color: 'text-purple-600',
      subtitle: isLoadingStats ? 'Loading...' : undefined
    },
    { 
      label: 'Rosters',
      value: isLoadingStats ? '...' : rosterAssignmentsCount.toString(), 
      icon: <ClipboardList size={20} />, 
      path: '/admin/roster', 
      color: 'text-indigo-600',
      subtitle: isLoadingStats ? 'Loading...' : undefined
    },
    {
      label: 'E-mails Sent',
      value: isLoadingStats
        ? '...'
        : emailsQuota
          ? `${formatEmailQuotaUsed(emailsQuota.day_count, emailsQuota.day_limit)} today`
          : '—',
      icon: <Mail size={20} />,
      path: '/admin/emails',
      color: emailsQuota?.blocked ? 'text-red-700' : 'text-amber-700',
      subtitle: isLoadingStats
        ? 'Loading...'
        : emailsQuota
          ? `${formatEmailQuotaUsed(emailsQuota.month_count, emailsQuota.month_limit)} this month · NZ time`
          : undefined,
      highlight: Boolean(emailsQuota && emailQuotaNearLimit(emailsQuota)),
    },
    {
      label: 'Annual Calendar',
      value: new Date().getFullYear().toString(),
      icon: <CalendarDays size={20} />,
      path: '/admin/calendar',
      color: 'text-emerald-600',
      subtitle: isLoadingStats ? 'Loading...' : undefined,
    },
  ], [visibleUsers.length, visibleApprovedCount, visiblePendingCount, visibleNotLinkedCount, isLoadingUsers, prayerRequestsCount, nextService, eventsCount, newsletterCount, devotionalsCount, isLoadingStats, teamMembersCount, rosterAssignmentsCount, emailsQuota]);

  console.log('AdminOverview - Rendering, user:', user, 'pendingCount:', pendingCount, 'isLoadingUsers:', isLoadingUsers);

  if (!user) {
    console.log('AdminOverview - No user, showing loading');
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  console.log('AdminOverview - User exists, rendering main content');
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Admin Dashboard"
        subtitle={`Welcome back, ${displayName(user)}. Manage your church community.`}
        icon={<Shield size={28} />}
        rightSlot={
          <span className="text-xs font-bold text-charcoal bg-gold px-4 py-2 rounded-full border border-gold uppercase tracking-widest shadow-sm">
            Admin Access
          </span>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 auto-rows-fr items-stretch justify-items-center gap-5 md:gap-6">
        {stats.map((stat, i) => {
          const description =
            stat.label === 'E-mails Sent' && !isLoadingStats && emailsQuota?.blocked
              ? 'Sending paused — daily or monthly limit reached'
              : stat.subtitle;

          const card = (
            <OverviewStatCard
              icon={stat.icon}
              iconClassName={`${stat.color} bg-gray-50`}
              label={stat.label}
              value={stat.value}
              description={description}
              highlight={stat.highlight}
              valueSize={stat.valueSize}
              valueClassName={stat.valueSize === 'title' ? 'line-clamp-2' : undefined}
            />
          );

          if (stat.path.startsWith('#')) {
            return (
              <a
                key={i}
                href={stat.path}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(stat.path.substring(1));
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="mx-auto flex h-full w-[48%] flex-col"
              >
                {card}
              </a>
            );
          }

          return (
            <Link key={i} to={stat.path} className="mx-auto flex h-full w-[48%] flex-col">
              {card}
            </Link>
          );
        })}
      </div>

      {/* Pending User Approvals Section */}
      <div id="pending-users" className="glass-card bg-white border border-gray-200 p-6 md:p-8 rounded-[8px] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gold/10 rounded-full">
              <Users size={24} className="text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-3xl text-charcoal font-normal">User Approval Requests</h2>
              <p className="text-neutral mt-1">Review and approve new user signups</p>
            </div>
          </div>
          {visiblePendingCount > 0 && (
            <span className="bg-gold text-charcoal px-4 py-2 rounded-full text-sm font-bold">
              {visiblePendingCount} {visiblePendingCount === 1 ? 'pending user' : 'pending users'}
            </span>
          )}
        </div>

        {isLoadingUsers ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonUserCard key={i} />
            ))}
          </div>
        ) : visiblePendingCount === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-[8px] border border-gray-100">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-neutral text-lg font-medium">No pending users</p>
            <p className="text-neutral text-sm mt-2">All users have been reviewed</p>
            <div className="mt-6 space-y-3">
              {visibleUsers.length > 0 && (
                <button
                  onClick={() => setShowAllUsers(!showAllUsers)}
                  className="text-gold hover:text-charcoal font-bold text-sm underline block"
                >
                  {showAllUsers ? 'Hide' : 'Show'} all users ({visibleUsers.length})
                </button>
              )}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-[4px]">
                <p className="text-sm text-yellow-800 font-bold mb-2">User Not Appearing?</p>
                <p className="text-xs text-yellow-700 mb-3">
                  If a user signed up but doesn't appear here, the database trigger may not have created their profile.
                  Go to Users to manually create their profile.
                </p>
                <Link
                  to="/admin/users"
                  className="bg-yellow-600 text-white px-4 py-2 rounded-[4px] text-sm font-bold hover:bg-yellow-700 transition-colors flex items-center gap-2 inline-block"
                >
                  <Plus size={16} />
                  Go to Users
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {visiblePendingUsers.map((pendingUser) => (
              <div
                key={pendingUser.id}
                className={`bg-white border border-gray-200 px-4 py-2.5 rounded-[8px] ${SURFACE_HOVER_CLASS} transition-all shadow-sm`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100 text-xs font-bold text-neutral flex items-center justify-center">
                        {photoByUserId[pendingUser.id] ? (
                          <img src={photoByUserId[pendingUser.id]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          displayInitials(pendingUser)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-medium text-base text-gold">{displayNameLastFirst(pendingUser)}</h3>
                          {pendingUser.role === 'admin' && (
                            <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-neutral">
                          {[
                            pendingUser.email,
                            pendingUser.phone,
                            pendingUser.created_at
                              ? `Signed up ${formatDate(pendingUser.created_at, pendingUser.user_timezone)}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto flex-shrink-0">
                    <button
                      onClick={() => handleApproveUser(pendingUser.id)}
                      className="bg-gold text-charcoal px-3 py-1.5 rounded-[4px] text-sm font-bold hover:bg-gold/80 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <UserCheck size={14} />
                      Approve
                    </button>
                    {pendingUser.role !== 'admin' && (
                      <button
                        onClick={() => handleApproveUser(pendingUser.id, true)}
                        className="bg-white border border-purple-200 text-purple-700 px-3 py-1.5 rounded-[4px] text-sm font-bold hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <Shield size={14} />
                        Approve as Admin
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEmailModalUser(pendingUser)}
                      className="bg-white border border-gray-200 text-charcoal px-3 py-1.5 rounded-[4px] text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-1.5"
                      title="Email this person"
                    >
                      <Mail size={14} />
                      Email
                    </button>
                    <button
                      onClick={() => handleRejectUser(pendingUser.id)}
                      className="bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-[4px] text-sm font-bold hover:bg-red-50 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <X size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug: Show All Users */}
        {showAllUsers && visibleUsers.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-serif text-xl text-charcoal font-normal mb-4">All Users (Debug View)</h3>
            <div className="space-y-3">
              {visibleUsers.map((u) => (
                <div
                  key={u.id}
                  className="bg-gray-50 border border-gray-200 p-4 rounded-[4px] text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-charcoal">{displayName(u)} ({u.email})</p>
                      <p className="text-neutral">
                        Role: {u.role} | Approved: {u.is_approved ? 'Yes' : 'No'} | 
                        Created: {u.created_at ? formatFullDateTimeInTimezone(u.created_at, u.user_timezone) : 'Unknown'}
                      </p>
                    </div>
                    {!u.is_approved && (
                      <button
                        onClick={() => handleApproveUser(u.id)}
                        className="bg-gold text-charcoal px-4 py-2 rounded-[4px] font-bold hover:bg-gold/80 transition-colors text-xs"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card bg-white/60 p-6 md:p-7 rounded-[8px] border border-gray-100">
          <h3 className="font-serif text-xl mb-4 text-charcoal font-normal">Quick Actions</h3>
          <div className="space-y-3">
            {visiblePendingCount > 0 && (
              <a
                href="#pending-users"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('pending-users')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block p-4 bg-white border-2 border-gold rounded-[4px] hover:border-gold hover:shadow-md transition-all"
              >
                <span className="font-semibold text-base text-charcoal">Review Pending Users</span>
                <p className="text-sm text-neutral mt-1">{visiblePendingCount} {visiblePendingCount === 1 ? 'user' : 'users'} awaiting approval</p>
              </a>
            )}
            <Link to="/admin/users" className="block p-4 bg-white border border-gray-100 rounded-[4px] hover:border-blue-300 hover:shadow-md transition-all">
              <span className="font-semibold text-base text-charcoal">Manage All Users</span>
              <p className="text-sm text-neutral mt-1">View and manage user roles and permissions</p>
            </Link>
            <Link to="/admin/prayer" className="block p-4 bg-white border border-gray-100 rounded-[4px] hover:border-gold hover:shadow-md transition-all">
              <span className="font-semibold text-base text-charcoal">Review New Prayer Requests</span>
              <p className="text-sm text-neutral mt-1">{pendingPrayerRequestsCount > 0 ? `${pendingPrayerRequestsCount} recent request${pendingPrayerRequestsCount === 1 ? '' : 's'}` : 'No recent requests'}</p>
            </Link>
            <Link to="/admin/calendar" className="block p-4 bg-white border border-gray-100 rounded-[4px] hover:border-gold hover:shadow-md transition-all">
              <span className="font-semibold text-base text-charcoal">Annual Calendar</span>
              <p className="text-sm text-neutral mt-1">See this year’s events, sermons, devotionals, and newsletters</p>
            </Link>
            <Link to="/admin/events" className="block p-4 bg-white border border-gray-100 rounded-[4px] hover:border-gold hover:shadow-md transition-all">
              <span className="font-semibold text-base text-charcoal">Add to {EVENTS_LABEL}</span>
              <p className="text-sm text-neutral mt-1">Create an upcoming listing</p>
            </Link>
            <Link to="/admin/newsletter" className="block p-4 bg-white border border-gray-100 rounded-[4px] hover:border-gold hover:shadow-md transition-all">
              <span className="font-semibold text-base text-charcoal">Upload Newsletter</span>
              <p className="text-sm text-neutral mt-1">Publish with title, week date, and PDF</p>
            </Link>
            <Link to="/admin/devotional" className="block p-4 bg-white border border-gray-100 rounded-[4px] hover:border-gold hover:shadow-md transition-all">
              <span className="font-semibold text-base text-charcoal">Upload Devotional</span>
              <p className="text-sm text-neutral mt-1">Publish this week&apos;s weekly PDF</p>
            </Link>
          </div>
        </div>

        <div className="glass-card bg-white/60 p-6 md:p-7 rounded-[8px] border border-gray-100">
          <h3 className="font-serif text-xl mb-4 text-charcoal font-normal">Recent Activity</h3>
          {isLoadingActivities ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-100 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-gray-300 mt-2"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`flex items-start gap-3 ${index < recentActivities.length - 1 ? 'pb-4 border-b border-gray-100' : ''}`}
                >
                  <div className="w-2 h-2 rounded-full bg-gold mt-2"></div>
                  <div>
                    <p className="text-sm text-charcoal font-medium leading-snug">{activity.title}</p>
                    <p className="text-xs text-neutral mt-0.5">{formatRelativeDateInTimezone(activity.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <IntroInquiryEmailModal
        isOpen={!!emailModalUser}
        onClose={() => setEmailModalUser(null)}
        targetUser={emailModalUser}
      />
    </div>
  );
};

