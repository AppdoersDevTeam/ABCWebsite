import { supabase } from './supabase';
import type { NotificationType } from './notificationTypes';

export type DispatchNotificationInput = {
  type: NotificationType;
  title: string;
  body?: string;
  href?: string;
  entityId?: string | null;
  targetUserId?: string | null;
  audience?: string | null;
  eventTitle?: string | null;
  rsvpName?: string | null;
  rsvpEmail?: string | null;
};

async function invokeDispatch(input: DispatchNotificationInput): Promise<void> {
  const { error, data } = await supabase.functions.invoke('dispatch-notification', {
    body: {
      type: input.type,
      title: input.title,
      body: input.body || '',
      href: input.href,
      entityId: input.entityId || undefined,
      targetUserId: input.targetUserId || undefined,
      audience: input.audience || undefined,
      eventTitle: input.eventTitle || undefined,
      rsvpName: input.rsvpName || undefined,
      rsvpEmail: input.rsvpEmail || undefined,
    },
  });

  if (error) {
    console.error('dispatch-notification invoke error', error, data);
    return;
  }
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    console.error('dispatch-notification function error', data);
  }
}

/** Fire-and-forget inbox + Web Push dispatch. Never throws into the calling UI. */
export function dispatchAppNotification(input: DispatchNotificationInput): void {
  void invokeDispatch(input).catch((err) => {
    console.error('dispatchAppNotification unexpected error', err);
  });
}
