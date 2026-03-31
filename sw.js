/* ============================================
   RNC 2026 — Service Worker
   Two-tier caching for 3,200 users on shared wifi
   ============================================ */

// Determine base path dynamically (works on both root and subdirectory deploys)
const BASE = new URL('./', self.location).pathname;

const SHELL_CACHE = 'rnc-shell-v6';
const DATA_CACHE = 'rnc-data-v6';
const IMAGE_CACHE = 'rnc-images';       // Never versioned — images persist across updates
const WHATSNEW_CACHE = 'rnc-whatsnew';   // Network-first, clearable for fresh announcements

// App shell — pre-cached on install for instant loading
const SHELL_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'event.html',
  BASE + 'map.html',
  BASE + 'explore.html',
  BASE + 'whatsnew.html',
  BASE + 'css/styles.css',
  BASE + 'js/app.js',
  BASE + 'js/schedule.js',
  BASE + 'js/event-detail.js',
  BASE + 'js/map.js',
  BASE + 'js/explore.js',
  BASE + 'manifest.json'
];

// Data files — network-first so schedule changes propagate immediately
const DATA_ASSETS = [
  BASE + 'data/schedule.json',
  BASE + 'data/speakers.json',
  BASE + 'data/venues.json',
  BASE + 'data/local-guide.json'
];

// Pre-cache shell and data on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)),
      caches.open(DATA_CACHE).then((cache) => cache.addAll(DATA_ASSETS))
    ])
  );
  self.skipWaiting();
});

// Clean up old caches, then eagerly pre-cache all images in the background
self.addEventListener('activate', (event) => {
  const keepCaches = [SHELL_CACHE, DATA_CACHE, IMAGE_CACHE, WHATSNEW_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !keepCaches.includes(k)).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();

  // Pre-cache all images so the app works fully offline
  precacheAllImages();
});

// Read image URLs from data files and cache them all in the background
function precacheAllImages() {
  const fetchJSON = (url) => fetch(url).then(r => r.json()).catch(() => null);

  Promise.all([
    fetchJSON(BASE + 'data/speakers.json'),
    fetchJSON(BASE + 'data/local-guide.json')
  ]).then(([speakersData, guideData]) => {
    const imageUrls = [];

    if (speakersData && speakersData.speakers) {
      for (const s of speakersData.speakers) {
        if (s.image) imageUrls.push(BASE + s.image);
      }
    }
    if (guideData && guideData.categories) {
      for (const cat of guideData.categories) {
        for (const item of (cat.listings || [])) {
          if (item.image) imageUrls.push(BASE + item.image);
        }
      }
    }

    if (imageUrls.length === 0) return;

    caches.open(IMAGE_CACHE).then((cache) => {
      for (const url of imageUrls) {
        cache.match(url).then((existing) => {
          if (!existing) {
            fetch(url).then((resp) => {
              if (resp.ok) cache.put(url, resp);
            }).catch(() => {});
          }
        });
      }
    });
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // --- Navigation (HTML pages): network-first ---
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request, SHELL_CACHE));
    return;
  }

  // --- What's New data: network-first with dedicated cache ---
  if (url.pathname.includes('whatsnew')) {
    event.respondWith(networkFirst(event.request, WHATSNEW_CACHE));
    return;
  }

  // --- JSON data files: network-first so updates propagate ---
  if (url.pathname.endsWith('.json') && url.pathname.includes('/data/')) {
    event.respondWith(networkFirst(event.request, DATA_CACHE));
    return;
  }

  // --- Images: cache-first, persist indefinitely ---
  if (url.pathname.match(/\.(webp|png|jpg|jpeg|svg|gif)$/i)) {
    event.respondWith(cacheFirstImages(event.request));
    return;
  }

  // --- All other assets (CSS, JS, manifest): cache-first ---
  event.respondWith(cacheFirst(event.request, SHELL_CACHE));
});

// Network-first: try network, update cache, fall back to cache
function networkFirst(request, cacheName) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(cacheName).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(() => caches.match(request));
}

// Cache-first: serve from cache, fall back to network and cache the response
function cacheFirst(request, cacheName) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(cacheName).then((cache) => cache.put(request, clone));
      }
      return response;
    });
  });
}

// Images: cache-first with persistent image cache, silent fail on network error
function cacheFirstImages(request) {
  return caches.open(IMAGE_CACHE).then((cache) =>
    cache.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(() => new Response('', { status: 404, statusText: 'Offline' }));
    })
  );
}
