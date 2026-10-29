// ═══════════════════════════════════════════════
// NAKULA SERVICE WORKER
// Strategi:
//   - Supabase Edge Functions & Auth → NETWORK ONLY (jangan cache)
//   - Supabase Storage (foto)        → Stale While Revalidate
//   - HTML                           → Network First (fresh, fallback cache)
//   - CSS/JS/Font/Icon               → Cache First
//   - Lainnya                        → Network Only
// ═══════════════════════════════════════════════

const VERSION = 'nakulaku-v1.0.4';          // ⬅️ bump saat deploy update
const SHELL_CACHE = `shell-${VERSION}`;
const PAGE_CACHE  = `page-${VERSION}`;
const IMG_CACHE   = `img-${VERSION}`;

const SHELL_ASSETS = [
  './login.html',
  './offline.html',
  './manifest.json',
  './assets/css/nakula.css',
  './assets/js/icons.js',
  './assets/js/api.js',
  './assets/js/ui.js',
  './assets/js/app-nav.js',
  './assets/js/pwa.js',
  './assets/img/icon.svg',
  './assets/img/icon-maskable.svg',
];

// ─────────── INSTALL ───────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(c => Promise.allSettled(SHELL_ASSETS.map(url => c.add(url))))
      .catch(err => console.warn('[SW] Precache partial fail:', err))
  );
  self.skipWaiting();
});

// ─────────── ACTIVATE ───────────
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const keep = [SHELL_CACHE, PAGE_CACHE, IMG_CACHE];
    await Promise.all(
      keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// ─────────── FETCH ───────────
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isSupabase = /\.supabase\.co$/i.test(url.hostname);
  const isFont = /fonts\.(googleapis|gstatic)\.com$/i.test(url.hostname);

  // 1) Supabase Edge Functions & Auth → NETWORK ONLY (jangan di-cache)
  if (isSupabase && !/\/storage\/v1\//.test(url.pathname)) {
    return; // biarkan browser handle langsung
  }

  // 2) Supabase Storage (foto) → SWR
  if (isSupabase && /\/storage\/v1\//.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(req, IMG_CACHE));
    return;
  }

  // 3) Google Fonts → Cache First
  if (isFont) {
    event.respondWith(cacheFirst(req, SHELL_CACHE));
    return;
  }

  // 4) Bukan same-origin & bukan font → biarkan browser
  if (!sameOrigin) return;

  // 5) Same-origin rules
  const path = url.pathname;

  // HTML → Network First
  if (
    path.endsWith('.html') ||
    path.endsWith('/') ||
    path === '/' ||
    !/\.[a-z0-9]+$/i.test(path)  // path tanpa ekstensi dianggap halaman
  ) {
    event.respondWith(networkFirst(req, PAGE_CACHE, './offline.html'));
    return;
  }

  // CSS / JS / Font lokal → Cache First
  if (/\.(css|js|mjs|woff2?|ttf|otf)$/i.test(path)) {
    event.respondWith(cacheFirst(req, SHELL_CACHE));
    return;
  }

  // Gambar & SVG → SWR
  if (/\.(png|jpe?g|webp|gif|svg|ico|avif)$/i.test(path)) {
    event.respondWith(staleWhileRevalidate(req, IMG_CACHE));
    return;
  }

  // Sisanya → Network Only (browser default)
});

// ─────────── HELPERS ───────────
async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) {
      const c = await caches.open(cacheName);
      c.put(req, res.clone());
    }
    return res;
  } catch {
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirst(req, cacheName, offlineFallback) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const c = await caches.open(cacheName);
      c.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    if (offlineFallback) {
      const off = await caches.match(offlineFallback);
      if (off) return off;
    }
    return new Response(
      '<!DOCTYPE html><html><body style="font-family:system-ui;padding:40px;text-align:center"><h2>Offline</h2><p>Tidak ada koneksi & halaman belum pernah dibuka.</p></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cached = await caches.match(req);
  const fetching = fetch(req)
    .then(async (res) => {
      if (res.ok) {
        const c = await caches.open(cacheName);
        c.put(req, res.clone());
      }
      return res;
    })
    .catch(() => null);
  return cached || (await fetching) || new Response('', { status: 503 });
}

// ─────────── MESSAGE: force update ───────────
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});