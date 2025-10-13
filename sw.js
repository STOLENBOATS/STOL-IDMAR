// sw.js — gerado por tools/build-sw.ps1
const CACHE_NAME = 'idmar-cache-20251010161615';
const ASSETS = [
  '/STOL-IDMAR/css/nav-ribbon.v5.css',
  '/STOL-IDMAR/css/styles.css',
  '/STOL-IDMAR/css/theme-soft-light.v1.css',
  '/STOL-IDMAR/img/logo-pm.png',
  '/STOL-IDMAR/js/engine_admin_embed.v1.js',
  '/STOL-IDMAR/js/engine_autocomplete_addon.v1.js',
  '/STOL-IDMAR/js/engine_picker.v2.4.js',
  '/STOL-IDMAR/js/engine_validation.v1.js',
  '/STOL-IDMAR/js/header-override.v4.js',
  '/STOL-IDMAR/js/i18n-boot.js',
  '/STOL-IDMAR/js/idmar-config.v4.js',
  '/STOL-IDMAR/js/idmar-header-only.all.v4.js',
  '/STOL-IDMAR/js/idmar-i18n.js',
  '/STOL-IDMAR/js/idmar-version.v4.js',
  '/STOL-IDMAR/js/ribbon-admin.v1.js',
  '/STOL-IDMAR/js/validator-enhancements.v4.js',
  '/STOL-IDMAR/manifest.webmanifest',
  '/STOL-IDMAR/validador.html'
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
        const fallback = '/STOL-IDMAR/validador.html';
        const accept = req.headers.get('accept');
        if (accept && accept.indexOf('text/html') !== -1) {
          return caches.match(fallback);
        }
      });
    })
  );
});

