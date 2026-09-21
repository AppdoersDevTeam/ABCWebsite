import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  contentEventRecipientRole,
  DEFAULT_NOTIFICATION_PREFERENCES,
  isNotificationType,
  preferenceAllowsType,
  preferenceColumnForType,
} from '../../lib/notificationTypes.ts';

test('event audience maps members and all to members, staff to admins, attendees to none', () => {
  assert.equal(contentEventRecipientRole('members'), 'member');
  assert.equal(contentEventRecipientRole('all'), 'member');
  assert.equal(contentEventRecipientRole(null), 'member');
  assert.equal(contentEventRecipientRole('staff'), 'admin');
  assert.equal(contentEventRecipientRole('attendees'), 'none');
});

test('notification types map onto preference columns', () => {
  assert.equal(preferenceColumnForType('content.newsletter'), 'content_newsletter');
  assert.equal(preferenceColumnForType('prayer.count_added'), 'prayer');
  assert.equal(preferenceColumnForType('event.rsvp_submitted'), 'admin_rsvp');
  assert.equal(preferenceColumnForType('user.signup'), 'admin_signup');
  assert.equal(preferenceColumnForType('user.approved'), 'user_lifecycle');
  assert.equal(preferenceColumnForType('not-a-type'), null);
});

test('missing preference row allows the type; explicit false blocks it', () => {
  assert.equal(preferenceAllowsType(null, 'content.newsletter'), true);
  assert.equal(preferenceAllowsType(DEFAULT_NOTIFICATION_PREFERENCES, 'content.roster'), true);
  assert.equal(
    preferenceAllowsType({ ...DEFAULT_NOTIFICATION_PREFERENCES, prayer: false }, 'prayer.request_created'),
    false
  );
});

test('known notification type guard', () => {
  assert.equal(isNotificationType('content.event'), true);
  assert.equal(isNotificationType('content.unknown'), false);
});
