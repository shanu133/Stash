// sw.js - Minimal Service Worker to satisfy PWA requirements
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Just pass requests through (Network First strategy)
  e.respondWith(fetch(e.request));
});
