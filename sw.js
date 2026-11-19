const CACHE = 'lovesync-v1.50.63';
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./supabase.js",
  "./css/styles.css",
  "./js/core.js",
  "./js/pages/auth.js",
  "./js/pages/calendar.js",
  "./js/pages/details.js",
  "./js/pages/notes.js",
  "./js/pages/trash.js",
  "./js/pages/settings.js",
  "./js/pages/album.js",
  "./js/pages/game.js",
  "./js/render.js",
  "./js/letter.js",
  "./js/actions.js",
  "./js/interactions.js",
  "./js/data.js",
  "./js/push.js",
  "./js/app.js",
  "./img/girl.png",
  "./img/boy.png",
  "./img/letter_0.png",
  "./img/letter_1.png",
  "./img/paper.png",
  "./img/couple.png",
  "./img/icons/app-icon-180.png",
  "./img/icons/app-icon-192.png",
  "./img/icons/app-icon-512.png",
  "./img/LoveSync-Rounded/LoveSync-Rounded-Full-Dark.svg",
  "./img/LoveSync-Rounded/LoveSync-Rounded-Icon-Dark.svg",
  "./img/LoveSync-Rounded/LoveSync-Rounded-Icon-Light.svg",
  "./img/pet/boy_act.png",
  "./img/pet/girl_act.png",
  "./img/pet/pet-bg-wide.png",
  "./img/pet/fj-bg.png",
  "./img/pet/fjf.png",
  "./img/pet/fjm.png",
  "./img/pet/fjn.png",
  "./img/pet/m-feeling.png",
  "./img/pet/f-feeling.png",
  "./img/pet/feeling/b-angry.png",
  "./img/pet/feeling/b-happy.png",
  "./img/pet/feeling/b-sad.png",
  "./img/pet/feeling/b-sick.png",
  "./img/pet/feeling/g-angry.png",
  "./img/pet/feeling/g-happy.png",
  "./img/pet/feeling/g-sad.png",
  "./img/pet/feeling/g-sick.png",
  "./img/pet/boy_walk_left_0.png",
  "./img/pet/boy_walk_left_1.png",
  "./img/pet/boy_walk_left_2.png",
  "./img/pet/boy_walk_right_0.png",
  "./img/pet/boy_walk_right_1.png",
  "./img/pet/boy_walk_right_2.png",
  "./img/pet/girl_walk_left_0.png",
  "./img/pet/girl_walk_left_1.png",
  "./img/pet/girl_walk_left_2.png",
  "./img/pet/girl_walk_right_0.png",
  "./img/pet/girl_walk_right_1.png",
  "./img/pet/girl_walk_right_2.png",
  "./img/pet/mini_boy.png",
  "./img/pet/mini_girl.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // Trang chính: mạng trước, mất mạng dùng index.html đã lưu
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html")),
    );
    return;
  }

  // Code (js, css, manifest): mạng trước, mất mạng mới dùng cache
  if (/\.(?:js|css|webmanifest)$/.test(url.pathname)) {
    event.respondWith(
      fetch(req, { cache: "no-cache" })
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return response;
        })
        .catch(() => caches.match(req)),
    );
    return;
  }

  // Ảnh và file khác: cache trước cho nhanh
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return response;
        }),
    ),
  );
});

// ===== Thông báo đẩy =====
self.addEventListener("push", (event) => {
  let d = {};
  try {
    d = event.data ? event.data.json() : {};
  } catch (e) {
    d = { body: event.data ? event.data.text() : "" };
  }
  const notification = self.registration.showNotification(d.title || "LoveSync", {
      body: d.body || "",
      icon: "./img/icons/app-icon-192.png",
      badge: "./img/icons/app-icon-192.png",
      tag: d.tag || undefined,
      renotify: !!d.tag,
      requireInteraction: d.type === 'app-update',
      vibrate: d.type === 'app-update' ? [180, 80, 180] : undefined,
      lang: d.lang || undefined,
      data: { url: d.url || './', id: d.id || null, type: d.type || '' },
    });
  const syncOpenApps = d.type === 'open-pet-messages'
    ? clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) =>
        Promise.all(list.map((client) => client.postMessage({ type: 'sync-pet-messages' }))),
      )
    : Promise.resolve();
  event.waitUntil(Promise.all([notification, syncOpenApps]));
});

// Bấm vào thông báo: mở app (hoặc đưa app đang mở lên) và chuyển tới đúng buổi hẹn
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { url, id, type } = event.notification.data || {};
  event.waitUntil(
    (async () => {
      const list = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const c of list) {
        if ("focus" in c) {
          await c.focus();
          if (id) c.postMessage({ type: 'open-event', id });
          else if (type == 'open-notes') c.postMessage({ type: 'open-notes' });
          else if (type == 'open-pet-messages') c.postMessage({ type: 'open-pet-messages' });
          else if (type == 'app-update') c.postMessage({ type: 'check-update' });
          return;
        }
      }
      await clients.openWindow(url || "./");
    })(),
  );
});
