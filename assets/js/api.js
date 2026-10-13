// =====================================================
// NAKULA API — Wrapper komunikasi ke Supabase
// =====================================================

const NAKULA_CONFIG = {
  SUPABASE_URL: 'https://qkcskwappwpdbiaotewp.supabase.co',
  ANON_KEY: 'sb_publishable_jrw1AxSZlFKym4lJPLf_EQ_Boibsp_c',
  LOGIN_URL: 'https://qkcskwappwpdbiaotewp.supabase.co/functions/v1/nakula-login',
  VERIFY_URL: 'https://qkcskwappwpdbiaotewp.supabase.co/functions/v1/nakula-verify',
  API_URL: 'https://qkcskwappwpdbiaotewp.supabase.co/functions/v1/nakula-api',
  TOKEN_KEY: 'nakula_token',
  PROFILE_KEY: 'nakula_profile',
};

const NakulaApi = {
  // ---------- Sesi ----------
  getToken() {
    return localStorage.getItem(NAKULA_CONFIG.TOKEN_KEY);
  },
  getProfile() {
    try {
      const raw = localStorage.getItem(NAKULA_CONFIG.PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  setSession(token, profile) {
    localStorage.setItem(NAKULA_CONFIG.TOKEN_KEY, token);
    localStorage.setItem(NAKULA_CONFIG.PROFILE_KEY, JSON.stringify(profile));
  },
  clearSession() {
    localStorage.removeItem(NAKULA_CONFIG.TOKEN_KEY);
    localStorage.removeItem(NAKULA_CONFIG.PROFILE_KEY);
  },
  logout() {
    this.clearSession();
    window.location.href = 'login.html';
  },

  // ---------- HTTP ----------
  async login(email, pin) {
    const r = await fetch(NAKULA_CONFIG.LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pin }),
    });
    return r.json();
  },
  async verify(token) {
    const r = await fetch(NAKULA_CONFIG.VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return r.json();
  },
  async call(action, extra = {}) {
    const token = this.getToken();
    const r = await fetch(NAKULA_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': NAKULA_CONFIG.ANON_KEY,
      },
      body: JSON.stringify({ action, token, ...extra }),
    });
    return r.json();
  },

  // ---------- Helper foto profil (mengikuti konvensi ekosistem) ----------
  fotoUrl(ukuran = 't') {
    const p = this.getProfile();
    if (!p) return null;
    const suf = ukuran === 't' ? '_t' : '';
    // thumbnail kecil dari Supabase NAKULAKU (kalau ada)
    if (p.foto_thumb_url) return p.foto_thumb_url + '?v=' + Date.now();
    return null;
  },
  inisial(nama) {
    return (nama || 'G').trim().charAt(0).toUpperCase();
  },
};
