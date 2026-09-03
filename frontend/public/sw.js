// DRISHTI-AI Service Worker v2 — Offline PWA + Push Notifications
const CACHE_NAME = 'drishti-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => caches.match('/index.html'));
    })
  );
});

// ─── Push Notification Handler ───────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'DRISHTI-AI Alert', body: 'A landslide risk update is available.', risk_level: 'High' };
  if (event.data) {
    try { data = { ...data, ...event.data.json() }; } catch (e) { data.body = event.data.text(); }
  }

  const iconByLevel = {
    Critical: '/icon-192.png',
    High: '/icon-192.png',
    Medium: '/icon-192.png',
    Low: '/icon-192.png'
  };

  const badgeColor = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#10b981' };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: iconByLevel[data.risk_level] || '/icon-192.png',
      badge: '/icon-192.png',
      tag: `drishti-alert-${data.zone_id || 'general'}`,
      renotify: true,
      requireInteraction: data.risk_level === 'Critical',
      data: { url: data.url || '/', zone_id: data.zone_id },
      actions: [
        { action: 'view', title: '🗺️ View on Map' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  );
});

// ─── Notification Click Handler ───────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ─── Message Handler (from main thread) ──────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_RISK_NOTIFICATION') {
    const { zone_name, risk_level, risk_score, zone_id } = event.data;
    self.registration.showNotification(`⚠️ DRISHTI-AI: ${risk_level} Risk — ${zone_name}`, {
      body: `Risk Index: ${risk_score}% | Immediate attention required for ${zone_name}.`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `drishti-zone-${zone_id}`,
      renotify: true,
      requireInteraction: risk_level === 'Critical',
      data: { url: '/', zone_id },
      actions: [
        { action: 'view', title: '🗺️ View Zone' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  }
});

