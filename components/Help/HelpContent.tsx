import React from 'react';

type Mode = 'member' | 'admin';

interface HelpContentProps {
  mode: Mode;
}

export const HelpContent: React.FC<HelpContentProps> = ({ mode }) => {
  const isAdmin = mode === 'admin';

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-serif font-normal text-charcoal">Help</h1>
        <p className="text-neutral mt-1">
          {isAdmin
            ? 'A quick guide to the admin dashboard sections and common workflows.'
            : 'A quick guide to the member dashboard sections and what you can do.'}
        </p>
      </div>

      <div className="grid gap-6">
        <section className="bg-white border border-gray-200 rounded-[12px] p-6">
          <h2 className="text-xl font-bold text-charcoal">Roster</h2>
          <ul className="mt-3 text-sm text-neutral space-y-2">
            <li>
              You will only see rosters for ministries (groups) you belong to in the Directory.
            </li>
            <li>
              If you see “No rosters at this time”, it usually means you are not linked to a directory person, you are not
              in any roster-enabled group, or no roster has been uploaded for your groups yet.
            </li>
            {isAdmin && (
              <li>
                Admins upload rosters per ministry in <span className="font-bold">Admin → Roster</span>.
              </li>
            )}
          </ul>
        </section>

        <section className="bg-white border border-gray-200 rounded-[12px] p-6">
          <h2 className="text-xl font-bold text-charcoal">Directory / People</h2>
          <ul className="mt-3 text-sm text-neutral space-y-2">
            <li>
              Directory groups determine roster visibility. If a user should see a ministry roster, ensure their directory
              person is in the correct group.
            </li>
            {isAdmin && (
              <>
                <li>
                  “User Management” controls approvals and admin access. “Directory / People” controls groups, job roles,
                  and leader photos/names.
                </li>
                <li>
                  If a user is linked but still can’t see rosters, confirm their directory person has the right group AND
                  a roster exists for that group.
                </li>
              </>
            )}
          </ul>
        </section>

        {isAdmin && (
          <section className="bg-white border border-gray-200 rounded-[12px] p-6">
            <h2 className="text-xl font-bold text-charcoal">Directory Setup</h2>
            <ul className="mt-3 text-sm text-neutral space-y-2">
              <li>
                <span className="font-bold">Groups</span>: ministries/teams (used for rosters + directory filtering).
              </li>
              <li>
                <span className="font-bold">Job Roles</span>: titles and leader roles (e.g. “Women Leader”).
              </li>
              <li>
                <span className="font-bold">Event Categories</span>: options shown in the Events create/edit form.
              </li>
            </ul>
          </section>
        )}

        <section className="bg-white border border-gray-200 rounded-[12px] p-6">
          <h2 className="text-xl font-bold text-charcoal">Prayer Wall</h2>
          <p className="mt-3 text-sm text-neutral">
            Share prayer requests and click “I’m praying” to support others. Your “I’m praying” click updates the count.
          </p>
        </section>
      </div>
    </div>
  );
};

