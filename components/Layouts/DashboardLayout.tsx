import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  BookOpen, 
  ClipboardList, 
  X,
  ArrowRightLeft,
  HelpCircle,
  Youtube,
  Newspaper,
  HandHeart,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAdminUser, EVENTS_LABEL } from '../../lib/constants';
import { ScrollToTop } from '../ScrollToTop';
import { useAutoSectionReveal } from '../UI/useAutoSectionReveal';
import { DASHBOARD_NAV_ICON } from '../../lib/dashboardNav';
import { flattenPortalSearchItems, portalPageTitle, PortalTopBar, usePortalSidebarCollapsed } from './PortalTopBar';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = usePortalSidebarCollapsed();
  useAutoSectionReveal();

  const handleLogout = () => {
    sessionStorage.removeItem('testRoleOverride');
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: <Home size={16} />, iconClass: DASHBOARD_NAV_ICON.overview },
    { label: 'Annual Calendar', path: '/dashboard/calendar', icon: <CalendarDays size={16} />, iconClass: DASHBOARD_NAV_ICON.calendar },
    { label: 'Prayers', path: '/dashboard/prayer', icon: <HandHeart size={16} />, iconClass: DASHBOARD_NAV_ICON.prayers },
    { label: 'Newsletters', path: '/dashboard/newsletter', icon: <Newspaper size={16} />, iconClass: DASHBOARD_NAV_ICON.newsletters },
    { label: 'Devotionals', path: '/dashboard/devotional', icon: <BookOpen size={16} />, iconClass: DASHBOARD_NAV_ICON.devotionals },
    { label: 'Sermons', path: '/dashboard/sermons', icon: <Youtube size={16} />, iconClass: DASHBOARD_NAV_ICON.sermons },
    { label: 'Leadership', path: '/dashboard/team', icon: <Users size={16} />, iconClass: DASHBOARD_NAV_ICON.team },
    { label: EVENTS_LABEL, path: '/dashboard/events', icon: <Calendar size={16} />, iconClass: DASHBOARD_NAV_ICON.events },
    { label: 'Rosters (Beta)', path: '/dashboard/roster', icon: <ClipboardList size={16} />, iconClass: DASHBOARD_NAV_ICON.rosters },
    { label: 'Help', path: '/dashboard/help', icon: <HelpCircle size={16} />, iconClass: DASHBOARD_NAV_ICON.help },
  ];

  return (
    <div className="flex h-dvh flex-col bg-dash font-sans text-charcoal lg:h-screen">
      <ScrollToTop />
      <PortalTopBar
        variant="member"
        pageTitle={portalPageTitle(location.pathname, navItems)}
        searchItems={[
          ...flattenPortalSearchItems(navItems),
          { label: 'My Profile', path: '/dashboard/profile' },
          { label: 'User Security', path: '/dashboard/security' },
        ]}
        helpPath="/dashboard/help"
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => {
          if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
            setSidebarCollapsed((collapsed) => !collapsed);
            return;
          }
          setIsSidebarOpen((open) => !open);
        }}
        showSwitchRole={isAdminUser(user)}
        onSwitchRole={() => {
          sessionStorage.removeItem('testRoleOverride');
          navigate('/admin');
        }}
        onSignOut={handleLogout}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-charcoal/20 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed bottom-0 left-0 top-16 z-50 transform border-r border-gray-100 bg-white shadow-sm transition-[width,transform] duration-300 ease-in-out lg:static lg:top-auto lg:z-auto lg:h-full lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'w-72 lg:w-[72px]' : 'w-72'}
        `}>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-end border-b border-gray-100 px-3 py-2 lg:hidden">
              <button className="text-charcoal" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu"><X /></button>
            </div>

          <nav className={`flex-1 space-y-1 overflow-y-auto py-2 ${sidebarCollapsed ? 'px-2 lg:px-2' : 'px-3'}`}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center rounded-[4px] transition-all duration-300 group relative overflow-hidden
                    ${sidebarCollapsed ? 'lg:justify-center lg:space-x-0 lg:px-2 py-1.5' : 'space-x-2.5 px-3 py-1.5'}
                    ${isActive 
                      ? 'bg-gold/10 text-charcoal font-bold' 
                      : 'text-neutral hover:text-charcoal hover:bg-gray-200'}
                  `}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold"></div>}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${item.iconClass} ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className={`tracking-wide ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {isAdminUser(user) && (
          <div className={`border-t border-gray-100 p-3 ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
            <button 
                title="Back to Admin"
                onClick={() => {
                  sessionStorage.removeItem('testRoleOverride');
                  navigate('/admin');
                }}
                className={`w-full flex items-center py-2 text-neutral hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-[4px] ${
                  sidebarCollapsed ? 'lg:justify-center lg:space-x-0 lg:px-2 space-x-3 px-4' : 'space-x-3 px-4'
                }`}
              >
                <ArrowRightLeft size={18} />
                <span className={`text-sm font-bold ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Back to Admin</span>
              </button>
          </div>
          )}
        </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-dash">
          <main className="min-h-0 flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};