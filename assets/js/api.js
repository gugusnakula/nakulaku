// ============================================================
// NAKULAKU — API Wrapper
// Semua komunikasi ke Supabase lewat sini.
// ============================================================

(function (global) {

  const CONFIG = {
    SUPABASE_URL: 'https://qkcskwappwpdbiaotewp.supabase.co',
    ANON_KEY:     'sb_publishable_jrw1AxSZlFKym4lJPLf_EQ_Boibsp_c',
    LOGIN_URL:    'https://qkcskwappwpdbiaotewp.supabase.co/functions/v1/nakula-login',
    VERIFY_URL:   'https://qkcskwappwpdbiaotewp.supabase.co/functions/v1/nakula-verify',
    API_URL:      'https://qkcskwappwpdbiaotewp.supabase.co/functions/v1/nakula-api',
    SEKOLAH_URL:  'https://qkcskwappwpdbiaotewp.supabase.co/functions/v1/nakula-sekolah',
    TOKEN_KEY:    'nakula_token',
    PROFILE_KEY:  'nakula_profile',
    FOTO_BASE:    'https://qkcskwappwpdbiaotewp.supabase.co/storage/v1/object/public/nakula-foto',
  };

  const Api = {

    // ==================== SESI ====================

    getToken() {
      return localStorage.getItem(CONFIG.TOKEN_KEY);
    },

    getProfile() {
      try {
        const raw = localStorage.getItem(CONFIG.PROFILE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    },

    setSession(token, profile) {
      localStorage.setItem(CONFIG.TOKEN_KEY, token);
      localStorage.setItem(CONFIG.PROFILE_KEY, JSON.stringify(profile));
    },

    updateProfile(partial) {
      const p = this.getProfile() || {};
      const merged = { ...p, ...partial };
      localStorage.setItem(CONFIG.PROFILE_KEY, JSON.stringify(merged));
      return merged;
    },

    clearSession() {
      localStorage.removeItem(CONFIG.TOKEN_KEY);
      localStorage.removeItem(CONFIG.PROFILE_KEY);
    },

    logout() {
      this.clearSession();
      window.location.href = 'login.html';
    },

    // ==================== HTTP ====================

    async login(email, pin) {
      const r = await fetch(CONFIG.LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      });
      return r.json();
    },

    async verify(token) {
      const r = await fetch(CONFIG.VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      return r.json();
    },

    /**
     * Panggil action di nakula-api.
     * @param {string} action  contoh: 'pertemuan.list'
     * @param {object} extra   parameter tambahan
     */
    async call(action, extra = {}) {
      const token = this.getToken();
      const r = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.ANON_KEY,
        },
        body: JSON.stringify({ action, token, ...extra }),
      });

      // Handle error server / network
      if (!r.ok) {
        let body = {};
        try { body = await r.json(); } catch {}
        return {
          ok: false,
          error: body.error || `Server error (${r.status})`,
          status: r.status,
        };
      }
      return r.json();
    },

    /**
     * Panggil action di nakula-sekolah (fitur Profil Sekolah).
     * Butuh token — untuk guru/KS/panitia.
     */
    async callSekolah(action, extra = {}) {
      const token = this.getToken();
      const r = await fetch(CONFIG.SEKOLAH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.ANON_KEY,
        },
        body: JSON.stringify({ action, token, ...extra }),
      });

      if (!r.ok) {
        let body = {};
        try { body = await r.json(); } catch {}
        return {
          ok: false,
          error: body.error || `Server error (${r.status})`,
          status: r.status,
        };
      }
      return r.json();
    },

    /**
     * Panggil action publik di nakula-sekolah (tanpa token).
     * Untuk galeri & profil sekolah.
     */
    async callSekolahPublik(action, extra = {}) {
      const r = await fetch(CONFIG.SEKOLAH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.ANON_KEY,
        },
        body: JSON.stringify({ action, ...extra }),
      });

      if (!r.ok) {
        let body = {};
        try { body = await r.json(); } catch {}
        return {
          ok: false,
          error: body.error || `Server error (${r.status})`,
          status: r.status,
        };
      }
      return r.json();
    },
    // ==================== LOGO SEKOLAH ====================

    /**
     * URL logo sekolah (path deterministik).
     * @param {number|string} sekolahId
     * @param {string} ver  timestamp untuk cache busting (opsional)
     */
    logoUrl(sekolahId, ver = null) {
      if (!sekolahId) return null;
      const base = `${CONFIG.SUPABASE_URL}/storage/v1/object/public/nakula-logo/${sekolahId}.webp`;
      return ver ? `${base}?v=${new Date(ver).getTime()}` : base;
    },

    /**
     * HTML logo sekolah dengan fallback inisial.
     * @param {number} sekolahId
     * @param {string} nama
     * @param {number} size  ukuran px
     * @param {string} ver   logo_updated_at
     * @param {object} opts  { rounded: 'md'|'full'|'lg', border: bool }
     */
    logoHtml(sekolahId, nama, size = 40, ver = null, opts = {}) {
      // Inisial fallback — ambil 2 huruf dari nama sekolah
      const init = this.inisialSekolah(nama);
      const url = this.logoUrl(sekolahId, ver);
      const rounded = opts.rounded === 'full' ? '50%'
                    : opts.rounded === 'lg' ? '14px'
                    : '10px';
      const border = opts.border ? `border: 1.5px solid var(--gold);` : '';

      return `
        <span style="
          display:inline-flex;align-items:center;justify-content:center;
          width:${size}px;height:${size}px;border-radius:${rounded};
          background:${opts.bg || 'var(--maroon-soft)'};
          color:${opts.color || 'var(--maroon)'};
          font-weight:800;font-size:${Math.round(size * 0.38)}px;
          position:relative;overflow:hidden;flex-shrink:0;${border}
          letter-spacing:0.5px;
        ">
          <span>${UI ? UI.escapeHtml(init) : init}</span>
          ${url ? `<img src="${url}" loading="lazy" alt="${nama || ''}"
            style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"
            onerror="this.remove()">` : ''}
        </span>
      `;
    },

    /**
     * Inisial sekolah dari nama — mis. "SD Negeri 1 Krisak" → "S1K"
     */
    inisialSekolah(nama) {
      if (!nama) return '?';
      // Ambil kata yang bukan "SD", "Negeri", "SMP", dsb.
      const stop = ['sd', 'smp', 'sma', 'smk', 'negeri', 'swasta', 'n', 's'];
      const parts = String(nama).split(/\s+/).filter(w => {
        const l = w.toLowerCase();
        return l && !stop.includes(l);
      });

      if (parts.length === 0) return nama.charAt(0).toUpperCase();

      // Ambil huruf pertama tiap kata, max 3
      const initials = parts.slice(0, 3).map(w => w.charAt(0).toUpperCase()).join('');
      return initials || nama.charAt(0).toUpperCase();
    },

    // ==================== HELPERS ====================

    /**
     * URL foto profil guru.
     * @param {number|string} id  guru_id
     * @param {'t'|'full'} ukuran
     */
    fotoUrl(id, ukuran = 't') {
      if (!id) return null;
      const suf = ukuran === 't' ? '_t' : '';
      return `${CONFIG.FOTO_BASE}/${id}${suf}.webp`;
    },

    /**
     * URL foto profil saya (dari sesi).
     */
    fotoSayaUrl(ukuran = 't') {
      const p = this.getProfile();
      if (!p) return null;
      if (p.foto_thumb_url) return p.foto_thumb_url + '?v=' + Date.now();
      return this.fotoUrl(p.id, ukuran);
    },

    /**
     * Apakah saya punya peran tertentu?
     */
    hasPeran(peran) {
      const p = this.getProfile();
      if (!p) return false;
      return (p.peran || []).includes(peran);
    },

    /**
     * Apakah saya punya salah satu dari beberapa peran?
     */
    hasAnyPeran(peranList) {
      const p = this.getProfile();
      if (!p) return false;
      const saya = p.peran || [];
      return peranList.some(r => saya.includes(r));
    },

    /**
     * Cek sesi, redirect ke login kalau tidak valid.
     * Return profile kalau valid.
     */
    async requireLogin() {
      const token = this.getToken();
      if (!token) {
        window.location.href = 'login.html';
        return null;
      }
      const v = await this.verify(token);
      if (!v.valid) {
        this.clearSession();
        window.location.href = 'login.html';
        return null;
      }
      this.setSession(token, v.profile);
      return v.profile;
    },
  };

  global.Api = Api;
  global.NAKULA_CONFIG = CONFIG;

})(window);
