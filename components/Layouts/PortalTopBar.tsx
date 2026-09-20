import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightLeft, ChevronDown, HelpCircle, LogOut, Menu, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CHURCH_NAME, displayName } from '../../lib/constants';

export type PortalSearchItem = {
  label: string;
  path: string;
};

type PortalTopBarProps = {
  variant: 'admin' | 'member';
  pageTitle: string;
  searchItems: PortalSearchItem[];
  helpPath: string;
  onOpenSidebar: () => void;
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
  onOpenSidebar,
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

  const matches = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return [];
    return searchItems.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 8);
  }, [searchItems, searchText]);

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

  return (
    <div className="relative z-30 flex h-[59px] shrink-0">
      <div className="flex w-44 shrink-0 items-center border-r border-gray-200 bg-white px-2 sm:w-72">
        <div className="relative w-full" ref={identityRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-[47px] w-full items-center gap-2 rounded-xl border border-black/5 bg-white px-2 shadow-sm"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <img
            src="/ABC Logo.png"
            alt=""
            className="h-8 w-8 shrink-0 rounded-full bg-white object-contain"
          />
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[13px] font-semibold leading-tight text-charcoal">
              {CHURCH_NAME}
            </span>
            <span className="block truncate text-xs font-normal leading-tight text-neutral">
              {displayName(user)}
            </span>
          </span>
          <ChevronDown size={16} className={`shrink-0 text-neutral transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute left-0 top-full z-40 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          >
            <Link
              to="/"
              role="menuitem"
              className="block px-3 py-2 text-sm text-charcoal hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Public website
            </Link>
            {showSwitchRole && (
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-charcoal hover:bg-gray-50"
                onClick={() => {
                  setMenuOpen(false);
                  onSwitchRole();
                }}
              >
                <ArrowRightLeft size={16} />
                {variant === 'admin' ? 'View as Member' : 'Back to Admin'}
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                setMenuOpen(false);
                onSignOut();
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
        </div>
      </div>

      <header className="flex min-w-0 flex-1 items-center gap-2 bg-gold px-3 sm:gap-3">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-md p-2 text-charcoal hover:bg-black/5"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <h1 className="hidden min-w-0 truncate text-base font-semibold text-charcoal sm:block">
        {pageTitle}
      </h1>

      <div className="ml-auto flex min-w-0 items-center gap-2">
        <div className="relative" ref={searchRef}>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral" />
          <input
            type="search"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search"
            className="h-10 w-32 rounded-full border-0 bg-white/90 pl-9 pr-4 text-sm text-charcoal placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-charcoal/10 sm:w-48 md:w-56"
            aria-label="Search dashboard pages"
          />
          {searchOpen && matches.length > 0 && (
            <div className="absolute right-0 top-full z-40 mt-1 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
              {matches.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-charcoal hover:bg-gray-200"
                  onClick={() => {
                    navigate(item.path);
                    setSearchText('');
                    setSearchOpen(false);
                  }}
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
