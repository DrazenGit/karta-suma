// App shell iz cachea (radi i bez signala); podloge i slojevi šuma: mreža, pa cache kao rezerva.
const SHELL = 'shell-v2', TILES = 'tiles-v1';
const SHELL_FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isShell = SHELL_FILES.some(f => req.url === new URL(f, self.location).href);
  if (isShell) {
    // stale-while-revalidate: odmah iz cachea, u pozadini osvježi
    e.respondWith(caches.open(SHELL).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
  } else if (/arcgisonline\.com\/.*\/tile\//.test(req.url)) {
    e.respondWith(caches.open(TILES).then(c => fetch(req).then(r => { c.put(req, r.clone()); return r; })
      .catch(() => c.match(req))));
  }
});
