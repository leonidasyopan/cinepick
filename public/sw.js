
const CACHE_NAME = 'cinepick-cache-v3';
const API_CACHE_NAME = 'cinepick-api-cache-v3';

// App shell files to be cached on install.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/i18n/locales/en-us.json',
  '/i18n/locales/es-es.json',
  '/i18n/locales/pt-br.json',
  '/favicon.ico',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service worker installation failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignore non-http/https requests.
  if (!event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);

  // Use a Stale-While-Revalidate strategy for all resources.
  // This provides a good balance of speed (from cache) and freshness (background updates).

  // Separate cache for third-party assets (API, CDN, etc.)
  if (url.origin !== self.location.origin) {
    event.respondWith(staleWhileRevalidate(API_CACHE_NAME, event.request));
    return;
  }

  // Use main cache for local app shell resources.
  event.respondWith(
    staleWhileRevalidate(CACHE_NAME, event.request, {
      onFetchSuccess: (request, response) => {
        // Additional validation for local resources before caching.
        // This prevents caching incorrect MIME types for scripts.
        const isScriptRequest = request.destination === 'script';
        const isHtmlResponse = response.headers.get('content-type')?.includes('text/html');

        if (isScriptRequest && isHtmlResponse) {
          console.warn(`Service Worker: Not caching HTML response for script request: ${request.url}`);
          return false; // Signal to not cache this response
        }
        return true; // OK to cache
      }
    })
  );
});


/**
 * Implements the Stale-While-Revalidate caching strategy.
 * @param {string} cacheName The name of the cache to use.
 * @param {Request} request The request object.
 * @param {object} [options] Optional callbacks.
 * @param {(req: Request, res: Response) => boolean} [options.onFetchSuccess] - A function to run on successful fetch. Return false to prevent caching.
 * @returns {Promise<Response>}
 */
async function staleWhileRevalidate(cacheName, request, options = {}) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse && networkResponse.status === 200) {
      // Run validation callback if provided
      const shouldCache = options.onFetchSuccess ? options.onFetchSuccess(request, networkResponse.clone()) : true;
      if (shouldCache) {
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  }).catch(error => {
    console.error(`Fetch failed for ${request.url}; serving stale content if available.`, error);
    // If fetch fails, we want to return the cached response if we have one.
    // If not, the promise will reject, and the browser will show its offline error.
  });

  return cachedResponse || fetchPromise;
}
