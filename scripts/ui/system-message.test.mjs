import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  cannotLoad,
  inferDialogTitle,
  withSystemDetail,
} from '../../lib/systemMessage.ts';

test('dialog titles follow the message role', () => {
  assert.equal(inferDialogTitle('confirm', 'Remove this photo?'), 'Please confirm');
  assert.equal(inferDialogTitle('alert', 'We could not save this event.'), 'Something went wrong');
  assert.equal(inferDialogTitle('alert', 'Please choose a PDF before continuing.'), 'A few details are needed');
  assert.equal(inferDialogTitle('alert', 'Jane Smith has been approved.'), 'Done');
  assert.equal(inferDialogTitle('alert', 'Welcome.'), 'Notice');
  assert.equal(inferDialogTitle('alert', 'Welcome.', 'Custom title'), 'Custom title');
});

test('system copy stays professional and can include a detail', () => {
  assert.equal(
    cannotLoad('People'),
    'We could not load People just now. Please refresh the page and try again.',
  );
  assert.equal(
    withSystemDetail('We could not delete this photo.', 'Storage timed out'),
    'We could not delete this photo.\n\nStorage timed out',
  );
});
