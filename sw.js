const CACHE_NAME = 'rnc-2026-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/event.html',
  '/map.html',
  '/explore.html',
  '/whatsnew.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/schedule.js',
  '/js/event-detail.js',
  '/js/map.js',
  '/js/explore.js',
  '/data/schedule.json',
  '/data/speakers.json',
  '/data/venues.json',
  '/data/local-guide.json',
  '/manifest.json'
];

// Pre-cache all app shell assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Clean up old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first strategy for all requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful responses for images and other assets
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
