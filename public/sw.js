const CACHE_NAME = "cuiyu-v1";
const STATIC_CACHE = "cuiyu-static-v1";

// Assets to cache on install
const PRECACHE_URLS = ["/", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stale-while-revalidate for pages + API; cache-first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== "GET" || url.origin !== location.origin) return;

  // Cache-first for static assets (JS/CSS/images/fonts)
  if (url.pathname.startsWith("/_next/static") || url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => cached ?? fetch(request).then((res) => {
        if (res.ok) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, resClone));
        }
        return res;
      }))
    );
    return;
  }

  // Stale-while-revalidate for spots API (allows offline browsing of visited spots)
  if (url.pathname.startsWith("/api/spots")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((res) => {
            if (res.ok) {
              const resClone = res.clone();
              cache.put(request, resClone);
            }
            return res;
          }).catch(() => cached);
          return cached ?? fetchPromise;
        })
      )
    );
    return;
  }

  // Network-first for pages with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/").then((c) => c ?? caches.match("/offline.html"))
      )
    );
    return;
  }
});
