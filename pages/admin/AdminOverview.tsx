import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { VibrantCard } from '../../components/UI/VibrantCard';
import { Calendar, MessageSquare, BookOpen, Users, Image, ClipboardList, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminOverview = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Prayer Requests', value: '12', icon: <MessageSquare size={24} />, path: '/admin/prayer', color: 'text-blue-500' },
    { label: 'Team Members', value: '8', icon: <Users size={24} />, path: '/admin/team', color: 'text-purple-500' },
    { label: 'Upcoming Events', value: '5', icon: <Calendar size={24} />, path: '/admin/events', color: 'text-green-500' },
    { label: 'Newsletters', value: '3', icon: <BookOpen size={24} />, path: '/admin/newsletter', color: 'text-orange-500' },
    { label: 'Photo Folders', value: '7', icon: <Image size={24} />, path: '/admin/photos', color: 'text-pink-500' },
    { label: 'Roster Assignments', value: '15', icon: <ClipboardList size={24} />, path: '/admin/roster', color: 'text-indigo-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-charcoal">Admin Dashboard</h1>
          <p className="text-neutral mt-2">Welcome back, {user?.name}. Manage your church community.</p>
        </div>
        <div className="hidden md:block">
          <span className="text-xs font-bold text-charcoal bg-gold px-4 py-2 rounded-full border border-gold uppercase tracking-widest shadow-sm">Admin Access</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Link key={i} to={stat.path}>
            <VibrantCard className="group cursor-pointer bg-white hover:shadow-lg hover:border-gold transition-all">
              <div className="absolute top-4 right-4 text-gray-400 group-hover:text-gold transition-colors">
                <ArrowUpRight />
              </div>
              <div className={`mb-4 text-charcoal p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-gold transition-colors ${stat.color}`}>
                {stat.icon}
              </div>
              <h3 className="font-bold text-xl mb-2 text-charcoal">{stat.label}</h3>
              <p className="text-4xl font-serif font-bold text-charcoal mb-2">{stat.value}</p>
              <div className="pt-4 border-t border-gray-100">
                <span className="text-gold font-bold text-sm">Manage →</span>
              </div>
            </VibrantCard>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card bg-white/60 p-8 rounded-[8px] border border-gray-100">
          <h3 className="font-serif text-2xl mb-4 text-charcoal font-bold">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/admin/prayer" className="block p-4 bg-white border border-gray-100 rounded-[4px] hover:border-gold hover:shadow-md transition-all">
              <span className="font-bold text-charcoal">Review New Prayer Requests</span>
              <p className="text-sm text-neutral mt-1">3 pending approval</p>
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
          <h3 className="font-serif text-2xl mb-4 text-charcoal font-bold">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
              <div className="w-2 h-2 rounded-full bg-gold mt-2"></div>
              <div>
                <p className="text-sm text-charcoal font-bold">New prayer request submitted</p>
                <p className="text-xs text-neutral">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
              <div className="w-2 h-2 rounded-full bg-gold mt-2"></div>
              <div>
                <p className="text-sm text-charcoal font-bold">Event updated: Sunday Service</p>
                <p className="text-xs text-neutral">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-gold mt-2"></div>
              <div>
                <p className="text-sm text-charcoal font-bold">Team member added</p>
                <p className="text-xs text-neutral">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

