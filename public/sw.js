const CACHE_NAME = 'tedx-cache-v1';

// Static assets that we want to cache-first
const STATIC_ASSETS = [
  '/favicon.svg',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static assets...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event (Cleanup old caches)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and Supabase API calls (we never want to cache real-time or API database requests)
  if (request.method !== 'GET' || url.hostname.includes('supabase') || url.pathname.startsWith('/rest/v1')) {
    return;
  }

  // Network-First, Cache-Fallback strategy for HTML and routing documents
  // This guarantees Chrome mobile and PC always receive the latest version of index.html
  // and database-driven content, and never get stuck on a blank page cache.
  if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache if the response is fully successful (status 200 and ok)
          if (response && response.status === 200 && response.ok) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseCopy);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, try to return the cached document
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Fall back to index.html for client-side routing
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Cache-First, Network-Update strategy for static assets (js, css, images, fonts)
  const isStaticAsset = 
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/) ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdnjs.cloudflare.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache, and optionally fetch in the background to update cache
          fetch(request).then((response) => {
            if (response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
            }
          }).catch(() => { /* ignore background update errors */ });
          return cachedResponse;
        }

        // Fetch from network and cache for next time
        return fetch(request).then((response) => {
          if (!response || response.status !== 200) return response;
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseCopy);
          });
          return response;
        });
      })
    );
  }
});
