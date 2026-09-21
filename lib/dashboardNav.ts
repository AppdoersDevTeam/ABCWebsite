/**
 * Portal left-menu icon chips — restrained accents from the public site palette
 * (gold, olive #A8B774/#738242, brand teal, charcoal). Soft tint backgrounds only.
 */
export const PORTAL_NAV_ICON = 'bg-gold/15 text-gold';

export const DASHBOARD_NAV_ICON = {
  overview: 'bg-gold/15 text-gold',
  events: 'bg-[#A8B774]/20 text-[#738242]',
  calendar: 'bg-[#A8B774]/20 text-[#738242]',
  prayers: 'bg-teal/10 text-teal',
  newsletters: 'bg-amber-50 text-amber-700',
  devotionals: 'bg-gold/10 text-[#738242]',
  sermons: 'bg-charcoal/5 text-charcoal',
  team: 'bg-teal/10 text-teal',
  rosters: 'bg-teal/10 text-teal',
  help: 'bg-gold/15 text-gold',
  users: 'bg-teal/10 text-teal',
  roles: 'bg-teal/10 text-teal',
  settings: 'bg-charcoal/5 text-charcoal',
  logs: 'bg-charcoal/5 text-charcoal',
  changelog: 'bg-charcoal/5 text-charcoal',
} as const;

/** Shared portal sidebar chrome — aligns with public glass / gold / dash surfaces. */
export const PORTAL_SIDEBAR_ASIDE =
  'border-r border-white/70 bg-dash/90 backdrop-blur-md shadow-[inset_-1px_0_0_rgba(251,203,5,0.12)]';

export const PORTAL_SIDEBAR_NAV = 'flex-1 space-y-0.5 overflow-y-auto py-3';

export const PORTAL_SIDEBAR_DIVIDER =
  'mx-2 my-2.5 border-t border-[#A8B774]/35';

export const PORTAL_NAV_ITEM_BASE =
  'flex min-h-[44px] items-center rounded-[10px] transition-all duration-300 group relative overflow-hidden';

export const PORTAL_NAV_ITEM_IDLE =
  'text-neutral hover:text-charcoal hover:bg-white/70';

export const PORTAL_NAV_ITEM_ACTIVE =
  'bg-white text-charcoal font-bold shadow-sm border border-gold/40';

export const PORTAL_NAV_CHILD_IDLE =
  'text-charcoal hover:bg-white/70';

export const PORTAL_NAV_CHILD_ACTIVE =
  'bg-gold/15 text-charcoal font-semibold';

export const PORTAL_SIDEBAR_FOOTER_BTN =
  'w-full flex items-center min-h-[44px] py-2 text-neutral hover:bg-white/70 hover:text-charcoal transition-colors rounded-[10px]';

type PortalNavChild = { label: string };

export const OVERVIEW_NAV_LABEL = 'Overview';

/** Member left-menu UX order (Overview first, then church life → content → people → help). */
export const MEMBER_NAV_ORDER = [
  'Overview',
  'Events',
  'Annual Calendar',
  'Prayers',
  'Newsletters',
  'Devotionals',
  'Sermons',
  'Rosters (Beta)',
  "People's Directory",
  'Help',
] as const;

/** Admin left-menu UX order (Overview first, then content → people → system → help). */
export const ADMIN_NAV_ORDER = [
  'Overview',
  'Events',
  'Annual Calendar',
  'Prayers',
  'Newsletters',
  'Devotionals',
  'Rosters (Beta)',
  "People's Directory",
  'Users & Roles',
  'System Setup',
  'Logs',
  'Changelog',
  'Help',
] as const;

/** Labels that start a new nav section (divider shown above them). */
export const MEMBER_NAV_DIVIDER_BEFORE = new Set([
  'Events',
  'Newsletters',
  'Rosters (Beta)',
  'Help',
]);

export const ADMIN_NAV_DIVIDER_BEFORE = new Set([
  'Events',
  'Newsletters',
  'Rosters (Beta)',
  'Users & Roles',
  'System Setup',
  'Help',
]);

export function comparePortalNavLabels(a: string, b: string): number {
  return a.localeCompare(b, 'en', { sensitivity: 'base' });
}

export function portalNavNeedsDivider(
  index: number,
  items: { label: string }[],
  dividerBeforeLabels: ReadonlySet<string> = MEMBER_NAV_DIVIDER_BEFORE,
): boolean {
  if (index <= 0) return false;
  const label = items[index]?.label;
  return Boolean(label && dividerBeforeLabels.has(label));
}

/**
 * Order portal nav by an explicit UX label list.
 * Nested children keep the order declared on the item (not A–Z).
 */
export function orderPortalNavItems<T extends { label: string; children?: PortalNavChild[] }>(
  items: T[],
  order: readonly string[],
): T[] {
  const rank = new Map(order.map((label, i) => [label, i]));
  return [...items].sort((a, b) => {
    const ai = rank.get(a.label) ?? Number.MAX_SAFE_INTEGER;
    const bi = rank.get(b.label) ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return comparePortalNavLabels(a.label, b.label);
  });
}

/** @deprecated Prefer orderPortalNavItems with MEMBER_NAV_ORDER / ADMIN_NAV_ORDER. */
export function sortPortalNavItems<T extends { label: string; children?: PortalNavChild[] }>(
  items: T[],
): T[] {
  return orderPortalNavItems(items, MEMBER_NAV_ORDER);
}
