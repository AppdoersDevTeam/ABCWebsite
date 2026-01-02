import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { Calendar, MessageSquare, BookOpen, Users, Image, ClipboardList, ArrowUpRight, UserCheck, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import { SkeletonPageHeader, SkeletonCard, SkeletonUserCard, SkeletonStatsCard } from '../../components/UI/Skeleton';
import { formatRelativeDateInTimezone, formatFullDateTimeInTimezone } from '../../lib/dateUtils';

export const AdminOverview = () => {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [prayerRequests24h, setPrayerRequests24h] = useState(0);
  const [nextService, setNextService] = useState<string | null>(null);
  const [lastNewsletterDate, setLastNewsletterDate] = useState<string | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [teamMembersCount, setTeamMembersCount] = useState(0);
  const [photoFoldersCount, setPhotoFoldersCount] = useState(0);
  const [rosterAssignmentsCount, setRosterAssignmentsCount] = useState(0);
  const [pendingPrayerRequestsCount, setPendingPrayerRequestsCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string;
    type: 'prayer' | 'event' | 'team_member' | 'newsletter' | 'roster';
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
    } catch (error) {
      console.error('AdminOverview - Error fetching pending users:', error);
      setPendingUsers([]);
      setPendingCount(0);
    } finally {
      setIsLoadingUsers(false);
      console.log('AdminOverview - fetchPendingUsers completed');
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
      fetchPendingUsers();
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
      // Delete the user from users table
      // Note: To delete from auth.users, you'll need to use Supabase Admin API with service role
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;

      fetchPendingUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user. Note: User record deleted from database, but auth account may still exist.');
    }
  };


  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      // Fetch prayer requests from last 24 hours (only non-deleted requests)
      // Since requests are hard-deleted, we just need to count existing requests
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      // Count only requests that still exist (not deleted)
      // Hard-deleted requests won't appear in the query, so this automatically excludes them
      const { data: prayerRequests, error: prayerError } = await supabase
        .from('prayer_requests')
        .select('id')
        .gte('created_at', twentyFourHoursAgo.toISOString());

      if (prayerError) {
        console.error('Error fetching prayer requests:', prayerError);
        setPrayerRequests24h(0);
      } else {
        // Count only existing (non-deleted) requests
        setPrayerRequests24h(prayerRequests?.length || 0);
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

      // Fetch team members count
      const { count: teamCount, error: teamError } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true });

      if (!teamError) {
        setTeamMembersCount(teamCount || 0);
      }

      // Fetch photo folders count
      const { count: photoFoldersCount, error: photoFoldersError } = await supabase
        .from('photo_folders')
        .select('*', { count: 'exact', head: true });

      if (!photoFoldersError) {
        setPhotoFoldersCount(photoFoldersCount || 0);
      }

      // Fetch roster assignments count
      const { count: rosterCount, error: rosterError } = await supabase
        .from('roster')
        .select('*', { count: 'exact', head: true });

      if (!rosterError) {
        setRosterAssignmentsCount(rosterCount || 0);
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
      const month = nextSunday.toLocaleDateString('en-US', { month: 'long' });
      const day = nextSunday.getDate();
      setNextService(`${day} ${month}`);

      // Fetch last newsletter date
      const { data: newsletters, error: newsletterError } = await supabase
        .from('newsletters')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      if (newsletterError) {
        console.error('Error fetching newsletters:', newsletterError);
      } else if (newsletters && newsletters.length > 0) {
        const lastNewsletter = new Date(newsletters[0].created_at);
        setLastNewsletterDate(lastNewsletter.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
      }
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
        type: 'prayer' | 'event' | 'team_member' | 'newsletter' | 'roster';
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
            title: isUpdate ? `Team member updated: ${member.name}` : `Team member added: ${member.name}`,
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

  const formatDate = (dateString: string | undefined, userTimezone?: string) => {
    // For admin views, display dates in the admin's current timezone
    return formatRelativeDateInTimezone(dateString, userTimezone);
  };

  const stats = useMemo(() => [
    { 
      label: 'Pending Approvals', 
      value: pendingCount.toString(), 
      icon: <UserCheck size={24} />, 
      path: '#pending-users', 
      color: 'text-gold', 
      highlight: pendingCount > 0 
    },
    { 
      label: 'New Prayer Requests (24h)', 
      value: isLoadingStats ? '...' : prayerRequests24h.toString(), 
      icon: <MessageSquare size={24} />, 
      path: '/admin/prayer', 
      color: 'text-blue-500',
      subtitle: isLoadingStats ? 'Loading...' : undefined
    },
    { 
      label: 'Next Service', 
      value: isLoadingStats ? '...' : (nextService || 'Sunday 10AM'), 
      icon: <Calendar size={24} />, 
      path: '/admin/events', 
      color: 'text-green-500',
      subtitle: isLoadingStats ? 'Loading...' : undefined
    },
    { 
      label: 'Last Newsletter', 
      value: isLoadingStats ? '...' : (lastNewsletterDate || 'None'), 
      icon: <BookOpen size={24} />, 
      path: '/admin/newsletter', 
      color: 'text-orange-500',
      subtitle: isLoadingStats ? 'Loading...' : undefined
    },
    { 
      label: 'Team Members', 
      value: isLoadingStats ? '...' : teamMembersCount.toString(), 
      icon: <Users size={24} />, 
      path: '/admin/team', 
      color: 'text-purple-500',
      subtitle: isLoadingStats ? 'Loading...' : undefined
    },
    { 
      label: 'Photo Folders', 
      value: isLoadingStats ? '...' : photoFoldersCount.toString(), 
      icon: <Image size={24} />, 
      path: '/admin/photos', 
      color: 'text-pink-500',
      subtitle: isLoadingStats ? 'Loading...' : undefined
    },
    { 
      label: 'Roster Assignments', 
      value: isLoadingStats ? '...' : rosterAssignmentsCount.toString(), 
      icon: <ClipboardList size={24} />, 
      path: '/admin/roster', 
      color: 'text-indigo-500',
      subtitle: isLoadingStats ? 'Loading...' : undefined
    },
  ], [pendingCount, prayerRequests24h, nextService, lastNewsletterDate, isLoadingStats, teamMembersCount, photoFoldersCount, rosterAssignmentsCount]);

  console.log('AdminOverview - Rendering, user:', user, 'pendingCount:', pendingCount, 'isLoadingUsers:', isLoadingUsers);

  if (!user) {
    console.log('AdminOverview - No user, showing loading');
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  console.log('AdminOverview - User exists, rendering main content');
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-normal text-charcoal">Admin Dashboard</h1>
          <p className="text-neutral mt-2">Welcome back, {user?.name || 'Admin'}. Manage your church community.</p>
        </div>
        <div className="hidden md:block">
          <span className="text-xs font-bold text-charcoal bg-gold px-4 py-2 rounded-full border border-gold uppercase tracking-widest shadow-sm">Admin Access</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const content = (
            <VibrantCard className={`group cursor-pointer bg-white hover:shadow-lg hover:border-gold transition-all ${stat.highlight ? 'border-2 border-gold' : ''}`}>
              <div className="absolute top-4 right-4 text-gray-400 group-hover:text-gold transition-colors">
                <ArrowUpRight />
              </div>
              <div className={`mb-4 text-charcoal p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-gold transition-colors ${stat.color} ${stat.highlight ? 'bg-gold/20' : ''}`}>
                {stat.icon}
              </div>
              <h3 className="font-bold text-xl mb-2 text-charcoal">{stat.label}</h3>
              <p className={`text-4xl font-serif font-normal mb-1 ${stat.highlight ? 'text-gold' : 'text-charcoal'}`}>{stat.value}</p>
              {stat.subtitle && (
                <p className="text-sm text-neutral mb-2">{stat.subtitle}</p>
              )}
              {stat.label === 'Next Service' && nextService && !isLoadingStats && (
                <p className="text-sm text-neutral mt-1">Every Sunday at 10:00 AM</p>
              )}
              {stat.label === 'Last Newsletter' && lastNewsletterDate && !isLoadingStats && (
                <p className="text-sm text-neutral mt-1">Uploaded {lastNewsletterDate}</p>
              )}
              <div className="pt-4 border-t border-gray-100">
                <span className="text-gold font-bold text-sm">Manage →</span>
              </div>
            </VibrantCard>
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
                className="block"
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={i} to={stat.path} className="block">
              {content}
            </Link>
          );
        })}
      </div>

      {/* Pending User Approvals Section */}
      <div id="pending-users" className="glass-card bg-white border border-gray-200 p-8 rounded-[8px] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gold/10 rounded-full">
              <UserCheck size={24} className="text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-3xl text-charcoal font-normal">User Approval Requests</h2>
              <p className="text-neutral mt-1">Review and approve new user signups</p>
            </div>
          </div>
          {pendingCount > 0 && (
            <span className="bg-gold text-charcoal px-4 py-2 rounded-full text-sm font-bold">
              {pendingCount} {pendingCount === 1 ? 'pending user' : 'pending users'}
            </span>
          )}
        </div>

        {isLoadingUsers ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonUserCard key={i} />
            ))}
          </div>
        ) : pendingCount === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-[8px] border border-gray-100">
            <UserCheck size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-neutral text-lg font-medium">No pending user approvals</p>
            <p className="text-neutral text-sm mt-2">All users have been reviewed</p>
            <div className="mt-6 space-y-3">
              {allUsers.length > 0 && (
                <button
                  onClick={() => setShowAllUsers(!showAllUsers)}
                  className="text-gold hover:text-charcoal font-bold text-sm underline block"
                >
                  {showAllUsers ? 'Hide' : 'Show'} all users ({allUsers.length})
                </button>
              )}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-[4px]">
                <p className="text-sm text-yellow-800 font-bold mb-2">User Not Appearing?</p>
                <p className="text-xs text-yellow-700 mb-3">
                  If a user signed up but doesn't appear here, the database trigger may not have created their profile.
                  Go to User Management to manually create their profile.
                </p>
                <Link
                  to="/admin/users"
                  className="bg-yellow-600 text-white px-4 py-2 rounded-[4px] text-sm font-bold hover:bg-yellow-700 transition-colors flex items-center gap-2 inline-block"
                >
                  <Plus size={16} />
                  Go to User Management
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((pendingUser) => (
              <div
                key={pendingUser.id}
                className="bg-white border-2 border-gray-200 p-6 rounded-[8px] hover:border-gold transition-all shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gold/10 text-charcoal flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {pendingUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-xl text-charcoal">{pendingUser.name}</h3>
                          {pendingUser.role === 'admin' && (
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded uppercase font-bold">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {pendingUser.email && (
                            <p className="text-sm text-neutral flex items-center gap-2">
                              <span className="font-bold">Email:</span> {pendingUser.email}
                            </p>
                          )}
                          {pendingUser.phone && (
                            <p className="text-sm text-neutral flex items-center gap-2">
                              <span className="font-bold">Phone:</span> {pendingUser.phone}
                            </p>
                          )}
                          {pendingUser.created_at && (
                              <p className="text-xs text-neutral flex items-center gap-2 mt-2">
                              <span className="font-bold">Signed up:</span> {formatDate(pendingUser.created_at, pendingUser.user_timezone)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleApproveUser(pendingUser.id)}
                      className="bg-gold text-charcoal px-6 py-3 rounded-[4px] font-bold hover:bg-gold/80 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <UserCheck size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectUser(pendingUser.id)}
                      className="bg-white border-2 border-red-200 text-red-600 px-6 py-3 rounded-[4px] font-bold hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <X size={18} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug: Show All Users */}
        {showAllUsers && allUsers.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-serif text-xl text-charcoal font-normal mb-4">All Users (Debug View)</h3>
            <div className="space-y-3">
              {allUsers.map((u) => (
                <div
                  key={u.id}
                  className="bg-gray-50 border border-gray-200 p-4 rounded-[4px] text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-charcoal">{u.name} ({u.email})</p>
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
        <div className="glass-card bg-white/60 p-8 rounded-[8px] border border-gray-100">
          <h3 className="font-serif text-2xl mb-4 text-charcoal font-normal">Quick Actions</h3>
          <div className="space-y-3">
            {pendingCount > 0 && (
              <a
                href="#pending-users"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('pending-users')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block p-4 bg-white border-2 border-gold rounded-[4px] hover:border-gold hover:shadow-md transition-all"
              >
                <span className="font-bold text-charcoal">Review Pending User Approvals</span>
                <p className="text-sm text-neutral mt-1">{pendingCount} {pendingCount === 1 ? 'user' : 'users'} awaiting approval</p>
              </a>
            )}
            <Link to="/admin/users" className="block p-4 bg-white border border-gray-100 rounded-[4px] hover:border-blue-300 hover:shadow-md transition-all">
              <span className="font-bold text-charcoal">Manage All Users</span>
              <p className="text-sm text-neutral mt-1">View and manage user roles and permissions</p>
            </Link>
            <Link to="/admin/prayer" className="block p-4 bg-white border border-gray-100 rounded-[4px] hover:border-gold hover:shadow-md transition-all">
              <span className="font-bold text-charcoal">Review New Prayer Requests</span>
              <p className="text-sm text-neutral mt-1">{pendingPrayerRequestsCount > 0 ? `${pendingPrayerRequestsCount} recent request${pendingPrayerRequestsCount === 1 ? '' : 's'}` : 'No recent requests'}</p>
            </Link>
            <Link to="/admin/events" className="block p-4 bg-white border border-gray-100 rounded-[4px] hover:border-gold hover:shadow-md transition-all">
              <span className="font-bold text-charcoal">Add New Event</span>
              <p className="text-sm text-neutral mt-1">Create upcoming church event</p>
            </Link>
            <Link to="/admin/newsletter" className="block p-4 bg-white border border-gray-100 rounded-[4px] hover:border-gold hover:shadow-md transition-all">
              <span className="font-bold text-charcoal">Upload Newsletter</span>
              <p className="text-sm text-neutral mt-1">Share latest church updates</p>
            </Link>
          </div>
        </div>

        <div className="glass-card bg-white/60 p-8 rounded-[8px] border border-gray-100">
          <h3 className="font-serif text-2xl mb-4 text-charcoal font-normal">Recent Activity</h3>
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
                    <p className="text-sm text-charcoal font-bold">{activity.title}</p>
                    <p className="text-xs text-neutral">{formatRelativeDateInTimezone(activity.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

