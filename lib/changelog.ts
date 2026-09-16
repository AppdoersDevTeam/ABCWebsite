/** Product changelog shown only to Super Admins in the admin dashboard. */

export type ChangelogKind = 'added' | 'changed' | 'fixed';

export type ChangelogArea =
  | 'admin'
  | 'auth'
  | 'calendar'
  | 'devotionals'
  | 'events'
  | 'leadership'
  | 'newsletters'
  | 'prayer'
  | 'public'
  | 'roster'
  | 'sermons'
  | 'system'
  | 'users';

export type ChangelogEntry = {
  id: string;
  /** ISO date-time when the change shipped */
  changedAt: string;
  /** Git author / team member who made the change */
  changedBy: string;
  kind: ChangelogKind;
  area: ChangelogArea;
  title: string;
  summary: string;
  details?: string[];
};

export const CHANGELOG_KIND_OPTIONS: { value: ChangelogKind | ''; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'added', label: 'Added' },
  { value: 'changed', label: 'Changed' },
  { value: 'fixed', label: 'Fixed' },
];

export const CHANGELOG_AREA_OPTIONS: { value: ChangelogArea | ''; label: string }[] = [
  { value: '', label: 'All areas' },
  { value: 'admin', label: 'Admin' },
  { value: 'auth', label: 'Auth' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'devotionals', label: 'Devotionals' },
  { value: 'events', label: 'Events' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'newsletters', label: 'Newsletters' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'public', label: 'Public site' },
  { value: 'roster', label: 'Rosters' },
  { value: 'sermons', label: 'Sermons' },
  { value: 'system', label: 'System' },
  { value: 'users', label: 'Users' },
];

export const CHANGELOG_KIND_LABELS: Record<ChangelogKind, string> = {
  added: 'Added',
  changed: 'Changed',
  fixed: 'Fixed',
};

export const CHANGELOG_KIND_COLORS: Record<ChangelogKind, string> = {
  added: 'bg-emerald-100 text-emerald-800',
  changed: 'bg-amber-100 text-amber-900',
  fixed: 'bg-sky-100 text-sky-800',
};

export const CHANGELOG_AREA_LABELS: Record<ChangelogArea, string> = {
  admin: 'Admin',
  auth: 'Auth',
  calendar: 'Calendar',
  devotionals: 'Devotionals',
  events: 'Events',
  leadership: 'Leadership',
  newsletters: 'Newsletters',
  prayer: 'Prayer',
  public: 'Public site',
  roster: 'Rosters',
  sermons: 'Sermons',
  system: 'System',
  users: 'Users',
};

/**
 * Curated product changelog covering shipped website changes.
 * Newest entries first. Each entry must include changedAt (ISO date-time) and changedBy.
 * Keep this list updated when Super Admin–visible product behaviour changes.
 */
export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    id: '2026-09-16-changelog-date-filters',
    changedAt: '2026-09-16T07:20:00+00:00',
    changedBy: 'Appdoers Dev Team',
    kind: 'added',
    area: 'admin',
    title: 'Changelog year, month, and date range filters',
    summary:
      'Super Admins can narrow the Changelog by calendar year, month, and/or a from–to date range. Exports include only the filtered rows.',
  },
  {
    id: '2026-09-16-changelog-contrast',
    changedAt: '2026-09-16T07:08:00+00:00',
    changedBy: 'Appdoers Dev Team',
    kind: 'fixed',
    area: 'admin',
    title: 'Changelog text contrast on light background',
    summary:
      'Changelog titles, summaries, and meta text use explicit dark colours so they stay readable on the white admin surface.',
  },
  {
    id: '2026-09-16-changelog-layout',
    changedAt: '2026-09-16T06:58:00+00:00',
    changedBy: 'Appdoers Dev Team',
    kind: 'changed',
    area: 'admin',
    title: 'Clearer Changelog timeline layout',
    summary:
      'Changelog entries use a vertical timeline with a clear title, typed badges, and a tidy footer for when, who, and area.',
    details: [
      'Month headers show how many updates are in that period.',
      'Type badges include icons so colour is not the only cue.',
    ],
  },
  {
    id: '2026-09-16-changelog-export',
    changedAt: '2026-09-16T06:53:00+00:00',
    changedBy: 'Appdoers Dev Team',
    kind: 'added',
    area: 'admin',
    title: 'Export Changelog to Excel and PDF',
    summary:
      'Super Admins can download the changelog as Excel (CSV) or PDF. Exports include only the rows matching the current type, area, and search filters.',
    details: ['Export buttons sit in the Changelog page header, next to the title.'],
  },
  {
    id: '2026-09-16-changelog-datetime-user',
    changedAt: '2026-09-16T06:49:00+00:00',
    changedBy: 'Appdoers Dev Team',
    kind: 'changed',
    area: 'admin',
    title: 'Changelog shows date, time, and who made each change',
    summary:
      'Every changelog row now includes the exact day and time the change shipped and the person or team who made it.',
    details: [
      'Times display in your admin timezone (same as System Logs).',
      'Search includes the user name as well as title and summary.',
    ],
  },
  {
    id: '2026-09-16-superadmin-changelog',
    changedAt: '2026-09-16T06:30:16+00:00',
    changedBy: 'Appdoers Dev Team',
    kind: 'added',
    area: 'admin',
    title: 'Super Admin Changelog tab in the admin dashboard',
    summary:
      'A Changelog tab sits next to Logs in the admin left menu. Only Super Admins can see or open it.',
    details: [
      'Regular admins do not see the tab and are redirected to Overview if they guess the URL.',
      'Filter by type, area, or search. Entries are grouped by month.',
      'This is the product history — live activity still lives under Logs.',
    ],
  },
  {
    id: '2026-09-15-hold-access',
    changedAt: '2026-09-15T02:35:23+12:00',
    changedBy: 'Fabiano J A da Silva',
    kind: 'added',
    area: 'users',
    title: 'Hold Access for existing accounts',
    summary:
      'Admins can place website access on hold for security, separate from first-time pending approval.',
    details: [
      'Held users see a distinct pending-access screen instead of the member portal.',
      'An email notifies the person when access is held.',
      'User Management includes a Held filter, export status, and restore flow.',
    ],
  },
  {
    id: '2026-09-15-admin-role-emails',
    changedAt: '2026-09-15T02:13:50+12:00',
    changedBy: 'Fabiano J A da Silva',
    kind: 'added',
    area: 'users',
    title: 'Emails when admin access is granted or removed',
    summary: 'Promoting or demoting an admin now sends a confirmation email to that person.',
  },
  {
    id: '2026-09-15-delete-user',
    changedAt: '2026-09-14T23:55:07+12:00',
    changedBy: 'Fabiano J A da Silva',
    kind: 'added',
    area: 'users',
    title: 'Delete a user from User Management',
    summary:
      'Admins can remove an account after confirmation. The person receives an email confirming deletion.',
    details: [
      'You cannot delete your own account while signed in.',
      'Super Admin and the Appdoers service account cannot be deleted.',
    ],
  },
  {
    id: '2026-09-15-user-export',
    changedAt: '2026-09-15T02:48:09+12:00',
    changedBy: 'Fabiano J A da Silva',
    kind: 'added',
    area: 'users',
    title: 'Export User Management lists to CSV and PDF',
    summary: 'Download the currently visible user list with role, status, leadership link, and join date.',
  },
  {
    id: '2026-09-14-annual-calendar',
    changedAt: '2026-09-14T23:10:29+12:00',
    changedBy: 'Fabiano J A da Silva',
    kind: 'added',
    area: 'calendar',
    title: 'Annual Calendar in admin and member portals',
    summary:
      'A year / month / week calendar shows events, sermons, devotionals, and newsletters together.',
    details: [
      'Coloured markers distinguish item types. Open a day, then tap an item to view it.',
      'The calendar updates when events, devotionals, or newsletters change.',
    ],
  },
  {
    id: '2026-09-14-newsletters-week-date',
    changedAt: '2026-09-14T19:05:44+12:00',
    changedBy: 'Fabiano J A da Silva',
    kind: 'changed',
    area: 'newsletters',
    title: 'Newsletters match devotionals: title, week date, latest-first archive',
    summary:
      'Admin newsletter publishing now uses a title and week date, with newest issues listed first.',
  },
  {
    id: '2026-09-14-dashboard-nav-icons',
    changedAt: '2026-09-14T22:28:05+12:00',
    changedBy: 'Fabiano J A da Silva',
    kind: 'changed',
    area: 'admin',
    title: 'Sidebar labels and icons for Prayers and Newsletters',
    summary: 'Prayers uses a praying-hands icon; Newsletters has a distinct newspaper icon and colour.',
  },
  {
    id: '2026-09-14-page-headers',
    changedAt: '2026-09-15T03:14:00+12:00',
    changedBy: 'Fabiano J A da Silva',
    kind: 'changed',
    area: 'admin',
    title: 'Shared page headers across admin and member sections',
    summary: 'Left-menu pages use a consistent title, subtitle, and icon header.',
  },
  {
    id: '2026-09-14-pending-oauth',
    changedAt: '2026-09-15T00:53:03+12:00',
    changedBy: 'Fabiano J A da Silva',
    kind: 'fixed',
    area: 'auth',
    title: 'Pending approval, OAuth, and HashRouter reliability',
    summary:
      'Sign-in callbacks, password recovery, and the pending-approval screen no longer drop people on a blank or looping page.',
  },
  {
    id: '2026-09-14-directory-linking',
    changedAt: '2026-09-15T03:09:05+12:00',
    changedBy: 'Fabiano J A da Silva',
    kind: 'changed',
    area: 'leadership',
    title: 'Leadership linking from User Management',
    summary:
      'Link a login to a Leadership person so ministry memberships and rosters apply. Recheck matches or pick a person by hand.',
  },
  {
    id: '2026-08-28-watch-sermons-dashboard',
    changedAt: '2026-08-28T10:15:25+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'sermons',
    title: 'Watch Sermons page in the member dashboard',
    summary: 'Members can watch the church YouTube sermons from inside the member portal.',
  },
  {
    id: '2026-08-28-overview-typography',
    changedAt: '2026-08-28T10:19:04+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'admin',
    title: 'Overview card typography',
    summary: 'Overview titles and labels are easier to read; all-caps labels are no longer forced.',
  },
  {
    id: '2026-08-27-devotional-of-the-week',
    changedAt: '2026-08-27T15:53:00+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'devotionals',
    title: 'Devotional of the Week with in-page PDF reader',
    summary:
      'Admins upload a weekly PDF with title, subtitle, and week date. Members read it in the portal viewer — no download or new-tab link.',
    details: [
      'Admins can edit an existing issue or replace the PDF.',
      'Upload drafts persist if you leave the form and come back.',
      'Archives are scrollable and listed newest first.',
    ],
  },
  {
    id: '2026-08-27-pdf-viewer-fixes',
    changedAt: '2026-08-27T16:39:13+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'fixed',
    area: 'system',
    title: 'PDF viewer blank screens, flicker, and mobile layout',
    summary:
      'Leaving a PDF, switching tabs, or reading on a phone no longer whites out the page or flashes the document.',
  },
  {
    id: '2026-08-27-turnstile',
    changedAt: '2026-08-23T14:11:14+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'auth',
    title: 'Cloudflare Turnstile on sign-in and admin email actions',
    summary:
      'CAPTCHA protects login, signup, password reset, and related admin email flows from automated abuse.',
  },
  {
    id: '2026-08-27-user-actions-menu',
    changedAt: '2026-08-27T15:23:49+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'users',
    title: 'User Management actions collapsed into a dropdown',
    summary: 'Pending user rows fit on smaller screens; actions sit in a single menu per person.',
  },
  {
    id: '2026-08-27-approval-email-errors',
    changedAt: '2026-08-27T15:29:16+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'fixed',
    area: 'users',
    title: 'Clear errors when approval emails fail',
    summary: 'If an approval or review email cannot send, the admin sees the failure instead of a silent miss.',
  },
  {
    id: '2026-08-27-multiday-events',
    changedAt: '2026-08-27T16:23:22+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'events',
    title: 'Clearer multi-day event schedules',
    summary: 'Event pages show start and end dates and times without unreadable contrast.',
  },
  {
    id: '2026-06-26-remove-community-lunch',
    changedAt: '2026-06-26T10:35:46+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'events',
    title: 'Community Lunch removed from event categories',
    summary: 'Community Lunch is no longer listed as an event category across the site.',
  },
  {
    id: '2026-06-23-verse-of-the-day',
    changedAt: '2026-06-23T20:23:38+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'public',
    title: 'Verse of the day on the member dashboard',
    summary: 'The member Overview rotates a daily verse drawn from the ACTS Prayers set.',
  },
  {
    id: '2026-06-23-audit-logs',
    changedAt: '2026-06-23T20:08:23+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'admin',
    title: 'System Logs audit trail',
    summary:
      'Admins can review sign-ins, sign-ups, admin changes, member activity, and RSVPs, then filter and export to CSV.',
    details: [
      'Database triggers record many table changes automatically.',
      'Logs cannot be edited or deleted in the portal.',
    ],
  },
  {
    id: '2026-06-23-event-images',
    changedAt: '2026-06-23T19:49:21+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'fixed',
    area: 'events',
    title: 'Event posters display at the right size without stretching',
    summary:
      'Calendar cards, detail pages, and uploads use a 16:9 poster. Any photo format is accepted; the Watch Online button links correctly.',
  },
  {
    id: '2026-06-22-production-seo',
    changedAt: '2026-06-22T19:45:28+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'public',
    title: 'Production domain, SEO, and leadership pages',
    summary:
      'The live site uses ashburtonbaptist.co.nz with search metadata. Placeholder leadership pages were removed.',
  },
  {
    id: '2026-06-21-mobile-dashboards',
    changedAt: '2026-06-21T19:24:16+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'fixed',
    area: 'admin',
    title: 'Admin and member dashboards work on phones',
    summary: 'Mobile layouts scroll and stack correctly without changing the desktop layout.',
  },
  {
    id: '2026-06-21-password-reset-hashrouter',
    changedAt: '2026-06-21T18:43:59+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'fixed',
    area: 'auth',
    title: 'Password reset works with HashRouter and recovery tokens',
    summary:
      'Reset links from email complete on the HashRouter site. Mobile no longer hangs on an infinite loading state.',
  },
  {
    id: '2026-06-21-shared-event-calendar',
    changedAt: '2026-06-21T18:24:06+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'events',
    title: 'Shared event calendar grid for admin and members',
    summary: 'Admin and member event calendars use the same grid, cards, and category filters.',
  },
  {
    id: '2026-06-21-statement-of-faith',
    changedAt: '2026-06-21T16:46:36+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'public',
    title: 'Statement of Faith page',
    summary:
      'The public beliefs page publishes the adopted church document, with a congregation photo hero and a mobile article picker.',
  },
  {
    id: '2026-06-18-contact-form',
    changedAt: '2026-06-18T16:50:55+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'public',
    title: 'Contact form connect-card fields and direct pastor email',
    summary:
      'The contact form is a multi-step connect card (first/last name, optional phone, spouse, extra details) and emails the pastor directly.',
    details: [
      'NZ mobile, landline, and toll-free numbers are accepted.',
      'Need Prayer was simplified; the Contact navbar dropdown was removed.',
    ],
  },
  {
    id: '2026-06-18-signup-email',
    changedAt: '2026-06-18T18:05:17+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'auth',
    title: 'Email-only signup with confirmation',
    summary:
      'People sign up with email, receive a branded confirmation message, and can complete signup even if they try again.',
  },
  {
    id: '2026-06-18-giving',
    changedAt: '2026-06-18T18:26:31+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'public',
    title: 'Giving page bank details and coming-soon online giving',
    summary:
      'The Giving page shows the correct bank account. Give Securely opens a coming-soon message until online giving is ready.',
  },
  {
    id: '2026-06-18-teens-youth',
    changedAt: '2026-06-18T12:43:17+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'events',
    title: 'Teens & Youth events page',
    summary: 'A Tuesday 7pm Teens & Youth category and public page were added to Events.',
  },
  {
    id: '2026-06-18-sermons-search',
    changedAt: '2026-06-18T12:09:39+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'sermons',
    title: 'Sermons playlist filter and title search',
    summary:
      'Watch Sermons can filter by playlist and search titles. Search no longer matches the description, and the dropdown stacks cleanly on mobile.',
  },
  {
    id: '2026-06-18-kids-programme',
    changedAt: '2026-06-18T16:42:11+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'events',
    title: 'Kids Programme time set to 10am',
    summary: 'Kids Programme copy uses 10am, and event contact buttons consistently say Get in touch.',
  },
  {
    id: '2026-06-18-hide-service-account',
    changedAt: '2026-06-18T18:45:56+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'users',
    title: 'Appdoers service account hidden from other admins',
    summary: 'The Super Admin service account no longer appears in other admins’ user lists.',
  },
  {
    id: '2026-06-18-history-mobile',
    changedAt: '2026-06-18T12:12:41+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'fixed',
    area: 'public',
    title: 'History page content visible on mobile',
    summary: 'The History timeline no longer renders blank on phones; hover is scoped to cards.',
  },
  {
    id: '2026-06-18-im-new-maps',
    changedAt: '2026-06-18T16:42:21+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'public',
    title: 'I’m New location link and visitor PDF coming soon',
    summary:
      'Church location uses a direct Google Maps place link. The new-visitor PDF download shows coming soon when the file is not available.',
  },
  {
    id: '2026-04-27-roster-ministries',
    changedAt: '2026-04-27T14:29:22+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'roster',
    title: 'Rosters per ministry with date ranges',
    summary:
      'Admins upload a roster PDF for a ministry (group) covering a from–to date range. Members only see rosters for ministries they belong to.',
    details: [
      'Dashboard Roster shows a ministry list, then roster details and PDF preview.',
      'Published rosters can be edited (ministry, dates, or replacement file).',
      'Leader name and photo come from the matching “<Group> Leader” job role.',
    ],
  },
  {
    id: '2026-04-27-event-categories-settings',
    changedAt: '2026-04-27T13:58:59+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'admin',
    title: 'Event categories managed in System Setup',
    summary:
      'Admins add, edit, disable, or delete event categories the same way as Groups and Job Roles. Event forms load the live list.',
  },
  {
    id: '2026-04-27-password-reset',
    changedAt: '2026-04-27T13:52:21+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'auth',
    title: 'Forgot password and admin-sent password reset',
    summary:
      'Login has Forgot password? Admins can send a reset link from User Management. People set a new password on the recovery page.',
  },
  {
    id: '2026-04-27-rsvp-search-export',
    changedAt: '2026-04-27T13:51:31+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'events',
    title: 'RSVP search and directory-styled CSV/PDF export',
    summary:
      'Admins can search RSVPs by name or email and export only the filtered rows, styled like the Leadership directory export.',
  },
  {
    id: '2026-04-27-directory-groups-roles',
    changedAt: '2026-04-27T12:14:58+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'leadership',
    title: 'Leadership groups, job roles, filters, and export',
    summary:
      'System Setup stores Groups and Job Roles. The Leadership table filters by staff/member/attendee and exports CSV or PDF.',
    details: [
      'Member dashboard Leadership shows staff only.',
      'Linking a login to a Leadership person is opt-in and re-checkable.',
    ],
  },
  {
    id: '2026-04-27-help-pages',
    changedAt: '2026-04-27T16:47:25+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'admin',
    title: 'Help pages for admin and member portals',
    summary: 'Each left-menu area has a short explanation of what it is for and typical tasks.',
  },
  {
    id: '2026-04-27-remove-photos',
    changedAt: '2026-04-27T17:07:28+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'admin',
    title: 'Photos section removed from admin',
    summary: 'The Photos tile and routes were taken out of the admin portal.',
  },
  {
    id: '2026-04-27-prayer-button',
    changedAt: '2026-04-27T14:30:40+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'fixed',
    area: 'prayer',
    title: 'I’m praying button refreshes the count',
    summary: 'Tapping I’m praying on the prayer wall updates the count without a stale refresh.',
  },
  {
    id: '2026-04-16-super-admin-roles',
    changedAt: '2026-04-16T20:49:20+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'users',
    title: 'Super Admin role and first/last name',
    summary:
      'The Super Admin account is protected. Any approved admin can promote or demote other admins. Profiles store first and last name.',
    details: ['View as Member moved from the login page into the dashboard sidebars.'],
  },
  {
    id: '2026-04-16-events-module',
    changedAt: '2026-04-14T20:39:38+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'events',
    title: 'Events: images, detail pages, RSVP, and audience',
    summary:
      'Admins upload event images, set audience (staff / members / attendees / all), and optionally collect RSVPs. Public events have a See More detail page.',
    details: [
      'Missing images fall back to the church logo banner.',
      'Public events stay visible to everyone; private events stay in the dashboards.',
      'Calendar cards, RSVP flow, and admin event list were polished for production.',
    ],
  },
  {
    id: '2026-04-14-directory-table',
    changedAt: '2026-04-14T19:35:56+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'leadership',
    title: 'Admin Leadership directory table',
    summary: 'Leadership is an Excel-style table with richer people profiles and export, instead of cards only.',
  },
  {
    id: '2026-04-14-oauth-callback',
    changedAt: '2026-04-14T20:06:43+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'fixed',
    area: 'auth',
    title: 'OAuth callback no longer 404s on refresh',
    summary: 'Google sign-in return URLs survive a page refresh on the HashRouter app.',
  },
  {
    id: '2026-02-01-sermons-youtube',
    changedAt: '2026-04-13T08:03:07+12:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'sermons',
    title: 'Public Watch Sermons with YouTube embeds',
    summary: 'The public Sermons page embeds the church YouTube channel so visitors can watch messages.',
  },
  {
    id: '2026-02-01-visual-refresh',
    changedAt: '2026-02-01T19:54:54+13:00',
    changedBy: 'Sara A. da Silva',
    kind: 'changed',
    area: 'public',
    title: 'Public pages match the home visual language',
    summary: 'FAQ accordions animate smoothly; scroll icons align on laptop and mobile.',
  },
  {
    id: '2026-01-24-admin-responsive',
    changedAt: '2026-01-24T19:28:11+13:00',
    changedBy: 'Sara A. da Silva',
    kind: 'fixed',
    area: 'admin',
    title: 'Admin layout works on smaller screens',
    summary: 'The admin sidebar collapses to a menu on phones.',
  },
  {
    id: '2026-01-02-leadership-uploads',
    changedAt: '2026-01-02T20:35:52+13:00',
    changedBy: 'Fabiano J A da Silva',
    kind: 'added',
    area: 'leadership',
    title: 'Leadership photo upload and descriptions',
    summary:
      'Admins upload a photo file instead of pasting a URL, and can add a description used on public leadership pages.',
  },
  {
    id: '2025-12-22-core-portals',
    changedAt: '2025-12-21T19:11:01+13:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'admin',
    title: 'Admin and member dashboards, prayer wall, and user management',
    summary:
      'Signed-in people land in a dashboard. Admins get Overview, User Management, and tools to run the site.',
    details: [
      'Prayer wall for submitting and supporting requests.',
      'Roster PDFs, team members, dates and timezones, and skeleton loading states.',
    ],
  },
  {
    id: '2025-12-21-public-site',
    changedAt: '2025-12-21T18:12:45+13:00',
    changedBy: 'Sara A. da Silva',
    kind: 'added',
    area: 'public',
    title: 'Public church website and History page',
    summary:
      'The public site launched with Home, About, Events, I’m New, Giving, Need Prayer, Contact, and History, plus the first admin dashboard.',
  },
];

export const CHANGELOG_MONTH_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All months' },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(2000, i, 1).toLocaleString('en-NZ', { month: 'long' }),
  })),
];

export function getChangelogYearOptions(entries: ChangelogEntry[]): { value: string; label: string }[] {
  const years = new Set<number>();
  for (const entry of entries) {
    years.add(new Date(entry.changedAt).getFullYear());
  }
  return [
    { value: '', label: 'All years' },
    ...Array.from(years)
      .sort((a, b) => b - a)
      .map((year) => ({ value: String(year), label: String(year) })),
  ];
}

export type ChangelogEntryFilters = {
  kind?: ChangelogKind | '';
  area?: ChangelogArea | '';
  search?: string;
  year?: string;
  month?: string;
  dateFrom?: string;
  dateTo?: string;
};

function changelogEntryInstantMs(changedAt: string): number {
  return new Date(changedAt).getTime();
}

function localDayStartMs(yyyyMmDd: string): number {
  return new Date(`${yyyyMmDd}T00:00:00`).getTime();
}

function localDayEndMs(yyyyMmDd: string): number {
  return new Date(`${yyyyMmDd}T23:59:59.999`).getTime();
}

function matchesChangelogDateFilters(changedAt: string, filters: ChangelogEntryFilters): boolean {
  const when = new Date(changedAt);
  const year = (filters.year ?? '').trim();
  const month = (filters.month ?? '').trim();
  if (year && when.getFullYear() !== Number(year)) return false;
  if (month && when.getMonth() + 1 !== Number(month)) return false;

  const from = (filters.dateFrom ?? '').trim();
  const to = (filters.dateTo ?? '').trim();
  const ms = changelogEntryInstantMs(changedAt);
  if (from && ms < localDayStartMs(from)) return false;
  if (to && ms > localDayEndMs(to)) return false;
  return true;
}

export function filterChangelogEntries(entries: ChangelogEntry[], filters: ChangelogEntryFilters): ChangelogEntry[] {
  const q = (filters.search ?? '').trim().toLowerCase();
  return entries.filter((entry) => {
    if (filters.kind && entry.kind !== filters.kind) return false;
    if (filters.area && entry.area !== filters.area) return false;
    if (!matchesChangelogDateFilters(entry.changedAt, filters)) return false;
    if (!q) return true;
    const haystack = [
      entry.title,
      entry.summary,
      entry.changedBy,
      CHANGELOG_AREA_LABELS[entry.area],
      CHANGELOG_KIND_LABELS[entry.kind],
      ...(entry.details ?? []),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function groupChangelogByMonth(entries: ChangelogEntry[]): { monthKey: string; label: string; entries: ChangelogEntry[] }[] {
  const groups = new Map<string, ChangelogEntry[]>();
  const sorted = [...entries].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );
  for (const entry of sorted) {
    const monthKey = entry.changedAt.slice(0, 7);
    const list = groups.get(monthKey);
    if (list) list.push(entry);
    else groups.set(monthKey, [entry]);
  }
  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([monthKey, monthEntries]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const label = new Date(year, month - 1, 1).toLocaleString('en-NZ', {
        month: 'long',
        year: 'numeric',
      });
      return { monthKey, label, entries: monthEntries };
    });
}
