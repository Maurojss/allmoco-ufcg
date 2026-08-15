/* Service Worker - allmoço UFCG
   Estratégia de Cache Offline Completa:
   - App Shell & Assets Estáticos: Cache-First / Network-First com Fallback
   - Imagens de Restaurantes e Pratos: Cache-First com Stale-While-Revalidate e Fallback Offline
   - Dados e Rotas da Aplicação: Network-First com Fallback Local para Cache
*/

const STATIC_CACHE_NAME = 'allmoco-static-v2';
const IMAGES_CACHE_NAME = 'allmoco-images-v2';
const DATA_CACHE_NAME = 'allmoco-data-v2';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Fallback SVG image in case a specific image is not cached and device is offline
const OFFLINE_IMAGE_FALLBACK = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#f1f5f9"/>
  <rect x="20" y="20" width="360" height="260" rx="16" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6 6"/>
  <circle cx="200" cy="120" r="40" fill="#f97316" fill-opacity="0.15"/>
  <path d="M190 105C190 99.4772 194.477 95 200 95C205.523 95 210 99.4772 210 105V135C210 140.523 205.523 145 200 145C194.477 145 190 140.523 190 135V105Z" fill="#ea580c"/>
  <path d="M175 115C175 109.477 179.477 105 185 105V135C185 140.523 179.477 145 175 145V115Z" fill="#f97316"/>
  <path d="M225 115C225 109.477 220.523 105 215 105V135C215 140.523 220.523 145 225 145V115Z" fill="#f97316"/>
  <text x="200" y="185" text-anchor="middle" fill="#334155" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700">allmoço UFCG</text>
  <text x="200" y="208" text-anchor="middle" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="12">Imagem em cache offline indisponível</text>
</svg>
`;

// Helper: check if a request is for an image
function isImageRequest(request, url) {
  return (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico|avif)$/i) ||
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('googleusercontent.com')
  );
}

// 1. Install Event: Pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then(async (cache) => {
        try {
          await cache.addAll(PRECACHE_ASSETS);
        } catch (err) {
          console.warn('[SW] Falha parcial no pre-cache inicial:', err);
        }
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Cleanup stale caches and claim clients immediately
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE_NAME, IMAGES_CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Multi-tiered offline strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g. POST, PUT, DELETE) and browser extensions
  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // A. Navigation / Document requests: Network-First with fallback to cached index.html
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
              cache.put('/index.html', response.clone());
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedDoc = await caches.match(request);
          if (cachedDoc) return cachedDoc;
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) return cachedIndex;
          const cachedRoot = await caches.match('/');
          if (cachedRoot) return cachedRoot;
          return new Response('Aplicativo allmoço UFCG Offline', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
    return;
  }

  // B. Images: Cache-First with Stale-While-Revalidate & Fallback
  if (isImageRequest(request, url)) {
    event.respondWith(
      caches.open(IMAGES_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        // If cached, return immediately and fetch in background to revalidate (Stale-While-Revalidate)
        if (cachedResponse) {
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                cache.put(request, networkResponse.clone());
              }
            })
            .catch(() => {
              // Ignore background fetch error when offline
            });
          return cachedResponse;
        }

        // If not in cache, fetch from network and cache
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (fetchError) {
          // Provide fallback SVG for images when completely offline
          return new Response(OFFLINE_IMAGE_FALLBACK, {
            headers: {
              'Content-Type': 'image/svg+xml; charset=utf-8',
              'Cache-Control': 'no-cache',
            },
          });
        }
      })
    );
    return;
  }

  // C. Static JS, CSS, Fonts, and Vite bundles: Cache-First with Network Revalidation
  if (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.(js|css|ts|tsx|woff|woff2|ttf|eot)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Background update
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(STATIC_CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response('// Offline script placeholder', {
              headers: { 'Content-Type': 'application/javascript' },
            });
          });
      })
    );
    return;
  }

  // D. General Requests: Network-First with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// 4. Message Event: Pre-caching dynamic data & image URLs dispatched by the UI
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Pre-cache restaurant images in the background with strict size limit (max 30 images)
  if (data.type === 'CACHE_IMAGE_URLS' && Array.isArray(data.urls)) {
    caches.open(IMAGES_CACHE_NAME).then((cache) => {
      // Limit caching to top 30 most recent URLs
      const safeUrls = data.urls.slice(0, 30);
      safeUrls.forEach((imgUrl) => {
        if (typeof imgUrl === 'string' && (imgUrl.startsWith('https://') || imgUrl.startsWith('http://'))) {
          cache.match(imgUrl).then((matched) => {
            if (!matched) {
              fetch(imgUrl, { mode: 'no-cors' })
                .then((res) => {
                  if (res) cache.put(imgUrl, res);
                })
                .catch(() => {});
            }
          });
        }
      });
    });
  }

  // Cache restaurant JSON data snapshot
  if (data.type === 'CACHE_RESTAURANTS_DATA' && data.payload) {
    caches.open(DATA_CACHE_NAME).then((cache) => {
      const blob = new Blob([JSON.stringify(data.payload)], {
        type: 'application/json',
      });
      const response = new Response(blob, {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      });
      cache.put('/api/offline-restaurants-data', response);
    });
  }
});

// 5. Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

