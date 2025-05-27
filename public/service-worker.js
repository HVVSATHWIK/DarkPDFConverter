const CACHE_NAME = 'litasdark-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/script.js' // As requested by user to attempt caching this
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
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request).catch(error => {
          console.error('Failed to fetch ' + event.request.url + ' for caching:', error.status);
          // Optionally, return a fallback page or image if appropriate
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
