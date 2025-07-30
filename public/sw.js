
const CACHE_NAME = 'cinepick-cache-v2'; // Bump version to force update
const API_CACHE_NAME = 'cinepick-api-cache-v2'; // A separate cache for API data

// These are the files for the app shell.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/i18n/locales/en-us.json',
  '/favicon.ico',
  '/apple-touch-icon.png'
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
          // If a cache is not one of the current, valid caches, delete it.
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
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

  // Ignore non-http/https requests to prevent errors with browser extensions.
  if (!event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);

  // Strategy: Stale-While-Revalidate for TMDb API and images.
  // This serves content from cache immediately for speed, then updates the cache
  // in the background with a fresh network request for future visits.
  if (url.hostname === 'api.themoviedb.org' || url.hostname === 'image.tmdb.org') {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(error => {
            console.error('TMDb fetch failed:', error);
            // If network fails, we still have the cachedResponse (if it existed)
          });

          // Return cached response if it exists, otherwise wait for the network.
          return cachedResponse || fetchPromise;
        });
      })
    );
    return; // Exit after handling the TMDb request.
  }

  // For other external CDNs, always use the network and do not cache.
  const isExternalResource =
    url.hostname === 'cdn.tailwindcss.com' ||
    url.hostname === 'cdn.jsdelivr.net' ||
    url.hostname === 'ipapi.co' ||
    url.hostname === 'picsum.photos' ||
    url.hostname.endsWith('googleapis.com');

  if (isExternalResource) {
    // Let the network handle it, do not intercept.
    return;
  }

  // Use a "Cache, falling back to network" strategy for local app shell resources.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // If we have a cached response, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from the network.
        return fetch(event.request).then((networkResponse) => {
          // Only cache successful responses for the app shell itself
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
          // For example: return caches.match('/offline.html');
        });
      });
    })
  );
});
