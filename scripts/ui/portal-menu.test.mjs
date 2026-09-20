import assert from 'node:assert/strict';
import { test } from 'node:test';
import { portalMenuPosition } from '../../lib/portalMenuPosition.ts';

test('row action menu opens below the trigger, right-aligned', () => {
  const pos = portalMenuPosition(
    { top: 400, right: 900, bottom: 432, left: 868 },
    { width: 208, height: 160 },
    { width: 1200, height: 800 },
  );
  assert.equal(pos.left, 692);
  assert.equal(pos.top, 436);
});

test('row action menu flips above when it would sit under the card footer', () => {
  const pos = portalMenuPosition(
    { top: 700, right: 900, bottom: 732, left: 868 },
    { width: 208, height: 160 },
    { width: 1200, height: 800 },
  );
  assert.equal(pos.top, 536);
  assert.equal(pos.left, 692);
});
