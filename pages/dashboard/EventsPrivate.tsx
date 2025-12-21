import React from 'react';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { Calendar as CalIcon } from 'lucide-react';

export const EventsPrivate = () => {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
         <h1 className="text-4xl font-serif font-bold text-charcoal">Internal Calendar</h1>
         <p className="text-neutral mt-1">Meetings & Rehearsals.</p>
      </div>

      <div className="space-y-4">
        {[
            { date: "Oct 24", title: "Worship Team Rehearsal", time: "7:30 PM", loc: "Main Auditorium" },
            { date: "Oct 26", title: "Elders Meeting", time: "6:00 PM", loc: "Meeting Room B" },
            { date: "Oct 29", title: "Working Bee", time: "8:00 AM", loc: "Grounds" },
        ].map((evt, i) => (
            <div key={i} className="flex items-center p-6 bg-white border border-gray-100 shadow-sm rounded-[8px] hover:border-gold hover:shadow-md transition-all group">
                <div className="flex-shrink-0 w-20 text-center border-r border-gray-100 pr-6 mr-6">
                    <span className="block text-xs text-gold uppercase font-bold tracking-widest">{evt.date.split(' ')[0]}</span>
                    <span className="block text-3xl font-serif text-charcoal font-bold">{evt.date.split(' ')[1]}</span>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-charcoal group-hover:text-gold transition-colors">{evt.title}</h3>
                    <p className="text-neutral text-sm mt-1 flex items-center"><span className="w-2 h-2 rounded-full bg-gold mr-2"></span> {evt.time} • {evt.loc}</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};