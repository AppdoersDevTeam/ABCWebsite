import React from 'react';

type Mode = 'member' | 'admin';

interface HelpContentProps {
  mode: Mode;
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

export const HelpContent: React.FC<HelpContentProps> = ({ mode }) => {
  const isAdmin = mode === 'admin';

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-serif font-normal text-charcoal">Help</h1>
        <p className="text-neutral mt-2 max-w-3xl">
          {isAdmin ? (
            <>
              This page explains each area of the <span className="font-semibold text-charcoal">Admin Portal</span>: what
              it is for, what you can configure, and typical tasks. Use the same names as the left-hand menu.
            </>
          ) : (
            <>
              This page explains what each part of the <span className="font-semibold text-charcoal">Member Portal</span>{' '}
              gives you: what you can view, join in with, or download. It matches the sections in your sidebar.
            </>
          )}
        </p>
      </div>

      <div className="grid gap-6">
        {isAdmin ? (
          <>
            <Section title="Overview">
              <li>Your landing page after signing in as an admin: quick snapshot and shortcuts into the main tools.</li>
              <li>Use it to orient new admins before they open User Management or Directory.</li>
            </Section>

            <Section title="User Management">
              <li>See everyone who has a website login: email, role (member/admin), and approval status.</li>
              <li>Approve new accounts, reset passwords, and promote or demote roles where your policy allows.</li>
              <li>
                Link a login to a Directory person so group memberships and rosters apply to that account. Use “Check
                Directory Links” to retry safe automatic matches; use “Link Directory” when you need to pick the right
                person manually.
              </li>
              <li>Not every login needs a Directory row—only link when they should appear in ministry lists or see group rosters.</li>
            </Section>

            <Section title="Prayer Wall (admin)">
              <li>Moderate prayer requests: review what members post, hide or remove items if needed, and keep the wall respectful.</li>
              <li>See the same prayer activity members see, with tools appropriate to your admin role.</li>
            </Section>

            <Section title="Newsletters">
              <li>Upload or manage newsletter files (PDFs or links) that members can open from their dashboard.</li>
              <li>Keep titles and dates clear so members know which issue is current.</li>
            </Section>

            <Section title="Directory / People">
              <li>Add and edit people shown on the public team/directory and used for ministry structure.</li>
              <li>Assign groups (ministries) and job roles; photos and names feed leader lines on rosters and listings.</li>
              <li>Watch for duplicate emails and “linked account” vs “no account link” so logins and directory rows stay aligned.</li>
            </Section>

            <Section title="Events">
              <li>Create and edit church events: times, details, and categories from Directory Setup.</li>
              <li>Control what appears on public event pages vs member-only views, depending on how your site is set up.</li>
            </Section>

            <Section title="Roster">
              <li>Publish rosters per ministry (group): PDF upload, date range, and which group the file belongs to.</li>
              <li>Edit existing rosters to change ministry, dates, or replace the file without re-creating the entry.</li>
              <li>Only members who are in that group (via their linked Directory person) can see that roster on their dashboard.</li>
            </Section>

            <Section title="Directory Setup">
              <li>
                <span className="font-semibold text-charcoal">Groups</span> — ministry/team names used when you assign
                people and when you attach a roster to a ministry.
              </li>
              <li>
                <span className="font-semibold text-charcoal">Job Roles</span> — titles and leader roles (e.g. “Worship
                Leader”) shown with people in the directory and on roster cards.
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

            <Section title="Prayer Wall">
              <li>Submit prayer requests and read requests from others in the church family.</li>
              <li>Tap “I’m praying” to show support; counts update so requesters know people are standing with them.</li>
            </Section>

            <Section title="Newsletters">
              <li>Access church newsletters your leaders have published—read or download in one place.</li>
              <li>Use this when you want the latest letter without hunting through email.</li>
            </Section>

            <Section title="The Team">
              <li>Browse staff and key people: names, roles, and photos the church has chosen to show members.</li>
              <li>Use it to learn who leads which areas and how to recognise people on a Sunday.</li>
            </Section>

            <Section title="Events">
              <li>See upcoming services, groups, and special dates that are shared with members.</li>
              <li>Check times and details so you can plan to attend or share with friends.</li>
            </Section>

            <Section title="Roster">
              <li>View ministry rosters (usually PDFs) for groups you belong to—schedules, serving teams, or similar.</li>
              <li>You only see rosters for your ministries. If nothing appears, your account may not be linked to the Directory yet, or no roster has been uploaded for your group.</li>
              <li>Ask an admin if you expect a roster but do not see one after you are correctly placed in a ministry group.</li>
            </Section>
          </>
        )}
      </div>
    </div>
  );
};
