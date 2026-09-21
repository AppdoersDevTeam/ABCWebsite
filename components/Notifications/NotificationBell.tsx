import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeDateInTimezone } from '../../lib/dateUtils';
import type { AppNotification } from '../../lib/notificationTypes';
import { registerPushServiceWorker } from '../../lib/pushNotifications';

const PAGE_SIZE = 30;

type NotificationBellProps = {
  /** Portal gold top bar uses a white icon; default is charcoal for older layouts. */
  variant?: 'default' | 'portal';
};

export const NotificationBell = ({ variant = 'default' }: NotificationBellProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const portal = variant === 'portal';

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read_at).length,
    [items]
  );

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('id, user_id, type, title, body, href, entity_id, read_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);
    if (error) {
      console.error('Failed to load notifications', error);
    } else {
      setItems((data || []) as AppNotification[]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void registerPushServiceWorker();
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`notifications-inbox-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void load();
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, load]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'abc-notification-click' && typeof event.data.href === 'string') {
        navigate(event.data.href);
        setOpen(false);
      }
    };
    navigator.serviceWorker?.addEventListener('message', onMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', onMessage);
  }, [navigate]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  const markRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .is('read_at', null);
    if (error) {
      console.error('Failed to mark notification read', error);
      return;
    }
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item))
    );
  };

  const markAllRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);
    if (error) {
      console.error('Failed to mark all notifications read', error);
      return;
    }
    const now = new Date().toISOString();
    setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at || now })));
  };

  const openItem = async (item: AppNotification) => {
    if (!item.read_at) await markRead(item.id);
    setOpen(false);
    if (item.href) navigate(item.href);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className={
          portal
            ? 'relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-white hover:bg-black/10'
            : 'relative rounded-[4px] p-2 text-charcoal hover:bg-gray-50'
        }
        aria-label={unreadCount ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-expanded={open}
        title="Notifications"
        onClick={() => setOpen((value) => !value)}
      >
        {portal ? (
          <Bell size={25} color="#ffffff" fill="#ffffff" stroke="#ffffff" />
        ) : (
          <Bell size={22} />
        )}
        {unreadCount > 0 && (
          <span
            className={
              portal
                ? 'absolute right-1 top-1 min-w-[1.1rem] rounded-full bg-white px-1 text-center text-[10px] font-bold leading-4 text-charcoal'
                : 'absolute right-1 top-1 min-w-[1.1rem] rounded-full bg-gold px-1 text-center text-[10px] font-bold leading-4 text-charcoal'
            }
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-2rem))] max-h-[min(28rem,70vh)] overflow-hidden bg-white border border-gray-100 rounded-[12px] shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-charcoal">Notifications</p>
            <button
              type="button"
              className="text-xs font-bold uppercase tracking-wider text-neutral hover:text-charcoal disabled:opacity-40"
              onClick={() => void markAllRead()}
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
          </div>
          <div className="overflow-y-auto max-h-[min(24rem,60vh)]">
            {loading && items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-neutral">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-neutral">No notifications yet.</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void openItem(item)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${
                    item.read_at ? 'bg-white' : 'bg-gold/10'
                  }`}
                >
                  <p className="text-sm font-bold text-charcoal">{item.title}</p>
                  {item.body ? <p className="text-xs text-neutral mt-1 line-clamp-2">{item.body}</p> : null}
                  <p className="text-[11px] text-neutral mt-1">
                    {formatRelativeDateInTimezone(item.created_at)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
