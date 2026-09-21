/** Shared left-menu icon style — matches public site gold/charcoal language. */
export const PORTAL_NAV_ICON = 'bg-gold/15 text-gold';

/** @deprecated Use PORTAL_NAV_ICON; kept as keyed aliases for existing call sites. */
export const DASHBOARD_NAV_ICON = {
  overview: PORTAL_NAV_ICON,
  prayers: PORTAL_NAV_ICON,
  newsletters: PORTAL_NAV_ICON,
  devotionals: PORTAL_NAV_ICON,
  sermons: PORTAL_NAV_ICON,
  events: PORTAL_NAV_ICON,
  calendar: PORTAL_NAV_ICON,
  team: PORTAL_NAV_ICON,
  rosters: PORTAL_NAV_ICON,
  help: PORTAL_NAV_ICON,
  users: PORTAL_NAV_ICON,
  roles: PORTAL_NAV_ICON,
  settings: PORTAL_NAV_ICON,
  logs: PORTAL_NAV_ICON,
  changelog: PORTAL_NAV_ICON,
} as const;

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
