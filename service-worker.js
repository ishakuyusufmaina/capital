// service-worker.js

self.addEventListener('install', (event) => {
  console.log('Service worker installed.');
  self.skipWaiting(); // Optional: activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated.');
});

self.addEventListener('fetch', (event) => {
  // Basic example: let network requests pass through
  event.respondWith(fetch(event.request));
});
