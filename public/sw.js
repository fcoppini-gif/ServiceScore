// =============================================================================
// Service Worker per Push Notifications
// =============================================================================
const CACHE_NAME = 'servicescore-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['/', '/index.html']))
  );
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'ServiceScore', body: 'Nuovo aggiornamento' };
  const options = {
    body: data.body,
    icon: '/logo_ufficiale.png',
    badge: '/logo_ufficiale.png',
    vibrate: [200, 100, 200],
    tag: 'servicescore-notification',
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/dashboard'));
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});