import { supabase } from './supabase';
import { VAPID_PUBLIC_KEY } from './vapidPublicKey';

const PROMPT_DISMISS_KEY = 'abc-notifications-prompt-v1';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  // PushManager requires a clean ArrayBuffer (not a Uint8Array view of a larger buffer).
  return output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength);
}

/** Show an OS toast from the open page (works when the tab is open; Web Push covers closed tabs). */
export function showLocalNotification(input: {
  title: string;
  body?: string;
  href?: string;
  tag?: string;
}): void {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    const notification = new Notification(input.title, {
      body: input.body || '',
      icon: '/abc-logo.png',
      badge: '/abc-logo.png',
      tag: input.tag || 'abc-local',
      data: { href: input.href || '/dashboard' },
    });
    notification.onclick = () => {
      window.focus();
      const href = input.href || '/dashboard';
      if (href.startsWith('/')) {
        window.location.hash = `#${href}`;
      }
      notification.close();
    };
  } catch (err) {
    console.error('Local notification failed', err);
  }
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const standaloneMq = window.matchMedia?.('(display-mode: standalone)')?.matches;
  const iosStandalone = 'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return Boolean(standaloneMq || iosStandalone);
}

export function iosNeedsHomeScreenInstall(): boolean {
  return isIosDevice() && !isStandaloneDisplay();
}

export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.error('Service worker registration failed', err);
    return null;
  }
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready.catch(() => null);
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

export async function subscribeCurrentDevice(): Promise<{ ok: boolean; error?: string }> {
  if (!isPushSupported()) {
    return { ok: false, error: 'This browser does not support push notifications.' };
  }
  if (iosNeedsHomeScreenInstall()) {
    return {
      ok: false,
      error: 'On iPhone and iPad, add this site to your Home Screen first, then enable notifications.',
    };
  }

  const registration = await registerPushServiceWorker();
  if (!registration) {
    return { ok: false, error: 'Could not register the notification service.' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { ok: false, error: 'Notifications are blocked. Enable them in your browser settings.' };
  }

  if (!VAPID_PUBLIC_KEY) {
    return { ok: false, error: 'Push is not configured for this site (missing VAPID public key).' };
  }

  await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    try {
      await existing.unsubscribe();
    } catch {
      // continue and create a fresh subscription
    }
  }

  const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  const json = subscription.toJSON();
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return { ok: false, error: 'The browser did not return a complete push subscription.' };
  }

  const { data: sessionData } = await supabase.auth.getUser();
  const userId = sessionData.user?.id;
  if (!userId) {
    return { ok: false, error: 'You need to be signed in to save this device.' };
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint,
      p256dh,
      auth,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    },
    { onConflict: 'endpoint' }
  );

  if (error) {
    console.error('Failed to store push subscription', error);
    return { ok: false, error: error.message || 'Could not save this device.' };
  }

  // Drop stale endpoints for this user so dispatch does not fan out to dead devices.
  await supabase.from('push_subscriptions').delete().eq('user_id', userId).neq('endpoint', endpoint);

  const { error: prefError } = await supabase.from('notification_preferences').upsert(
    {
      user_id: userId,
      push_enabled: true,
    },
    { onConflict: 'user_id' }
  );
  if (prefError) {
    console.error('Failed to enable push preference', prefError);
  }

  showLocalNotification({
    title: 'Ashburton Baptist Church',
    body: 'Desktop notifications are enabled on this device.',
    href: '/dashboard',
    tag: 'abc-push-enabled',
  });

  return { ok: true };
}

/** Ask the server to send a Web Push + inbox row only to the signed-in user. */
export async function sendTestPushNotification(): Promise<{ ok: boolean; error?: string; pushed?: number }> {
  const { data, error } = await supabase.functions.invoke('dispatch-notification', {
    body: {
      type: 'system.push_test',
      title: 'Test notification',
      body: 'If you see this as a desktop or mobile alert, push is working on this device.',
      href: '/dashboard',
    },
  });
  if (error) {
    const context = (error as { context?: Response }).context;
    let detail = error.message || 'Could not send a test notification.';
    if (context) {
      try {
        const body = await context.json();
        if (body && typeof body === 'object' && 'error' in body && body.error) {
          detail = String(body.error);
        }
      } catch {
        // keep default
      }
    }
    return { ok: false, error: detail };
  }
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    return { ok: false, error: String(data.error) };
  }
  const pushed = data && typeof data === 'object' && 'pushed' in data ? Number(data.pushed) : undefined;
  return { ok: true, pushed };
}

export async function unsubscribeCurrentDevice(): Promise<void> {
  const subscription = await getExistingPushSubscription();
  if (!subscription) {
    const { data: sessionData } = await supabase.auth.getUser();
    const userId = sessionData.user?.id;
    if (userId) {
      await supabase.from('notification_preferences').upsert(
        { user_id: userId, push_enabled: false },
        { onConflict: 'user_id' }
      );
    }
    return;
  }

  const endpoint = subscription.endpoint;
  try {
    await subscription.unsubscribe();
  } catch (err) {
    console.error('Push unsubscribe failed', err);
  }

  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);

  const { data: sessionData } = await supabase.auth.getUser();
  const userId = sessionData.user?.id;
  if (userId) {
    const { count } = await supabase
      .from('push_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (!count) {
      await supabase.from('notification_preferences').upsert(
        { user_id: userId, push_enabled: false },
        { onConflict: 'user_id' }
      );
    }
  }
}

export function wasPushPromptDismissed(): boolean {
  try {
    return localStorage.getItem(PROMPT_DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissPushPrompt(): void {
  try {
    localStorage.setItem(PROMPT_DISMISS_KEY, '1');
  } catch {
    // ignore
  }
}
