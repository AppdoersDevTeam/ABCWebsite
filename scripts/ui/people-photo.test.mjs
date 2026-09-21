import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  PEOPLE_PHOTO,
  isPeoplePhotoTypeAllowed,
  isPeoplePhotoWithinLimit,
} from '../../lib/peoplePhotoSpec.ts';

test('people photo max is 1024KB', () => {
  assert.equal(PEOPLE_PHOTO.maxFileBytes, 1024 * 1024);
  assert.equal(PEOPLE_PHOTO.sizeLabel, '1024KB');
  assert.match(PEOPLE_PHOTO.uploadHint, /1024KB/);
  assert.match(PEOPLE_PHOTO.tooLargeMessage, /1024KB/);
});

test('people photo size check allows 1024KB and rejects larger', () => {
  assert.equal(isPeoplePhotoWithinLimit(1024 * 1024), true);
  assert.equal(isPeoplePhotoWithinLimit(1024 * 1024 + 1), false);
  assert.equal(isPeoplePhotoWithinLimit(300 * 1024), true);
});

test('people photo types stay PNG, JPEG, and PDF', () => {
  assert.equal(isPeoplePhotoTypeAllowed('image/png'), true);
  assert.equal(isPeoplePhotoTypeAllowed('image/jpeg'), true);
  assert.equal(isPeoplePhotoTypeAllowed('application/pdf'), true);
  assert.equal(isPeoplePhotoTypeAllowed('image/gif'), false);
});
