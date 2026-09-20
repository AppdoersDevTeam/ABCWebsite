import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightLeft, Check, ChevronDown, HelpCircle, LogOut, Menu, MoreHorizontal, Search } from 'lucide-react';
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
  showSwitchRole,
  onSwitchRole,
  onSignOut,
}: PortalTopBarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const identityRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const profilePath = variant === 'admin' ? '/admin/profile' : '/dashboard/profile';
  const homePath = variant === 'admin' ? '/admin' : '/dashboard';
  const [directory, setDirectory] = useState<{ img: string | null; staff_role: string | null; role: string | null } | null>(null);

  const matches = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return [];
    return searchItems.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 8);
  }, [searchItems, searchText]);

  useEffect(() => {
    if (!user?.id) {
      setDirectory(null);
      return;
    }
    let cancelled = false;
    void supabase
      .from('team_members')
      .select('img, staff_role, role')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setDirectory(data || null);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const firstName = (user?.first_name || displayName(user).split(' ')[0] || 'User').trim();
  const title = (directory?.staff_role || directory?.role || '').trim();
  const identitySubtitle = title ? `${title} ${firstName}` : displayName(user);
  const avatarUrl = directory?.img || '';
  const initials = displayInitials(user);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (identityRef.current && !identityRef.current.contains(target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

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
    <div className="relative z-30 flex h-16 shrink-0">
      <div
        className={`flex shrink-0 items-center border-r border-gray-200 bg-white py-1 ${
          sidebarCollapsed ? 'w-[72px] px-1' : 'w-44 px-2 sm:w-72'
        }`}
      >
        <div className="relative w-full" ref={identityRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className={`flex h-14 w-full items-center gap-2.5 rounded-2xl border border-black/5 bg-gray-200 px-2.5 shadow-sm transition-colors hover:bg-gray-300 ${
            sidebarCollapsed ? 'justify-center px-1' : ''
          }`}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="User menu"
        >
          <img
            src="/ABC Logo.png"
            alt=""
            className="h-10 w-10 shrink-0 rounded-full bg-white object-contain"
          />
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
            size={18}
            className={`shrink-0 text-neutral transition-transform ${menuOpen ? 'rotate-180' : ''} ${
              sidebarCollapsed ? 'hidden' : ''
            }`}
          />
        </button>
        {menuOpen && (
          <div
            role="menu"
            className={`absolute left-0 top-full z-40 mt-1 overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-lg ${
              sidebarCollapsed ? 'w-72' : 'w-full min-w-[260px]'
            }`}
          >
            <Link
              to={profilePath}
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-3 text-[15px] font-medium text-gold hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-sm font-semibold text-gold">
                  {initials}
                </span>
              )}
              My Profile
            </Link>
            <div className="mx-3 border-t border-gray-200" />
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
              onClick={() => {
                setMenuOpen(false);
                navigate(homePath);
              }}
            >
              <img src="/ABC Logo.png" alt="" className="h-9 w-9 rounded-full bg-white object-contain" />
              <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug text-charcoal">
                Ashburton Baptist
                <br />
                Church
              </span>
              <Check size={18} className="shrink-0 text-gold" />
            </button>
            <Link
              to="/ministries"
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-3 text-[15px] font-medium text-gold hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              <MoreHorizontal size={18} className="ml-2.5 shrink-0" />
              Add Ministry
            </Link>
            {showSwitchRole && (
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-charcoal hover:bg-gray-50"
                onClick={() => {
                  setMenuOpen(false);
                  onSwitchRole();
                }}
              >
                <ArrowRightLeft size={16} className="ml-1.5 text-neutral" />
                {variant === 'admin' ? 'View as Member' : 'Back to Admin'}
              </button>
            )}
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
              Log Out
            </button>
          </div>
        )}
        </div>
      </div>

      <header className="flex min-w-0 flex-1 items-center gap-2 bg-gold px-3 sm:gap-3">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-md p-2 text-charcoal hover:bg-black/5"
        aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
        aria-pressed={sidebarCollapsed}
      >
        <Menu size={22} />
      </button>

      <h1 className="hidden min-w-0 truncate text-base font-semibold text-charcoal sm:block">
        {pageTitle}
      </h1>

      <div className="ml-auto flex min-w-0 items-center gap-2">
        <div className="relative" ref={searchRef}>
          <form
            className="flex items-center gap-1"
            onSubmit={(event) => {
              event.preventDefault();
              goToSearchMatch();
            }}
          >
            <input
              type="search"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search"
              className="h-10 w-28 rounded-full border-0 bg-white/90 px-4 text-sm text-charcoal placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-charcoal/10 sm:w-44 md:w-52"
              aria-label="Search dashboard pages"
            />
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] bg-white/90 text-charcoal hover:bg-white"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
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
        <Link
          to={helpPath}
          className="rounded-full p-2 text-charcoal hover:bg-black/5"
          aria-label="Help"
          title="Help"
        >
          <HelpCircle size={20} />
        </Link>
      </div>
      </header>
    </div>
  );
};
