/** Shared left-menu icon colours, matched to dashboard overview cards. */
export const DASHBOARD_NAV_ICON = {
  overview: 'bg-gold/20 text-gold',
  prayers: 'bg-blue-50 text-blue-600',
  newsletters: 'bg-orange-50 text-orange-600',
  devotionals: 'bg-purple-50 text-purple-600',
  sermons: 'bg-red-50 text-red-600',
  events: 'bg-green-50 text-green-600',
  calendar: 'bg-emerald-50 text-emerald-600',
  team: 'bg-teal-50 text-teal-600',
  rosters: 'bg-indigo-50 text-indigo-600',
  help: 'bg-cyan-50 text-cyan-600',
  users: 'bg-sky-50 text-sky-600',
  roles: 'bg-amber-50 text-amber-700',
  settings: 'bg-slate-50 text-slate-600',
  logs: 'bg-rose-50 text-rose-600',
  changelog: 'bg-violet-50 text-violet-600',
} as const;

type PortalNavChild = { label: string };

export function comparePortalNavLabels(a: string, b: string): number {
  return a.localeCompare(b, 'en', { sensitivity: 'base' });
}

/** A–Z by visible label, including nested Users & Roles children. */
export function sortPortalNavItems<T extends { label: string; children?: PortalNavChild[] }>(
  items: T[],
): T[] {
  return items
    .map((item) =>
      item.children
        ? { ...item, children: [...item.children].sort((a, b) => comparePortalNavLabels(a.label, b.label)) }
        : item,
    )
    .sort((a, b) => comparePortalNavLabels(a.label, b.label));
}
