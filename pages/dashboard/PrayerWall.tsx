import React from 'react';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { MessageCircle, Heart } from 'lucide-react';

export const PrayerWall = () => {
  const requests = [
    { name: "Sarah M.", date: "2 days ago", content: "Please pray for my mother who is going into surgery tomorrow.", count: 5 },
    { name: "Anonymous", date: "4 days ago", content: "Seeking guidance for a new job opportunity.", count: 2 },
    { name: "The Wilson Family", date: "1 week ago", content: "Praise God for our new baby boy!", count: 12 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
           <h1 className="text-4xl font-serif font-bold text-charcoal">Prayer Wall</h1>
           <p className="text-neutral mt-1">Bear one another's burdens.</p>
        </div>
        <GlowingButton size="sm">Share Request</GlowingButton>
      </div>

      <div className="grid gap-6">
        {requests.map((req, i) => (
            <div key={i} className="bg-white border border-gray-100 shadow-sm p-6 rounded-[8px] hover:shadow-md hover:border-gold transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/10 text-charcoal flex items-center justify-center font-bold">
                            {req.name.charAt(0)}
                        </div>
                        <div>
                            <span className="font-bold text-charcoal block">{req.name}</span>
                            <span className="text-xs text-neutral uppercase tracking-widest">{req.date}</span>
                        </div>
                    </div>
                </div>
                <p className="text-charcoal leading-relaxed mb-6 text-lg font-light pl-12 border-l-2 border-gold/20">{req.content}</p>
                <div className="flex items-center space-x-6 border-t border-gray-100 pt-4 pl-12">
                    <button className="flex items-center text-sm text-neutral hover:text-gold transition-colors font-bold uppercase tracking-wider">
                        <Heart size={16} className="mr-2" /> Praying ({req.count})
                    </button>
                    <button className="flex items-center text-sm text-neutral hover:text-charcoal transition-colors font-bold uppercase tracking-wider">
                        <MessageCircle size={16} className="mr-2" /> Encouragement
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};