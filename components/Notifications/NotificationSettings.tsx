import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { isAdminUser } from '../../lib/constants';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from '../../lib/notificationTypes';
import {
  iosNeedsHomeScreenInstall,
  isPushSupported,
  subscribeCurrentDevice,
  unsubscribeCurrentDevice,
} from '../../lib/pushNotifications';
import { GlowingButton } from '../UI/GlowingButton';

type ToggleKey = keyof Omit<NotificationPreferences, 'user_id' | 'push_enabled' | 'updated_at'>;

const MEMBER_TOGGLES: Array<{ key: ToggleKey; label: string; hint: string }> = [
  { key: 'content_newsletter', label: 'Newsletters', hint: 'When a newsletter is published' },
  { key: 'content_devotional', label: 'Devotionals', hint: 'When a weekly devotional is published' },
  { key: 'content_event', label: "What's On", hint: 'When a new listing is published for members' },
  { key: 'content_roster', label: 'Rosters', hint: 'When a ministry roster is published' },
  { key: 'prayer', label: 'Prayer', hint: 'When someone prays for your request' },
  { key: 'user_lifecycle', label: 'Account updates', hint: 'Approval, access hold, and role changes' },
];

const ADMIN_TOGGLES: Array<{ key: ToggleKey; label: string; hint: string }> = [
  { key: 'prayer', label: 'New prayer requests', hint: 'Including confidential requests' },
  { key: 'admin_rsvp', label: 'Event RSVPs', hint: "When someone RSVPs to What's On" },
  { key: 'admin_signup', label: 'New signups', hint: 'When a member account is waiting for approval' },
  { key: 'user_lifecycle', label: 'Your account updates', hint: 'Role and access changes for you' },
];

export const NotificationSettings = () => {
  const { user } = useAuth();
  const admin = isAdminUser(user);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const permission =
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;

  const toggles = admin ? ADMIN_TOGGLES : MEMBER_TOGGLES;

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      const { data, error: loadError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (loadError) {
        console.error('Failed to load notification preferences', loadError);
        setError('Could not load notification settings.');
        setLoading(false);
        return;
      }
      if (data) {
        setPrefs(data as NotificationPreferences);
      } else {
        setPrefs({ user_id: user.id, ...DEFAULT_NOTIFICATION_PREFERENCES });
      }
      setLoading(false);
    };
    void load();
  }, [user?.id]);

  const save = async (next: NotificationPreferences) => {
    if (!user?.id) return;
    setBusy(true);
    setError(null);
    const { error: saveError, data } = await supabase
      .from('notification_preferences')
      .upsert(
        {
          user_id: user.id,
          push_enabled: next.push_enabled,
          content_newsletter: next.content_newsletter,
          content_devotional: next.content_devotional,
          content_event: next.content_event,
          content_roster: next.content_roster,
          prayer: next.prayer,
          admin_rsvp: next.admin_rsvp,
          admin_signup: next.admin_signup,
          user_lifecycle: next.user_lifecycle,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();
    setBusy(false);
    if (saveError) {
      setError(saveError.message || 'Could not save notification settings.');
      return;
    }
    setPrefs(data as NotificationPreferences);
  };

  const enablePush = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    const result = await subscribeCurrentDevice();
    setBusy(false);
    if (!result.ok) {
      setError(result.error || 'Could not enable browser notifications.');
      return;
    }
    setMessage('Browser notifications enabled on this device.');
    if (prefs) {
      setPrefs({ ...prefs, push_enabled: true });
    }
  };

  const disablePush = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    await unsubscribeCurrentDevice();
    setBusy(false);
    setMessage('Browser notifications turned off on this device.');
    if (prefs) {
      const next = { ...prefs, push_enabled: false };
      setPrefs(next);
    }
  };

  if (!user) return null;

  return (
    <section className="bg-white border border-gray-200 rounded-[12px] p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center">
            <Bell size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-charcoal">Notifications</h2>
            <p className="text-sm text-neutral">
              In-app inbox is always available. Browser and Home Screen alerts need permission on each device.
            </p>
          </div>
        </div>
      </div>

      {iosNeedsHomeScreenInstall() && (
        <p className="text-sm text-neutral bg-gold/10 border border-gold/30 rounded-[8px] px-3 py-2">
          On iPhone and iPad, add this website to your Home Screen first (Share → Add to Home Screen), then enable notifications.
        </p>
      )}

      <p className="text-xs uppercase tracking-wider font-bold text-neutral">
        Browser permission: {permission}
      </p>

      {error ? (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[4px] text-sm">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-[4px] text-sm">{message}</div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <GlowingButton type="button" size="sm" onClick={() => void enablePush()} disabled={busy || !isPushSupported()}>
          Enable on this device
        </GlowingButton>
        <GlowingButton type="button" size="sm" variant="outline" onClick={() => void disablePush()} disabled={busy}>
          Disable on this device
        </GlowingButton>
      </div>

      {loading || !prefs ? (
        <p className="text-sm text-neutral">Loading notification types…</p>
      ) : (
        <div className="space-y-3">
          {toggles.map((item) => (
            <label key={item.key} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={prefs[item.key]}
                disabled={busy}
                onChange={(event) => {
                  const next = { ...prefs, [item.key]: event.target.checked };
                  setPrefs(next);
                  void save(next);
                }}
              />
              <span>
                <span className="block text-sm font-bold text-charcoal">{item.label}</span>
                <span className="block text-xs text-neutral">{item.hint}</span>
              </span>
            </label>
          ))}
        </div>
      )}
    </section>
  );
};
