// Service worker: keeps a copy of the app on the phone so it opens without internet.
// When you change any file, bump VERSION (v1 -> v2) so phones fetch the new copy.
const VERSION = "v1";
const CACHE = "training-" + VERSION;
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];

// First visit: download every file into the phone's cache.
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

// New version: delete old copies.
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Every open: answer from the saved copy first; only go to the network if something is missing.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit =>
      hit || fetch(e.request).catch(() => caches.match("index.html"))
    )
  );
});
