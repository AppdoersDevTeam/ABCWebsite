import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, ChevronUp, HelpCircle, LogOut, Menu, Search, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CHURCH_NAME, displayInitials, displayName } from '../../lib/constants';
import { supabase } from '../../lib/supabase';

export const PORTAL_TOP_BAR_PX = 64;
const SIDEBAR_COLLAPSED_KEY = 'abc-portal-sidebar-collapsed';

export function usePortalSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore quota / private mode */
    }
  }, [collapsed]);

  return [collapsed, setCollapsed] as const;
}

export type PortalSearchItem = {
  label: string;
  path: string;
};

type PortalTopBarProps = {
  variant: 'admin' | 'member';
  pageTitle: string;
  searchItems: PortalSearchItem[];
  helpPath: string;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  showSwitchRole: boolean;
  onSwitchRole: () => void;
  onSignOut: () => void;
};

export function flattenPortalSearchItems(
  items: Array<{ label: string; path?: string; children?: { label: string; path: string }[] }>
): PortalSearchItem[] {
  const out: PortalSearchItem[] = [];
  items.forEach((item) => {
    if (item.path) out.push({ label: item.label, path: item.path });
    (item.children || []).forEach((child) => out.push({ label: child.label, path: child.path }));
  });
  return out;
}

export function portalPageTitle(
  pathname: string,
  items: Array<{ label: string; path?: string; children?: { label: string; path: string }[] }>
): string {
  if (pathname.endsWith('/profile')) return 'My Profile';
  if (pathname.endsWith('/security')) return 'User Security';
  for (const item of items) {
    if (item.path === pathname) return item.label;
    const child = item.children?.find((entry) => entry.path === pathname);
    if (child) return child.label;
  }
  return items[0]?.label || 'Overview';
}

export const PortalTopBar = ({
  variant,
  pageTitle,
  searchItems,
  helpPath,
  sidebarCollapsed,
  onToggleSidebar,
  onSignOut,
}: PortalTopBarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 280 });
  const [searchText, setSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const identityRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);
  const profilePath = variant === 'admin' ? '/admin/profile' : '/dashboard/profile';
  const securityPath = variant === 'admin' ? '/admin/security' : '/dashboard/security';
  const [directory, setDirectory] = useState<{ img: string | null; staff_role: string | null; role: string | null } | null>(null);
  const [authPhoto, setAuthPhoto] = useState('');

  const matches = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return [];
    return searchItems.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 8);
  }, [searchItems, searchText]);

  useEffect(() => {
    if (!user?.id) {
      setDirectory(null);
      setAuthPhoto('');
      return;
    }
    let cancelled = false;
    void Promise.all([
      supabase.from('team_members').select('img, staff_role, role').eq('user_id', user.id).limit(1).maybeSingle(),
      supabase.auth.getUser(),
    ]).then(([{ data }, auth]) => {
      if (cancelled) return;
      setDirectory(data || null);
      const meta = auth.data.user?.user_metadata || {};
      setAuthPhoto(String(meta.avatar_url || meta.picture || ''));
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const firstName = (user?.first_name || displayName(user).split(' ')[0] || 'User').trim();
  const title = (directory?.staff_role || directory?.role || '').trim();
  const identitySubtitle = title ? `${title} ${firstName}` : displayName(user);
  const avatarUrl = directory?.img || authPhoto || '';
  const initials = displayInitials(user);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (identityRef.current && !identityRef.current.contains(target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
      if (notifyRef.current && !notifyRef.current.contains(target)) setNotifyOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
        setNotifyOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const openUserMenu = () => {
    const box = identityRef.current?.getBoundingClientRect();
    if (box) {
      setMenuPos({
        top: box.bottom + 4,
        left: box.left,
        width: Math.max(box.width, 280),
      });
    }
    setMenuOpen(true);
  };

  const goToSearchMatch = (path?: string) => {
    const target = path || matches[0]?.path;
    if (!target) {
      setSearchOpen(true);
      return;
    }
    navigate(target);
    setSearchText('');
    setSearchOpen(false);
  };

  return (
    <div className="relative z-[80] flex h-[calc(4rem+env(safe-area-inset-top))] shrink-0 overflow-visible pt-[env(safe-area-inset-top)]">
      <div
        className={`flex shrink-0 items-center overflow-visible border-r border-gray-100 bg-white py-1 ${
          sidebarCollapsed ? 'w-[72px] px-1' : 'w-44 px-2 sm:w-72'
        }`}
      >
        <div className="relative w-full" ref={identityRef}>
        <button
          type="button"
          onClick={() => {
            if (menuOpen) setMenuOpen(false);
            else openUserMenu();
          }}
          className={`flex h-14 w-full items-center gap-2.5 rounded-[11px] border-[0.5px] border-gray-300 bg-gray-200 px-2.5 transition-colors hover:bg-gray-300 ${
            sidebarCollapsed ? 'justify-center px-1' : ''
          }`}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="User menu"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold">
            <img
              src="/ABC Logo.png"
              alt=""
              className="h-full w-full object-contain"
            />
          </span>
          {!sidebarCollapsed && (
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-[15px] font-semibold leading-tight text-charcoal">
                {CHURCH_NAME}
              </span>
              <span className="block truncate text-sm font-normal leading-tight text-neutral">
                {identitySubtitle}
              </span>
            </span>
          )}
          <ChevronDown
            size={21}
            strokeWidth={2.75}
            className={`shrink-0 text-charcoal ${sidebarCollapsed ? 'hidden' : ''} ${menuOpen ? 'hidden' : ''}`}
          />
          <ChevronUp
            size={21}
            strokeWidth={2.75}
            className={`shrink-0 text-charcoal ${sidebarCollapsed || !menuOpen ? 'hidden' : ''}`}
          />
        </button>
        {menuOpen && (
          <div
            role="menu"
            style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
            className="fixed z-[90] overflow-hidden rounded-[11px] border border-gray-200 bg-white py-1 shadow-lg"
          >
            <Link
              to={profilePath}
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-3 text-[15px] font-medium text-gold hover:bg-gray-200"
              onClick={() => setMenuOpen(false)}
            >
              <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-black/10">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-gold">
                    {initials}
                  </span>
                )}
              </span>
              My Profile
            </Link>
            <div className="mx-3 border-t border-gray-200" />
            <Link
              to={securityPath}
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-3 text-[15px] font-medium text-charcoal hover:bg-gray-200"
              onClick={() => setMenuOpen(false)}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600">
                <Shield size={18} />
              </span>
              User Security
            </Link>
            <div className="mx-3 border-t border-gray-200" />
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] font-medium text-red-600 hover:bg-red-50"
              onClick={() => {
                setMenuOpen(false);
                onSignOut();
              }}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        )}
        </div>
      </div>

      <header className="flex min-w-0 flex-1 items-center gap-2 bg-gold px-3 pr-[max(0.75rem,env(safe-area-inset-right))] sm:gap-3">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-white hover:bg-black/10"
        aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
        aria-pressed={sidebarCollapsed}
      >
        <Menu size={22} strokeWidth={2.75} />
      </button>

      <h1 className="hidden min-w-0 truncate text-base font-bold text-white sm:block">
        {pageTitle}
      </h1>

      <div className="ml-auto flex min-w-0 items-center gap-2">
        <div className="relative" ref={searchRef}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              goToSearchMatch();
            }}
          >
            <Search size={21} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white" />
            <input
              type="search"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search"
              className="h-[45px] w-28 min-w-0 max-w-[213px] rounded-md border border-white/80 bg-transparent pl-10 pr-3 text-base font-bold text-white placeholder:text-white focus:outline-none focus:ring-1 focus:ring-white/70 sm:w-[181px] md:w-[213px]"
              aria-label="Search dashboard pages"
            />
          </form>
          {searchOpen && matches.length > 0 && (
            <div className="absolute right-0 top-full z-40 mt-1 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
              {matches.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-charcoal hover:bg-gray-200"
                  onClick={() => goToSearchMatch(item.path)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative" ref={notifyRef}>
          <button
            type="button"
            onClick={() => setNotifyOpen((open) => !open)}
            className="rounded-full p-2 text-white hover:bg-black/10"
            aria-label="Notifications"
            aria-expanded={notifyOpen}
            title="Notifications"
          >
            <Bell size={25} color="#ffffff" fill="#ffffff" stroke="#ffffff" />
          </button>
          {notifyOpen && (
            <div className="absolute right-0 top-full z-40 mt-1 w-64 rounded-[11px] border border-gray-200 bg-white px-4 py-3 text-sm text-neutral shadow-lg">
              No new notifications
            </div>
          )}
        </div>
        <Link
          to={helpPath}
          className="rounded-full p-2 text-white hover:bg-black/10"
          aria-label="Help"
          title="Help"
        >
          <HelpCircle size={25} />
        </Link>
      </div>
      </header>
    </div>
  );
};
