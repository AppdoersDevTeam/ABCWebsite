import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatOverviewUserBreakdown } from '../../lib/overviewUserCounts.ts';

test('overview Users card shows approved, pending, and not linked totals', () => {
  assert.equal(
    formatOverviewUserBreakdown({ approved: 12, pending: 3, notLinked: 5 }),
    'Approved 12 · Pending 3 · Not linked 5',
  );
});
