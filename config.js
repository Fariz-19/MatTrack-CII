// ==========================================================
// KONFIGURASI SUPABASE
// ==========================================================

const SUPABASE_CONFIG = {
  DEFAULT_URL: 'https://uwzhnzzpoprejcrbglxu.supabase.co',

  DEFAULT_ANON_KEY: 'sb_publishable_Fm9-W8tP7inInV5SYC2r9g_yFpX23Pc',

  STORAGE_KEY_URL: 'stk_supabase_url',
  STORAGE_KEY_KEY: 'stk_supabase_anon_key',
  STORAGE_KEY_USER: 'stk_active_user',
  STORAGE_KEY_OFFLINE_TRX: 'stk_offline_transactions',
  STORAGE_KEY_OFFLINE_STOCK: 'stk_offline_stock'
};

function getActiveSupabaseConfig() {
  return {
    url: SUPABASE_CONFIG.DEFAULT_URL,
    anonKey: SUPABASE_CONFIG.DEFAULT_ANON_KEY
  };
}

function saveActiveSupabaseConfig(url, anonKey) {

  if (url) {
    localStorage.setItem(
      SUPABASE_CONFIG.STORAGE_KEY_URL,
      url.trim()
    );
  }

  if (anonKey) {
    localStorage.setItem(
      SUPABASE_CONFIG.STORAGE_KEY_KEY,
      anonKey.trim()
    );
  }
}
