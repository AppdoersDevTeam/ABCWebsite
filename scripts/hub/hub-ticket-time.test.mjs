import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import {
  MIN_LOG_HOURS,
  billableHours,
  createTicketTimeStore,
  logTicketHours,
  msToHours,
} from '../../tools/hub-ticket-time.mjs';

test('MIN_LOG_HOURS is 0.1', () => {
  assert.equal(MIN_LOG_HOURS, 0.1);
});

test('billableHours rounds any positive time below 0.1 up to 0.1', () => {
  assert.equal(billableHours(1_000), 0.1); // 1s
  assert.equal(billableHours(3 * 60 * 1000), 0.1); // 3 min
  assert.equal(billableHours(6 * 60 * 1000), 0.1); // exactly 0.1h
  assert.equal(billableHours(12 * 60 * 1000), 0.2); // 0.2h
});

test('billableHours logs 0.1 when never logged even if unlogged ms is 0', () => {
  assert.equal(billableHours(0, { neverLoggedToHub: true }), 0.1);
  assert.equal(billableHours(0, { neverLoggedToHub: false }), 0);
});

test('prepareFlush rounds up and marks has_logged_to_hub', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hub-time-'));
  const store = createTicketTimeStore(dir);
  store.startTicket('t1');

  const statePath = path.join(dir, '.hub-ticket-time.json');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  state.sessions.t1.active_ms = 30_000; // 30s
  state.sessions.t1.last_tick_at = new Date().toISOString();
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);

  const prepared = store.prepareFlush('t1');
  assert.equal(prepared.hours, 0.1);
  assert.equal(prepared.rounded_up_to_minimum, true);
  assert.ok(prepared.raw_hours < 0.1);

  const again = store.prepareFlush('t1');
  assert.equal(again.hours, 0, 'second flush with no new time must not re-bill');
});

test('logTicketHours never skips for below-minimum; posts at least 0.1', async () => {
  const posts = [];
  const hubFetch = async (url, opts) => {
    posts.push({ url, body: JSON.parse(opts.body) });
    return { ok: true };
  };

  await logTicketHours(hubFetch, 'ticket-1', 0.05, 'test');
  assert.equal(posts.length, 1);
  assert.equal(posts[0].body.hours, 0.1);

  const skipped = await logTicketHours(hubFetch, 'ticket-1', 0, 'test');
  assert.equal(skipped.skipped, true);
  assert.equal(posts.length, 1);
});

test('msToHours uses two decimal places', () => {
  assert.equal(msToHours(3_600_000), 1);
  assert.equal(msToHours(180_000), 0.05);
});
