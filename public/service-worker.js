const CACHE_NAME = 'litasdark-cache-v1';
const urlsToCache = [
  '/',
  '/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching core assets');
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' }))); // Force reload from network
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests and http/https URLs
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    // Let the browser handle it by default if not cached or for non-GET/non-http.
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Cache hit
        }
        // Not in cache, fetch from network
        return fetch(event.request).then(networkResponse => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse; // Don't cache error responses or opaque responses
          }

          // IMPORTANT: Clone the response. A response is a stream
          // and because we want the browser to consume the response
          // as well as the cache consuming the response, we need
          // to clone it so we have two streams.
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return networkResponse;
        }).catch(error => {
          console.error('ServiceWorker Fetch failed for:', event.request.url, error);
          // Optionally, return a generic fallback page or offline indicator here
          // For example: return caches.match('/offline.html');
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
