const currentCacheName = 'restaurant-reviews-v19';

// when installing add main resources to cache
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(currentCacheName).then(function (cache) {
      return cache.addAll([
        'js/main.js',
        'js/dbhelper.js',
        'js/swManager.js',
        'js/restaurant_info.js',
        'css/styles.css',
        'index.html',
        'restaurant.html',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
        'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png',
        'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png'
      ]);
    })
  );
});

// when activating delete old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheName) {
          return cacheName.startsWith('restaurant-reviews-') &&
            cacheName != currentCacheName;
        }).map(function (cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // There were some problems with caching map tiles therefore
  // there are always fetched from the web
  if (event.request.url.startsWith('https://api.tiles.mapbox.com')) {
    return fetch(event.request);
  }

  event.respondWith(
    // check if there is cached result for this request
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      } else {
        // since ther is no cache result, go to the web
        return fetch(event.request).then((response) => {
          if (response.ok) {
            // cache request result and return response
            caches.open(currentCacheName).then((cache) => {
              cache.put(event.request, response);
            });
            return response.clone();
          } else {
            return getErrorResponse();
          }
        })
      }
    }).catch(() => {
      return getErrorResponse();
    })
  );
});

const getErrorResponse = () => new Response(
  `<p class="respond-error">Can't get resource</p>`,
  { headers: { 'Content-Type': 'text/html' } }
);

// handle messages from pages - currently only in order to force app update
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
