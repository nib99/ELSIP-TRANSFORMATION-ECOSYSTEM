// public/service-worker.js
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => self.clients.claim());

self.addEventListener('fetch', (event) => {
  // Basic network-first for dynamic content - more advanced caching recommended
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
