import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  EMAIL_DAY_LIMIT,
  EMAIL_MONTH_LIMIT,
  emailQuotaBlockedMessage,
  emailQuotaNearLimit,
  emptyEmailQuotaStatus,
  formatEmailQuotaUsed,
} from '../../lib/emailQuota.ts';

test('blocked messages name the daily and monthly caps', () => {
  assert.match(
    emailQuotaBlockedMessage({ hit: 'day', day_limit: EMAIL_DAY_LIMIT, month_limit: EMAIL_MONTH_LIMIT }),
    /daily email limit of 50/
  );
  assert.match(
    emailQuotaBlockedMessage({ hit: 'month', day_limit: EMAIL_DAY_LIMIT, month_limit: EMAIL_MONTH_LIMIT }),
    /monthly email limit of 1,000/
  );
  assert.match(
    emailQuotaBlockedMessage({ hit: 'both', day_limit: EMAIL_DAY_LIMIT, month_limit: EMAIL_MONTH_LIMIT }),
    /50 per day/
  );
});

test('near-limit and used labels', () => {
  const empty = emptyEmailQuotaStatus();
  assert.equal(emailQuotaNearLimit(empty), false);
  assert.equal(emailQuotaNearLimit({ ...empty, day_remaining: 10 }), true);
  assert.equal(emailQuotaNearLimit({ ...empty, blocked: true, day_remaining: 0 }), true);
  assert.equal(formatEmailQuotaUsed(12, 50), '12 / 50');
  assert.equal(formatEmailQuotaUsed(340, 1000), '340 / 1,000');
});
