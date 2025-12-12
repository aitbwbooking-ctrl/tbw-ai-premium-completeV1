/* TBW AI PREMIUM - SW (safe cache, no extension URLs) */
const CACHE = "tbw-ai-premium-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.ico",
  "/hero-paris-desktop.jpg",
  "/hero-paris-mobile.jpg",
  "/hero-split.jpg",
  "/hero-zadar.jpg",
  "/hero-zagreb.jpg",
  "/hero-karlovac.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for API, cache-first for static
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ignore non-http(s) (chrome-extension etc.)
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // API: network first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Static: cache first
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
