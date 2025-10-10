//// sw.js — gerado por tools/build-sw.ps1
const CACHE_NAME = 'idmar-cache-20251010160753';
const ASSETS = [
  ''
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k===CACHE_NAME? null : caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// cache-first básico para GET do mesmo domínio
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => {
        // fallback html
        const fallback = '/validador.html';
        if (req.headers.get('accept')?.includes('text/html')) {
          return caches.match(fallback);
        }
      });
    })
  );
});
