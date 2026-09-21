self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'Ashburton Baptist Church',
    body: '',
    href: '/dashboard',
    icon: '/abc-logo.png',
  };
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    try {
      data.body = event.data ? event.data.text() : '';
    } catch {
      // ignore
    }
  }

  const href = data.href || '/dashboard';
  event.waitUntil(
    self.registration.showNotification(data.title || 'Ashburton Baptist Church', {
      body: data.body || 'You have a new notification.',
      icon: data.icon || '/abc-logo.png',
      badge: '/abc-logo.png',
      tag: data.tag || `abc-push-${Date.now()}`,
      renotify: true,
      requireInteraction: true,
      data: { href },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const href = event.notification.data?.href || '/dashboard';
  const path = href.startsWith('/') ? href : `/${href}`;

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        if ('focus' in client) {
          await client.focus();
          client.postMessage({ type: 'abc-notification-click', href: path });
          return;
        }
      }
      const url = new URL(`/#${path}`, self.location.origin);
      await self.clients.openWindow(url.href);
    })()
  );
});
