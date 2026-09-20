import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  BookOpen, 
  ClipboardList, 
  LogOut, 
  X,
  Shield,
  UserCog,
  ArrowRightLeft,
  Settings,
  HelpCircle,
  ScrollText,
  Newspaper,
  HandHeart,
  CalendarDays,
  History,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSuperAdminUser, EVENTS_LABEL } from '../../lib/constants';
import { ScrollToTop } from '../ScrollToTop';
import { useAutoSectionReveal } from '../UI/useAutoSectionReveal';
import { DASHBOARD_NAV_ICON } from '../../lib/dashboardNav';
import { flattenPortalSearchItems, portalPageTitle, PortalTopBar } from './PortalTopBar';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const usersRolesActive =
    location.pathname === '/admin/users' || location.pathname === '/admin/roles';
  const [usersRolesOpen, setUsersRolesOpen] = useState(usersRolesActive);
  useAutoSectionReveal();

  useEffect(() => {
    if (usersRolesActive) setUsersRolesOpen(true);
  }, [usersRolesActive]);

  const handleLogout = () => {
    sessionStorage.removeItem('testRoleOverride');
    logout();
    navigate('/login');
  };

  type AdminNavItem =
    | { label: string; path: string; icon: React.ReactNode; iconClass: string; children?: undefined }
    | { label: string; icon: React.ReactNode; iconClass: string; children: { label: string; path: string }[] };

  const navItems: AdminNavItem[] = [
    { label: 'Overview', path: '/admin', icon: <Home size={20} />, iconClass: DASHBOARD_NAV_ICON.overview },
    { label: 'Annual Calendar', path: '/admin/calendar', icon: <CalendarDays size={20} />, iconClass: DASHBOARD_NAV_ICON.calendar },
    {
      label: 'Users & Roles',
      icon: <UserCog size={20} />,
      iconClass: DASHBOARD_NAV_ICON.users,
      children: [
        { label: 'Users', path: '/admin/users' },
        { label: 'Roles & Permissions', path: '/admin/roles' },
      ],
    },
    { label: 'Prayers', path: '/admin/prayer', icon: <HandHeart size={20} />, iconClass: DASHBOARD_NAV_ICON.prayers },
    { label: 'Newsletters', path: '/admin/newsletter', icon: <Newspaper size={20} />, iconClass: DASHBOARD_NAV_ICON.newsletters },
    { label: 'Devotionals', path: '/admin/devotional', icon: <BookOpen size={20} />, iconClass: DASHBOARD_NAV_ICON.devotionals },
    { label: 'Leadership', path: '/admin/team', icon: <Users size={20} />, iconClass: DASHBOARD_NAV_ICON.team },
    { label: EVENTS_LABEL, path: '/admin/events', icon: <Calendar size={20} />, iconClass: DASHBOARD_NAV_ICON.events },
    { label: 'Rosters (Beta)', path: '/admin/roster', icon: <ClipboardList size={20} />, iconClass: DASHBOARD_NAV_ICON.rosters },
    { label: 'System Setup', path: '/admin/settings', icon: <Settings size={20} />, iconClass: DASHBOARD_NAV_ICON.settings },
    { label: 'User Security', path: '/admin/security', icon: <Shield size={20} />, iconClass: DASHBOARD_NAV_ICON.settings },
    { label: 'Help', path: '/admin/help', icon: <HelpCircle size={20} />, iconClass: DASHBOARD_NAV_ICON.help },
    { label: 'Logs', path: '/admin/logs', icon: <ScrollText size={20} />, iconClass: DASHBOARD_NAV_ICON.logs },
    ...(isSuperAdminUser(user)
      ? [
          {
            label: 'Changelog',
            path: '/admin/changelog',
            icon: <History size={20} />,
            iconClass: DASHBOARD_NAV_ICON.changelog,
          },
        ]
      : []),
  ];

  return (
    <div className="flex h-dvh flex-col bg-dash font-sans text-charcoal lg:h-screen">
      <ScrollToTop />
      <PortalTopBar
        variant="admin"
        pageTitle={portalPageTitle(location.pathname, navItems)}
        searchItems={flattenPortalSearchItems(navItems)}
        helpPath="/admin/help"
        onOpenSidebar={() => setIsSidebarOpen(true)}
        showSwitchRole
        onSwitchRole={() => {
          sessionStorage.setItem('testRoleOverride', 'member');
          navigate('/dashboard');
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
          fixed bottom-0 left-0 top-14 z-50 w-72 transform border-r border-gray-100 bg-white shadow-sm transition-transform duration-300 ease-in-out lg:static lg:top-auto lg:h-full lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-end border-b border-gray-100 px-3 py-2 lg:hidden">
              <button className="text-charcoal" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu"><X /></button>
            </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
            {navItems.map((item) => {
              if ('children' in item && item.children) {
                const childActive = item.children.some((child) => location.pathname === child.path);
                const isOpen = usersRolesOpen;
                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() => setUsersRolesOpen((open) => !open)}
                      className={`
                        w-full flex items-center space-x-4 px-4 py-3 rounded-[4px] transition-all duration-300 group relative overflow-hidden
                        ${childActive
                          ? 'bg-gold/10 text-charcoal font-bold'
                          : 'text-neutral hover:text-charcoal hover:bg-gray-50'}
                      `}
                      aria-expanded={isOpen}
                    >
                      {childActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold"></div>}
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${item.iconClass} ${
                          childActive ? 'scale-110' : 'group-hover:scale-110'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="tracking-wide flex-1 text-left">{item.label}</span>
                      {isOpen ? (
                        <ChevronUp size={16} className="shrink-0 text-neutral" />
                      ) : (
                        <ChevronDown size={16} className="shrink-0 text-neutral" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="mt-1 ml-4 space-y-1">
                        {item.children.map((child) => {
                          const isChildActive = location.pathname === child.path;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setIsSidebarOpen(false)}
                              className={`
                                relative flex items-center pl-5 pr-3 py-2.5 rounded-[8px] text-sm transition-colors
                                ${isChildActive
                                  ? 'bg-gold/15 text-gold font-semibold'
                                  : 'text-charcoal hover:bg-gray-50'}
                              `}
                            >
                              {isChildActive && (
                                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-gold" />
                              )}
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

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
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${item.iconClass} ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-100 p-3">
            <button 
              onClick={() => {
                sessionStorage.setItem('testRoleOverride', 'member');
                navigate('/dashboard');
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-neutral hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-[4px]"
            >
              <ArrowRightLeft size={18} />
              <span className="text-sm font-bold">View as Member</span>
            </button>
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

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-dash">
          <main className="min-h-0 flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

