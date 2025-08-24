// public/sw.js
const VERSION = "pc-v1";
const APP_SHELL = [
  "./",                     // index.html
  "./manifest.webmanifest",
  // Vite will fingerprint assets; we fall back to runtime caching for them.
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Strategies:
// - JSON: stale-while-revalidate (24h max-age hint)
// - Images: cache-first with cap
// - Everything else: network-first with cache fallback
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Navigate requests (HashRouter still uses index.html)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./"))
    );
    return;
  }

  // JSON files
  if (url.pathname.endsWith(".json")) {
    event.respondWith(staleWhileRevalidate(req, "json-cache"));
    return;
  }

  // Images
  if (req.destination === "image") {
    event.respondWith(cacheFirst(req, "img-cache", 50));
    return;
  }

  // Default: network-first
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open("runtime").then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req))
  );
});

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || (await network) || fetch(req);
}

async function cacheFirst(req, cacheName, maxEntries = 50) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  cache.put(req, res.clone());
  trimCache(cache, maxEntries);
  return res;
}

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await cache.delete(keys[0]);
  return trimCache(cache, maxEntries);
}

// Optional: allow app to trigger immediate activation
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
