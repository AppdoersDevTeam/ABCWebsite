import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { leadershipSortRank, sortLeadershipTeam } from '../../lib/leadershipOrder.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

test('Senior Pastor ranks ahead of Elder and other staff', () => {
  assert.equal(leadershipSortRank({ staff_role: 'Senior Pastor' }), 0);
  assert.equal(leadershipSortRank({ role: 'Elder' }), 1);
  assert.equal(leadershipSortRank({ staff_role: 'Administrator' }), 2);
});

test('Meet the Team and member People Directory list Senior Pastor first, then Elders A-Z', () => {
  const ordered = sortLeadershipTeam([
    { name: 'Shane Cochrane', staff_role: 'Elder' },
    { name: 'Craig Hansen', role: 'Elder' },
    { name: 'Fabiano J A da Silva', staff_role: 'Senior Pastor', job_roles: [{ name: 'Senior Pastor' }, { name: 'Administrator' }] },
    { name: 'Paul Huang', staff_role: 'Elder' },
    { name: 'Michael Egleton', staff_role: 'Elder' },
  ]);

  assert.deepEqual(
    ordered.map((m) => m.name),
    ['Fabiano J A da Silva', 'Craig Hansen', 'Michael Egleton', 'Paul Huang', 'Shane Cochrane'],
  );

  const about = readFileSync(join(root, 'pages/public/About.tsx'), 'utf8');
  const memberDirectory = readFileSync(join(root, 'pages/dashboard/Team.tsx'), 'utf8');
  const adminPeople = readFileSync(join(root, 'pages/admin/AdminTeam.tsx'), 'utf8');
  assert.match(about, /sortLeadershipTeam/);
  assert.match(memberDirectory, /sortLeadershipTeam/);
  assert.doesNotMatch(adminPeople, /saving as base64/);
});
