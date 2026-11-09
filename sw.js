/* Service worker: cache toàn bộ file để app chạy offline.
   Khi sửa code, tăng VERSION để điện thoại tải bản mới. */
const VERSION = 'v2';
const CACHE = 'so-diem-bai-' + VERSION;
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon.svg',
  'css/app.css',
  'js/core/utils.js',
  'js/core/registry.js',
  'js/core/store.js',
  'js/core/game.js',
  'js/ui/components.js',
  'js/modes/phom.js',
  'js/modes/sam.js',
  'js/modes/free.js',
  'js/ui/app.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()));
});

// Ưu tiên mạng (để luôn có bản mới khi online), mất mạng thì dùng cache.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
});
