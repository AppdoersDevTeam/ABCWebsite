import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle, LogOut, Menu, Search, Shield, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CHURCH_NAME, displayInitials, displayName } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { NotificationBell } from '../Notifications/NotificationBell';

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
  isMobileNavOpen?: boolean;
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
  isMobileNavOpen = false,
}: PortalTopBarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 280 });
  const [searchText, setSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const identityRef = useRef<HTMLDivElement>(null);
  const mobileIdentityRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
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
      const inDesktopIdentity = identityRef.current?.contains(target);
      const inMobileIdentity = mobileIdentityRef.current?.contains(target);
      if (!inDesktopIdentity && !inMobileIdentity) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
        setMobileSearchOpen(false);
        setSearchText('');
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!mobileSearchOpen) return;
    mobileSearchInputRef.current?.focus();
  }, [mobileSearchOpen]);

  const openUserMenu = (fromRef: React.RefObject<HTMLDivElement | null>) => {
    const box = fromRef.current?.getBoundingClientRect();
    if (box) {
      const width = Math.min(Math.max(box.width, 260), window.innerWidth - 16);
      const left = Math.min(Math.max(8, box.left), Math.max(8, window.innerWidth - width - 8));
      setMenuPos({
        top: box.bottom + 4,
        left,
        width,
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
    setMobileSearchOpen(false);
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    setSearchText('');
    setSearchOpen(false);
  };

  const userMenu = menuOpen ? (
    <div
      role="menu"
      style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
      className="fixed z-[90] overflow-hidden rounded-[11px] border border-gold/25 bg-white/95 py-1 shadow-lg backdrop-blur-md"
    >
      <Link
        to={profilePath}
        role="menuitem"
        className="flex w-full items-center gap-3 px-4 py-3 text-[15px] font-medium text-charcoal hover:bg-gold/10"
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
        className="flex w-full items-center gap-3 px-4 py-3 text-[15px] font-medium text-charcoal hover:bg-gold/10"
        onClick={() => setMenuOpen(false)}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/5 text-charcoal">
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
  ) : null;

  const searchResults = searchOpen && matches.length > 0 ? (
    <div className="absolute right-0 top-full z-40 mt-1 w-56 max-w-[min(16rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
      {matches.map((item) => (
        <button
          key={item.path}
          type="button"
          className="block w-full min-h-[44px] px-3 py-2 text-left text-sm text-charcoal hover:bg-gold/10"
          onClick={() => goToSearchMatch(item.path)}
        >
          {item.label}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div className="relative z-[80] flex h-[calc(4rem+env(safe-area-inset-top))] shrink-0 overflow-visible pt-[env(safe-area-inset-top)]">
      {userMenu}

      {/* Desktop identity rail — aligns with sidebar; hidden on phone/tablet drawer layout */}
      <div
        className={`hidden lg:flex shrink-0 items-center overflow-visible border-r border-white/70 bg-dash/90 backdrop-blur-md py-1 ${
          sidebarCollapsed ? 'w-[72px] px-1' : 'w-72 px-2'
        }`}
      >
        <div className="relative w-full" ref={identityRef}>
          <button
            type="button"
            onClick={() => {
              if (menuOpen) setMenuOpen(false);
              else openUserMenu(identityRef);
            }}
            className={`flex h-14 w-full items-center gap-2.5 rounded-[11px] border border-gold/30 bg-white/80 px-2.5 shadow-sm transition-colors hover:bg-white hover:border-gold/50 ${
              sidebarCollapsed ? 'justify-center px-1' : ''
            }`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="User menu"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold">
              <img src="/ABC Logo.png" alt="" className="h-full w-full object-contain" />
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
              className={`shrink-0 text-charcoal ${sidebarCollapsed || menuOpen ? 'hidden' : ''}`}
            />
            <ChevronUp
              size={21}
              strokeWidth={2.75}
              className={`shrink-0 text-charcoal ${sidebarCollapsed || !menuOpen ? 'hidden' : ''}`}
            />
          </button>
        </div>
      </div>

      <header className="flex min-w-0 flex-1 items-center gap-1.5 bg-gold px-2 pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] sm:gap-2 sm:px-3 sm:pr-[max(0.75rem,env(safe-area-inset-right))]">
        {mobileSearchOpen ? (
          <div className="flex min-w-0 flex-1 items-center gap-1.5 lg:hidden" ref={searchRef}>
            <form
              className="relative min-w-0 flex-1"
              onSubmit={(event) => {
                event.preventDefault();
                goToSearchMatch();
              }}
            >
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/90" />
              <input
                ref={mobileSearchInputRef}
                type="search"
                value={searchText}
                onChange={(event) => {
                  setSearchText(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search pages"
                className="h-11 w-full min-w-0 rounded-md border border-white/80 bg-black/10 pl-10 pr-3 text-sm font-semibold text-white placeholder:text-white/80 focus:outline-none focus:ring-1 focus:ring-white/70"
                aria-label="Search dashboard pages"
              />
              {searchResults}
            </form>
            <button
              type="button"
              onClick={closeMobileSearch}
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md p-2 text-white hover:bg-black/10"
              aria-label="Close search"
            >
              <X size={22} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md p-2 text-white hover:bg-black/10"
              aria-label={isMobileNavOpen ? 'Close menu' : sidebarCollapsed ? 'Expand menu' : 'Open menu'}
              aria-pressed={sidebarCollapsed}
              aria-expanded={isMobileNavOpen}
              aria-controls="portal-sidebar"
            >
              <Menu size={22} strokeWidth={2.75} />
            </button>

            <h1 className="min-w-0 flex-1 truncate text-sm font-bold text-white sm:text-base lg:flex-none lg:max-w-[12rem] xl:max-w-[16rem]">
              {pageTitle}
            </h1>

            <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5">
              {/* Phone/tablet: icon opens search overlay mode */}
              <button
                type="button"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-white hover:bg-black/10 lg:hidden"
                aria-label="Search"
                onClick={() => setMobileSearchOpen(true)}
              >
                <Search size={22} strokeWidth={2.5} />
              </button>

              {/* Desktop: inline search field */}
              <div className="relative hidden lg:block" ref={searchRef}>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    goToSearchMatch();
                  }}
                >
                  <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white" />
                  <input
                    type="search"
                    value={searchText}
                    onChange={(event) => {
                      setSearchText(event.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search"
                    className="h-11 w-40 min-w-0 max-w-[14rem] rounded-md border border-white/80 bg-transparent pl-9 pr-3 text-sm font-bold text-white placeholder:text-white focus:outline-none focus:ring-1 focus:ring-white/70 xl:w-52"
                    aria-label="Search dashboard pages"
                  />
                </form>
                {searchResults}
              </div>

              <NotificationBell variant="portal" />
              <Link
                to={helpPath}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-white hover:bg-black/10"
                aria-label="Help"
                title="Help"
              >
                <HelpCircle size={22} />
              </Link>

              {/* Phone/tablet account control (desktop uses left identity rail) */}
              <div className="relative lg:hidden" ref={mobileIdentityRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (menuOpen) setMenuOpen(false);
                    else openUserMenu(mobileIdentityRef);
                  }}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-1 text-white hover:bg-black/10"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="User menu"
                >
                  <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-1 ring-white/50">
                    <img src="/ABC Logo.png" alt="" className="h-7 w-7 object-contain" />
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </header>
    </div>
  );
};
