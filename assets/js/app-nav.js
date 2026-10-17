// ============================================================
// NAKULAKU — Auto Hamburger Drawer Navigation
// ============================================================
(function () {
  if (!window.Api || !window.Icons) return;

  const profile = Api.getProfile();
  if (!profile) return;

  // Skip halaman admin (mereka punya sidebar sendiri)
  if (document.querySelector('.admin-layout')) return;

  // Skip halaman tanpa header
  const header = document.querySelector('.app-header');
  if (!header) return;

  // Tandai body agar CSS bisa menyembunyikan bottom-nav
  document.body.classList.add('app-nav-active');

  const peran = profile.peran || [];
  const isAdmin = peran.includes('pengurus') || peran.includes('super_admin');
  const isKS = peran.includes('ks');

  // Deteksi lokasi file untuk path yang benar
  const inSubfolder = window.location.pathname.includes('/ks/') || window.location.pathname.includes('/admin/');
  const prefix = inSubfolder ? '../' : '';

  // Deteksi halaman aktif
  const currentPath = window.location.pathname.split('/').pop() || 'beranda.html';
  const pageToKey = {
    'beranda.html': 'beranda',
    'pertemuan.html': 'pertemuan',
    'pertemuan-detail.html': 'pertemuan',
    'presensi.html': 'pertemuan',
    'ajukan.html': 'pertemuan',
    'tugas.html': 'pertemuan',
    'galeri.html': 'galeri',
    'award.html': 'award',
    'aktivitas.html': 'aktivitas',
    'karya.html': 'karya',
    'profil.html': 'profil',
    'sekolah.html': 'sekolah',
  };
  const currentKey = pageToKey[currentPath] || '';

  // Susun menu berdasarkan role
  const menuItems = [
    { href: prefix + 'beranda.html', icon: 'home', label: 'Beranda', key: 'beranda' },
    { href: prefix + 'beranda.html#sectionPertemuan', icon: 'calendar', label: 'Pertemuan', key: 'pertemuan' },
  ];

  // Galeri & Award: HANYA untuk Admin
  if (isAdmin) {
    menuItems.push(
      { href: prefix + 'galeri.html', icon: 'grid', label: 'Galeri Sekolah', key: 'galeri' },
      { href: prefix + 'award.html', icon: 'award', label: 'Papan Juara', key: 'award' }
    );
  }

  // Menu Umum
  menuItems.push(
    { href: prefix + 'aktivitas.html', icon: 'activity', label: 'Aktivitas Saya', key: 'aktivitas' },
    { href: prefix + 'karya.html', icon: 'sparkles', label: 'Karya Saya', key: 'karya' },
    { href: prefix + 'profil.html', icon: 'user', label: 'Profil', key: 'profil' }
  );

  // Menu Khusus KS
  if (isKS && !isAdmin) {
    menuItems.push(
      { href: prefix + 'ks/sekolah.html', icon: 'home', label: 'Sekolahku', key: 'ks-sekolah' },
      { href: prefix + 'ks/verifikasi.html', icon: 'checkCircle', label: 'Verifikasi KS', key: 'ks-verif' },
      { href: prefix + 'admin/index.html', icon: 'shield', label: 'Dashboard Admin', key: 'admin' }
    );
  }

  // Menu Khusus Admin (jika sedang di halaman guru)
  if (isAdmin) {
    menuItems.push(
      { href: prefix + 'admin/index.html', icon: 'shield', label: 'Dashboard Admin', key: 'admin' }
    );
  }

  // Buat tombol Hamburger
  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger-btn';
  hamburger.setAttribute('aria-label', 'Buka Menu');
  hamburger.innerHTML = Icons.get('menu');
  hamburger.addEventListener('click', openDrawer);
  header.insertBefore(hamburger, header.firstChild);

  // Data user untuk drawer
  const initial = (profile.nama || 'U').charAt(0).toUpperCase();
  const fotoUrl = Api.fotoSayaUrl ? Api.fotoSayaUrl('t') : null;
  const roleLabel = peran.includes('super_admin') ? 'Super Admin'
    : peran.includes('pengurus') ? 'Pengurus'
    : peran.includes('ks') ? 'Kepala Sekolah'
    : peran.includes('narasumber') ? 'Narasumber'
    : peran.includes('pengamat') ? 'Pengamat'
    : 'Peserta';

  // Bangun HTML Drawer
  const drawerHTML = `
    <div class="app-drawer-overlay" id="appDrawerOverlay"></div>
    <aside class="app-drawer" id="appDrawer">
      <div class="drawer-header">
        <div class="drawer-brand">
          <div class="drawer-brand-logo">
            <img src="${prefix}assets/img/logo-mark.svg" alt="Nakula" onerror="this.style.display='none'">
          </div>
          <div>
            <div class="drawer-brand-name">NAKULAKU</div>
            <div class="drawer-brand-sub">KKG Gugus Nakula</div>
          </div>
        </div>
        <button class="drawer-close" id="appDrawerClose" aria-label="Tutup">
          ${Icons.get('x')}
        </button>
      </div>
      <nav class="drawer-menu">
        ${menuItems.map(item => `
          <a href="${item.href}" class="drawer-item ${currentKey === item.key ? 'active' : ''}">
            ${Icons.get(item.icon, { class: 'icon' })}
            <span>${item.label}</span>
          </a>
        `).join('')}
      </nav>
      <div class="drawer-footer">
        <div class="drawer-user">
          <div class="drawer-user-avatar">
            ${initial}
            ${fotoUrl ? `<img src="${fotoUrl}" onerror="this.parentElement.textContent='${initial}'">` : ''}
          </div>
          <div style="flex:1;min-width:0;">
            <div class="drawer-user-name">${UI.escapeHtml ? UI.escapeHtml(profile.nama || '-') : profile.nama}</div>
            <div class="drawer-user-role">${roleLabel}</div>
          </div>
        </div>
      </div>
    </aside>
  `;
  document.body.insertAdjacentHTML('beforeend', drawerHTML);

  // Kontrol Buka/Tutup
  const drawer = document.getElementById('appDrawer');
  const overlay = document.getElementById('appDrawerOverlay');
  const closeBtn = document.getElementById('appDrawerClose');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', closeDrawer);
  closeBtn.addEventListener('click', closeDrawer);

  // Sembunyikan elemen bottom-nav yang ada di DOM (jika masih tersisa)
  document.querySelectorAll('.bottom-nav').forEach(el => {
    el.style.display = 'none';
  });
})();
