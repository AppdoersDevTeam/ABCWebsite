import React, { useState, useEffect } from 'react';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { Mail, Phone, User } from 'lucide-react';
import { TeamMember } from '../../types';
import { supabase } from '../../lib/supabase';
import { SkeletonPageHeader } from '../../components/UI/Skeleton';

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
        .order('name', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
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
      <div className="border-b border-gray-200 pb-6">
         <h1 className="text-4xl font-serif font-normal text-charcoal">Directory</h1>
         <p className="text-neutral mt-1">Staff and Leadership.</p>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral">No team members available yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <VibrantCard key={member.id} className="flex items-center space-x-6 group bg-white shadow-sm hover:shadow-md hover:border-gold">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-gold transition-colors flex-shrink-0">
                {member.img ? (
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gold/10 flex items-center justify-center">
                    <User size={32} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-xl text-charcoal">{member.name}</h4>
                <p className="text-xs text-gold font-bold uppercase tracking-wider mb-4">{member.role}</p>
                <div className="flex space-x-4 text-neutral">
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="hover:text-gold transition-colors" title={member.email}>
                      <Mail size={18} />
                    </a>
                  )}
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="hover:text-gold transition-colors" title={member.phone}>
                      <Phone size={18} />
                    </a>
                  )}
                </div>
              </div>
            </VibrantCard>
          ))}
        </div>
      )}
    </div>
  );
};