import assert from 'node:assert/strict';
import { test } from 'node:test';
import { linkedToCaption } from '../../lib/linkedToCaption.ts';

test('linked caption includes the other person name', () => {
  assert.equal(linkedToCaption('Jane Smith'), 'Linked to Jane Smith');
  assert.equal(linkedToCaption('  '), 'Linked');
});
