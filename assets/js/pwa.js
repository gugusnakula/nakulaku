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
    l.href = rootPath + 'assets/img/apple-touch-icon.png';
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
// ═══════════════════════════════════════════════
// FORCE HEADER RATA KIRI (mobile + desktop)
// Dijalankan setelah app-nav.js untuk menang override
// ═══════════════════════════════════════════════
(function fixHeaderAlignment() {
  function applyFix() {
    // ── Mobile header ──
    const appHeader = document.querySelector('.app-header');
    if (appHeader) {
      appHeader.style.justifyContent = 'space-between';
      appHeader.style.textAlign = 'left';
    }

    const brand = document.querySelector('.app-header-brand');
    if (brand) {
      brand.style.justifyContent = 'flex-start';
      brand.style.textAlign = 'left';
      brand.style.flex = '1';
      brand.style.minWidth = '0';
    }

    const text = document.querySelector('.app-header-text');
    if (text) {
      text.style.textAlign = 'left';
      text.style.alignItems = 'flex-start';
      text.style.flex = '1';
      text.style.minWidth = '0';
      text.style.display = 'flex';
      text.style.flexDirection = 'column';
    }

    document.querySelectorAll('.app-header-title, .app-header-sub').forEach(el => {
      el.style.textAlign = 'left';
      el.style.width = '100%';
    });

    // ── Admin header ──
    const adminLeft = document.querySelector('.admin-header-left');
    if (adminLeft) {
      adminLeft.style.justifyContent = 'flex-start';
      adminLeft.style.textAlign = 'left';
    }
    document.querySelectorAll('.admin-header-title, .admin-header-title-1, .admin-header-title-2').forEach(el => {
      el.style.textAlign = 'left';
    });

    // ── Desktop topbar ──
    document.querySelectorAll('.desktop-topbar h1, .desktop-topbar h2, .desktop-topbar h3, .admin-topbar-title').forEach(el => {
      el.style.textAlign = 'left';
    });
  }

  // Jalan segera
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFix);
  } else {
    applyFix();
  }

  // Jalan lagi setelah delay (kalau app-nav.js inject header belakangan)
  setTimeout(applyFix, 100);
  setTimeout(applyFix, 500);

  // Jalan lagi setiap kali ada mutation (kalau app-nav.js re-render)
  const observer = new MutationObserver(() => {
    applyFix();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
