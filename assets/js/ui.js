// ============================================================
// NAKULAKU — UI Helpers
// Fungsi bantu tampilan: toast, format, skeleton, empty state.
// ============================================================

(function (global) {

  const UI = {

    // ==================== TOAST ====================

    /**
     * Tampilkan notifikasi kecil di atas layar.
     * @param {string} pesan
     * @param {'info'|'success'|'error'|'warning'} tipe
     * @param {number} durasiMs
     */
    toast(pesan, tipe = 'info', durasiMs = 3000) {
      let wrap = document.querySelector('.toast-wrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'toast-wrap';
        document.body.appendChild(wrap);
      }
      const el = document.createElement('div');
      el.className = `toast ${tipe}`;
      el.textContent = pesan;
      wrap.appendChild(el);

      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-8px)';
        el.style.transition = 'all .25s ease';
        setTimeout(() => el.remove(), 250);
      }, durasiMs);
    },

    sukses(pesan) { this.toast(pesan, 'success'); },
    gagal(pesan) { this.toast(pesan, 'error'); },
    info(pesan) { this.toast(pesan, 'info'); },
    peringatan(pesan) { this.toast(pesan, 'warning'); },

    // ==================== FORMAT ====================

    /**
     * Format tanggal panjang: "15 Januari 2026"
     */
    formatTanggal(input) {
      if (!input) return '-';
      const d = input instanceof Date ? input : new Date(input);
      if (isNaN(d)) return '-';
      return d.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    },

    /**
     * Format tanggal pendek: "15 Jan 2026"
     */
    formatTanggalPendek(input) {
      if (!input) return '-';
      const d = input instanceof Date ? input : new Date(input);
      if (isNaN(d)) return '-';
      return d.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    },

    /**
     * Format jam: "08:30"
     */
    formatJam(input) {
      if (!input) return '-';
      // input 'HH:MM:SS' atau Date
      if (typeof input === 'string' && /^\d{2}:\d{2}/.test(input)) {
        return input.slice(0, 5);
      }
      const d = input instanceof Date ? input : new Date(input);
      if (isNaN(d)) return '-';
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    },

    /**
     * Format "3 jam lalu", "kemarin", dll.
     */
    timeAgo(input) {
      if (!input) return '-';
      const d = input instanceof Date ? input : new Date(input);
      if (isNaN(d)) return '-';
      const detik = Math.floor((Date.now() - d.getTime()) / 1000);
      if (detik < 60) return 'baru saja';
      if (detik < 3600) return Math.floor(detik / 60) + ' menit lalu';
      if (detik < 86400) return Math.floor(detik / 3600) + ' jam lalu';
      if (detik < 604800) return Math.floor(detik / 86400) + ' hari lalu';
      return this.formatTanggalPendek(d);
    },

    /**
     * Format tanggal + jam: "15 Jan 2026 · 08:30"
     */
    formatTanggalJam(input) {
      if (!input) return '-';
      const d = input instanceof Date ? input : new Date(input);
      if (isNaN(d)) return '-';
      return `${this.formatTanggalPendek(d)} · ${this.formatJam(d)}`;
    },

    // ==================== KEAMANAN ====================

    /**
     * Escape HTML — wajib sebelum menampilkan input user.
     */
    escapeHtml(s) {
      return String(s ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;',
        '"': '&quot;', "'": '&#39;'
      }[c]));
    },

    // ==================== FOTO PROFIL ====================

    /**
     * HTML foto profil dengan fallback inisial.
     * @param {number|string} guruId
     * @param {string} nama
     * @param {number} size  ukuran px
     * @param {object} opts  { rounded: 'md'|'full', border: bool }
     */
    fotoHtml(guruId, nama, size = 40, opts = {}) {
      const init = (nama || 'G').trim().charAt(0).toUpperCase();
      const url = Api.fotoUrl(guruId, 't');
      const rounded = opts.rounded === 'full' ? '50%' : (opts.rounded === 'md' ? '12px' : '8px');
      const border = opts.border ? `border: 2px solid var(--gold);` : '';
      return `
        <span style="
          display:inline-flex;align-items:center;justify-content:center;
          width:${size}px;height:${size}px;border-radius:${rounded};
          background:var(--maroon-soft);color:var(--maroon);
          font-weight:800;font-size:${Math.round(size * 0.42)}px;
          position:relative;overflow:hidden;flex-shrink:0;${border}
        ">
          <span>${UI.escapeHtml(init)}</span>
          ${url ? `<img src="${url}" loading="lazy" alt="${UI.escapeHtml(nama)}"
            style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"
            onerror="this.remove()">` : ''}
        </span>
      `;
    },

    /**
     * HTML ikon Lucide-style. Panggil Icons.get().
     */
    icon(name, cls = '') {
      return global.Icons ? Icons.get(name, { class: cls }) : '';
    },

    // ==================== LOADING ====================

    /**
     * Skeleton block untuk placeholder.
     */
    skeleton(height = 20, width = '100%', radius = '8px') {
      return `<div class="skeleton" style="height:${height}px;width:${width};border-radius:${radius};"></div>`;
    },

    /**
     * Skeleton list — banyak baris.
     */
    skeletonList(jumlah = 3, tinggi = 72) {
      return Array(jumlah).fill(0).map(() =>
        `<div class="skeleton" style="height:${tinggi}px;border-radius:16px;margin-bottom:10px;"></div>`
      ).join('');
    },

    // ==================== EMPTY STATE ====================

    /**
     * Tampilan saat data kosong.
     */
    emptyHtml(ikon = 'info', judul = 'Belum ada data', deskripsi = '') {
      return `
        <div class="empty">
          <div class="empty-icon">${UI.icon(ikon, 'icon-xl')}</div>
          <div class="empty-title">${UI.escapeHtml(judul)}</div>
          ${deskripsi ? `<div class="empty-desc">${UI.escapeHtml(deskripsi)}</div>` : ''}
        </div>
      `;
    },

    /**
     * Tampilan error.
     */
    errorHtml(pesan = 'Terjadi kesalahan.', aksi = '') {
      return `
        <div class="empty">
          <div class="empty-icon" style="color:var(--danger)">${UI.icon('alertCircle', 'icon-xl')}</div>
          <div class="empty-title">Ups…</div>
          <div class="empty-desc">${UI.escapeHtml(pesan)}</div>
          ${aksi}
        </div>
      `;
    },

    // ==================== MODAL ====================

    /**
     * Modal sederhana.
     * @returns {Promise<boolean>} resolve true kalau konfirmasi.
     */
    konfirmasi(judul, pesan, opts = {}) {
      const okText = opts.okText || 'Ya';
      const cancelText = opts.cancelText || 'Batal';
      const danger = opts.danger ? 'background:var(--danger)' : '';

      return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position:fixed;inset:0;background:rgba(28,20,20,.5);
          display:flex;align-items:center;justify-content:center;
          padding:20px;z-index:1000;animation:toast-in .2s ease;
        `;
        overlay.innerHTML = `
          <div style="
            background:white;border-radius:20px;padding:24px;
            max-width:400px;width:100%;box-shadow:var(--sh-xl);
          ">
            <h3 style="font-size:17px;margin-bottom:8px;color:var(--ink)">${UI.escapeHtml(judul)}</h3>
            <p style="color:var(--muted);font-size:13.5px;line-height:1.55;margin-bottom:20px;">
              ${UI.escapeHtml(pesan)}
            </p>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
              <button data-act="cancel" class="btn btn-ghost btn-sm">${UI.escapeHtml(cancelText)}</button>
              <button data-act="ok" class="btn btn-primary btn-sm" style="${danger}">${UI.escapeHtml(okText)}</button>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) { overlay.remove(); resolve(false); }
        });
        overlay.querySelector('[data-act="cancel"]').addEventListener('click', () => {
          overlay.remove(); resolve(false);
        });
        overlay.querySelector('[data-act="ok"]').addEventListener('click', () => {
          overlay.remove(); resolve(true);
        });
      });
    },

    /**
     * Modal informasi (tanpa konfirmasi).
     */
    modal(judul, isiHtml, opts = {}) {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(28,20,20,.5);
        display:flex;align-items:center;justify-content:center;
        padding:20px;z-index:1000;
      `;
      overlay.innerHTML = `
        <div style="
          background:white;border-radius:20px;padding:24px;
          max-width:480px;width:100%;max-height:85vh;overflow-y:auto;
          box-shadow:var(--sh-xl);
        ">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
            <h3 style="font-size:17px;color:var(--ink)">${UI.escapeHtml(judul)}</h3>
            <button data-act="close" class="btn-icon">${UI.icon('x')}</button>
          </div>
          <div>${isiHtml}</div>
        </div>
      `;
      document.body.appendChild(overlay);

      const close = () => overlay.remove();
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
      });
      overlay.querySelector('[data-act="close"]').addEventListener('click', close);
      return close;
    },

    // ==================== LOADING STATE ====================

    /**
     * Set tombol jadi loading.
     */
    btnLoading(btn, teks = 'Memproses…') {
      if (!btn) return;
      btn.dataset.originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `
        <span style="display:inline-flex;align-items:center;gap:8px;">
          <span style="
            width:14px;height:14px;border:2px solid rgba(255,255,255,.3);
            border-top-color:white;border-radius:50%;
            animation:spin .7s linear infinite;
          "></span>
          ${UI.escapeHtml(teks)}
        </span>
      `;
      if (!document.getElementById('nakulaSpinStyle')) {
        const s = document.createElement('style');
        s.id = 'nakulaSpinStyle';
        s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
        document.head.appendChild(s);
      }
    },

    btnReset(btn) {
      if (!btn || !btn.dataset.originalHtml) return;
      btn.innerHTML = btn.dataset.originalHtml;
      btn.disabled = false;
      delete btn.dataset.originalHtml;
    },

    // ==================== SESSION UI ====================

    /**
     * Render info user di header (nama, foto).
     * Cari elemen dengan id: headerNama, headerFoto.
     */
    renderUserHeader(profile) {
      const namaEl = document.getElementById('headerNama');
      if (namaEl) namaEl.textContent = profile.nama || '-';

      const fotoEl = document.getElementById('headerFoto');
      if (fotoEl) {
        fotoEl.innerHTML = this.fotoHtml(profile.id, profile.nama, 32, { rounded: 'full' });
      }

      const chipEl = document.getElementById('userChip');
      if (chipEl) {
        chipEl.innerHTML = `
          ${this.fotoHtml(profile.id, profile.nama, 28, { rounded: 'full' })}
          <span>${this.escapeHtml(profile.nama)}</span>
        `;
      }
    },

    // ==================== NAVIGASI ====================

    /**
     * Tandai menu bottom nav yang aktif.
     * @param {string} nama  'beranda' | 'pertemuan' | 'tugas' | 'presensi' | 'profil'
     */
    setNavActive(nama) {
      document.querySelectorAll('.nav-item, .sidebar-item').forEach(el => {
        el.classList.toggle('active', el.dataset.nav === nama);
      });
    },

    /**
     * Pasang listener logout ke semua tombol dengan data-act="logout".
     */
    bindLogout() {
      document.querySelectorAll('[data-act="logout"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const ok = await this.konfirmasi('Keluar', 'Yakin ingin keluar dari akun Anda?', { danger: true, okText: 'Keluar' });
          if (ok) Api.logout();
        });
      });
    },
  };

  global.UI = UI;

})(window);
