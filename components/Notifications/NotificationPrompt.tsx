import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { GlowingButton } from '../UI/GlowingButton';
import {
  dismissPushPrompt,
  iosNeedsHomeScreenInstall,
  isPushSupported,
  subscribeCurrentDevice,
  wasPushPromptDismissed,
} from '../../lib/pushNotifications';

export const NotificationPrompt = () => {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iosHint = iosNeedsHomeScreenInstall();

  useEffect(() => {
    if (wasPushPromptDismissed()) return;
    if (!isPushSupported() && !iosHint) return;
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') return;
    setVisible(true);
  }, [iosHint]);

  if (!visible) return null;

  const enable = async () => {
    setBusy(true);
    setError(null);
    const result = await subscribeCurrentDevice();
    setBusy(false);
    if (!result.ok) {
      setError(result.error || 'Could not enable notifications.');
      return;
    }
    dismissPushPrompt();
    setVisible(false);
  };

  return (
    <div className="mx-4 sm:mx-8 mt-4 mb-0 bg-white/90 border border-gold/40 rounded-[12px] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center shrink-0">
        <Bell size={18} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-charcoal">Turn on notifications</p>
        <p className="text-xs text-neutral mt-1">
          {iosHint
            ? 'On iPhone and iPad, tap Share → Add to Home Screen, open the ABC app, then enable notifications here.'
            : "Get browser or Home Screen alerts for newsletters, devotionals, what's on, prayer, and account updates."}
        </p>
        {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
      </div>
      <div className="flex gap-2 shrink-0">
        <GlowingButton type="button" size="sm" onClick={() => void enable()} disabled={busy}>
          {busy ? 'Enabling…' : 'Enable'}
        </GlowingButton>
        <GlowingButton
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            dismissPushPrompt();
            setVisible(false);
          }}
        >
          Not now
        </GlowingButton>
      </div>
    </div>
  );
};
