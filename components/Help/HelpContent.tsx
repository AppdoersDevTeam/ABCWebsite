import React from 'react';
import { HelpCircle } from 'lucide-react';
import { AdminPageHeader } from '../UI/AdminPageHeader';
import { EVENTS_LABEL, PEOPLE_LABEL } from '../../lib/constants';

type Mode = 'member' | 'admin';

interface HelpContentProps {
  mode: Mode;
  isSuperAdmin?: boolean;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-[12px] p-6">
      <h2 className="text-xl font-bold text-charcoal">{title}</h2>
      <ul className="mt-3 text-sm text-neutral space-y-2 list-disc list-inside marker:text-gold">{children}</ul>
    </section>
  );
}

export const HelpContent: React.FC<HelpContentProps> = ({ mode, isSuperAdmin = false }) => {
  const isAdmin = mode === 'admin';

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Help"
        subtitle={
          isAdmin
            ? 'This page explains each area of the Admin Portal: what it is for, what you can configure, and typical tasks. Use the same names as the left-hand menu.'
            : 'This page explains what each part of the Member Portal gives you: what you can view, join in with, or download. It matches the sections in your sidebar.'
        }
        icon={<HelpCircle size={28} />}
      />

      <div className="grid gap-6">
        {isAdmin ? (
          <>
            <Section title="Overview">
              <li>Your landing page after signing in as an admin: quick snapshot and shortcuts into the main tools.</li>
              <li>The yellow bar at the top has the church name, the person signed in, a search box for admin pages, and Help.</li>
              <li>The Users card shows how many approved users are in the system. Click it to open Users under Users & Roles.</li>
              <li>The {PEOPLE_LABEL} card shows how many people are in the directory. Click it to open {PEOPLE_LABEL}.</li>
              <li>Use it to orient new admins before they open Users, Roles, or {PEOPLE_LABEL}.</li>
            </Section>

            <Section title="Annual Calendar">
              <li>See this year’s events, sermons, devotionals, and newsletters on one calendar — year, month, or week view.</li>
              <li>Coloured dots mark each type of item. Tap a day, then tap an item to open it for viewing.</li>
              <li>The calendar updates when you add or change events, devotionals, or newsletters. Sermons follow the church YouTube channel.</li>
            </Section>

            <Section title="Users & Roles">
              <li>The Users & Roles menu opens Users and Roles. Roles are named labels (Owner, Admin, Member, Group Leader, plus any you add) — there is no permissions matrix.</li>
              <li>On Users, search by name, username, email or mobile, filter by role, and export the current list. Row actions include notify, assign a role, edit, {PEOPLE_LABEL.toLowerCase()} linking, approval, and delete.</li>
              <li>On Roles, add a role name and type (Account, Member, or Group Leader) and see how many people have that role. System roles cannot be deleted.</li>
              <li>
                Use <span className="font-semibold text-charcoal">Delete</span> to remove someone from
                the system after confirmation. They receive an email confirming the deletion. You cannot delete your own
                account while logged in.
              </li>
              <li>Link a login to a {PEOPLE_LABEL} record so group memberships and rosters apply to that account. Use Check {PEOPLE_LABEL} Links to retry safe automatic matches.</li>
              <li>When a login is linked, Users shows Linked to plus the {PEOPLE_LABEL} name under the login name, in the same purple as {PEOPLE_LABEL}. Pending shows in red.</li>
              <li>Not every login needs a {PEOPLE_LABEL} row—only link when they should appear in ministry lists or see group rosters.</li>
            </Section>

            <Section title="Logs">
              <li>
                Security and compliance audit trail: sign-ins, sign-ups, admin changes, member activity, and RSVPs from
                when this feature was enabled.
              </li>
              <li>Filter by category, action, date, or search by email or summary. Export filtered results to CSV for records.</li>
              <li>Database changes (groups, events, {PEOPLE_LABEL}, etc.) are recorded automatically — you may occasionally see two entries for the same action (app + database).</li>
              <li>Contact form submissions are not stored in logs (email only). Logs cannot be edited or deleted in the portal.</li>
            </Section>

            {isSuperAdmin && (
              <Section title="Changelog">
                <li>
                  Super Admins only: a left-menu tab with the product history of everything that has been
                  changed on the website.
                </li>
                <li>
                  Each row shows when the change shipped (date and time) and who made it. Filter by type, area, year,
                  month, date range, or search by title, summary, or user.
                </li>
                <li>Export Excel or PDF from the page header — only the filtered rows you see are included in the download.</li>
                <li>This is not the live audit trail — use Logs for who did what. Changelog records shipped product changes.</li>
              </Section>
            )}

            <Section title="Prayers (admin)">
              <li>Moderate prayer requests: review what members post, hide or remove items if needed, and keep the wall respectful.</li>
              <li>See the same prayer activity members see, with tools appropriate to your admin role.</li>
            </Section>

            <Section title="Newsletters">
              <li>Upload or manage newsletter PDFs that members can read in their dashboard (viewed in-browser only).</li>
              <li>Each issue needs a title, week date, and PDF — same pattern as Devotional of the Week.</li>
              <li>The archive lists title and date, newest first. Edit title, week date, or replace the PDF after upload.</li>
            </Section>

            <Section title="Devotional of the Week">
              <li>Upload the weekly devotional PDF with a title, subtitle, and week date.</li>
              <li>Edit details or replace the PDF from the archive list after upload.</li>
              <li>Members open devotionals in the dashboard viewer — no download or new-tab links.</li>
            </Section>

            <Section title={PEOPLE_LABEL}>
              <li>Add and edit people shown on the public leadership pages and used for ministry structure.</li>
              <li>Assign groups (ministries) and job roles; photos and names feed leader lines on rosters and listings.</li>
              <li>Watch for duplicate emails and “linked account” vs “no account link” so logins and {PEOPLE_LABEL} rows stay aligned.</li>
              <li>If a person is linked, the list shows Linked to plus the website login name in purple. The 3-dots menu includes Unlink account. That option is not shown when there is no linked login.</li>
              <li>If you archive or delete a person who has a linked website login, you are told the login will be unlinked. You can also choose to archive or delete that login at the same time.</li>
              <li>Adding, archiving, or deleting a person sends them a confirmation email about that action.</li>
            </Section>

            <Section title={EVENTS_LABEL}>
              <li>Create and edit events: times, details, and categories from System Setup.</li>
              <li>Control what appears on public Events pages vs member-only views, depending on how your site is set up.</li>
            </Section>

            <Section title="Roster">
              <li>Publish rosters per ministry (group): PDF upload, date range, and which group the file belongs to.</li>
              <li>Edit existing rosters to change ministry, dates, or replace the file without re-creating the entry.</li>
              <li>Only members who are in that group (via their linked {PEOPLE_LABEL} record) can see that roster on their dashboard.</li>
            </Section>

            <Section title="System Setup">
              <li>
                <span className="font-semibold text-charcoal">Groups</span> — ministry/team names used when you assign
                people and when you attach a roster to a ministry.
              </li>
              <li>
                <span className="font-semibold text-charcoal">Job Roles</span> — titles and leader roles (e.g. “Worship
                Leader”) shown with people in {PEOPLE_LABEL} and on roster cards.
              </li>
              <li>
                <span className="font-semibold text-charcoal">Event Categories</span> — dropdown options when admins create
                or edit {EVENTS_LABEL} listings; keep this list in sync with how you want them organised.
              </li>
            </Section>

            <Section title="User Security">
              <li>Admins can also open User Security to enable authenticator or email two-factor authentication on their own account.</li>
              <li>2FA is required at sign-in once enabled. Recovery codes are shown only when generated.</li>
            </Section>
          </>
        ) : (
          <>
            <Section title="Overview">
              <li>Your home inside the member area: welcome content and pointers to the rest of the portal.</li>
              <li>The yellow bar at the top shows the church name, the person signed in, a search box for member pages, and Help.</li>
              <li>Open this when you first log in to see what is new or highlighted for members.</li>
              <li>The {PEOPLE_LABEL} card shows how many people are in the directory. Click it to open {PEOPLE_LABEL}.</li>
            </Section>

            <Section title="Annual Calendar">
              <li>See this year’s church calendar: events, sermons, devotionals, and newsletters together.</li>
              <li>Switch between year, month, and week. Tap a day to list what is on, then tap an item to open it.</li>
              <li>New items appear on the calendar after they are published (or when you return to this page).</li>
            </Section>

            <Section title="Prayers">
              <li>Submit prayer requests and read requests from others in the church family.</li>
              <li>Tap “I’m praying” to show support; counts update so requesters know people are standing with them.</li>
            </Section>

            <Section title="Newsletters">
              <li>Read church newsletters your leaders have published — PDFs open in the page viewer (no download).</li>
              <li>The latest issue is shown first; older issues appear in the archive with title and week date.</li>
            </Section>

            <Section title="Devotional of the Week">
              <li>Read the current weekly devotional and browse earlier weeks in the archive.</li>
              <li>On a phone, tap Enlarge to read the PDF full screen, then use + / − to zoom in on the text.</li>
              <li>PDFs open only inside this page so you can reflect without leaving the portal.</li>
            </Section>

            <Section title={PEOPLE_LABEL}>
              <li>Browse staff and key people: names, roles, and photos the church has chosen to show members.</li>
              <li>Use it to learn who leads which areas and how to recognise people on a Sunday.</li>
            </Section>

            <Section title={EVENTS_LABEL}>
              <li>See upcoming services, groups, and special dates that are shared with members.</li>
              <li>Check times and details so you can plan to attend or share with friends.</li>
            </Section>

            <Section title="Roster">
              <li>View ministry rosters (usually PDFs) for groups you belong to—schedules, serving teams, or similar.</li>
              <li>You only see rosters for your ministries. If nothing appears, your account may not be linked to {PEOPLE_LABEL} yet, or no roster has been uploaded for your group.</li>
              <li>Ask an admin if you expect a roster but do not see one after you are correctly placed in a ministry group.</li>
            </Section>

            <Section title="User Security">
              <li>Change your password and turn on two-factor authentication (2FA) for your approved member account.</li>
              <li>Authenticator app uses a standard TOTP code (Google Authenticator, Microsoft Authenticator, Authy, 1Password, and similar apps).</li>
              <li>Email verification sends a short-lived one-time code to your registered email. Recovery codes are shown once when you first enable 2FA.</li>
            </Section>
          </>
        )}
      </div>
    </div>
  );
};
