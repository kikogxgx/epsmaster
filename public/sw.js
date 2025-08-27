// Service Worker optimisé sans gestionnaire fetch inutile
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation');
  self.clients.claim();
});

// PLUS de gestionnaire fetch - élimine l'avertissement no-op
// Si vous avez besoin de cache/offline plus tard, rajoutez le gestionnaire fetch
