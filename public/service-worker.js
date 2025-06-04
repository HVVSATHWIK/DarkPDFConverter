const CACHE_NAME = 'litasdark-cache-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favi.png'
];

// Cache version management
const CACHE_VERSION = 1;
const CURRENT_CACHES = {
  static: `static-cache-v${CACHE_VERSION}`,
  dynamic: `dynamic-cache-v${CACHE_VERSION}`
};

// Helper function to determine if a request should be cached
function shouldCache(request) {
  return (
    request.method === 'GET' &&
    request.url.startsWith('http') &&
    !request.url.includes('chrome-extension') &&
    !request.url.includes('ws:')
  );
}

// Helper function to handle network errors
async function handleNetworkError(request) {
  const cache = await caches.open(CURRENT_CACHES.static);
  const cachedResponse = await cache.match('/offline.html');
  return cachedResponse || new Response('Offline. Please check your connection.');
}

// Install event handler
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CURRENT_CACHES.static);
        console.log('Opened cache and caching core assets');
        await cache.addAll(
          CORE_ASSETS.map(url => new Request(url, { cache: 'reload' }))
        );
        await self.skipWaiting();
      } catch (error) {
        console.error('Failed to cache during install:', error);
      }
    })()
  );
});

// Fetch event handler
self.addEventListener('fetch', event => {
  if (!shouldCache(event.request)) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Try to get from cache first
        const cache = await caches.open(CURRENT_CACHES.dynamic);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          // Return cached response and update cache in background
          event.waitUntil(
            (async () => {
              try {
                const networkResponse = await fetch(event.request);
                if (networkResponse && networkResponse.status === 200) {
                  await cache.put(event.request, networkResponse);
                }
              } catch (error) {
                console.warn('Background cache update failed:', error);
              }
            })()
          );
          return cachedResponse;
        }

        // If not in cache, get from network
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200) {
          const clonedResponse = networkResponse.clone();
          event.waitUntil(cache.put(event.request, clonedResponse));
          return networkResponse;
        }

        throw new Error('Network response was not valid');
      } catch (error) {
        console.error('Fetch failed:', error);
        return handleNetworkError(event.request);
      }
    })()
  );
});

// Activate event handler
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            if (!Object.values(CURRENT_CACHES).includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
        
        // Claim all clients
        await clients.claim();
        
        console.log('Service Worker activated and claiming clients');
      } catch (error) {
        console.error('Activation failed:', error);
      }
    })()
  );
});