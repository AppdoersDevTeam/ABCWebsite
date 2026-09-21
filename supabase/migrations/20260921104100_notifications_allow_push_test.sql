-- Allow Account Settings "Send test notification" type.
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'content.newsletter',
    'content.devotional',
    'content.event',
    'content.roster',
    'prayer.request_created',
    'prayer.count_added',
    'event.rsvp_submitted',
    'user.signup',
    'user.approved',
    'user.denied',
    'user.access_held',
    'user.access_restored',
    'user.admin_granted',
    'user.admin_revoked',
    'system.push_test'
  ));
