import React from 'react';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { Mail, Phone } from 'lucide-react';

export const Team = () => {
  const staff = [
    { name: "Alex Johnson", role: "Youth Pastor", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
    { name: "Maria Garcia", role: "Worship Leader", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
    { name: "James Wilson", role: "Elder", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" },
    { name: "Linda Chen", role: "Admin", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" },
    { name: "Robert Taylor", role: "Facilities", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
    { name: "Patricia Lee", role: "Children's Ministry", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
         <h1 className="text-4xl font-serif font-bold text-charcoal">Directory</h1>
         <p className="text-neutral mt-1">Staff and Leadership.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member, i) => (
            <VibrantCard key={i} className="flex items-center space-x-6 group bg-white shadow-sm hover:shadow-md hover:border-gold">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-gold transition-colors flex-shrink-0">
                     <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h4 className="font-bold text-xl text-charcoal">{member.name}</h4>
                    <p className="text-xs text-gold font-bold uppercase tracking-wider mb-4">{member.role}</p>
                    <div className="flex space-x-4 text-neutral">
                        <Mail size={18} className="hover:text-gold cursor-pointer transition-colors" />
                        <Phone size={18} className="hover:text-gold cursor-pointer transition-colors" />
                    </div>
                </div>
            </VibrantCard>
        ))}
      </div>
    </div>
  );
};