import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  BookOpen, 
  Image, 
  ClipboardList, 
  LogOut, 
  Menu,
  MessageSquare,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BackgroundBlobs } from '../UI/BackgroundBlobs';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: <Home size={20} /> },
    { label: 'Prayer Wall', path: '/dashboard/prayer', icon: <MessageSquare size={20} /> },
    { label: 'Newsletters', path: '/dashboard/newsletter', icon: <BookOpen size={20} /> },
    { label: 'The Team', path: '/dashboard/team', icon: <Users size={20} /> },
    { label: 'Events', path: '/dashboard/events', icon: <Calendar size={20} /> },
    { label: 'Roster', path: '/dashboard/roster', icon: <ClipboardList size={20} /> },
    { label: 'Photos', path: '/dashboard/photos', icon: <Image size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-base font-sans text-charcoal relative">
      <BackgroundBlobs />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-md border-r border-gray-100 transform transition-transform duration-300 ease-in-out shadow-sm
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full relative">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center">
            <Link to="/" className="block">
                <img 
                  src="/ABC Logo.png" 
                  alt="Ashburton Baptist Church" 
                  className="h-16 transition-opacity duration-300 hover:opacity-80"
                />
                <span className="block text-[10px] uppercase tracking-[0.2em] text-gold mt-1">Member Portal</span>
            </Link>
            <button className="lg:hidden text-charcoal" onClick={() => setIsSidebarOpen(false)}><X /></button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center space-x-4 px-4 py-3 rounded-[4px] transition-all duration-300 group relative overflow-hidden
                    ${isActive 
                      ? 'bg-gold/10 text-charcoal font-bold' 
                      : 'text-neutral hover:text-charcoal hover:bg-gray-50'}
                  `}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold"></div>}
                  <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-gold' : 'group-hover:scale-110 group-hover:text-gold'}`}>
                    {item.icon}
                  </span>
                  <span className="tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 px-4 py-4 mb-2 rounded-[4px] bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-charcoal font-bold text-lg">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-charcoal truncate">{user?.name}</p>
                <p className="text-xs text-neutral truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-neutral hover:bg-red-50 hover:text-red-500 transition-colors rounded-[4px]"
            >
              <LogOut size={18} />
              <span className="text-sm font-bold">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 h-16 relative z-20">
          <button onClick={() => setIsSidebarOpen(true)} className="text-charcoal p-2">
            <Menu size={24} />
          </button>
          <span className="font-serif font-bold text-lg text-charcoal">Dashboard</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};