const CACHE_NAME = 'cinepick-cache-v1';
// These are the files for the app shell.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/i18n/locales/en-us.json',
  '/favicon.ico',
  '/apple-touch-icon.png'
];

// External resources that might be used by the app
// We'll handle these differently due to CORS restrictions
const EXTERNAL_URLS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.0.0/css/flag-icons.min.css'
];

// Install the service worker and cache the app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        // Only cache local resources initially
        return cache.addAll(APP_SHELL_URLS);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service worker installation failed:', error);
      })
  );
});

// Clean up old caches when a new service worker is activated.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tell the active service worker to take control of the page immediately.
      return self.clients.claim();
    })
  );
});

// Serve assets from cache, falling back to network.
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // For external CDNs and APIs, always use the network
  const isExternalResource = 
    url.hostname === 'cdn.tailwindcss.com' ||
    url.hostname === 'cdn.jsdelivr.net' ||
    url.hostname === 'ipapi.co' || 
    url.hostname === 'picsum.photos' || 
    url.hostname.endsWith('googleapis.com');

  if (isExternalResource) {
    // Don't try to handle these in the service worker
    return;
  }

  // Use a "Cache, falling back to network" strategy for local resources
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // If we have a cached response, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from the network.
        return fetch(event.request).then((networkResponse) => {
          // Only cache successful responses
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // IMPORTANT: Clone the response. A response is a stream
          // and because we want the browser to consume the response
          // as well as the cache consuming the response, we need
          // to clone it so we have two streams.
          const responseToCache = networkResponse.clone();

          // Cache the new response for future use.
          cache.put(event.request, responseToCache);

          // Return the network response.
          return networkResponse;
        }).catch(error => {
          console.error('Fetch failed:', error);
          // You could return a custom offline page here
          // return cache.match('/offline.html');
        });
      });
    })
  );
});
