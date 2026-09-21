export const NOTIFICATION_TYPES = [
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
  'system.push_test',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationPreferenceColumn =
  | 'content_newsletter'
  | 'content_devotional'
  | 'content_event'
  | 'content_roster'
  | 'prayer'
  | 'admin_rsvp'
  | 'admin_signup'
  | 'user_lifecycle';

export type AppNotification = {
  id: string;
  user_id: string;
  type: NotificationType | string;
  title: string;
  body: string;
  href: string;
  entity_id?: string | null;
  read_at?: string | null;
  created_at: string;
};

export type NotificationPreferences = {
  user_id: string;
  push_enabled: boolean;
  content_newsletter: boolean;
  content_devotional: boolean;
  content_event: boolean;
  content_roster: boolean;
  prayer: boolean;
  admin_rsvp: boolean;
  admin_signup: boolean;
  user_lifecycle: boolean;
  updated_at?: string;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<
  NotificationPreferences,
  'user_id' | 'updated_at'
> = {
  push_enabled: false,
  content_newsletter: true,
  content_devotional: true,
  content_event: true,
  content_roster: true,
  prayer: true,
  admin_rsvp: true,
  admin_signup: true,
  user_lifecycle: true,
};

const PREFERENCE_BY_TYPE: Record<NotificationType, NotificationPreferenceColumn> = {
  'content.newsletter': 'content_newsletter',
  'content.devotional': 'content_devotional',
  'content.event': 'content_event',
  'content.roster': 'content_roster',
  'prayer.request_created': 'prayer',
  'prayer.count_added': 'prayer',
  'event.rsvp_submitted': 'admin_rsvp',
  'user.signup': 'admin_signup',
  'user.approved': 'user_lifecycle',
  'user.denied': 'user_lifecycle',
  'user.access_held': 'user_lifecycle',
  'user.access_restored': 'user_lifecycle',
  'user.admin_granted': 'user_lifecycle',
  'user.admin_revoked': 'user_lifecycle',
  'system.push_test': 'user_lifecycle',
};

export function isNotificationType(value: string): value is NotificationType {
  return (NOTIFICATION_TYPES as readonly string[]).includes(value);
}

export function preferenceColumnForType(type: string): NotificationPreferenceColumn | null {
  if (!isNotificationType(type)) return null;
  return PREFERENCE_BY_TYPE[type];
}

/** Who should receive a published What's On item. */
export function contentEventRecipientRole(
  audience?: string | null
): 'member' | 'admin' | 'none' {
  const value = (audience || 'members').toLowerCase();
  if (value === 'attendees') return 'none';
  if (value === 'staff') return 'admin';
  return 'member';
}

export function preferenceAllowsType(
  prefs: Pick<NotificationPreferences, NotificationPreferenceColumn> | null | undefined,
  type: string
): boolean {
  const column = preferenceColumnForType(type);
  if (!column) return false;
  if (!prefs) return true;
  return prefs[column] !== false;
}
