import { WHATS_ON_LABEL } from './constants';

export const INTERNAL_APP_LOCATION = 'Internal App';

/** Left-menu names (admin + member) used as Changelog location headings. */
export const MENU_LOCATION_LABELS = [
  'Overview',
  'Annual Calendar',
  'User Management',
  'User Security',
  'Prayers',
  'Newsletters',
  'Devotionals',
  'Sermons',
  'Leadership',
  WHATS_ON_LABEL,
  'Rosters (Beta)',
  'System Setup',
  'Help',
  'Logs',
  'Changelog',
  INTERNAL_APP_LOCATION,
] as const;

export type MenuLocationLabel = (typeof MENU_LOCATION_LABELS)[number];

const MENU_LOCATION_SET = new Set<string>(MENU_LOCATION_LABELS);

const PATH_RULES: { test: RegExp; label: MenuLocationLabel }[] = [
  { test: /pages\/dashboard\/UserSecurity|lib\/mfa|components\/Auth\/Mfa|supabase\/functions\/mfa/, label: 'User Security' },
  { test: /pages\/admin\/AdminTeam|pages\/dashboard\/Team|exportDirectoryPeople|teamMemberUtils/, label: 'Leadership' },
  { test: /pages\/admin\/AdminChangelog|lib\/changelog|lib\/githubChangelog|lib\/exportChangelog|CHANGELOG\.(json|md)|scripts\/changelog/, label: 'Changelog' },
  { test: /pages\/admin\/AdminOverview|pages\/dashboard\/DashboardHome|pages\/admin\/AdminEmails/, label: 'Overview' },
  { test: /AnnualCalendar|calendarItems|pages\/shared\/AnnualCalendar|components\/calendar\//, label: 'Annual Calendar' },
  { test: /PrayerWall|AdminPrayer|pages\/.*[Pp]rayer/, label: 'Prayers' },
  { test: /Newsletter/, label: 'Newsletters' },
  { test: /Devotional/, label: 'Devotionals' },
  { test: /[Ss]ermon|YouTubeSermon/, label: 'Sermons' },
  { test: /AdminEvents|EventsCalendarGrid|pages\/.*[Ee]vent/, label: WHATS_ON_LABEL },
  { test: /[Rr]oster/, label: 'Rosters (Beta)' },
  { test: /pages\/admin\/Help|pages\/dashboard\/Help|HelpContent/, label: 'Help' },
  { test: /AdminLogs|exportAuditLogs|auditLog/, label: 'Logs' },
  { test: /AdminSettings/, label: 'System Setup' },
];

export function isMenuLocation(value?: string): value is MenuLocationLabel {
  return Boolean(value && MENU_LOCATION_SET.has(value.trim()));
}

export function locationFromPath(filename: string): MenuLocationLabel {
  const path = filename.replaceAll('\\', '/');
  for (const rule of PATH_RULES) {
    if (rule.test.test(path)) return rule.label;
  }
  return INTERNAL_APP_LOCATION;
}

export function locationFromFiles(filenames: string[]): MenuLocationLabel {
  const counts = new Map<string, number>();
  for (const name of filenames) {
    const loc = locationFromPath(name);
    counts.set(loc, (counts.get(loc) ?? 0) + 1);
  }
  const menu = [...counts.entries()]
    .filter(([label]) => label !== INTERNAL_APP_LOCATION)
    .sort((a, b) => b[1] - a[1]);
  if (menu.length > 0) return menu[0][0] as MenuLocationLabel;
  return INTERNAL_APP_LOCATION;
}

function locationFromAreaCode(area: string): MenuLocationLabel {
  switch (area) {
    case 'users':
      return 'User Management';
    case 'prayer':
      return 'Prayers';
    case 'newsletters':
      return 'Newsletters';
    case 'devotionals':
      return 'Devotionals';
    case 'leadership':
      return 'Leadership';
    case 'events':
      return WHATS_ON_LABEL;
    case 'roster':
      return 'Rosters (Beta)';
    case 'calendar':
      return 'Annual Calendar';
    case 'sermons':
      return 'Sermons';
    case 'auth':
      return 'User Security';
    default:
      return INTERNAL_APP_LOCATION;
  }
}

export function locationFromArea(area: string, hint = ''): MenuLocationLabel {
  const h = hint.toLowerCase();
  const hintHits: MenuLocationLabel[] = [];
  const addHit = (label: MenuLocationLabel) => {
    if (!hintHits.includes(label)) hintHits.push(label);
  };

  if (h.includes('changelog')) addHit('Changelog');
  if (/\bhelp pages?\b/.test(h) || h.includes('help page')) addHit('Help');
  if (h.includes('system log') || h.includes('audit trail')) addHit('Logs');
  if (h.includes('system setup') || h.includes('adminsettings')) addHit('System Setup');
  if (h.includes('overview') || h.includes('verse of the day')) addHit('Overview');
  if (h.includes('user security') || h.includes('mfa') || h.includes('two-factor') || h.includes('2fa')) {
    addHit('User Security');
  }
  if (h.includes('user management') || h.includes('pending user') || h.includes('hold access')) {
    addHit('User Management');
  }
  if (h.includes('annual calendar')) addHit('Annual Calendar');
  if (h.includes('prayer')) addHit('Prayers');
  if (h.includes('newsletter')) addHit('Newsletters');
  if (h.includes('devotional')) addHit('Devotionals');
  if (h.includes('sermon')) addHit('Sermons');
  if (h.includes('leadership')) addHit('Leadership');
  if (/\bevents?\b/.test(h) || h.includes("what's on") || h.includes('whats on')) addHit(WHATS_ON_LABEL);
  if (h.includes('roster')) addHit('Rosters (Beta)');

  const fromArea = locationFromAreaCode(area);
  const adminMenus: MenuLocationLabel[] = ['Changelog', 'Logs', 'System Setup', 'Help', 'Overview'];
  if (hintHits.length === 1) return hintHits[0];
  if (hintHits.length > 1) {
    const adminHit = adminMenus.find((label) => hintHits.includes(label));
    if (adminHit) return adminHit;
    if (hintHits.includes(fromArea)) return fromArea;
    return INTERNAL_APP_LOCATION;
  }
  return fromArea;
}

export function isGenericChangelogHeading(heading?: string): boolean {
  const t = (heading || '').trim().toLowerCase();
  return !t || t === 'website update' || t === 'website updates' || /^updates?\s+\d+/.test(t);
}

export function locationForDisplay(input: {
  area: string;
  heading?: string;
  summary?: string;
  title?: string;
  id?: string;
}): MenuLocationLabel {
  if (!isGenericChangelogHeading(input.heading) && isMenuLocation(input.heading)) {
    return input.heading;
  }
  return locationFromArea(
    input.area,
    [input.heading, input.summary, input.title, input.id].filter(Boolean).join(' ')
  );
}
