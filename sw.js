// Iron Front offline service worker (scope: /iron-front/)
// Game page: network first (always latest when online), cached copy when offline.
// Libraries, fonts, icons: cache first (they are versioned by CACHE name).
const CACHE = 'ironfront-v6-983adfa263';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'vendor/peerjs.min.js',
  'fonts/rajdhani-500.woff2', 'fonts/rajdhani-600.woff2', 'fonts/rajdhani-700.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('ironfront-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
function timeout(ms) { return new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)); }
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin !== location.origin) return;                 // PeerJS signalling, STUN/TURN etc. go straight out
  const scope = new URL(self.registration.scope).pathname;  // /iron-front/
  if (!u.pathname.startsWith(scope)) return;
  const rel = u.pathname.slice(scope.length);
  const isPage = req.mode === 'navigate' || rel === '' || rel === 'index.html';
  if (isPage) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try {
        const r = await Promise.race([fetch(req, { cache: 'no-cache' }), timeout(4000)]);
        if (r && r.ok) { c.put('index.html', r.clone()); return r; }
        throw new Error('bad status');
      } catch (err) {
        return (await c.match('index.html')) || (await c.match('./')) || new Response('Offline and not cached yet. Open the game once while online.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      }
    })());
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    const r = await fetch(req);
    if (r && r.ok) c.put(req, r.clone());
    return r;
  })());
});
