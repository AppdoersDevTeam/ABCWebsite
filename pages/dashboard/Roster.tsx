import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, FileText, Users } from 'lucide-react';
import { Group, JobRole, RosterImage, TeamMember } from '../../types';
import { supabase } from '../../lib/supabase';
import { SkeletonPageHeader } from '../../components/UI/Skeleton';
import { useAuth } from '../../context/AuthContext';

export const Roster = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [rostersByGroup, setRostersByGroup] = useState<Map<string, RosterImage[]>>(new Map());
  const [leaderByGroup, setLeaderByGroup] = useState<Map<string, { name: string; img?: string | null }>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedRosterId, setSelectedRosterId] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      setSelectedGroupId(null);
      setSelectedRosterId(null);

      if (!user?.email) {
        setGroups([]);
        setRostersByGroup(new Map());
        setLeaderByGroup(new Map());
        setIsLoading(false);
        return;
      }

      try {
        // 1) Resolve this user's ministry (group) memberships from Directory
        const { data: tm, error: tmErr } = await supabase
          .from('team_members')
          .select(
            `
            id,
            email,
            team_member_groups:team_member_groups(
              group_id,
              groups:groups(id, name, slug, sort_order, is_active)
            )
          `
          )
          .ilike('email', user.email)
          .maybeSingle();

        if (tmErr) throw tmErr;

        const memberGroups: Group[] =
          (tm?.team_member_groups || [])
            .map((x: any) => x.groups as Group)
            .filter(Boolean) || [];

        const uniqueGroups = Array.from(new Map(memberGroups.map((g) => [g.id, g])).values()).filter(
          (g) => g.is_active !== false
        );

        setGroups(uniqueGroups);

        const groupIds = uniqueGroups.map((g) => g.id);
        if (groupIds.length === 0) {
          setRostersByGroup(new Map());
          setLeaderByGroup(new Map());
          return;
        }

        // 2) Fetch rosters only for ministries the user belongs to
        const { data: rosterRows, error: rosterErr } = await supabase
          .from('roster_images')
          .select('id, group_id, date, date_from, date_to, pdf_url, created_at, updated_at')
          .in('group_id', groupIds)
          .order('date_from', { ascending: false })
          .order('created_at', { ascending: false });

        if (rosterErr) throw rosterErr;

        const byGroup = new Map<string, RosterImage[]>();
        (rosterRows || []).forEach((r: RosterImage) => {
          const gid = r.group_id;
          if (!gid) return;
          const cur = byGroup.get(gid) || [];
          cur.push(r);
          byGroup.set(gid, cur);
        });
        setRostersByGroup(byGroup);

        // 3) Resolve leaders for these ministries using job role rule:
        // leader job role name must equal "<Group Name> Leader"
        const { data: leadersRaw, error: leadersErr } = await supabase
          .from('team_members')
          .select(
            `
            id,
            name,
            img,
            team_member_groups:team_member_groups(group_id),
            team_member_job_roles:team_member_job_roles(
              job_roles:job_roles(id, name)
            )
          `
          )
          .in('team_member_groups.group_id', groupIds);

        if (leadersErr) throw leadersErr;

        const leaders = new Map<string, { name: string; img?: string | null }>();
        (leadersRaw || []).forEach((row: any) => {
          const member: TeamMember = row as TeamMember;
          const memberGroupIds: string[] = (row.team_member_groups || []).map((x: any) => x.group_id).filter(Boolean);
          const memberRoleNames: string[] = (row.team_member_job_roles || [])
            .map((x: any) => (x.job_roles as JobRole | null)?.name)
            .filter(Boolean);

          memberGroupIds.forEach((gid) => {
            if (leaders.has(gid)) return;
            const groupName = uniqueGroups.find((g) => g.id === gid)?.name;
            if (!groupName) return;
            const requiredRole = `${groupName} Leader`;
            if (!memberRoleNames.includes(requiredRole)) return;
            leaders.set(gid, { name: member.name, img: member.img });
          });
        });

        setLeaderByGroup(leaders);
      } catch (e) {
        console.error('Error fetching roster dashboard data:', e);
        setGroups([]);
        setRostersByGroup(new Map());
        setLeaderByGroup(new Map());
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [user?.email]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatRangeShort = (roster: RosterImage) => {
    const from = roster.date_from || roster.date || null;
    const to = roster.date_to || roster.date || null;
    if (!from && !to) return 'Roster';
    if (from && to && from !== to) return `${formatDateShort(from)} – ${formatDateShort(to)}`;
    const single = from || to;
    return single ? formatDateShort(single) : 'Roster';
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="bg-white border border-gray-100 rounded-[8px] p-8">
          <div className="h-96 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const rosterLinkedGroups = groups
    .map((g) => ({ group: g, rosters: rostersByGroup.get(g.id) || [] }))
    .filter((x) => x.rosters.length > 0);

  if (rosterLinkedGroups.length === 0) {
    return (
      <div className="space-y-8">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-serif font-normal text-charcoal">Roster</h1>
          <p className="text-neutral mt-1">View roster schedules.</p>
        </div>
        <div className="text-center py-12 bg-white border border-gray-100 rounded-[8px]">
          <FileText size={48} className="mx-auto text-neutral mb-4" />
          <p className="text-neutral text-lg mb-2">No rosters at this time.</p>
          <p className="text-neutral text-sm">If you recently joined a ministry, check back later.</p>
        </div>
      </div>
    );
  }

  const selected =
    selectedGroupId ? rosterLinkedGroups.find((x) => x.group.id === selectedGroupId) || null : null;
  const selectedRoster =
    selected && selectedRosterId ? selected.rosters.find((r) => r.id === selectedRosterId) || null : null;

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-serif font-normal text-charcoal">Roster</h1>
        <p className="text-neutral mt-1">View roster schedules.</p>
      </div>

      {!selected ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rosterLinkedGroups.map(({ group, rosters }) => {
            const leader = leaderByGroup.get(group.id);
            const latest = rosters[0];
            return (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className="text-left bg-white border border-gray-100 rounded-[8px] p-6 shadow-sm hover:shadow-md hover:border-gold transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-charcoal">{group.name}</h3>
                    <p className="text-sm text-neutral mt-1">
                      {leader ? `Leader: ${leader.name}` : 'Leader: —'}
                    </p>
                  </div>
                  {leader?.img ? (
                    <img
                      src={leader.img}
                      alt={leader.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <Users size={18} className="text-neutral" />
                    </div>
                  )}
                </div>

                {latest && (
                  <div className="mt-4 flex items-center gap-2 text-gold">
                    <Calendar size={16} />
                    <span className="text-sm font-bold uppercase tracking-wider">{formatRangeShort(latest)}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedGroupId(null)}
            className="inline-flex items-center gap-2 text-sm font-bold text-charcoal hover:text-gold transition-colors"
          >
            <ArrowLeft size={16} />
            Back to ministries
          </button>

          <div className="bg-white border border-gray-200 rounded-[8px] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-charcoal">{selected.group.name}</h2>
                <p className="text-sm text-neutral mt-1">
                  {leaderByGroup.get(selected.group.id)?.name
                    ? `Leader: ${leaderByGroup.get(selected.group.id)?.name}`
                    : 'Leader: —'}
                </p>
              </div>
              {leaderByGroup.get(selected.group.id)?.img ? (
                <img
                  src={leaderByGroup.get(selected.group.id)?.img as string}
                  alt={leaderByGroup.get(selected.group.id)?.name || 'Leader'}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
              ) : null}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white border border-gray-100 rounded-[8px] p-4">
              <p className="text-sm font-bold text-charcoal mb-3">Rosters</p>
              <div className="space-y-2">
                {selected.rosters.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRosterId(r.id)}
                    className={`block w-full text-left bg-gray-50 border rounded-[6px] p-3 transition-colors ${
                      selectedRosterId === r.id
                        ? 'border-gold bg-white'
                        : 'border-gray-200 hover:border-gold hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-charcoal truncate">{formatRangeShort(r)}</p>
                        {(r.date_from || r.date_to || r.date) && (
                          <p className="text-xs text-neutral mt-1">
                            {r.date_from || r.date ? formatDate(r.date_from || (r.date as string)) : ''}
                          </p>
                        )}
                      </div>
                      <FileText size={16} className="text-neutral shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[8px] p-6 shadow-sm">
              {!selectedRoster ? (
                <>
                  <p className="text-sm font-bold text-charcoal mb-3">Select a roster</p>
                  <p className="text-sm text-neutral">Choose a roster from the list to preview it here.</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 text-gold">
                      <Calendar size={16} />
                      <span className="text-sm font-bold uppercase tracking-wider">
                        {formatRangeShort(selectedRoster)}
                      </span>
                    </div>
                    <a
                      href={selectedRoster.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:text-charcoal font-bold text-sm transition-colors inline-flex items-center gap-2"
                    >
                      <FileText size={16} />
                      Open PDF in new tab
                    </a>
                  </div>

                  <iframe
                    src={selectedRoster.pdf_url}
                    className="w-full h-[800px] rounded-[4px] border border-gray-200"
                    title={`Roster ${formatRangeShort(selectedRoster)}`}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
