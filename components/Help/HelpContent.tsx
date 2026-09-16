import React from 'react';
import { HelpCircle } from 'lucide-react';
import { AdminPageHeader } from '../UI/AdminPageHeader';

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
              <li>Use it to orient new admins before they open User Management or Leadership.</li>
            </Section>

            <Section title="Annual Calendar">
              <li>See this year’s events, sermons, devotionals, and newsletters on one calendar — year, month, or week view.</li>
              <li>Coloured dots mark each type of item. Tap a day, then tap an item to open it for viewing.</li>
              <li>The calendar updates when you add or change events, devotionals, or newsletters. Sermons follow the church YouTube channel.</li>
            </Section>

            <Section title="User Management">
              <li>Every approved admin can use this page — including User Management, Leadership, Events, and the rest of the admin menu.</li>
              <li>See everyone who has a website login: email, role (member/admin), and approval status.</li>
              <li>Approve new accounts as a member or as an admin, reset passwords, and promote or demote admin access.</li>
              <li>
                Use <span className="font-semibold text-charcoal">Actions → Delete user</span> to remove someone from
                the system after confirmation. They receive an email confirming the deletion. You cannot delete your own
                account while logged in.
              </li>
              <li>
                Click the summary cards (All Users, Pending, Hold Access, Approved, Linked Account) or use Search and
                Sort by to filter the list. Linked logins show the matching Leadership person on the same row, with Unlink.
              </li>
              <li>
                Link a login to a Leadership person so group memberships and rosters apply to that account. Use “Check
                Leadership Links” to retry safe automatic matches; use “Link Leadership” when you need to pick the right
                person manually.
              </li>
              <li>Not every login needs a Leadership row—only link when they should appear in ministry lists or see group rosters.</li>
            </Section>

            <Section title="Logs">
              <li>
                Security and compliance audit trail: sign-ins, sign-ups, admin changes, member activity, and RSVPs from
                when this feature was enabled.
              </li>
              <li>Filter by category, action, date, or search by email or summary. Export filtered results to CSV for records.</li>
              <li>Database changes (groups, events, Leadership, etc.) are recorded automatically — you may occasionally see two entries for the same action (app + database).</li>
              <li>Contact form submissions are not stored in logs (email only). Logs cannot be edited or deleted in the portal.</li>
            </Section>

            {isSuperAdmin && (
              <Section title="Changelog">
                <li>
                  Super Admins only: a left-menu tab (next to Logs) with the product history of everything that has been
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

            <Section title="Leadership">
              <li>Add and edit people shown on the public leadership pages and used for ministry structure.</li>
              <li>Assign groups (ministries) and job roles; photos and names feed leader lines on rosters and listings.</li>
              <li>Watch for duplicate emails and “linked account” vs “no account link” so logins and Leadership rows stay aligned.</li>
            </Section>

            <Section title="Events">
              <li>Create and edit church events: times, details, and categories from System Setup.</li>
              <li>Control what appears on public event pages vs member-only views, depending on how your site is set up.</li>
            </Section>

            <Section title="Roster">
              <li>Publish rosters per ministry (group): PDF upload, date range, and which group the file belongs to.</li>
              <li>Edit existing rosters to change ministry, dates, or replace the file without re-creating the entry.</li>
              <li>Only members who are in that group (via their linked Leadership person) can see that roster on their dashboard.</li>
            </Section>

            <Section title="System Setup">
              <li>
                <span className="font-semibold text-charcoal">Groups</span> — ministry/team names used when you assign
                people and when you attach a roster to a ministry.
              </li>
              <li>
                <span className="font-semibold text-charcoal">Job Roles</span> — titles and leader roles (e.g. “Worship
                Leader”) shown with people in Leadership and on roster cards.
              </li>
              <li>
                <span className="font-semibold text-charcoal">Event Categories</span> — dropdown options when admins create
                or edit events; keep this list in sync with how you want events organised.
              </li>
            </Section>
          </>
        ) : (
          <>
            <Section title="Overview">
              <li>Your home inside the member area: welcome content and pointers to the rest of the portal.</li>
              <li>Open this when you first log in to see what is new or highlighted for members.</li>
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

            <Section title="Leadership">
              <li>Browse staff and key people: names, roles, and photos the church has chosen to show members.</li>
              <li>Use it to learn who leads which areas and how to recognise people on a Sunday.</li>
            </Section>

            <Section title="Events">
              <li>See upcoming services, groups, and special dates that are shared with members.</li>
              <li>Check times and details so you can plan to attend or share with friends.</li>
            </Section>

            <Section title="Roster">
              <li>View ministry rosters (usually PDFs) for groups you belong to—schedules, serving teams, or similar.</li>
              <li>You only see rosters for your ministries. If nothing appears, your account may not be linked to Leadership yet, or no roster has been uploaded for your group.</li>
              <li>Ask an admin if you expect a roster but do not see one after you are correctly placed in a ministry group.</li>
            </Section>
          </>
        )}
      </div>
    </div>
  );
};
