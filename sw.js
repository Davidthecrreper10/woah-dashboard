const CACHE = 'woah-app-v15';
const SHELL = [
  './', 'index.html', 'home.html', 'handlers.html', 'email.html', 'partners.html', 'profile.html', 'pipeline.html', 'shop.html',
  'sell.html', 'stock.html', 'gaps.html', 'control.html', 'install.html',
  'style.css?v=12', 'woah.css?v=7', 'ledger.css?v=1', 'tide.css?v=2', 'common.js?v=14', 'extras.js?v=3', 'phone.js?v=6', 'home.js?v=2', 'phone.css?v=4', 'handle.js?v=13', 'mass.js?v=2', 'outreach.js?v=4',
  'practice.js?v=5', 'reach.js?v=2', 'theme.js?v=11',
  'img/icon.png?v=2', 'img/chris.webp', 'img/logo-light.webp', 'img/logo-dark.webp', 'img/xendit-qr.png',
  'app.webmanifest', 'pos.webmanifest', 'img/app/icon-192.png', 'img/app/pos-icon-192.png'
];

self.addEventListener('install', (e) => {
  // add one by one so a missing file doesn't break install
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // only our own files; never Chris's data
  e.respondWith(
    // pages bypass the HTTP cache
    fetch(req.mode === 'navigate' ? new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : req).then((res) => {
      if (res && res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match(req, { ignoreSearch: true })).then((hit) => {
      if (hit) return hit;
      if (req.mode === 'navigate') return caches.match('index.html');
      return new Response('', { status: 504, statusText: 'Offline' });
    }))
  );
});
