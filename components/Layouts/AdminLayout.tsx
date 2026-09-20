import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  BookOpen, 
  ClipboardList, 
  X,
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
import { isSuperAdminUser, EVENTS_LABEL, PEOPLE_NAV_LABEL } from '../../lib/constants';
import { ScrollToTop } from '../ScrollToTop';
import { useAutoSectionReveal } from '../UI/useAutoSectionReveal';
import { DASHBOARD_NAV_ICON, portalNavNeedsDivider, sortPortalNavItems } from '../../lib/dashboardNav';
import { PortalTopBar, flattenPortalSearchItems, portalPageTitle, usePortalSidebarCollapsed } from './PortalTopBar';
import { AppDialogHost } from '../UI/AppDialogHost';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = usePortalSidebarCollapsed();
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

  const navItems: AdminNavItem[] = sortPortalNavItems([
    { label: 'Overview', path: '/admin', icon: <Home size={16} />, iconClass: DASHBOARD_NAV_ICON.overview },
    { label: 'Annual Calendar', path: '/admin/calendar', icon: <CalendarDays size={16} />, iconClass: DASHBOARD_NAV_ICON.calendar },
    {
      label: 'Users & Roles',
      icon: <UserCog size={16} />,
      iconClass: DASHBOARD_NAV_ICON.users,
      children: [
        { label: 'Users', path: '/admin/users' },
        { label: 'Roles & Permissions', path: '/admin/roles' },
      ],
    },
    { label: 'Prayers', path: '/admin/prayer', icon: <HandHeart size={16} />, iconClass: DASHBOARD_NAV_ICON.prayers },
    { label: 'Newsletters', path: '/admin/newsletter', icon: <Newspaper size={16} />, iconClass: DASHBOARD_NAV_ICON.newsletters },
    { label: 'Devotionals', path: '/admin/devotional', icon: <BookOpen size={16} />, iconClass: DASHBOARD_NAV_ICON.devotionals },
    { label: PEOPLE_NAV_LABEL, path: '/admin/team', icon: <Users size={16} />, iconClass: DASHBOARD_NAV_ICON.team },
    { label: EVENTS_LABEL, path: '/admin/events', icon: <Calendar size={16} />, iconClass: DASHBOARD_NAV_ICON.events },
    { label: 'Rosters (Beta)', path: '/admin/roster', icon: <ClipboardList size={16} />, iconClass: DASHBOARD_NAV_ICON.rosters },
    { label: 'System Setup', path: '/admin/settings', icon: <Settings size={16} />, iconClass: DASHBOARD_NAV_ICON.settings },
    { label: 'Help', path: '/admin/help', icon: <HelpCircle size={16} />, iconClass: DASHBOARD_NAV_ICON.help },
    { label: 'Logs', path: '/admin/logs', icon: <ScrollText size={16} />, iconClass: DASHBOARD_NAV_ICON.logs },
    ...(isSuperAdminUser(user)
      ? [
          {
            label: 'Changelog',
            path: '/admin/changelog',
            icon: <History size={16} />,
            iconClass: DASHBOARD_NAV_ICON.changelog,
          },
        ]
      : []),
  ]);

  return (
    <div className="flex h-[100vh] h-[100dvh] min-w-0 flex-col bg-dash font-sans text-charcoal">
      <ScrollToTop />
      <AppDialogHost />
      <PortalTopBar
        variant="admin"
        pageTitle={portalPageTitle(location.pathname, navItems)}
        searchItems={[
          ...flattenPortalSearchItems(navItems),
          { label: 'My Profile', path: '/admin/profile' },
          { label: 'User Security', path: '/admin/security' },
        ]}
        helpPath="/admin/help"
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => {
          if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
            setSidebarCollapsed((collapsed) => !collapsed);
            return;
          }
          setIsSidebarOpen((open) => !open);
        }}
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
          fixed bottom-0 left-0 top-[calc(4rem+env(safe-area-inset-top))] z-50 transform border-r border-gray-100 bg-white shadow-sm transition-[width,transform] duration-300 ease-in-out lg:static lg:top-auto lg:z-auto lg:h-full lg:translate-x-0 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'w-72 lg:w-[72px]' : 'w-72'}
        `}>
          <div className="flex h-full min-w-0 flex-col">
            <div className="flex items-center justify-end border-b border-gray-100 px-3 py-2 lg:hidden">
              <button type="button" className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-charcoal" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu"><X /></button>
            </div>

          <nav className={`flex-1 space-y-1 overflow-y-auto py-2 ${sidebarCollapsed ? 'px-2 lg:px-2' : 'px-3'}`}>
            {navItems.map((item, index) => {
              const divider = portalNavNeedsDivider(index, navItems) ? (
                <div className="mx-1 my-2 border-t border-gray-300" role="separator" aria-hidden="true" />
              ) : null;
              if ('children' in item && item.children) {
                const childActive = item.children.some((child) => location.pathname === child.path);
                const isOpen = usersRolesOpen && !sidebarCollapsed;
                return (
                  <React.Fragment key={item.label}>
                    {divider}
                  <div>
                    <button
                      type="button"
                      title={item.label}
                      onClick={() => {
                        if (sidebarCollapsed && window.matchMedia('(min-width: 1024px)').matches) {
                          setSidebarCollapsed(false);
                          setUsersRolesOpen(true);
                          return;
                        }
                        setUsersRolesOpen((open) => !open);
                      }}
                      className={`
                        w-full flex min-h-[44px] items-center rounded-[4px] transition-all duration-300 group relative overflow-hidden
                        ${sidebarCollapsed ? 'lg:justify-center lg:space-x-0 lg:px-2 py-1.5' : 'space-x-2.5 px-3 py-1.5'}
                        ${childActive
                          ? 'bg-gold/10 text-charcoal font-bold'
                          : 'text-neutral hover:text-charcoal hover:bg-gray-200'}
                      `}
                      aria-expanded={isOpen}
                    >
                      {childActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold"></div>}
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${item.iconClass} ${
                          childActive ? 'scale-110' : 'group-hover:scale-110'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className={`tracking-wide flex-1 text-left ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                      {sidebarCollapsed ? null : isOpen ? (
                        <ChevronUp size={19} strokeWidth={2.75} className="shrink-0 text-charcoal" />
                      ) : (
                        <ChevronDown size={19} strokeWidth={2.75} className="shrink-0 text-charcoal" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="mt-0.5 ml-3 space-y-0.5">
                        {item.children.map((child) => {
                          const isChildActive = location.pathname === child.path;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setIsSidebarOpen(false)}
                              className={`
                                relative flex items-center pl-5 pr-3 py-1.5 rounded-[8px] text-sm transition-colors
                                ${isChildActive
                                  ? 'bg-gold/15 text-gold font-semibold'
                                  : 'text-charcoal hover:bg-gray-200'}
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
                  </React.Fragment>
                );
              }

              const isActive = location.pathname === item.path;
              return (
                <React.Fragment key={item.path}>
                  {divider}
                <Link
                  to={item.path}
                  title={item.label}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex min-h-[44px] items-center rounded-[4px] transition-all duration-300 group relative overflow-hidden
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
                </React.Fragment>
              );
            })}
          </nav>

          <div className={`p-3 ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
            <div className="mx-1 my-2 border-t border-gray-300" role="separator" aria-hidden="true" />
            <button 
              title="View as Member"
              onClick={() => {
                sessionStorage.setItem('testRoleOverride', 'member');
                navigate('/dashboard');
              }}
              className={`w-full flex items-center py-2 text-neutral hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-[4px] ${
                sidebarCollapsed ? 'lg:justify-center lg:space-x-0 lg:px-2 space-x-3 px-4' : 'space-x-3 px-4'
              }`}
            >
              <ArrowRightLeft size={18} />
              <span className={`text-sm font-bold ${sidebarCollapsed ? 'lg:hidden' : ''}`}>View as Member</span>
            </button>
          </div>
        </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-dash">
          <main className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

