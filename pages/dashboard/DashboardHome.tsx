import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { Calendar, MessageSquare, BookOpen, ArrowUpRight } from 'lucide-react';

export const DashboardHome = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-end border-b border-gray-200 pb-6">
             <div>
                <h1 className="text-4xl font-serif font-bold text-charcoal">Welcome, {user?.name}</h1>
                <p className="text-neutral mt-2">Here is what is happening in your community.</p>
             </div>
             <div className="hidden md:block">
                 <span className="text-xs font-bold text-charcoal bg-gold px-4 py-2 rounded-full border border-gold uppercase tracking-widest shadow-sm">Member Access</span>
             </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <VibrantCard className="group cursor-pointer bg-white hover:shadow-lg hover:border-gold">
                <div className="absolute top-4 right-4 text-gray-400 group-hover:text-gold transition-colors"><ArrowUpRight /></div>
                <div className="mb-4 text-charcoal p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-gold transition-colors">
                    <Calendar size={32} />
                </div>
                <h3 className="font-bold text-xl mb-2 text-charcoal">Next Service</h3>
                <p className="text-neutral mb-4">Sunday, 10:00 AM</p>
                <div className="pt-4 border-t border-gray-100">
                    <span className="text-gold font-bold text-sm">Rostered: Welcome Team</span>
                </div>
            </VibrantCard>

            <VibrantCard className="group cursor-pointer bg-white hover:shadow-lg hover:border-gold">
                 <div className="absolute top-4 right-4 text-gray-400 group-hover:text-gold transition-colors"><ArrowUpRight /></div>
                 <div className="mb-4 text-charcoal p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-gold transition-colors">
                    <MessageSquare size={32} />
                </div>
                <h3 className="font-bold text-xl mb-2 text-charcoal">Prayer Wall</h3>
                <p className="text-neutral mb-4">3 new requests.</p>
                 <div className="pt-4 border-t border-gray-100">
                    <span className="text-charcoal font-bold text-sm underline decoration-gold">View Requests</span>
                </div>
            </VibrantCard>

             <VibrantCard className="group cursor-pointer bg-white hover:shadow-lg hover:border-gold">
                 <div className="absolute top-4 right-4 text-gray-400 group-hover:text-gold transition-colors"><ArrowUpRight /></div>
                 <div className="mb-4 text-charcoal p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-gold transition-colors">
                    <BookOpen size={32} />
                </div>
                <h3 className="font-bold text-xl mb-2 text-charcoal">Newsletter</h3>
                <p className="text-neutral mb-4">October Edition</p>
                 <div className="pt-4 border-t border-gray-100">
                    <span className="text-charcoal font-bold text-sm underline decoration-gold">Read Now</span>
                </div>
            </VibrantCard>
        </div>

        <div className="glass-card bg-white/60 p-10 rounded-[8px] relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="font-serif text-3xl mb-4 text-charcoal font-bold">Verse of the Day</h3>
                <p className="text-2xl text-charcoal/80 italic font-serif leading-relaxed max-w-3xl">
                    "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."
                </p>
                <p className="mt-6 text-charcoal font-black tracking-widest uppercase text-sm">Jeremiah 29:11</p>
             </div>
        </div>
    </div>
  );
};