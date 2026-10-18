// ============================================================
// NAKULAKU — Auto Hamburger Drawer Navigation (Universal)
// ============================================================
(function () {
if (!window.Api || !window.Icons) return;

const profile = Api.getProfile();
if (!profile) return;

const isAdminFolder = window.location.pathname.includes('/admin/');
const isKSFolder = window.location.pathname.includes('/ks/');
const inSubfolder = isAdminFolder || isKSFolder;
const prefix = inSubfolder ? '../' : '';

const peran = profile.peran || [];
const isAdmin = peran.includes('pengurus') || peran.includes('super_admin');
const isKS = peran.includes('ks');

// Hide menu Galeri untuk non-admin (global)
if (!isAdmin) {
  document.querySelectorAll('.galeri-menu').forEach(el => el.style.display = 'none');
}

// --- 1. SETUP DRAWER ELEMENTS (DOM) ---
let drawerHTML = `
<div class="app-drawer-overlay" id="appDrawerOverlay"></div>
<aside class="app-drawer" id="appDrawer">
  <div class="drawer-header">
    <div class="drawer-brand">
      <div class="drawer-brand-logo"><img src="${prefix}assets/img/logo-mark.svg" onerror="this.style.display='none'"></div>
      <div>
        <div class="drawer-brand-name">NAKULAKU</div>
        <div class="drawer-brand-sub">Menu Navigasi</div>
      </div>
    </div>
    <button class="drawer-close" id="appDrawerClose">${Icons.get('x')}</button>
  </div>
  <div style="flex:1; overflow-y:auto;" id="appDrawerContent"></div>
</aside>
`;
document.body.insertAdjacentHTML('beforeend', drawerHTML);

const drawer = document.getElementById('appDrawer');
const overlay = document.getElementById('appDrawerOverlay');
const closeBtn = document.getElementById('appDrawerClose');
const drawerContent = document.getElementById('appDrawerContent');

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

// --- 2. BUILD MENU BERDASARKAN ROLE & FOLDER ---

// A. KHUSUS HALAMAN ADMIN (/admin/)
if (isAdminFolder) {
const header = document.querySelector('.admin-header');
if (!header) return;

// Sembunyikan bottom-nav admin
document.querySelectorAll('.admin-bottom-nav').forEach(el => el.style.display = 'none');
document.body.style.paddingBottom = '0';

const page = window.location.pathname.split('/').pop() || 'index.html';

// Bangun Menu Admin
drawerContent.innerHTML = `
<div class="drawer-menu" style="padding-top:16px;">
  <div style="font-size:10px;font-weight:800;opacity:0.5;margin:16px 0 8px 12px;text-transform:uppercase;">Utama</div>
  <a href="index.html" class="drawer-item ${page==='index.html'?'active':''}">${Icons.get('layoutDashboard')} Dashboard</a>
  <a href="guru.html" class="drawer-item ${page==='guru.html'?'active':''}">${Icons.get('users')} Data Guru</a>
  <a href="pertemuan.html" class="drawer-item ${page==='pertemuan.html'?'active':''}">${Icons.get('calendar')} Pertemuan</a>
  <a href="verifikasi-sekolah.html" class="drawer-item ${page==='verifikasi-sekolah.html'?'active':''}">${Icons.get('checkCircle')} Verifikasi</a>
  
  <div style="font-size:10px;font-weight:800;opacity:0.5;margin:16px 0 8px 12px;text-transform:uppercase;">Lainnya</div>
  <a href="periode.html" class="drawer-item ${page==='periode.html'?'active':''}">${Icons.get('calendar')} Periode</a>
  <a href="pengumuman.html" class="drawer-item ${page==='pengumuman.html'?'active':''}">${Icons.get('megaphone')} Pengumuman</a>
  <a href="award.html" class="drawer-item ${page==='award.html'?'active':''}">${Icons.get('award')} Award</a>
  <a href="analitik.html" class="drawer-item ${page==='analitik.html'?'active':''}">${Icons.get('activity')} Analitik</a>
  <a href="pengaturan.html" class="drawer-item ${page==='pengaturan.html'?'active':''}">${Icons.get('settings')} Pengaturan</a>
</div>
`;

// Buat Tombol Hamburger Admin
const hamburger = document.createElement('button');
hamburger.className = 'admin-menu-btn'; // Pastikan class ini ada di layout.css / nakula.css
hamburger.style.marginRight = '8px';
hamburger.innerHTML = Icons.get('menu');
hamburger.onclick = openDrawer;

const headerLeft = header.querySelector('.admin-header-left');
if (headerLeft) {
// Sembunyikan tombol back (chevronLeft) lama karena kita sudah pakai hamburger
const backBtn = headerLeft.querySelector('a.admin-header-btn[href="index.html"]');
if (backBtn && page !== 'index.html') backBtn.style.display = 'none';

headerLeft.insertBefore(hamburger, headerLeft.firstChild);
}
return;
}

// B. KHUSUS GURU & KS (ROOT & /ks/)
const header = document.querySelector('.app-header');
if (!header) return;

document.body.classList.add('app-nav-active');
document.querySelectorAll('.bottom-nav').forEach(el => el.style.display = 'none');

const file = window.location.pathname.split('/').pop() || 'beranda.html';
let currentKey = '';
if (isKSFolder && file === 'sekolah.html') currentKey = 'ks-sekolah';
else if (isKSFolder && file === 'verifikasi.html') currentKey = 'ks-verif';
else if (file === 'beranda.html') currentKey = 'beranda';
else if (['pertemuan.html', 'presensi.html', 'ajukan.html', 'tugas.html'].includes(file)) currentKey = 'pertemuan';
else if (file === 'galeri.html') currentKey = 'galeri';
else if (file === 'award.html') currentKey = 'award';
else if (file === 'aktivitas.html') currentKey = 'aktivitas';
else if (file === 'karya.html') currentKey = 'karya';
else if (file === 'narsum.html') currentKey = 'narsum';
else if (file === 'profil.html') currentKey = 'profil';

const menuItems = [
{ href: prefix + 'beranda.html', icon: 'home', label: 'Beranda', key: 'beranda' },
{ href: prefix + 'beranda.html#sectionPertemuan', icon: 'calendar', label: 'Pertemuan', key: 'pertemuan' },
];

if (isAdmin) {
menuItems.push(
{ href: prefix + 'galeri.html', icon: 'grid', label: 'Galeri Sekolah', key: 'galeri' },
{ href: prefix + 'award.html', icon: 'award', label: 'Papan Juara', key: 'award' }
);
}

menuItems.push(
{ href: prefix + 'aktivitas.html', icon: 'activity', label: 'Aktivitas Saya', key: 'aktivitas' },
{ href: prefix + 'karya.html', icon: 'sparkles', label: 'Karya Saya', key: 'karya' },
{ href: prefix + 'profil.html', icon: 'user', label: 'Profil', key: 'profil' }
);

if (isKS && !isAdmin) {
menuItems.push(
{ href: prefix + 'ks/sekolah.html', icon: 'home', label: 'Sekolahku', key: 'ks-sekolah' },
{ href: prefix + 'ks/verifikasi.html', icon: 'checkCircle', label: 'Verifikasi Izin', key: 'ks-verif' },
);
}
  // MENU NARASUMBER
  if (peran.includes('narasumber') && !isAdmin) {
    menuItems.push(
      { href: prefix + 'narsum.html', icon: 'edit', label: 'Penilaian Tugas', key: 'narsum' }
    );
  }
const initial = (profile.nama || 'U').charAt(0).toUpperCase();
const fotoUrl = Api.fotoSayaUrl ? Api.fotoSayaUrl('t') : null;
const roleLabel = isAdmin ? 'Admin' : (isKS ? 'Kepala Sekolah' : 'Guru');

drawerContent.innerHTML = `
<nav class="drawer-menu">
  ${menuItems.map(item => `
  <a href="${item.href}" class="drawer-item ${currentKey === item.key ? 'active' : ''}">
    ${Icons.get(item.icon, { class: 'icon' })} <span>${item.label}</span>
  </a>
  `).join('')}
</nav>
<div class="drawer-footer">
  <div class="drawer-user">
    <div class="drawer-user-avatar">${initial}${fotoUrl ? `<img src="${fotoUrl}">` : ''}</div>
    <div style="flex:1;min-width:0;">
      <div class="drawer-user-name">${UI.escapeHtml ? UI.escapeHtml(profile.nama) : profile.nama}</div>
      <div class="drawer-user-role">${roleLabel}</div>
    </div>
  </div>
</div>
`;

const hamburger = document.createElement('button');
hamburger.className = 'hamburger-btn';
hamburger.innerHTML = Icons.get('menu');
hamburger.onclick = openDrawer;

// Sembunyikan tombol back/chevron kiri lama
const backBtn = header.querySelector('a.header-btn[href="beranda.html"]');
if (backBtn) backBtn.style.display = 'none';

header.insertBefore(hamburger, header.firstChild);
})();
