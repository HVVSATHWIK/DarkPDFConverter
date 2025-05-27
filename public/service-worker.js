/*
 * NOTE: This service worker has been simplified to prevent errors during development
 * by only caching essential static assets. It does not currently provide robust
 * offline capabilities for all Vite build outputs.
 * For a full Progressive Web App (PWA) experience with optimized caching of
 * Vite's generated assets (hashed JS/CSS bundles, etc.), consider using a tool
 * like `vite-plugin-pwa` to auto-generate a more comprehensive service worker.
 */
const CACHE_NAME = 'pdf-tools-cache-v1';
const urlsToCache = [
    '/', // Alias for index.html
    '/index.html',
    '/script.js',
    '/favi.png', // Icon specified in manifest
    // Key CDN resources
    'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js'
];

self.addEventListener('install', event => {
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache and caching core assets');
                // Use try-catch for each addAll or map individual requests with error handling
                // to prevent one failed CDN request from failing the entire cache.addAll
                const cachePromises = urlsToCache.map(urlToCache => {
                    return fetch(new Request(urlToCache, { mode: 'cors' })) // Try to fetch with CORS
                        .then(response => {
                            if (!response.ok) {
                                // If CDN fails (e.g. no CORS, or actual error), don't break install
                                console.warn(`Failed to fetch ${urlToCache} for caching: ${response.status}`);
                                // Fallback for no-cors if needed, but this makes response opaque and size 0
                                // return fetch(new Request(urlToCache, { mode: 'no-cors' }));
                                return Promise.resolve(); // Resolve to not break Promise.all
                            }
                            return cache.put(urlToCache, response);
                        })
                        .catch(err => {
                            console.error(`Error fetching/caching ${urlToCache}:`, err);
                            return Promise.resolve(); // Don't let one failure stop others
                        });
                });
                return Promise.all(cachePromises);
            })
    );
});

self.addEventListener('activate', event => {
    // Claim clients immediately
    event.waitUntil(self.clients.claim());
    // Clean up old caches
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Cache hit - return response
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Not in cache - fetch from network
                return fetch(event.request).then(
                    networkResponse => {
                        // Optional: Cache the new resource if it's a GET request and valid
                        if (event.request.method === 'GET' && networkResponse && networkResponse.ok) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return networkResponse;
                    }
                ).catch(error => {
                    console.error('Fetch failed; returning offline page instead.', error);
                    // Optional: return a fallback offline page if specific routes fail
                    // For a SPA, usually index.html is the main fallback.
                    if (event.request.mode === 'navigate') {
                         return caches.match('/index.html');
                    }
                });
            })
    );
});
