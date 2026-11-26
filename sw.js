// WOAH app: keeps a copy of the pages, scripts and pictures on the phone, so the app opens (and the POS can sell)
// with bad or no wifi. Always tries the internet first, so changes to the site show up straight away when online.
// Chris's data (script.google.com) is never stored here: the pages handle that themselves.
const CACHE = 'woah-app-v12';
const SHELL = [
  './', 'index.html', 'home.html', 'handlers.html', 'email.html', 'partners.html', 'profile.html', 'pipeline.html', 'shop.html',
  'sell.html', 'stock.html', 'gaps.html', 'control.html', 'install.html',
  'style.css?v=11', 'woah.css?v=6', 'common.js?v=14', 'extras.js?v=3', 'phone.js?v=6', 'home.js?v=2', 'phone.css?v=4', 'handle.js?v=13', 'mass.js?v=2', 'outreach.js?v=4',
  'practice.js?v=5', 'reach.js?v=2', 'theme.js?v=8',
  'img/icon.png?v=2', 'img/chris.webp', 'img/logo-light.webp', 'img/logo-dark.webp', 'img/xendit-qr.png',
  'app.webmanifest', 'pos.webmanifest', 'img/app/icon-192.png', 'img/app/pos-icon-192.png'
];

self.addEventListener('install', (e) => {
  // One missing file must not stop the app installing, so each is added on its own.
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // only our own files; never Chris's data
  e.respondWith(
    // pages are always checked with the server (not the browser's 10-minute copy), so a new version shows up straight away
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
