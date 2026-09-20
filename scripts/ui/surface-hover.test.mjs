import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SURFACE_HOVER_CLASS } from '../../lib/uiHover.ts';

test('system hover fill matches the left menu', () => {
  assert.equal(SURFACE_HOVER_CLASS, 'hover:bg-gray-200');
});
