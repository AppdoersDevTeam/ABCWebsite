import React, { useState, useEffect } from 'react';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { Mail, Phone, User, Users } from 'lucide-react';
import { TeamMember } from '../../types';
import { supabase } from '../../lib/supabase';
import { getDisplayRole, inferProfileType } from '../../lib/teamMemberUtils';
import { SkeletonPageHeader } from '../../components/UI/Skeleton';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';
import { PEOPLE_LABEL } from '../../lib/constants';

export const Team = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_archived', false)
        .order('name', { ascending: true });

      if (error) throw error;
      const all = (data || []) as TeamMember[];
      const staffOnly = all.filter((m) => inferProfileType(m) === 'staff');
      setMembers(staffOnly);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={PEOPLE_LABEL}
        subtitle="Staff and church leadership."
        icon={<Users size={28} />}
      />

      {members.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral">No staff profiles available yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <VibrantCard
              key={member.id}
              className="group bg-white shadow-sm hover:shadow-md hover:border-gold text-left py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-[59px] h-[59px] rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-gold transition-colors flex-shrink-0">
                  {member.img ? (
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gold/10 flex items-center justify-center">
                      <User size={24} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-lg text-charcoal truncate">{member.name}</h4>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex flex-col items-center justify-center gap-0.5 flex-shrink-0 text-neutral">
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="hover:text-gold transition-colors" title={member.email}>
                          <Mail size={16} />
                        </a>
                      )}
                      {member.phone && (
                        <a href={`tel:${member.phone}`} className="hover:text-gold transition-colors" title={member.phone}>
                          <Phone size={16} />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gold font-bold uppercase tracking-wider truncate">
                      {getDisplayRole(member)}
                    </p>
                  </div>
                </div>
              </div>
            </VibrantCard>
          ))}
        </div>
      )}
    </div>
  );
};