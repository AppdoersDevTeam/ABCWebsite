import React from 'react';
import { Download, Filter, ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { RosterMember } from '../../types';

export const Roster = () => {
  const rosterData: RosterMember[] = [
    { id: '1', name: 'Sarah Jenkins', role: 'Worship Leader', date: 'Oct 24', status: 'confirmed', team: 'Worship' },
    { id: '2', name: 'Michael Chen', role: 'Bass Guitar', date: 'Oct 24', status: 'pending', team: 'Worship' },
    { id: '3', name: 'David Smith', role: 'Sound Engineer', date: 'Oct 24', status: 'confirmed', team: 'Tech' },
    { id: '4', name: 'Emily White', role: 'Visuals', date: 'Oct 24', status: 'declined', team: 'Tech' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-charcoal">Roster</h1>
          <p className="text-neutral mt-1">Manage team schedules.</p>
        </div>
        <div className="flex gap-3">
          <GlowingButton variant="outline" size="sm" className="flex items-center"><Filter size={16} className="mr-2"/> Filter</GlowingButton>
          <GlowingButton variant="gold" size="sm" className="flex items-center"><Download size={16} className="mr-2"/> Export</GlowingButton>
        </div>
      </div>

      {/* Date Nav */}
      <div className="flex items-center justify-between bg-white p-4 rounded-[8px] border border-gray-200 shadow-sm">
        <button className="p-2 hover:bg-gray-100 rounded-full text-charcoal transition-colors"><ChevronLeft /></button>
        <div className="text-center">
            <h3 className="font-bold text-xl text-charcoal">Sunday Service</h3>
            <p className="text-sm text-gold font-bold uppercase tracking-widest">Oct 24 • 10:00 AM</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full text-charcoal transition-colors"><ChevronRight /></button>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rosterData.map((member) => (
              <div key={member.id} className="bg-white border border-gray-100 p-6 rounded-[8px] hover:border-gold hover:shadow-md transition-all duration-300 relative overflow-hidden group shadow-sm">
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      member.status === 'confirmed' ? 'bg-green-500' : 
                      member.status === 'declined' ? 'bg-red-500' : 'bg-gold'
                  }`}></div>

                  <div className="flex justify-between items-start mb-4 pl-4">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-charcoal font-serif font-bold">
                              {member.name.charAt(0)}
                          </div>
                          <div>
                              <h4 className="font-bold text-charcoal">{member.name}</h4>
                              <p className="text-xs text-neutral uppercase tracking-wider">{member.team}</p>
                          </div>
                      </div>
                      
                      {member.status === 'confirmed' && <Check size={20} className="text-green-500" />}
                      {member.status === 'declined' && <X size={20} className="text-red-500" />}
                      {member.status === 'pending' && <Clock size={20} className="text-gold animate-pulse" />}
                  </div>

                  <div className="pl-4">
                      <p className="text-sm text-neutral mb-4">Role: <span className="text-charcoal font-bold">{member.role}</span></p>
                      
                      <div className="flex gap-2">
                          <button className="flex-1 bg-gray-50 hover:bg-gray-100 py-2 rounded text-xs font-bold text-charcoal uppercase tracking-wider transition-colors">Edit</button>
                          <button className="flex-1 bg-gray-50 hover:bg-gray-100 py-2 rounded text-xs font-bold text-charcoal uppercase tracking-wider transition-colors">Contact</button>
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};