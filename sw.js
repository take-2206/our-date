const CACHE = 'lovesync-v9';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './supabase.js',
  './css/styles.css',
  './js/core.js',
  './js/pages/auth.js',
  './js/pages/calendar.js',
  './js/pages/details.js',
  './js/pages/notes.js',
  './js/pages/settings.js',
  './js/pages/album.js',
  './js/render.js',
  './js/letter.js',
  './js/actions.js',
  './js/interactions.js',
  './js/data.js',
  './js/push.js',
  './js/app.js',
  './img/girl.png',
  './img/boy.png',
  './img/icons/app-icon-180.png',
  './img/icons/app-icon-192.png',
  './img/icons/app-icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html')),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        }),
    ),
  );
});

// ===== Thông báo đẩy =====
self.addEventListener('push', (event) => {
  let d = {};
  try {
    d = event.data ? event.data.json() : {};
  } catch (e) {
    d = { body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(d.title || 'LoveSync', {
      body: d.body || '',
      icon: './img/icons/app-icon-192.png',
      badge: './img/icons/app-icon-192.png',
      tag: d.tag || undefined,
      lang: d.lang || undefined,
      data: { url: d.url || './', id: d.id || null },
    }),
  );
});

// Bấm vào thông báo: mở app (hoặc đưa app đang mở lên) và chuyển tới đúng buổi hẹn
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { url, id } = event.notification.data || {};
  event.waitUntil(
    (async () => {
      const list = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const c of list) {
        if ('focus' in c) {
          await c.focus();
          if (id) c.postMessage({ type: 'open-event', id });
          return;
        }
      }
      await clients.openWindow(url || './');
    })(),
  );
});
