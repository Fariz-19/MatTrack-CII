// ==========================================================
// KONFIGURASI SUPABASE (MURNI JAVASCRIPT - TANPA .ENV)
// ==========================================================

const SUPABASE_CONFIG = {
  // Masukkan URL Supabase Anda jika ingin hardcode (misal: 'https://xyzcompany.supabase.co')
  DEFAULT_URL: 'https://uwzhnzzpoprejcrbglxu.supabase.co',
  
  // Masukkan Anon Key Supabase Anda jika ingin hardcode
  DEFAULT_ANON_KEY: 'sb_publishable_Fm9-W8tP7inInV5SYC2r9g_yFpX23Pc',
  
  // Kunci penyimpanan localStorage browser
  STORAGE_KEY_URL: 'stk_supabase_url',
  STORAGE_KEY_KEY: 'stk_supabase_anon_key',
  STORAGE_KEY_USER: 'stk_active_user',
  STORAGE_KEY_OFFLINE_TRX: 'stk_offline_transactions',
  STORAGE_KEY_OFFLINE_STOCK: 'stk_offline_stock'
};

function getActiveSupabaseConfig() {
  const storedUrl = (typeof window !== 'undefined' ? localStorage.getItem(SUPABASE_CONFIG.STORAGE_KEY_URL) || '' : '').trim();
  const storedKey = (typeof window !== 'undefined' ? localStorage.getItem(SUPABASE_CONFIG.STORAGE_KEY_KEY) || '' : '').trim();
  
  return {
    url: SUPABASE_CONFIG.DEFAULT_URL || storedurl,
    anonKey: SUPABASE_CONFIG.DEFAULT_ANON_KEY || storedkey,
  };
}

function saveActiveSupabaseConfig(url, anonKey) {
  if (typeof window !== 'undefined') {
    if (url) {
      localStorage.setItem(SUPABASE_CONFIG.STORAGE_KEY_URL, url.trim());
    } else {
      localStorage.removeItem(SUPABASE_CONFIG.STORAGE_KEY_URL);
    }
    
    if (anonKey) {
      localStorage.setItem(SUPABASE_CONFIG.STORAGE_KEY_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(SUPABASE_CONFIG.STORAGE_KEY_KEY);
    }
  }
}
