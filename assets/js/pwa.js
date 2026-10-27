// ═══════════════════════════════════════════════
// NAKULA PWA BOOTSTRAP
// - Auto-inject manifest, apple-meta, apple-touch-icon
// - Register service worker (scope = folder pwa.js)
// - Cek update tiap 60 detik
// ═══════════════════════════════════════════════
(function () {
  // ─── Cari root NAKULAKU dari lokasi pwa.js ───
  const script = document.currentScript;
  const scriptSrc = script ? script.src : '';
  const rootPath = scriptSrc.replace(/assets\/js\/pwa\.js.*$/i, '') || '/';
  // rootPath akan jadi misal: https://gugusnakula.github.io/nakulaku/

  // ─── Manifest ───
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = rootPath + 'manifest.json';
    document.head.appendChild(link);
  }

  // ─── Apple meta tags ───
  const metaTags = [
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'NAKULAKU' },
    { name: 'mobile-web-app-capable', content: 'yes' },
  ];
  metaTags.forEach(m => {
    if (!document.querySelector(`meta[name="${m.name}"]`)) {
      const el = document.createElement('meta');
      el.name = m.name;
      el.content = m.content;
      document.head.appendChild(el);
    }
  });

  // ─── Apple touch icon (iOS) ───
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const l = document.createElement('link');
    l.rel = 'apple-touch-icon';
    l.href = rootPath + 'assets/img/icon-192.png';
    document.head.appendChild(l);
  }

  // ─── Service worker ───
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(rootPath + 'service-worker.js', { scope: rootPath })
      .then((reg) => {
        console.log('[PWA] SW registered · scope:', reg.scope);

        // Cek update tiap 60 detik (kalau user buka tab lama)
        setInterval(() => {
          reg.update().catch(() => {});
        }, 60_000);

        // Kalau ada SW baru, langsung aktif
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              console.log('[PWA] Update diterapkan. Refresh untuk versi terbaru.');
            }
          });
        });
      })
      .catch((err) => console.warn('[PWA] SW gagal:', err));
  });
})();