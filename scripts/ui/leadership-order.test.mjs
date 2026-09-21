import assert from 'node:assert/strict';
import { test } from 'node:test';
import { leadershipSortRank, sortLeadershipTeam } from '../../lib/leadershipOrder.ts';

test('Senior Pastor ranks ahead of Elder and other staff', () => {
  assert.equal(leadershipSortRank({ staff_role: 'Senior Pastor' }), 0);
  assert.equal(leadershipSortRank({ role: 'Elder' }), 1);
  assert.equal(leadershipSortRank({ staff_role: 'Administrator' }), 2);
});

test('Meet the Team lists Senior Pastor first, then Elders A-Z', () => {
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
});
