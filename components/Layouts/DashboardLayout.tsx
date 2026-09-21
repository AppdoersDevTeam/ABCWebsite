import React, { useEffect, useRef, useState } from 'react';
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
import { isAdminUser, EVENTS_LABEL, PEOPLE_NAV_LABEL } from '../../lib/constants';
import { ScrollToTop } from '../ScrollToTop';
import { useAutoSectionReveal } from '../UI/useAutoSectionReveal';
import {
  DASHBOARD_NAV_ICON,
  MEMBER_NAV_DIVIDER_BEFORE,
  MEMBER_NAV_ORDER,
  orderPortalNavItems,
  portalNavNeedsDivider,
} from '../../lib/dashboardNav';
import { flattenPortalSearchItems, portalPageTitle, PortalTopBar, usePortalSidebarCollapsed } from './PortalTopBar';
import { AppDialogHost } from '../UI/AppDialogHost';
import { useFocusTrap } from '../UI/useFocusTrap';
import { useMediaQuery } from '../UI/useMediaQuery';
import { NotificationPrompt } from '../Notifications/NotificationPrompt';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = usePortalSidebarCollapsed();
  const sidebarRef = useRef<HTMLElement>(null);
  const isDesktopNav = useMediaQuery('(min-width: 1024px)');
  useAutoSectionReveal();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useFocusTrap(isSidebarOpen && !isDesktopNav, sidebarRef, () => setIsSidebarOpen(false));

  const handleLogout = () => {
    sessionStorage.removeItem('testRoleOverride');
    logout();
    navigate('/login');
  };

  const navItems = orderPortalNavItems(
    [
      { label: 'Overview', path: '/dashboard', icon: <Home size={16} />, iconClass: DASHBOARD_NAV_ICON.overview },
      { label: EVENTS_LABEL, path: '/dashboard/events', icon: <Calendar size={16} />, iconClass: DASHBOARD_NAV_ICON.events },
      { label: 'Annual Calendar', path: '/dashboard/calendar', icon: <CalendarDays size={16} />, iconClass: DASHBOARD_NAV_ICON.calendar },
      { label: 'Prayers', path: '/dashboard/prayer', icon: <HandHeart size={16} />, iconClass: DASHBOARD_NAV_ICON.prayers },
      { label: 'Newsletters', path: '/dashboard/newsletter', icon: <Newspaper size={16} />, iconClass: DASHBOARD_NAV_ICON.newsletters },
      { label: 'Devotionals', path: '/dashboard/devotional', icon: <BookOpen size={16} />, iconClass: DASHBOARD_NAV_ICON.devotionals },
      { label: 'Sermons', path: '/dashboard/sermons', icon: <Youtube size={16} />, iconClass: DASHBOARD_NAV_ICON.sermons },
      { label: 'Rosters (Beta)', path: '/dashboard/roster', icon: <ClipboardList size={16} />, iconClass: DASHBOARD_NAV_ICON.rosters },
      { label: PEOPLE_NAV_LABEL, path: '/dashboard/team', icon: <Users size={16} />, iconClass: DASHBOARD_NAV_ICON.team },
      { label: 'Help', path: '/dashboard/help', icon: <HelpCircle size={16} />, iconClass: DASHBOARD_NAV_ICON.help },
    ],
    MEMBER_NAV_ORDER,
  );

  return (
    <div className="flex h-[100vh] h-[100dvh] min-w-0 flex-col bg-dash font-sans text-charcoal">
      <ScrollToTop />
      <AppDialogHost />
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
        isMobileNavOpen={isSidebarOpen}
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

        <aside
          id="portal-sidebar"
          ref={sidebarRef}
          className={`
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
              const isActive = location.pathname === item.path;
              return (
                <React.Fragment key={item.path}>
                  {portalNavNeedsDivider(index, navItems, MEMBER_NAV_DIVIDER_BEFORE) ? (
                    <div className="mx-1 my-2 border-t border-gray-300" role="separator" aria-hidden="true" />
                  ) : null}
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

          {isAdminUser(user) && (
          <div className={`border-t border-gray-100 p-3 ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
            <button 
                title="Back to Admin"
                onClick={() => {
                  sessionStorage.removeItem('testRoleOverride');
                  navigate('/admin');
                }}
                className={`w-full flex items-center py-2 text-neutral hover:bg-gold/10 hover:text-charcoal transition-colors rounded-[4px] ${
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
          <main className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto p-4 md:p-6 lg:p-8">
            <NotificationPrompt />
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};