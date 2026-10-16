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
