import { supabase } from './supabase';
import { VAPID_PUBLIC_KEY } from './vapidPublicKey';

const PROMPT_DISMISS_KEY = 'abc-notifications-prompt-v1';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
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
    return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
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

  return { ok: true };
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
