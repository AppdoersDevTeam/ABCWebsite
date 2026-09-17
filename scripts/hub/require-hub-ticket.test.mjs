import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  decideHubTicketHook,
  resolveTicketId,
  shouldRequireHubTicket,
} from '../../.cursor/hooks/require-hub-ticket-lib.mjs';

test('write tools require a Hub ticket', () => {
  assert.equal(shouldRequireHubTicket({ tool_name: 'Write' }), true);
  assert.equal(shouldRequireHubTicket({ tool_name: 'StrReplace' }), true);
  assert.equal(shouldRequireHubTicket({ tool_name: 'Delete' }), true);
  assert.equal(shouldRequireHubTicket({ tool_name: 'Read' }), false);
  assert.equal(shouldRequireHubTicket({ tool_name: 'Shell' }), false);
});

test('resolves active ticket over current ticket', () => {
  assert.equal(resolveTicketId({}), null);
  assert.equal(resolveTicketId({ current_ticket_id: 'abc' }), 'abc');
  assert.equal(resolveTicketId({ active_ticket_id: 'active', current_ticket_id: 'old' }), 'active');
});

test('denies writes when no ticket is recorded', () => {
  const decision = decideHubTicketHook({ tool_name: 'Write' }, {});
  assert.equal(decision.permission, 'deny');
  assert.match(decision.agent_message, /create-ticket/);
});

test('allows writes when a ticket is recorded', () => {
  const decision = decideHubTicketHook(
    { tool_name: 'StrReplace' },
    { current_ticket_id: '58e4b526-65af-4663-a1c9-0e2b91975ddf' }
  );
  assert.equal(decision.permission, 'allow');
});

test('allows non-write tools without a ticket', () => {
  const decision = decideHubTicketHook({ tool_name: 'Read' }, {});
  assert.equal(decision.permission, 'allow');
});
