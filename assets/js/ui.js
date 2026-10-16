// ============================================================
// NAKULAKU — UI Helpers v2
// ============================================================

(function (global) {

  const UI = {

    // ==================== TOAST ====================
    toast(pesan, tipe = 'info', durasiMs = 3200) {
      let wrap = document.querySelector('.toast-wrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'toast-wrap';
        document.body.appendChild(wrap);
      }
      const el = document.createElement('div');
      el.className = `toast ${tipe}`;

      const iconMap = {
        success: 'checkCircle',
        error: 'alertCircle',
        warning: 'alertTriangle',
        info: 'info',
      };
      const iconName = iconMap[tipe] || 'info';
      const svg = global.Icons ? Icons.get(iconName, { class: 'icon-sm' }) : '';

      el.innerHTML = `${svg}<span>${String(pesan)}</span>`;
      wrap.appendChild(el);

      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-12px)';
        el.style.transition = 'all .3s var(--ease-out)';
        setTimeout(() => el.remove(), 300);
      }, durasiMs);
    },

    sukses(pesan) { this.toast(pesan, 'success'); },
    gagal(pesan) { this.toast(pesan, 'error'); },
    info(pesan) { this.toast(pesan, 'info'); },
    peringatan(pesan) { this.toast(pesan, 'warning'); },

    // ==================== FORMAT ====================
    formatTanggal(input) {
      if (!input) return '-';
      const d = input instanceof Date ? input : new Date(input);
      if (isNaN(d)) return '-';
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    },

    formatTanggalPendek(input) {
      if (!input) return '-';
      const d = input instanceof Date ? input : new Date(input);
      if (isNaN(d)) return '-';
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    formatJam(input) {
      if (!input) return '-';
      if (typeof input === 'string' && /^\d{2}:\d{2}/.test(input)) return input.slice(0, 5);
      const d = input instanceof Date ? input : new Date(input);
      if (isNaN(d)) return '-';
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    },

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

    formatTanggalJam(input) {
      if (!input) return '-';
      const d = input instanceof Date ? input : new Date(input);
      if (isNaN(d)) return '-';
      return `${this.formatTanggalPendek(d)} · ${this.formatJam(d)}`;
    },

    /**
     * Extract thumbnail dari URL (YouTube, Google Drive, atau image langsung).
     * Return URL gambar atau null kalau tidak bisa.
     */
    thumbnail(url) {
      if (!url || typeof url !== 'string') return null;
      try {
        // YouTube: youtube.com/watch?v=X, youtu.be/X, youtube.com/shorts/X, embed/X
        const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/#]+)/);
        if (yt && yt[1]) {
          return `https://img.youtube.com/vi/${yt[1]}/mqdefault.jpg`;
        }

        // Google Drive: drive.google.com/file/d/FILE_ID/...
        const gd = url.match(/\/d\/([^/?#]+)/);
        if (gd && gd[1]) {
          return `https://drive.google.com/thumbnail?id=${gd[1]}&sz=w400`;
        }
        // Google Drive: drive.google.com/open?id=FILE_ID
        const gdOpen = url.match(/[?&]id=([^&]+)/);
        if (gdOpen && url.includes('drive.google.com') && gdOpen[1]) {
          return `https://drive.google.com/thumbnail?id=${gdOpen[1]}&sz=w400`;
        }

        // Direct image
        if (/\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(url)) return url;

        // Google Photos (thumbnail) — kadang bisa
        // Skip karena biasanya butuh auth
      } catch {}
      return null;
    },

    /**
     * Handler fallback logo — dipanggil dari `onerror` di <img>.
     * Aman dari null reference.
     */
    fotoError(img) {
      try {
        const parent = img.parentElement;
        if (parent) {
          const fallback = parent.querySelector('.fallback, .fallback-icon');
          if (fallback) fallback.style.display = 'flex';
        }
      } catch (e) {
        console.warn('fotoError:', e);
      }
      img.remove();
    },

    // ==================== KEAMANAN ====================
    escapeHtml(s) {
      return String(s ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;',
        '"': '&quot;', "'": '&#39;'
      }[c]));
    },

    // ==================== FOTO PROFIL ====================
    fotoHtml(guruId, nama, size = 40, opts = {}) {
      const init = (nama || 'G').trim().charAt(0).toUpperCase();
      const url = global.Api ? Api.fotoUrl(guruId, 't') : null;
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

    icon(name, cls = '') {
      return global.Icons ? Icons.get(name, { class: cls }) : '';
    },

    // ==================== LOADING ====================
    skeleton(height = 20, width = '100%', radius = '8px') {
      return `<div class="skeleton" style="height:${height}px;width:${width};border-radius:${radius};"></div>`;
    },

    skeletonList(jumlah = 3, tinggi = 72) {
      return Array(jumlah).fill(0).map(() =>
        `<div class="skeleton" style="height:${tinggi}px;border-radius:16px;margin-bottom:10px;"></div>`
      ).join('');
    },

    skeletonCard() {
      return `
        <div class="skeleton-card">
          <div class="row">
            <div class="skeleton" style="width:40px;height:40px;border-radius:12px;"></div>
            <div style="flex:1;">
              <div class="skeleton" style="height:14px;width:60%;border-radius:6px;margin-bottom:6px;"></div>
              <div class="skeleton" style="height:11px;width:40%;border-radius:6px;"></div>
            </div>
          </div>
          <div class="skeleton" style="height:11px;width:80%;border-radius:6px;margin-bottom:6px;"></div>
          <div class="skeleton" style="height:11px;width:50%;border-radius:6px;"></div>
        </div>
      `;
    },

    // ==================== EMPTY STATE ====================
    emptyHtml(ikon = 'info', judul = 'Belum ada data', deskripsi = '') {
      return `
        <div class="empty">
          <div class="empty-icon">${UI.icon(ikon, 'icon-lg')}</div>
          <div class="empty-title">${UI.escapeHtml(judul)}</div>
          ${deskripsi ? `<div class="empty-desc">${UI.escapeHtml(deskripsi)}</div>` : ''}
        </div>
      `;
    },

    errorHtml(pesan = 'Terjadi kesalahan.', aksi = '') {
      return `
        <div class="empty">
          <div class="empty-icon" style="background:var(--danger-soft);color:var(--danger);">${UI.icon('alertCircle', 'icon-lg')}</div>
          <div class="empty-title">Ups…</div>
          <div class="empty-desc">${UI.escapeHtml(pesan)}</div>
          ${aksi}
        </div>
      `;
    },

    // ==================== MODAL / KONFIRMASI ====================
    konfirmasi(judul, pesan, opts = {}) {
      const okText = opts.okText || 'Ya';
      const cancelText = opts.cancelText || 'Batal';
      const danger = opts.danger;

      return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'bottom-sheet-overlay';
        overlay.innerHTML = `
          <div class="bottom-sheet">
            <div class="bottom-sheet-handle"></div>
            <h3 style="font-size:17px;margin-bottom:8px;color:var(--ink)">${UI.escapeHtml(judul)}</h3>
            <p style="color:var(--muted);font-size:13.5px;line-height:1.55;margin-bottom:20px;">
              ${UI.escapeHtml(pesan)}
            </p>
            <div style="display:flex;gap:10px;">
              <button data-act="cancel" class="btn btn-ghost" style="flex:1;">${UI.escapeHtml(cancelText)}</button>
              <button data-act="ok" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" style="flex:2;">${UI.escapeHtml(okText)}</button>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = (val) => {
          overlay.style.opacity = '0';
          overlay.style.transition = 'opacity .2s';
          setTimeout(() => { overlay.remove(); resolve(val); }, 200);
        };
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
        overlay.querySelector('[data-act="cancel"]').addEventListener('click', () => close(false));
        overlay.querySelector('[data-act="ok"]').addEventListener('click', () => close(true));
      });
    },

    modal(judul, isiHtml, opts = {}) {
      const overlay = document.createElement('div');
      overlay.className = 'bottom-sheet-overlay';
      overlay.innerHTML = `
        <div class="bottom-sheet">
          <div class="bottom-sheet-handle"></div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <h3 style="font-size:17px;color:var(--maroon);margin:0;">${UI.escapeHtml(judul)}</h3>
            <button data-act="close" class="btn-icon">${UI.icon('x')}</button>
          </div>
          <div>${isiHtml}</div>
        </div>
      `;
      document.body.appendChild(overlay);

      const close = () => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity .2s';
        setTimeout(() => overlay.remove(), 200);
      };
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
      overlay.querySelector('[data-act="close"]').addEventListener('click', close);
      return close;
    },

    // ==================== BUTTON LOADING ====================
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
    },

    btnReset(btn) {
      if (!btn || !btn.dataset.originalHtml) return;
      btn.innerHTML = btn.dataset.originalHtml;
      btn.disabled = false;
      delete btn.dataset.originalHtml;
    },

    // ==================== SESSION UI ====================
    renderUserHeader(profile) {
      const namaEl = document.getElementById('headerNama');
      if (namaEl) namaEl.textContent = profile.nama || '-';

      const fotoEl = document.getElementById('headerFoto');
      if (fotoEl) fotoEl.innerHTML = this.fotoHtml(profile.id, profile.nama, 32, { rounded: 'full' });

      const chipEl = document.getElementById('userChip');
      if (chipEl) {
        chipEl.innerHTML = `
          ${this.fotoHtml(profile.id, profile.nama, 28, { rounded: 'full' })}
          <span>${this.escapeHtml(profile.nama)}</span>
        `;
      }
    },

    // ==================== NAVIGASI ====================
    setNavActive(nama) {
      document.querySelectorAll('.nav-item, .sidebar-item').forEach(el => {
        el.classList.toggle('active', el.dataset.nav === nama);
      });
    },

    bindLogout() {
      document.querySelectorAll('[data-act="logout"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const ok = await this.konfirmasi('Keluar', 'Yakin ingin keluar dari akun Anda?', { danger: true, okText: 'Keluar' });
          if (ok && global.Api) Api.logout();
        });
      });
    },

    // ==================== KOMPONEN BARU v2 ====================

    /**
     * Progress bar horizontal.
     * @param {number} persen  0-100
     * @param {string} label   label kiri (opsional)
     */
    progressBar(persen, label = '') {
      const p = Math.max(0, Math.min(100, persen));
      return `
        <div class="progress-label">
          <span>${UI.escapeHtml(label)}</span>
          <span class="persen">${p}%</span>
        </div>
        <div class="progress-bar"><div style="width:${p}%"></div></div>
      `;
    },

    /**
     * Progress steps horizontal.
     * @param {Array} steps  [{ label, status: 'done'|'active'|'pending' }]
     */
    progressSteps(steps) {
      return `
        <div class="progress-steps">
          ${steps.map((s, i) => {
            const cls = s.status === 'done' ? 'done' : s.status === 'active' ? 'active' : '';
            const dot = s.status === 'done'
              ? (global.Icons ? Icons.get('check', { class: 'icon-sm' }) : '✓')
              : (i + 1);
            return `
              <div class="step ${cls}">
                ${i > 0 ? `<div class="step-line"></div>` : ''}
                <div class="step-dot">${dot}</div>
                <div class="step-label">${UI.escapeHtml(s.label)}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    },

    /**
     * Avatar group.
     * @param {Array} users  [{ id, nama_lengkap }]
     * @param {number} max   maksimal yang ditampilkan
     */
    avatarGroup(users, max = 5) {
      const list = users.slice(0, max);
      const sisa = users.length - max;
      return `
        <div class="avatar-group">
          ${list.map(u => {
            const init = (u.nama_lengkap || '?').charAt(0).toUpperCase();
            const url = global.Api ? Api.fotoUrl(u.id, 't') : null;
            return `
              <div class="av" title="${UI.escapeHtml(u.nama_lengkap)}">
                <span>${init}</span>
                ${url ? `<img src="${url}" onerror="this.remove()">` : ''}
              </div>
            `;
          }).join('')}
          ${sisa > 0 ? `<div class="av more">+${sisa}</div>` : ''}
        </div>
      `;
    },

    /**
     * Stat card.
     */
    statCard(ikon, nilai, label, opts = {}) {
      const trendHtml = opts.trend
        ? `<div class="trend ${opts.trendarah || 'up'}">${opts.trend}</div>`
        : '';
      return `
        <div class="stat-card">
          <div class="icon-wrap">${UI.icon(ikon, 'icon-sm')}</div>
          <div class="value">${UI.escapeHtml(String(nilai))}</div>
          <div class="label">${UI.escapeHtml(label)}</div>
          ${trendHtml}
        </div>
      `;
    },

    /**
     * Timeline item.
     */
    timelineItem(judul, sub, waktu, status = '') {
      return `
        <div class="tl-item ${status}">
          <div class="tl-dot"></div>
          <div class="tl-title">${UI.escapeHtml(judul)}</div>
          ${sub ? `<div class="tl-sub">${UI.escapeHtml(sub)}</div>` : ''}
          ${waktu ? `<div class="tl-time">${UI.escapeHtml(waktu)}</div>` : ''}
        </div>
      `;
    },

    /**
     * Bottom sheet — sebagai pengganti modal di mobile.
     * @returns {Function} close()
     */
    sheet(isiHtml, opts = {}) {
      const overlay = document.createElement('div');
      overlay.className = 'bottom-sheet-overlay';
      overlay.innerHTML = `
        <div class="bottom-sheet">
          <div class="bottom-sheet-handle"></div>
          ${opts.judul ? `<h3 style="font-size:17px;color:var(--maroon);margin-bottom:16px;">${UI.escapeHtml(opts.judul)}</h3>` : ''}
          <div>${isiHtml}</div>
        </div>
      `;
      document.body.appendChild(overlay);

      const close = () => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity .2s';
        setTimeout(() => overlay.remove(), 200);
      };
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
      return close;
    },

    /**
     * Skeleton dengan struktur lengkap — untuk list yang kaya.
     */
    skeletonRichList(jumlah = 3) {
      return Array(jumlah).fill(0).map(() => this.skeletonCard()).join('');
    },
  };

  global.UI = UI;

})(window);
