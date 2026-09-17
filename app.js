// ==========================================================
// MATERIAL TRACKING SYSTEM - PURE VANILLA JAVASCRIPT
// ==========================================================

const DEFAULT_AREAS = [
  'Gudang Utama (Main Warehouse)',
  'Produksi Line 1',
  'Produksi Line 2',
  'Area Karantina / Reject',
  'Area Pengembalian (Return Area)',
  'Quality Control (QC)'
];

const DEFAULT_MATERIALS = [
  { code: 'MAT-RAW-001', name: 'Pelat Baja Stainless 304 2mm', uom: 'SHEET', category: 'Raw Material' },
  { code: 'MAT-RAW-002', name: 'Pipa Seamless Carbon Steel 2 inch', uom: 'METER', category: 'Raw Material' },
  { code: 'MAT-FST-003', name: 'Baut Hexagonal M8 x 30mm SS', uom: 'PCS', category: 'Fastener' },
  { code: 'MAT-FST-004', name: 'Nut & Washer M8 Zinc Plated', uom: 'SET', category: 'Fastener' },
  { code: 'MAT-ELC-005', name: 'Kabel NYAF 2.5mm Hitam', uom: 'ROLL', category: 'Electrical' },
  { code: 'MAT-ELC-006', name: 'Relay Omron 24VDC 8 Pin', uom: 'PCS', category: 'Electrical' },
  { code: 'MAT-PKG-007', name: 'Karton Box 40x30x20 Double Wall', uom: 'PCS', category: 'Packaging' },
  { code: 'MAT-CHM-008', name: 'Degreaser & Cleaner Solven', uom: 'LITER', category: 'Chemical' }
];

const DEFAULT_USERS = [
  { id: 'USR001', name: 'Budi Santoso', role: 'Kepala Gudang & Logistik' },
  { id: 'USR002', name: 'Siti Rahmawati', role: 'Supervisor Produksi Line 1' },
  { id: 'USR003', name: 'Rama Pratama', role: 'Material Handler / Admin' },
  { id: 'USR004', name: 'Ahmad Fauzi', role: 'Quality Control (QC) Inspector' }
];

const SQL_SCHEMA = `-- SCRIPT SQL UNTUK SUPABASE POSTGRESQL (Jalankan di Supabase SQL Editor)
CREATE TABLE IF NOT EXISTS material_master (
  material_code VARCHAR(100) PRIMARY KEY,
  material_name VARCHAR(255) NOT NULL,
  uom VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(50) PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS areas (
  area_id VARCHAR(50) PRIMARY KEY,
  area_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  trx_id VARCHAR(100) PRIMARY KEY,
  material_code VARCHAR(100) NOT NULL,
  material_name VARCHAR(255) NOT NULL,
  qty NUMERIC NOT NULL,
  origin_area VARCHAR(255) NOT NULL,
  destination_area VARCHAR(255) NOT NULL,
  note TEXT,
  user_id VARCHAR(50),
  user_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_balances (
  area_name VARCHAR(255) NOT NULL,
  material_code VARCHAR(100) NOT NULL,
  material_name VARCHAR(255) NOT NULL,
  qty NUMERIC NOT NULL DEFAULT 0,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (area_name, material_code)
);

ALTER TABLE material_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon public access material_master" ON material_master FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access users" ON users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access areas" ON areas FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access transactions" ON transactions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access stock_balances" ON stock_balances FOR ALL TO anon USING (true) WITH CHECK (true);

INSERT INTO users (user_id, user_name) VALUES
  ('USR001', 'Budi Santoso'),
  ('USR002', 'Siti Rahmawati'),
  ('USR003', 'Rama Pratama'),
  ('USR004', 'Ahmad Fauzi')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO areas (area_id, area_name) VALUES
  ('AREA-01', 'Gudang Utama (Main Warehouse)'),
  ('AREA-02', 'Produksi Line 1'),
  ('AREA-03', 'Produksi Line 2'),
  ('AREA-04', 'Area Karantina / Reject'),
  ('AREA-05', 'Area Pengembalian (Return Area)'),
  ('AREA-06', 'Quality Control (QC)')
ON CONFLICT (area_id) DO NOTHING;

INSERT INTO material_master (material_code, material_name, uom, category) VALUES
  ('MAT-RAW-001', 'Pelat Baja Stainless 304 2mm', 'SHEET', 'Raw Material'),
  ('MAT-RAW-002', 'Pipa Seamless Carbon Steel 2 inch', 'METER', 'Raw Material'),
  ('MAT-FST-003', 'Baut Hexagonal M8 x 30mm SS', 'PCS', 'Fastener'),
  ('MAT-FST-004', 'Nut & Washer M8 Zinc Plated', 'SET', 'Fastener'),
  ('MAT-ELC-005', 'Kabel NYAF 2.5mm Hitam', 'ROLL', 'Electrical'),
  ('MAT-ELC-006', 'Relay Omron 24VDC 8 Pin', 'PCS', 'Electrical'),
  ('MAT-PKG-007', 'Karton Box 40x30x20 Double Wall', 'PCS', 'Packaging'),
  ('MAT-CHM-008', 'Degreaser & Cleaner Solven', 'LITER', 'Chemical')
ON CONFLICT (material_code) DO NOTHING;

INSERT INTO stock_balances (area_name, material_code, material_name, qty, last_update) VALUES
  ('Gudang Utama (Main Warehouse)', 'MAT-RAW-001', 'Pelat Baja Stainless 304 2mm', 120, NOW()),
  ('Gudang Utama (Main Warehouse)', 'MAT-RAW-002', 'Pipa Seamless Carbon Steel 2 inch', 85, NOW()),
  ('Gudang Utama (Main Warehouse)', 'MAT-RAW-003', 'Baut Hexagonal M8 x 30mm SS', 1500, NOW()),
  ('Gudang Utama (Main Warehouse)', 'MAT-FST-004', 'Nut & Washer M8 Zinc Plated', 1450, NOW()),
  ('Gudang Utama (Main Warehouse)', 'MAT-ELC-005', 'Kabel NYAF 2.5mm Hitam', 40, NOW()),
  ('Produksi Line 1', 'MAT-RAW-001', 'Pelat Baja Stainless 304 2mm', 35, NOW()),
  ('Produksi Line 1', 'MAT-FST-003', 'Baut Hexagonal M8 x 30mm SS', 300, NOW()),
  ('Produksi Line 2', 'MAT-ELC-005', 'Kabel NYAF 2.5mm Hitam', 15, NOW()),
  ('Area Pengembalian (Return Area)', 'MAT-FST-004', 'Nut & Washer M8 Zinc Plated', 50, NOW())
ON CONFLICT (area_name, material_code) DO NOTHING;`;

let supabaseClient = null;
let currentUser = null;
let currentTab = 'dashboard';
let usersList = [...DEFAULT_USERS];
let materialsList = [...DEFAULT_MATERIALS];
let areasList = [...DEFAULT_AREAS];
let stockBalances = [];
let transactionsList = [];
let selectedMaterialCode = '';
let filteredMaterials = [];
let activeDropdownIndex = -1;
let currentConnectionState = 'checking';
let bannerManuallyDismissed = false;
let transactionMode = 'single'; // 'single' | 'bulk'
let bulkRows = [
  { id: 1, material_code: '', qty: '', origin_area: '', destination_area: '', note: '' },
  { id: 2, material_code: '', qty: '', origin_area: '', destination_area: '', note: '' }
];
let nextBulkRowId = 3;

function findUserById(id) {
  if (!id) return null;
  const cleanId = String(id).trim().toUpperCase();
  return usersList.find(u => u.id.toUpperCase() === cleanId) || null;
}

function isValidUserId(id) {
  return !!findUserById(id);
}

function initSupabase() {
  const config = getActiveSupabaseConfig();
  if (config.url && config.anonKey && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(config.url, config.anonKey);
      return true;
    } catch (e) {
      console.error('Error init supabase client:', e);
      supabaseClient = null;
      return false;
    }
  }
  supabaseClient = null;
  return false;
}

window.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  loadStoredSession();
  loadLocalFallbackData();
  setupEventListeners();
  checkConnectionStatus();
  updateUI();
});

function loadStoredSession() {
  const stored = localStorage.getItem(SUPABASE_CONFIG.STORAGE_KEY_USER);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.id && isValidUserId(parsed.id)) {
        currentUser = findUserById(parsed.id) || parsed;
      } else {
        currentUser = null;
        localStorage.removeItem(SUPABASE_CONFIG.STORAGE_KEY_USER);
      }
    } catch (e) {
      currentUser = null;
    }
  }
}

function loadLocalFallbackData() {
  const localTrx = localStorage.getItem(SUPABASE_CONFIG.STORAGE_KEY_OFFLINE_TRX);
  if (localTrx) {
    try {
      transactionsList = JSON.parse(localTrx);
    } catch (e) {
      transactionsList = [];
    }
  } else {
    transactionsList = [
      {
        trx_id: 'TRX-SAMPLE-01',
        material_code: 'MAT-RAW-001',
        material_name: 'Pelat Baja Stainless 304 2mm',
        qty: 15,
        origin_area: 'Gudang Utama (Main Warehouse)',
        destination_area: 'Produksi Line 1',
        note: 'Permintaan material harian',
        user_name: 'Budi Santoso',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        trx_id: 'TRX-SAMPLE-02',
        material_code: 'MAT-FST-004',
        material_name: 'Nut & Washer M8 Zinc Plated',
        qty: 50,
        origin_area: 'Produksi Line 1',
        destination_area: 'Area Pengembalian (Return Area)',
        note: 'Sisa assembly line 1',
        user_name: 'Siti Rahmawati',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ];
  }

  const localStock = localStorage.getItem(SUPABASE_CONFIG.STORAGE_KEY_OFFLINE_STOCK);
  if (localStock) {
    try {
      stockBalances = JSON.parse(localStock);
    } catch (e) {
      stockBalances = [];
    }
  } else {
    stockBalances = [
      { area_name: 'Gudang Utama (Main Warehouse)', material_code: 'MAT-RAW-001', material_name: 'Pelat Baja Stainless 304 2mm', qty: 120, last_update: new Date().toISOString() },
      { area_name: 'Gudang Utama (Main Warehouse)', material_code: 'MAT-RAW-002', material_name: 'Pipa Seamless Carbon Steel 2 inch', qty: 85, last_update: new Date().toISOString() },
      { area_name: 'Gudang Utama (Main Warehouse)', material_code: 'MAT-FST-003', material_name: 'Baut Hexagonal M8 x 30mm SS', qty: 1500, last_update: new Date().toISOString() },
      { area_name: 'Gudang Utama (Main Warehouse)', material_code: 'MAT-FST-004', material_name: 'Nut & Washer M8 Zinc Plated', qty: 1450, last_update: new Date().toISOString() },
      { area_name: 'Gudang Utama (Main Warehouse)', material_code: 'MAT-ELC-005', material_name: 'Kabel NYAF 2.5mm Hitam', qty: 40, last_update: new Date().toISOString() },
      { area_name: 'Produksi Line 1', material_code: 'MAT-RAW-001', material_name: 'Pelat Baja Stainless 304 2mm', qty: 35, last_update: new Date().toISOString() },
      { area_name: 'Produksi Line 1', material_code: 'MAT-FST-003', material_name: 'Baut Hexagonal M8 x 30mm SS', qty: 300, last_update: new Date().toISOString() },
      { area_name: 'Produksi Line 2', material_code: 'MAT-ELC-005', material_name: 'Kabel NYAF 2.5mm Hitam', qty: 15, last_update: new Date().toISOString() },
      { area_name: 'Area Pengembalian (Return Area)', material_code: 'MAT-FST-004', material_name: 'Nut & Washer M8 Zinc Plated', qty: 50, last_update: new Date().toISOString() }
    ];
  }
}

function updateConnectionStatusState(state, customMessage) {
  currentConnectionState = state;

  const loginBadge = document.getElementById('db-status-badge');
  const loginText = document.getElementById('db-status-text');

  const navBtn = document.getElementById('btn-open-config');
  const navDot = document.getElementById('nav-db-dot');
  const navPing = document.getElementById('nav-db-ping');
  const navText = document.getElementById('nav-db-text');
  const navTextMobile = document.getElementById('nav-db-text-mobile');

  const banner = document.getElementById('nav-offline-banner');
  const bannerIcon = document.getElementById('nav-banner-icon');
  const bannerMsg = document.getElementById('nav-banner-message');

  switch (state) {
    case 'connected':
      if (loginBadge) loginBadge.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';
      if (loginText) loginText.textContent = 'Supabase Terhubung (PostgreSQL)';

      if (navBtn) {
        navBtn.className = 'flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-2xs bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100';
        navBtn.title = 'Supabase Terhubung (Klik untuk melihat info database)';
      }
      if (navDot) navDot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500';
      if (navPing) navPing.className = 'hidden';
      if (navText) navText.textContent = 'Supabase Terhubung';
      if (navTextMobile) navTextMobile.textContent = 'Online';

      if (banner) banner.classList.add('hidden');
      break;

    case 'checking':
      if (loginBadge) loginBadge.className = 'w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse';
      if (loginText) loginText.textContent = 'Memeriksa Database...';

      if (navBtn) {
        navBtn.className = 'flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-2xs bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100';
        navBtn.title = 'Sedang memeriksa koneksi Supabase...';
      }
      if (navDot) navDot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500';
      if (navPing) navPing.className = 'absolute inline-flex h-full w-full rounded-full opacity-75 bg-sky-400 animate-ping';
      if (navText) navText.textContent = 'Memeriksa...';
      if (navTextMobile) navTextMobile.textContent = 'Cek...';
      break;

    case 'offline_network':
      if (loginBadge) loginBadge.className = 'w-2.5 h-2.5 rounded-full bg-slate-500';
      if (loginText) loginText.textContent = 'Jaringan Offline (Tidak ada internet)';

      if (navBtn) {
        navBtn.className = 'flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-2xs bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200';
        navBtn.title = 'Perangkat tidak terhubung ke internet. Berjalan dalam mode offline lokal.';
      }
      if (navDot) navDot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-500';
      if (navPing) navPing.className = 'hidden';
      if (navText) navText.textContent = 'Jaringan Offline';
      if (navTextMobile) navTextMobile.textContent = 'Offline';

      if (banner && !bannerManuallyDismissed) {
        banner.className = 'bg-slate-900 text-slate-100 border-b border-slate-950 transition-all';
        if (bannerIcon) bannerIcon.textContent = '📡';
        if (bannerMsg) bannerMsg.textContent = customMessage || 'Perangkat Anda sedang offline (tidak ada akses internet). Data disimpan sementara di browser ini.';
        banner.classList.remove('hidden');
      }
      break;

    case 'connection_error':
      if (loginBadge) loginBadge.className = 'w-2.5 h-2.5 rounded-full bg-rose-500';
      if (loginText) loginText.textContent = 'Gagal Terhubung ke Supabase';

      if (navBtn) {
        navBtn.className = 'flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-2xs bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100';
        navBtn.title = 'Gagal terhubung ke Supabase. Klik untuk periksa konfigurasi database.';
      }
      if (navDot) navDot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600';
      if (navPing) navPing.className = 'absolute inline-flex h-full w-full rounded-full opacity-75 bg-rose-400 animate-ping';
      if (navText) navText.textContent = 'Koneksi Supabase Gagal';
      if (navTextMobile) navTextMobile.textContent = 'DB Gagal';

      if (banner && !bannerManuallyDismissed) {
        banner.className = 'bg-rose-700 text-white border-b border-rose-800 transition-all';
        if (bannerIcon) bannerIcon.textContent = '❌';
        if (bannerMsg) bannerMsg.textContent = customMessage || 'Koneksi ke Supabase terputus atau gagal terhubung. Periksa konfigurasi atau jaringan Anda.';
        banner.classList.remove('hidden');
      }
      break;

    case 'sql_missing':
      if (loginBadge) loginBadge.className = 'w-2.5 h-2.5 rounded-full bg-rose-500';
      if (loginText) loginText.textContent = 'Tabel SQL Belum Dibuat di Supabase';

      if (navBtn) {
        navBtn.className = 'flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-2xs bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100';
        navBtn.title = 'Tabel SQL di database Supabase belum dibuat. Klik untuk melihat SQL Schema.';
      }
      if (navDot) navDot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500';
      if (navPing) navPing.className = 'hidden';
      if (navText) navText.textContent = 'Tabel SQL Belum Ada';
      if (navTextMobile) navTextMobile.textContent = 'SQL?';

      if (banner && !bannerManuallyDismissed) {
        banner.className = 'bg-amber-600 text-white border-b border-amber-700 transition-all';
        if (bannerIcon) bannerIcon.textContent = '📋';
        if (bannerMsg) bannerMsg.textContent = 'Supabase terhubung tapi tabel PostgreSQL belum dibuat. Buka Pengaturan untuk salin script SQL.';
        banner.classList.remove('hidden');
      }
      break;

    case 'local_mode':
    default:
      if (loginBadge) loginBadge.className = 'w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse';
      if (loginText) loginText.textContent = 'Mode Lokal (Supabase belum diset)';

      if (navBtn) {
        navBtn.className = 'flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-2xs bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100';
        navBtn.title = 'Aplikasi berjalan dalam Mode Lokal (Penyimpanan browser). Klik untuk menyambungkan Supabase.';
      }
      if (navDot) navDot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500';
      if (navPing) navPing.className = 'hidden';
      if (navText) navText.textContent = 'Mode Offline (Lokal)';
      if (navTextMobile) navTextMobile.textContent = 'Offline';

      if (banner && !bannerManuallyDismissed) {
        banner.className = 'bg-amber-600 text-white border-b border-amber-700 transition-all';
        if (bannerIcon) bannerIcon.textContent = '⚠️';
        if (bannerMsg) bannerMsg.textContent = customMessage || 'Mode Offline / Lokal: Transaksi tersimpan di browser ini. Hubungkan database Supabase untuk sinkronisasi cloud.';
        banner.classList.remove('hidden');
      }
      break;
  }
}

async function checkConnectionStatus(silent = false) {
  // 1. Cek koneksi browser/jaringan perangkat
  if (!navigator.onLine) {
    updateConnectionStatusState('offline_network');
    return false;
  }

  // 2. Cek apakah konfigurasi Supabase sudah terisi
  const cfg = getActiveSupabaseConfig();
  if (!cfg.url || !cfg.anonKey || cfg.url.includes('your-project') || !supabaseClient) {
    updateConnectionStatusState('local_mode');
    return false;
  }

  if (!silent) {
    updateConnectionStatusState('checking');
  }

  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Koneksi timeout ke Supabase (>6 detik)')), 6000)
    );
    const queryPromise = supabaseClient.from('material_master').select('material_code').limit(1);

    const { error } = await Promise.race([queryPromise, timeoutPromise]);
    if (error) {
      if (error.code === '42P01' || (error.message && error.message.includes('relation "material_master" does not exist'))) {
        updateConnectionStatusState('sql_missing');
      } else {
        updateConnectionStatusState('connection_error', `Gagal koneksi Supabase: ${error.message || 'Periksa API Key'}`);
      }
      return false;
    }

    updateConnectionStatusState('connected');
    fetchDataFromSupabase();
    return true;
  } catch (err) {
    updateConnectionStatusState('connection_error', 'Gagal terhubung ke server Supabase. Pastikan URL & API Key valid serta jaringan stabil.');
    return false;
  }
}

async function fetchDataFromSupabase() {
  if (!supabaseClient) return;

  try {
    const { data: mats } = await supabaseClient.from('material_master').select('*');
    if (mats && mats.length > 0) {
      materialsList = mats.map(m => ({
        code: m.material_code,
        name: m.material_name,
        uom: m.uom,
        category: m.category
      }));
      populateMaterialDropdown();
    }

    const { data: areas } = await supabaseClient.from('areas').select('*');
    if (areas && areas.length > 0) {
      areasList = areas.map(a => a.area_name);
      populateAreaDropdowns();
    }

    // Fetch users from Supabase users table
    const { data: dbUsers } = await supabaseClient.from('users').select('*');
    if (dbUsers && dbUsers.length > 0) {
      usersList = dbUsers.map(u => {
        const fallback = DEFAULT_USERS.find(du => du.id.toUpperCase() === (u.user_id || '').toUpperCase());
        return {
          id: u.user_id,
          name: u.user_name,
          role: fallback ? fallback.role : 'Petugas Terdaftar'
        };
      });
      renderLoginUsersGrid();
      if (currentUser) {
        const refreshed = findUserById(currentUser.id);
        if (refreshed) {
          currentUser = refreshed;
          localStorage.setItem(SUPABASE_CONFIG.STORAGE_KEY_USER, JSON.stringify(currentUser));
          const userDisplay = document.getElementById('nav-user-name');
          const trxOperatorName = document.getElementById('trx-operator-name');
          if (userDisplay) userDisplay.textContent = currentUser.name;
          if (trxOperatorName) trxOperatorName.textContent = currentUser.name;
        }
      }
    }

    const { data: trxs } = await supabaseClient.from('transactions').select('*').order('created_at', { ascending: false });
    if (trxs) {
      transactionsList = trxs;
      renderTransactionHistory();
      renderDashboard();
    }

    const { data: stocks } = await supabaseClient.from('stock_balances').select('*');
    if (stocks) {
      stockBalances = stocks;
      renderStockBalance();
      renderDashboard();
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

function updateUI() {
  const loginSection = document.getElementById('login-section');
  const mainAppSection = document.getElementById('main-app-section');
  const userDisplay = document.getElementById('nav-user-name');
  const userIdDisplay = document.getElementById('nav-user-id');
  const userIdMobile = document.getElementById('nav-user-id-mobile');
  const trxOperatorName = document.getElementById('trx-operator-name');
  const trxOperatorId = document.getElementById('trx-operator-id');

  if (!currentUser || !isValidUserId(currentUser.id)) {
    if (loginSection) loginSection.classList.remove('hidden');
    if (mainAppSection) mainAppSection.classList.add('hidden');
    renderLoginUsersGrid();
    return;
  }

  if (loginSection) loginSection.classList.add('hidden');
  if (mainAppSection) mainAppSection.classList.remove('hidden');

  if (userDisplay) userDisplay.textContent = currentUser.name;
  if (userIdDisplay) userIdDisplay.textContent = currentUser.id;
  if (userIdMobile) userIdMobile.textContent = currentUser.id;

  if (trxOperatorName) trxOperatorName.textContent = currentUser.name;
  if (trxOperatorId) trxOperatorId.textContent = currentUser.id;

  const bulkSummaryOperator = document.getElementById('bulk-summary-operator');
  if (bulkSummaryOperator) bulkSummaryOperator.textContent = `${currentUser.name} (${currentUser.id})`;

  populateMaterialDropdown();
  populateAreaDropdowns();
  renderBulkRows();
  updateBulkSummary();
  switchTab(currentTab);
}

function switchTab(tabName) {
  currentTab = tabName;
  const tabs = ['dashboard', 'transaction', 'stock', 'history'];
  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(`nav-btn-${t}`);
    if (el) {
      if (t === tabName) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
    if (navBtn) {
      if (t === tabName) {
        navBtn.className = 'px-3 py-2 rounded-lg text-sm font-semibold bg-sky-50 text-sky-700 transition';
      } else {
        navBtn.className = 'px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition';
      }
    }
  });

  if (tabName === 'dashboard') renderDashboard();
  if (tabName === 'transaction') {
    renderBulkRows();
    updateBulkSummary();
  }
  if (tabName === 'stock') renderStockBalance();
  if (tabName === 'history') renderTransactionHistory();
}

function renderDashboard() {
  const totalMatsEl = document.getElementById('dash-total-materials');
  const totalStockEl = document.getElementById('dash-total-stock');
  const totalTrxEl = document.getElementById('dash-total-trx');
  const totalAreasEl = document.getElementById('dash-total-areas');

  const totalStock = stockBalances.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  
  if (totalMatsEl) totalMatsEl.textContent = materialsList.length;
  if (totalStockEl) totalStockEl.textContent = totalStock.toLocaleString('id-ID');
  if (totalTrxEl) totalTrxEl.textContent = transactionsList.length;
  if (totalAreasEl) totalAreasEl.textContent = areasList.length;

  const recentTable = document.getElementById('dash-recent-trx');
  if (recentTable) {
    const recent = transactionsList.slice(0, 5);
    if (recent.length === 0) {
      recentTable.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400 text-sm">Belum ada transaksi</td></tr>`;
    } else {
      recentTable.innerHTML = recent.map(t => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 text-sm">
          <td class="py-3 px-3 font-mono text-xs text-sky-600 font-semibold">${t.trx_id || '-'}</td>
          <td class="py-3 px-3">
            <div class="font-medium text-slate-900">${escapeHtml(t.material_name)}</div>
            <div class="text-xs text-slate-500">${escapeHtml(t.material_code)}</div>
          </td>
          <td class="py-3 px-3 font-semibold text-slate-800">${Number(t.qty).toLocaleString('id-ID')}</td>
          <td class="py-3 px-3">
            <div class="text-xs font-medium text-slate-700">${escapeHtml(t.origin_area)}</div>
            <div class="text-[11px] text-sky-600 font-semibold">➔ ${escapeHtml(t.destination_area)}</div>
          </td>
          <td class="py-3 px-3">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              👤 ${escapeHtml(t.user_name || 'Operator')}
            </span>
          </td>
          <td class="py-3 px-3 text-xs text-slate-500">${formatDate(t.created_at)}</td>
        </tr>
      `).join('');
    }
  }
}

function renderStockBalance() {
  const table = document.getElementById('stock-table-body');
  const areaFilter = document.getElementById('stock-filter-area')?.value || 'ALL';
  const searchFilter = (document.getElementById('stock-search')?.value || '').toLowerCase();

  let filtered = stockBalances.filter(item => {
    const matchArea = areaFilter === 'ALL' || item.area_name === areaFilter;
    const matchSearch = item.material_name.toLowerCase().includes(searchFilter) ||
                        item.material_code.toLowerCase().includes(searchFilter) ||
                        item.area_name.toLowerCase().includes(searchFilter);
    return matchArea && matchSearch;
  });

  if (!table) return;

  if (filtered.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400 text-sm">Tidak ada data saldo stok yang cocok</td></tr>`;
    return;
  }

  table.innerHTML = filtered.map(item => {
    const mat = materialsList.find(m => m.code === item.material_code);
    const uom = mat ? mat.uom : 'PCS';
    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50 text-sm">
        <td class="py-3.5 px-4 font-medium text-slate-800">${item.area_name}</td>
        <td class="py-3.5 px-4 font-mono text-xs text-sky-600 font-semibold">${item.material_code}</td>
        <td class="py-3.5 px-4 text-slate-900">${item.material_name}</td>
        <td class="py-3.5 px-4 font-bold text-slate-900">${Number(item.qty).toLocaleString('id-ID')}</td>
        <td class="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase">${uom}</td>
        <td class="py-3.5 px-4 text-xs text-slate-400">${formatDate(item.last_update)}</td>
      </tr>
    `;
  }).join('');
}

async function handleTransactionSubmit(e) {
  e.preventDefault();
  
  const matCode = document.getElementById('trx-material').value;
  const qty = parseFloat(document.getElementById('trx-qty').value);
  const originArea = document.getElementById('trx-origin').value;
  const destArea = document.getElementById('trx-dest').value;
  const note = document.getElementById('trx-note').value;
  const feedbackEl = document.getElementById('trx-feedback');

  // Validasi Syarat Bertransaksi: User ID wajib terdaftar di tabel users
  if (!currentUser || !currentUser.id || !isValidUserId(currentUser.id)) {
    showFeedback(feedbackEl, '⛔ Syarat Bertransaksi: Anda wajib login dengan User ID statis yang terdaftar di tabel users untuk mencatat transfer material!', 'error');
    setTimeout(() => {
      currentUser = null;
      localStorage.removeItem(SUPABASE_CONFIG.STORAGE_KEY_USER);
      updateUI();
    }, 1500);
    return;
  }

  if (!matCode) {
    showFeedback(feedbackEl, 'Silakan cari dan pilih material terlebih dahulu!', 'error');
    document.getElementById('trx-material-search-input')?.focus();
    return;
  }

  if (!qty || qty <= 0 || !originArea || !destArea) {
    showFeedback(feedbackEl, 'Harap isi semua kolom dengan benar (Qty harus > 0)', 'error');
    return;
  }

  if (originArea === destArea) {
    showFeedback(feedbackEl, 'Area Asal dan Area Tujuan tidak boleh sama!', 'error');
    return;
  }

  const selectedMat = materialsList.find(m => m.code === matCode);
  const matName = selectedMat ? selectedMat.name : matCode;
  const trxId = 'TRX-' + Date.now().toString().slice(-6);

  const newTrx = {
    trx_id: trxId,
    material_code: matCode,
    material_name: matName,
    qty: qty,
    origin_area: originArea,
    destination_area: destArea,
    note: note || '',
    user_id: currentUser.id,
    user_name: `${currentUser.name} (${currentUser.id})`,
    created_at: new Date().toISOString()
  };

  const btnSubmit = document.getElementById('btn-submit-trx');
  if (btnSubmit) btnSubmit.disabled = true;

  if (supabaseClient) {
    try {
      const { error: trxErr } = await supabaseClient.from('transactions').insert([newTrx]);
      if (trxErr) throw trxErr;

      await updateSupabaseStock(destArea, matCode, matName, qty);
      await updateSupabaseStock(originArea, matCode, matName, -qty);

      await fetchDataFromSupabase();
      showFeedback(feedbackEl, `Berhasil! Transaksi ${trxId} tercatat atas nama ${currentUser.name} (${currentUser.id}) di Supabase.`, 'success');
      document.getElementById('trx-form').reset();
      clearSelectedMaterial();
      if (btnSubmit) btnSubmit.disabled = false;
      return;
    } catch (err) {
      console.warn('Gagal simpan ke Supabase, fallback ke offline mode:', err);
      bannerManuallyDismissed = false;
      updateConnectionStatusState('connection_error', 'Gagal menyimpan ke Supabase. Transaksi dialihkan ke penyimpanan lokal browser.');
    }
  }

  transactionsList.unshift(newTrx);
  localStorage.setItem(SUPABASE_CONFIG.STORAGE_KEY_OFFLINE_TRX, JSON.stringify(transactionsList));

  updateLocalStock(destArea, matCode, matName, qty);
  updateLocalStock(originArea, matCode, matName, -qty);

  showFeedback(feedbackEl, `⚠️ Transaksi ${trxId} tersimpan lokal atas nama ${currentUser.name} (${currentUser.id}). (Supabase offline)`, 'success');
  document.getElementById('trx-form').reset();
  clearSelectedMaterial();
  if (btnSubmit) btnSubmit.disabled = false;
  renderDashboard();
}

async function updateSupabaseStock(areaName, matCode, matName, deltaQty) {
  if (!supabaseClient) return;

  const { data: existing } = await supabaseClient
    .from('stock_balances')
    .select('qty')
    .eq('area_name', areaName)
    .eq('material_code', matCode)
    .maybeSingle();

  const currentQty = existing ? Number(existing.qty || 0) : 0;
  const newQty = Math.max(0, currentQty + deltaQty);

  await supabaseClient.from('stock_balances').upsert({
    area_name: areaName,
    material_code: matCode,
    material_name: matName,
    qty: newQty,
    last_update: new Date().toISOString()
  });
}

function updateLocalStock(areaName, matCode, matName, deltaQty) {
  const index = stockBalances.findIndex(s => s.area_name === areaName && s.material_code === matCode);
  if (index >= 0) {
    const cur = Number(stockBalances[index].qty || 0);
    stockBalances[index].qty = Math.max(0, cur + deltaQty);
    stockBalances[index].last_update = new Date().toISOString();
  } else {
    stockBalances.push({
      area_name: areaName,
      material_code: matCode,
      material_name: matName,
      qty: Math.max(0, deltaQty),
      last_update: new Date().toISOString()
    });
  }
  localStorage.setItem(SUPABASE_CONFIG.STORAGE_KEY_OFFLINE_STOCK, JSON.stringify(stockBalances));
}

// ==============================================================
// FITUR TRANSAKSI MASSAL (BULK / MULTI-ITEM TRANSACTIONS)
// ==============================================================

function setTransactionMode(mode) {
  transactionMode = mode;
  const btnSingle = document.getElementById('btn-mode-single');
  const btnBulk = document.getElementById('btn-mode-bulk');
  const singleContainer = document.getElementById('trx-single-container');
  const bulkContainer = document.getElementById('trx-bulk-container');

  if (mode === 'single') {
    if (btnSingle) {
      btnSingle.className = 'px-3.5 py-1.5 rounded-lg bg-white shadow-2xs text-sky-700 font-bold transition cursor-pointer';
    }
    if (btnBulk) {
      btnBulk.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center gap-1.5';
    }
    if (singleContainer) singleContainer.classList.remove('hidden');
    if (bulkContainer) bulkContainer.classList.add('hidden');
  } else {
    if (btnSingle) {
      btnSingle.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer';
    }
    if (btnBulk) {
      btnBulk.className = 'px-3.5 py-1.5 rounded-lg bg-white shadow-2xs text-sky-700 font-bold transition cursor-pointer flex items-center gap-1.5';
    }
    if (singleContainer) singleContainer.classList.add('hidden');
    if (bulkContainer) bulkContainer.classList.remove('hidden');
    renderBulkRows();
    updateBulkSummary();
  }
}

function closeAllBulkDropdowns() {
  document.querySelectorAll('.bulk-mat-dropdown').forEach(d => d.classList.add('hidden'));
}

function renderBulkRows() {
  const container = document.getElementById('bulk-rows-container');
  if (!container) return;

  container.innerHTML = bulkRows.map((row, index) => {
    const selectedMat = materialsList.find(m => m.code === row.material_code);
    const uom = selectedMat ? selectedMat.uom : 'Unit';

    // Informasi saldo stok di area asal terpilih
    let stockBadgeHtml = '';
    if (row.material_code && row.origin_area) {
      const stock = getStockForMaterialInArea(row.material_code, row.origin_area);
      if (stock > 0) {
        stockBadgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Saldo di asal: <b>${stock.toLocaleString('id-ID')} ${uom}</b></span>`;
      } else {
        stockBadgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">⚠️ Saldo 0 di ${escapeHtml(row.origin_area)}</span>`;
      }
    } else if (row.material_code) {
      const total = getTotalStockForMaterial(row.material_code);
      stockBadgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">Total semua area: <b>${total.toLocaleString('id-ID')} ${uom}</b></span>`;
    }

    return `
      <div data-row-id="${row.id}" class="bulk-row-item p-4 bg-slate-50 border border-slate-200 rounded-xl relative hover:border-slate-300 transition">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
          <div class="flex flex-wrap items-center gap-2">
            <span class="w-6 h-6 rounded-md bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center">#${index + 1}</span>
            <span class="text-xs font-bold text-slate-800">Item Mutasi #${index + 1}</span>
            ${stockBadgeHtml ? `<div>${stockBadgeHtml}</div>` : ''}
          </div>
          <div class="flex items-center space-x-1.5">
            <button 
              type="button" 
              data-action="duplicate-row" 
              data-id="${row.id}" 
              class="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition cursor-pointer flex items-center space-x-1"
              title="Duplikasi baris ini"
            >
              <span>📑</span>
              <span>Duplikat</span>
            </button>
            <button 
              type="button" 
              data-action="remove-row" 
              data-id="${row.id}" 
              class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
              title="Hapus baris ini"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <!-- Kolom Material Master Searchable (Col 1-4) -->
          <div class="md:col-span-4 relative bulk-mat-wrapper" data-row-id="${row.id}">
            <div class="flex items-center justify-between mb-1">
              <label class="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Material Master *
              </label>
              <span class="text-[10px] text-sky-600 font-medium">🔍 Cari Kode / Nama</span>
            </div>

            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>

              <input 
                type="text" 
                class="bulk-mat-search-input w-full pl-8 pr-14 py-2 bg-white border ${row.material_code ? 'border-sky-300 ring-1 ring-sky-100 font-semibold text-slate-900' : 'border-slate-300 font-medium text-slate-800'} rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400 placeholder:font-normal transition"
                placeholder="Ketik kode / nama material..." 
                value="${selectedMat ? `[${selectedMat.code}] ${selectedMat.name}` : ''}"
                autocomplete="off"
              />

              <div class="absolute inset-y-0 right-0 pr-1.5 flex items-center space-x-0.5">
                <button 
                  type="button" 
                  data-action="clear-bulk-mat" 
                  class="bulk-mat-clear-btn p-1 text-slate-400 hover:text-slate-600 text-xs ${row.material_code ? '' : 'hidden'} cursor-pointer" 
                  title="Hapus / Cari Ulang"
                >
                  ✕
                </button>
                <button 
                  type="button" 
                  data-action="toggle-bulk-mat-dropdown" 
                  class="bulk-mat-toggle-btn p-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer" 
                  title="Buka daftar material master"
                >
                  ▼
                </button>
              </div>
            </div>

            <!-- Dropdown Pencarian Material Floating -->
            <div class="bulk-mat-dropdown hidden absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-100">
            </div>
          </div>

          <!-- Kolom Qty (Col 5-6) -->
          <div class="md:col-span-2">
            <label class="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Jumlah (Qty) *
            </label>
            <div class="relative">
              <input 
                type="number" 
                data-field="qty" 
                step="any" 
                min="0.01" 
                placeholder="0" 
                value="${row.qty || ''}" 
                class="bulk-input-qty w-full pl-2.5 pr-12 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500" 
              />
              <span class="absolute right-2.5 top-2 text-[10px] font-bold text-slate-400 uppercase pointer-events-none">${uom}</span>
            </div>
          </div>

          <!-- Kolom Area Asal (Col 7-8) -->
          <div class="md:col-span-2">
            <label class="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Area Asal (Kirim) *
            </label>
            <select data-field="origin_area" class="bulk-input-origin w-full px-2 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">-- Area Asal --</option>
              ${areasList.map(a => `<option value="${a}" ${row.origin_area === a ? 'selected' : ''}>${a}</option>`).join('')}
            </select>
          </div>

          <!-- Kolom Area Tujuan (Col 9-10) -->
          <div class="md:col-span-2">
            <label class="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Area Tujuan (Terima) *
            </label>
            <select data-field="destination_area" class="bulk-input-dest w-full px-2 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">-- Area Tujuan --</option>
              ${areasList.map(a => `<option value="${a}" ${row.destination_area === a ? 'selected' : ''}>${a}</option>`).join('')}
            </select>
          </div>

          <!-- Kolom Catatan / Ref (Col 11-12) -->
          <div class="md:col-span-2">
            <label class="block text-[11px] font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Catatan / Ref
            </label>
            <input 
              type="text" 
              data-field="note" 
              placeholder="No. SJ / Ket..." 
              value="${escapeHtml(row.note || '')}" 
              class="bulk-input-note w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500" 
            />
          </div>
        </div>
      </div>
    `;
  }).join('');

  attachBulkRowsEvents();
  updateBulkSummary();
}

function attachBulkRowsEvents() {
  const container = document.getElementById('bulk-rows-container');
  if (!container) return;

  container.querySelectorAll('.bulk-row-item').forEach(card => {
    const rowId = parseInt(card.getAttribute('data-row-id'), 10);
    const row = bulkRows.find(r => r.id === rowId);
    if (!row) return;

    // Searchable Material logic untuk baris ini
    const matWrapper = card.querySelector('.bulk-mat-wrapper');
    if (matWrapper) {
      const searchInput = matWrapper.querySelector('.bulk-mat-search-input');
      const clearBtn = matWrapper.querySelector('[data-action="clear-bulk-mat"]');
      const toggleBtn = matWrapper.querySelector('[data-action="toggle-bulk-mat-dropdown"]');
      const dropdown = matWrapper.querySelector('.bulk-mat-dropdown');

      const renderDropdownItems = (q = '') => {
        const cleanQ = (q || '').toLowerCase().trim();
        const origin = row.origin_area || document.getElementById('bulk-preset-origin')?.value || '';
        
        const filtered = materialsList.filter(m => {
          if (!cleanQ) return true;
          return m.code.toLowerCase().includes(cleanQ) ||
                 m.name.toLowerCase().includes(cleanQ) ||
                 (m.category && m.category.toLowerCase().includes(cleanQ)) ||
                 (m.uom && m.uom.toLowerCase().includes(cleanQ));
        });

        if (filtered.length === 0) {
          dropdown.innerHTML = `
            <div class="p-3.5 text-center text-xs text-slate-500">
              <div class="text-base mb-1">🔍</div>
              <div>Tidak ditemukan material untuk "<b>${escapeHtml(cleanQ)}</b>"</div>
              <div class="text-[10px] text-slate-400 mt-1">Coba cari dengan nomor kode atau nama material</div>
            </div>
          `;
          return;
        }

        dropdown.innerHTML = filtered.map(m => {
          const isSelected = row.material_code === m.code;
          let stockInfo = '';
          if (origin) {
            const stockInOrigin = getStockForMaterialInArea(m.code, origin);
            if (stockInOrigin > 0) {
              stockInfo = `<span class="text-[10px] text-emerald-700 font-semibold">Saldo di ${escapeHtml(origin)}: ${stockInOrigin.toLocaleString('id-ID')} ${m.uom}</span>`;
            } else {
              stockInfo = `<span class="text-[10px] text-amber-600 font-medium">Saldo 0 di ${escapeHtml(origin)}</span>`;
            }
          } else {
            const total = getTotalStockForMaterial(m.code);
            stockInfo = `<span class="text-[10px] text-slate-400">Total semua area: ${total.toLocaleString('id-ID')} ${m.uom}</span>`;
          }

          return `
            <div 
              data-code="${m.code}" 
              class="bulk-mat-option p-2.5 hover:bg-sky-50 transition cursor-pointer flex items-center justify-between gap-2 ${isSelected ? 'bg-sky-50/80 border-l-3 border-sky-600' : ''}"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center space-x-1.5 mb-0.5">
                  <span class="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-mono font-bold text-[10px] rounded border border-slate-200">${highlightMatch(m.code, cleanQ)}</span>
                  <span class="text-xs font-semibold text-slate-900 truncate">${highlightMatch(m.name, cleanQ)}</span>
                </div>
                <div class="flex items-center space-x-1.5">
                  <span class="text-[10px] text-slate-500">${escapeHtml(m.category || '')}</span>
                  <span class="text-[10px] text-slate-300">•</span>
                  ${stockInfo}
                </div>
              </div>
              <span class="shrink-0 text-[10px] font-semibold text-sky-600 hover:text-sky-700">Pilih ➔</span>
            </div>
          `;
        }).join('');

        dropdown.querySelectorAll('.bulk-mat-option').forEach(opt => {
          opt.addEventListener('mousedown', (e) => {
            e.preventDefault(); // cegah blur sebelum klik terproses
            const code = opt.getAttribute('data-code');
            row.material_code = code;
            dropdown.classList.add('hidden');
            renderBulkRows();
          });
        });
      };

      if (searchInput) {
        searchInput.addEventListener('focus', () => {
          closeAllBulkDropdowns();
          const query = searchInput.value.startsWith('[') ? '' : searchInput.value;
          renderDropdownItems(query);
          dropdown.classList.remove('hidden');
        });

        searchInput.addEventListener('input', (e) => {
          const val = e.target.value;
          renderDropdownItems(val);
          dropdown.classList.remove('hidden');
          if (clearBtn) {
            if (val) clearBtn.classList.remove('hidden');
            else clearBtn.classList.add('hidden');
          }
        });

        searchInput.addEventListener('blur', () => {
          setTimeout(() => {
            dropdown.classList.add('hidden');
            const selected = materialsList.find(m => m.code === row.material_code);
            searchInput.value = selected ? `[${selected.code}] ${selected.name}` : '';
            if (clearBtn) {
              if (row.material_code) clearBtn.classList.remove('hidden');
              else clearBtn.classList.add('hidden');
            }
          }, 200);
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          row.material_code = '';
          renderBulkRows();
        });
      }

      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = dropdown.classList.contains('hidden');
          closeAllBulkDropdowns();
          if (isHidden) {
            renderDropdownItems('');
            dropdown.classList.remove('hidden');
            if (searchInput) searchInput.focus();
          }
        });
      }
    }

    // Input fields lainnya (qty, origin, dest, note)
    card.querySelectorAll('input[data-field], select[data-field]').forEach(input => {
      const field = input.getAttribute('data-field');
      if (!field || field === 'material_search') return;

      input.addEventListener('change', (e) => {
        row[field] = e.target.value;
        if (field === 'origin_area') {
          renderBulkRows();
        } else {
          updateBulkSummary();
        }
      });

      if (input.tagName === 'INPUT') {
        input.addEventListener('input', (e) => {
          row[field] = e.target.value;
          updateBulkSummary();
        });
      }
    });

    const removeBtn = card.querySelector('[data-action="remove-row"]');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        removeBulkRow(rowId);
      });
    }

    const dupBtn = card.querySelector('[data-action="duplicate-row"]');
    if (dupBtn) {
      dupBtn.addEventListener('click', () => {
        duplicateBulkRow(rowId);
      });
    }
  });
}

function addBulkRow(count = 1) {
  const presetOrigin = document.getElementById('bulk-preset-origin')?.value || '';
  const presetDest = document.getElementById('bulk-preset-dest')?.value || '';
  const presetNote = document.getElementById('bulk-preset-note')?.value || '';

  for (let i = 0; i < count; i++) {
    bulkRows.push({
      id: nextBulkRowId++,
      material_code: '',
      qty: '',
      origin_area: presetOrigin,
      destination_area: presetDest,
      note: presetNote
    });
  }
  renderBulkRows();
}

function removeBulkRow(rowId) {
  if (bulkRows.length <= 1) {
    bulkRows[0] = {
      id: bulkRows[0].id,
      material_code: '',
      qty: '',
      origin_area: '',
      destination_area: '',
      note: ''
    };
  } else {
    bulkRows = bulkRows.filter(r => r.id !== rowId);
  }
  renderBulkRows();
}

function duplicateBulkRow(rowId) {
  const row = bulkRows.find(r => r.id === rowId);
  if (!row) return;
  const newRow = {
    id: nextBulkRowId++,
    material_code: row.material_code,
    qty: row.qty,
    origin_area: row.origin_area,
    destination_area: row.destination_area,
    note: row.note
  };
  const index = bulkRows.findIndex(r => r.id === rowId);
  bulkRows.splice(index + 1, 0, newRow);
  renderBulkRows();
}

function resetBulkRows() {
  const presetOrigin = document.getElementById('bulk-preset-origin')?.value || '';
  const presetDest = document.getElementById('bulk-preset-dest')?.value || '';
  const presetNote = document.getElementById('bulk-preset-note')?.value || '';

  bulkRows = [
    { id: nextBulkRowId++, material_code: '', qty: '', origin_area: presetOrigin, destination_area: presetDest, note: presetNote },
    { id: nextBulkRowId++, material_code: '', qty: '', origin_area: presetOrigin, destination_area: presetDest, note: presetNote }
  ];
  renderBulkRows();
}

function applyBulkPreset() {
  const presetOrigin = document.getElementById('bulk-preset-origin')?.value || '';
  const presetDest = document.getElementById('bulk-preset-dest')?.value || '';
  const presetNote = document.getElementById('bulk-preset-note')?.value || '';
  const feedbackEl = document.getElementById('bulk-feedback');

  if (!presetOrigin && !presetDest && !presetNote) {
    showFeedback(feedbackEl, 'Pilih Area Asal, Area Tujuan, atau Catatan pada panel Preset terlebih dahulu.', 'error');
    return;
  }

  let countApplied = 0;
  bulkRows.forEach(row => {
    if (presetOrigin) row.origin_area = presetOrigin;
    if (presetDest) row.destination_area = presetDest;
    if (presetNote) row.note = presetNote;
    countApplied++;
  });

  renderBulkRows();
  showFeedback(feedbackEl, `⚡ Preset berhasil diterapkan ke ${countApplied} baris transaksi massal!`, 'success');
}

function updateBulkSummary() {
  const totalCount = bulkRows.length;
  let totalQty = 0;
  bulkRows.forEach(r => {
    const q = parseFloat(r.qty);
    if (!isNaN(q) && q > 0) totalQty += q;
  });

  const countBadge = document.getElementById('bulk-active-count-badge');
  const counterBadge = document.getElementById('bulk-item-counter-badge');
  const summaryCount = document.getElementById('bulk-summary-count');
  const summaryQty = document.getElementById('bulk-summary-qty');
  const summaryUser = document.getElementById('bulk-summary-operator');

  if (countBadge) countBadge.textContent = `${totalCount} Item`;
  if (counterBadge) counterBadge.textContent = String(totalCount);
  if (summaryCount) summaryCount.textContent = String(totalCount);
  if (summaryQty) summaryQty.textContent = totalQty.toLocaleString('id-ID');
  if (summaryUser) {
    summaryUser.textContent = currentUser ? `${currentUser.name} (${currentUser.id})` : 'Belum Login';
  }
}

async function handleBulkTransactionSubmit() {
  const feedbackEl = document.getElementById('bulk-feedback');
  const submitBtn = document.getElementById('btn-submit-bulk-trx');

  // Validasi Syarat Bertransaksi: User ID wajib terdaftar di tabel users
  if (!currentUser || !currentUser.id || !isValidUserId(currentUser.id)) {
    showFeedback(feedbackEl, '⛔ Syarat Bertransaksi: Anda wajib login dengan User ID statis yang terdaftar di tabel users untuk mencatat transaksi!', 'error');
    setTimeout(() => {
      currentUser = null;
      localStorage.removeItem(SUPABASE_CONFIG.STORAGE_KEY_USER);
      updateUI();
    }, 1500);
    return;
  }

  // Filter baris yang terisi (tidak kosong total)
  const candidateRows = bulkRows.filter(r => r.material_code || r.qty || r.origin_area || r.destination_area || r.note);

  if (candidateRows.length === 0) {
    showFeedback(feedbackEl, 'Harap pilih material dan isi kuantitas pada minimal 1 baris transaksi massal!', 'error');
    return;
  }

  // Validasi setiap baris yang akan diproses
  const validationErrors = [];
  const validRows = [];

  candidateRows.forEach((row, idx) => {
    const rowNum = idx + 1;
    if (!row.material_code) {
      validationErrors.push(`Baris #${rowNum}: Belum memilih Material Master.`);
      return;
    }
    const qty = parseFloat(row.qty);
    if (isNaN(qty) || qty <= 0) {
      validationErrors.push(`Baris #${rowNum}: Kuantitas harus berupa angka lebih dari 0.`);
      return;
    }
    if (!row.origin_area) {
      validationErrors.push(`Baris #${rowNum}: Area Asal belum dipilih.`);
      return;
    }
    if (!row.destination_area) {
      validationErrors.push(`Baris #${rowNum}: Area Tujuan belum dipilih.`);
      return;
    }
    if (row.origin_area === row.destination_area) {
      validationErrors.push(`Baris #${rowNum}: Area Asal dan Area Tujuan tidak boleh sama.`);
      return;
    }

    validRows.push({
      ...row,
      qty: qty
    });
  });

  if (validationErrors.length > 0) {
    showFeedback(feedbackEl, `Terdapat kesalahan input pada baris:\n• ${validationErrors.join('\n• ')}`, 'error');
    return;
  }

  if (validRows.length === 0) {
    showFeedback(feedbackEl, 'Tidak ada baris transaksi yang valid untuk diproses.', 'error');
    return;
  }

  // Disable button with spinner text
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>⏳</span><span>Menyimpan ${validRows.length} Transaksi Massal...</span>`;
  }

  const baseTimestamp = Date.now().toString().slice(-6);
  const nowIso = new Date().toISOString();

  const newTrxList = validRows.map((row, index) => {
    const selectedMat = materialsList.find(m => m.code === row.material_code);
    const matName = selectedMat ? selectedMat.name : row.material_code;
    const trxId = `TRX-${baseTimestamp}-${String(index + 1).padStart(2, '0')}`;

    return {
      trx_id: trxId,
      material_code: row.material_code,
      material_name: matName,
      qty: row.qty,
      origin_area: row.origin_area,
      destination_area: row.destination_area,
      note: row.note ? `[Massal] ${row.note}` : '[Massal]',
      user_id: currentUser.id,
      user_name: `${currentUser.name} (${currentUser.id})`,
      created_at: nowIso
    };
  });

  if (supabaseClient) {
    try {
      // 1. Simpan semua transaksi secara batch ke Supabase
      const { error: trxErr } = await supabaseClient.from('transactions').insert(newTrxList);
      if (trxErr) throw trxErr;

      // 2. Perbarui saldo stok di Supabase untuk setiap transaksi
      for (const trx of newTrxList) {
        await updateSupabaseStock(trx.destination_area, trx.material_code, trx.material_name, trx.qty);
        await updateSupabaseStock(trx.origin_area, trx.material_code, trx.material_name, -trx.qty);
      }

      await fetchDataFromSupabase();
      showFeedback(feedbackEl, `🎉 Berhasil! ${newTrxList.length} transaksi massal tersimpan di database Supabase atas nama ${currentUser.name} (${currentUser.id}).`, 'success');
      resetBulkRows();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>💾</span><span>Proses & Simpan Semua Transaksi Massal</span>`;
      }
      return;
    } catch (err) {
      console.warn('Gagal simpan massal ke Supabase, fallback ke mode offline:', err);
      bannerManuallyDismissed = false;
      updateConnectionStatusState('connection_error', 'Gagal menyimpan transaksi massal ke Supabase. Data dialihkan ke penyimpanan lokal browser.');
    }
  }

  // Fallback Mode Offline / Lokal
  transactionsList.unshift(...newTrxList);
  localStorage.setItem(SUPABASE_CONFIG.STORAGE_KEY_OFFLINE_TRX, JSON.stringify(transactionsList));

  for (const trx of newTrxList) {
    updateLocalStock(trx.destination_area, trx.material_code, trx.material_name, trx.qty);
    updateLocalStock(trx.origin_area, trx.material_code, trx.material_name, -trx.qty);
  }

  showFeedback(feedbackEl, `⚠️ Berhasil! ${newTrxList.length} transaksi massal tersimpan di Mode Lokal browser atas nama ${currentUser.name} (${currentUser.id}). (Supabase offline)`, 'success');
  resetBulkRows();
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>💾</span><span>Proses & Simpan Semua Transaksi Massal</span>`;
  }
  renderDashboard();
}

function renderTransactionHistory() {
  const table = document.getElementById('history-table-body');
  const search = (document.getElementById('history-search')?.value || '').toLowerCase();
  
  let filtered = transactionsList.filter(t => {
    return t.material_name.toLowerCase().includes(search) ||
           t.material_code.toLowerCase().includes(search) ||
           t.origin_area.toLowerCase().includes(search) ||
           t.destination_area.toLowerCase().includes(search) ||
           (t.trx_id && t.trx_id.toLowerCase().includes(search)) ||
           (t.user_name && t.user_name.toLowerCase().includes(search));
  });

  if (!table) return;

  if (filtered.length === 0) {
    table.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400 text-sm">Tidak ada riwayat transaksi</td></tr>`;
    return;
  }

  table.innerHTML = filtered.map(t => `
    <tr class="border-b border-slate-100 hover:bg-slate-50 text-sm">
      <td class="py-3 px-3 font-mono text-xs font-semibold text-sky-600">${t.trx_id || '-'}</td>
      <td class="py-3 px-3">
        <div class="font-medium text-slate-900">${t.material_name}</div>
        <div class="text-xs text-slate-500">${t.material_code}</div>
      </td>
      <td class="py-3 px-3 font-bold text-slate-900">${Number(t.qty).toLocaleString('id-ID')}</td>
      <td class="py-3 px-3 text-xs">
        <span class="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">${t.origin_area}</span>
        <span class="mx-1 text-slate-400">➔</span>
        <span class="inline-block bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-medium">${t.destination_area}</span>
      </td>
      <td class="py-3 px-3 text-xs text-slate-500">${t.note || '-'}</td>
      <td class="py-3 px-3 text-xs font-medium text-slate-700">${t.user_name}</td>
      <td class="py-3 px-3 text-xs text-slate-400">${formatDate(t.created_at)}</td>
    </tr>
  `).join('');
}

function exportTransactionsCSV() {
  if (transactionsList.length === 0) {
    alert('Tidak ada transaksi untuk diekspor.');
    return;
  }

  const headers = ['ID Transaksi', 'Kode Material', 'Nama Material', 'Jumlah (Qty)', 'Area Asal', 'Area Tujuan', 'Catatan', 'Petugas', 'Waktu'];
  const rows = transactionsList.map(t => [
    `"${t.trx_id || ''}"`,
    `"${t.material_code}"`,
    `"${t.material_name}"`,
    t.qty,
    `"${t.origin_area}"`,
    `"${t.destination_area}"`,
    `"${t.note || ''}"`,
    `"${t.user_name || ''}"`,
    `"${formatDate(t.created_at)}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `material_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function openConfigModal() {
  const modal = document.getElementById('config-modal');
  const inputUrl = document.getElementById('cfg-supabase-url');
  const inputKey = document.getElementById('cfg-supabase-key');
  const schemaBox = document.getElementById('cfg-sql-schema');

  const config = getActiveSupabaseConfig();
  if (inputUrl) inputUrl.value = config.url;
  if (inputKey) inputKey.value = config.anonKey;
  if (schemaBox) schemaBox.value = SQL_SCHEMA;
  if (modal) modal.classList.remove('hidden');
}

function closeConfigModal() {
  const modal = document.getElementById('config-modal');
  if (modal) modal.classList.add('hidden');
}

async function saveAndTestConfig() {
  const url = document.getElementById('cfg-supabase-url').value.trim();
  const key = document.getElementById('cfg-supabase-key').value.trim();
  const testMsg = document.getElementById('cfg-test-status');

  saveActiveSupabaseConfig(url, key);
  initSupabase();

  if (testMsg) {
    testMsg.className = 'text-xs text-sky-600 font-medium';
    testMsg.textContent = 'Menguji koneksi ke Supabase...';
    testMsg.classList.remove('hidden');
  }

  const isOk = await checkConnectionStatus();
  if (testMsg) {
    if (isOk) {
      testMsg.className = 'text-xs text-emerald-600 font-bold';
      testMsg.textContent = 'Berhasil terhubung ke Supabase PostgreSQL!';
      setTimeout(() => {
        closeConfigModal();
        updateUI();
      }, 1200);
    } else {
      testMsg.className = 'text-xs text-amber-600 font-medium';
      testMsg.textContent = 'Koneksi gagal atau tabel SQL belum dibuat. Pastikan script SQL sudah dijalankan di Supabase.';
    }
  }
}

function copySqlSchema() {
  const schemaBox = document.getElementById('cfg-sql-schema');
  if (schemaBox) {
    schemaBox.select();
    navigator.clipboard.writeText(schemaBox.value);
    const copyBtn = document.getElementById('btn-copy-sql');
    if (copyBtn) {
      const orig = copyBtn.textContent;
      copyBtn.textContent = 'Tersalin ke Clipboard!';
      setTimeout(() => { copyBtn.textContent = orig; }, 2000);
    }
  }
}

function getStockForMaterialInArea(matCode, areaName) {
  if (!areaName || !matCode) return 0;
  const found = stockBalances.find(s => s.material_code === matCode && s.area_name === areaName);
  return found ? Number(found.qty || 0) : 0;
}

function getTotalStockForMaterial(matCode) {
  if (!matCode) return 0;
  return stockBalances
    .filter(s => s.material_code === matCode)
    .reduce((sum, s) => sum + Number(s.qty || 0), 0);
}

function openMaterialDropdown() {
  const dropdown = document.getElementById('trx-material-dropdown');
  if (dropdown) dropdown.classList.remove('hidden');
}

function closeMaterialDropdown() {
  const dropdown = document.getElementById('trx-material-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
  activeDropdownIndex = -1;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function highlightMatch(text, query) {
  if (!query || !text) return escapeHtml(text || '');
  const cleanQ = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!cleanQ) return escapeHtml(text || '');
  const regex = new RegExp(`(${cleanQ})`, 'gi');
  return escapeHtml(text).replace(regex, '<span class="bg-amber-200 text-amber-900 font-bold px-0.5 rounded-xs">$1</span>');
}

function renderMaterialDropdownResults(query) {
  const listEl = document.getElementById('trx-material-list');
  const countEl = document.getElementById('trx-mat-result-count');
  if (!listEl) return;

  const q = (query || '').toLowerCase().trim();
  const originArea = document.getElementById('trx-origin')?.value || '';

  filteredMaterials = materialsList.filter(m => {
    if (!q) return true;
    return m.code.toLowerCase().includes(q) ||
           m.name.toLowerCase().includes(q) ||
           (m.category && m.category.toLowerCase().includes(q)) ||
           (m.uom && m.uom.toLowerCase().includes(q));
  });

  if (countEl) {
    if (q) {
      countEl.textContent = `Ditemukan ${filteredMaterials.length} material untuk "${q}"`;
    } else {
      countEl.textContent = `Semua Material (${filteredMaterials.length} item) - Ketik nomor / nama`;
    }
  }

  if (filteredMaterials.length === 0) {
    listEl.innerHTML = `
      <div class="p-5 text-center text-xs text-slate-500">
        <div class="text-base mb-1">🔍</div>
        <div>Tidak ditemukan material dengan nomor atau nama <b>"${escapeHtml(q)}"</b>.</div>
        <div class="text-[11px] text-slate-400 mt-1">Coba kata kunci lain atau periksa ejaan nomor material.</div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = filteredMaterials.map((m, idx) => {
    let stockDisplay = '';
    if (originArea) {
      const stockInOrigin = getStockForMaterialInArea(m.code, originArea);
      const stockClass = stockInOrigin > 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200';
      stockDisplay = `<span class="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${stockClass}">Stok: ${stockInOrigin.toLocaleString('id-ID')} ${m.uom}</span>`;
    } else {
      const totalStock = getTotalStockForMaterial(m.code);
      stockDisplay = `<span class="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">Total: ${totalStock.toLocaleString('id-ID')} ${m.uom}</span>`;
    }

    return `
      <div class="trx-mat-option p-3 hover:bg-sky-50/80 cursor-pointer flex items-center justify-between transition-colors ${idx === activeDropdownIndex ? 'bg-sky-100/70 ring-1 ring-sky-400' : ''}" data-code="${m.code}">
        <div class="min-w-0 pr-3">
          <div class="flex flex-wrap items-center gap-1.5 mb-1">
            <span class="font-mono text-xs font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded">${highlightMatch(m.code, q)}</span>
            <span class="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">${m.category}</span>
            <span class="text-xs text-slate-400 font-mono">(${m.uom})</span>
          </div>
          <div class="text-xs sm:text-sm font-semibold text-slate-900 truncate">${highlightMatch(m.name, q)}</div>
        </div>
        <div class="shrink-0 text-right">
          ${stockDisplay}
        </div>
      </div>
    `;
  }).join('');
}

function updateActiveDropdownItem(items) {
  items.forEach((item, idx) => {
    if (idx === activeDropdownIndex) {
      item.classList.add('bg-sky-100/70', 'ring-1', 'ring-sky-400');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('bg-sky-100/70', 'ring-1', 'ring-sky-400');
    }
  });
}

function selectMaterial(matCode) {
  const mat = materialsList.find(m => m.code === matCode);
  if (!mat) return;

  selectedMaterialCode = matCode;
  
  const hiddenInput = document.getElementById('trx-material');
  if (hiddenInput) hiddenInput.value = matCode;

  const codeEl = document.getElementById('selected-mat-code');
  const nameEl = document.getElementById('selected-mat-name');
  const catEl = document.getElementById('selected-mat-category');
  const uomEl = document.getElementById('selected-mat-uom');

  if (codeEl) codeEl.textContent = mat.code;
  if (nameEl) nameEl.textContent = mat.name;
  if (catEl) catEl.textContent = mat.category;
  if (uomEl) uomEl.textContent = mat.uom;

  updateSelectedMaterialStockBadge();

  // Tampilkan card terpilih, sembunyikan input pencarian
  const searchContainer = document.getElementById('trx-material-search-container');
  const selectedCard = document.getElementById('trx-material-selected-card');
  if (searchContainer) searchContainer.classList.add('hidden');
  if (selectedCard) selectedCard.classList.remove('hidden');

  closeMaterialDropdown();

  // Fokus ke input Qty
  const qtyInput = document.getElementById('trx-qty');
  if (qtyInput) {
    qtyInput.focus();
    qtyInput.select();
  }
}

function clearSelectedMaterial() {
  selectedMaterialCode = '';
  const hiddenInput = document.getElementById('trx-material');
  if (hiddenInput) hiddenInput.value = '';

  const searchContainer = document.getElementById('trx-material-search-container');
  const selectedCard = document.getElementById('trx-material-selected-card');
  const searchInput = document.getElementById('trx-material-search-input');
  const clearBtn = document.getElementById('btn-clear-mat-search');

  if (selectedCard) selectedCard.classList.add('hidden');
  if (searchContainer) searchContainer.classList.remove('hidden');

  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
    if (clearBtn) clearBtn.classList.add('hidden');
  }

  activeDropdownIndex = -1;
  openMaterialDropdown();
  renderMaterialDropdownResults('');
}

function updateSelectedMaterialStockBadge() {
  if (!selectedMaterialCode) return;
  const mat = materialsList.find(m => m.code === selectedMaterialCode);
  if (!mat) return;

  const badgeEl = document.getElementById('selected-mat-stock-badge');
  if (!badgeEl) return;

  const originArea = document.getElementById('trx-origin')?.value || '';
  if (originArea) {
    const stock = getStockForMaterialInArea(selectedMaterialCode, originArea);
    if (stock > 0) {
      badgeEl.innerHTML = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">✓ Saldo di ${escapeHtml(originArea)}: <b>${stock.toLocaleString('id-ID')} ${mat.uom}</b></span>`;
    } else {
      badgeEl.innerHTML = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">⚠️ Saldo stok 0 di ${escapeHtml(originArea)}</span>`;
    }
  } else {
    const total = getTotalStockForMaterial(selectedMaterialCode);
    badgeEl.innerHTML = `<span class="text-[11px] text-slate-500">Pilih Area Asal untuk cek saldo stok area • Total semua area: <b>${total.toLocaleString('id-ID')} ${mat.uom}</b></span>`;
  }
}

function populateMaterialDropdown() {
  if (!selectedMaterialCode) {
    renderMaterialDropdownResults(document.getElementById('trx-material-search-input')?.value || '');
  } else {
    updateSelectedMaterialStockBadge();
  }
}

function populateAreaDropdowns() {
  const origin = document.getElementById('trx-origin');
  const dest = document.getElementById('trx-dest');
  const filter = document.getElementById('stock-filter-area');
  const presetOrigin = document.getElementById('bulk-preset-origin');
  const presetDest = document.getElementById('bulk-preset-dest');

  const options = areasList.map(a => `<option value="${a}">${a}</option>`).join('');

  if (origin) {
    origin.innerHTML = '<option value="">-- Pilih Area Asal --</option>' + options;
  }
  if (dest) {
    dest.innerHTML = '<option value="">-- Pilih Area Tujuan --</option>' + options;
  }
  if (filter) {
    filter.innerHTML = '<option value="ALL">Semua Stock Control Area</option>' + options;
  }
  if (presetOrigin) {
    const curVal = presetOrigin.value;
    presetOrigin.innerHTML = '<option value="">-- Tetapkan Area Asal Seragam --</option>' + options;
    if (curVal) presetOrigin.value = curVal;
  }
  if (presetDest) {
    const curVal = presetDest.value;
    presetDest.innerHTML = '<option value="">-- Tetapkan Area Tujuan Seragam --</option>' + options;
    if (curVal) presetDest.value = curVal;
  }
}

function renderLoginUsersGrid() {
  const grid = document.getElementById('login-users-grid');
  if (grid) {
    grid.innerHTML = '';
  }
}

function validateLoginInputPreview(rawId) {
  const preview = document.getElementById('login-user-verified-preview');
  if (preview) {
    preview.className = 'mt-1.5 text-xs text-slate-500 min-h-[18px]';
    preview.textContent = 'Masukkan User ID pribadi yang telah didaftarkan oleh administrator pada database.';
  }
}

function showLoginError(message) {
  const errBox = document.getElementById('login-error-msg');
  const errText = document.getElementById('login-error-text');
  if (errBox && errText) {
    errText.textContent = message;
    errBox.classList.remove('hidden');
  }
}

function hideLoginError() {
  const errBox = document.getElementById('login-error-msg');
  if (errBox) errBox.classList.add('hidden');
}

function handleLogin() {
  const input = document.getElementById('login-user-id');
  const id = (input ? input.value : '').trim().toUpperCase();

  if (!id) {
    showLoginError('Harap masukkan User ID statis yang terdaftar di tabel users!');
    if (input) input.focus();
    return;
  }

  const user = findUserById(id);
  if (!user) {
    showLoginError(`User ID "${id}" tidak ditemukan atau belum terdaftar di sistem. Harap hubungi administrator gudang.`);
    if (input) input.focus();
    return;
  }

  hideLoginError();
  currentUser = user;
  localStorage.setItem(SUPABASE_CONFIG.STORAGE_KEY_USER, JSON.stringify(currentUser));
  updateUI();
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem(SUPABASE_CONFIG.STORAGE_KEY_USER);
  updateUI();
  const input = document.getElementById('login-user-id');
  if (input) {
    input.value = '';
    validateLoginInputPreview('');
  }
  hideLoginError();
  renderLoginUsersGrid();
}

function setupEventListeners() {
  const loginBtn = document.getElementById('btn-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }

  const loginInput = document.getElementById('login-user-id');
  if (loginInput) {
    loginInput.addEventListener('input', (e) => {
      validateLoginInputPreview(e.target.value);
      hideLoginError();
    });

    loginInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin();
      }
    });
  }

  // Tutup dropdown pencarian material massal jika klik di luar
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.bulk-mat-wrapper')) {
      closeAllBulkDropdowns();
    }
  });

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  const logoutMobileBtn = document.getElementById('btn-logout-mobile');
  if (logoutMobileBtn) {
    logoutMobileBtn.addEventListener('click', handleLogout);
  }

  const trxSwitchUserBtn = document.getElementById('btn-trx-switch-user');
  if (trxSwitchUserBtn) {
    trxSwitchUserBtn.addEventListener('click', handleLogout);
  }

  const trxForm = document.getElementById('trx-form');
  if (trxForm) {
    trxForm.addEventListener('submit', handleTransactionSubmit);
  }

  // Switch Mode Transaksi: Tunggal vs Massal
  const btnModeSingle = document.getElementById('btn-mode-single');
  if (btnModeSingle) {
    btnModeSingle.addEventListener('click', () => setTransactionMode('single'));
  }

  const btnModeBulk = document.getElementById('btn-mode-bulk');
  if (btnModeBulk) {
    btnModeBulk.addEventListener('click', () => setTransactionMode('bulk'));
  }

  // Aksi Transaksi Massal
  const btnAddBulkRow = document.getElementById('btn-add-bulk-row');
  if (btnAddBulkRow) {
    btnAddBulkRow.addEventListener('click', () => addBulkRow(1));
  }

  const btnAddBulk3Rows = document.getElementById('btn-add-bulk-3-rows');
  if (btnAddBulk3Rows) {
    btnAddBulk3Rows.addEventListener('click', () => addBulkRow(3));
  }

  const btnClearBulkRows = document.getElementById('btn-clear-bulk-rows');
  if (btnClearBulkRows) {
    btnClearBulkRows.addEventListener('click', resetBulkRows);
  }

  const btnApplyBulkPreset = document.getElementById('btn-apply-bulk-preset');
  if (btnApplyBulkPreset) {
    btnApplyBulkPreset.addEventListener('click', applyBulkPreset);
  }

  const btnSubmitBulkTrx = document.getElementById('btn-submit-bulk-trx');
  if (btnSubmitBulkTrx) {
    btnSubmitBulkTrx.addEventListener('click', handleBulkTransactionSubmit);
  }

  // Event Pencarian Material Interaktif (Searchable Autocomplete)
  const searchInput = document.getElementById('trx-material-search-input');
  const searchClearBtn = document.getElementById('btn-clear-mat-search');
  const toggleDropdownBtn = document.getElementById('btn-toggle-mat-dropdown');
  const changeMatBtn = document.getElementById('btn-change-material');
  const materialListEl = document.getElementById('trx-material-list');
  const originSelect = document.getElementById('trx-origin');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value;
      if (searchClearBtn) {
        if (q.length > 0) searchClearBtn.classList.remove('hidden');
        else searchClearBtn.classList.add('hidden');
      }
      activeDropdownIndex = -1;
      openMaterialDropdown();
      renderMaterialDropdownResults(q);
    });

    searchInput.addEventListener('focus', () => {
      openMaterialDropdown();
      renderMaterialDropdownResults(searchInput.value);
    });

    searchInput.addEventListener('keydown', (e) => {
      const items = materialListEl ? materialListEl.querySelectorAll('.trx-mat-option') : [];
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length === 0) return;
        activeDropdownIndex = (activeDropdownIndex + 1) % items.length;
        updateActiveDropdownItem(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length === 0) return;
        activeDropdownIndex = (activeDropdownIndex - 1 + items.length) % items.length;
        updateActiveDropdownItem(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeDropdownIndex >= 0 && items[activeDropdownIndex]) {
          const code = items[activeDropdownIndex].getAttribute('data-code');
          if (code) selectMaterial(code);
        } else if (filteredMaterials.length === 1) {
          selectMaterial(filteredMaterials[0].code);
        }
      } else if (e.key === 'Escape') {
        closeMaterialDropdown();
      }
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchClearBtn.classList.add('hidden');
        searchInput.focus();
        activeDropdownIndex = -1;
        renderMaterialDropdownResults('');
      }
    });
  }

  if (toggleDropdownBtn) {
    toggleDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = document.getElementById('trx-material-dropdown');
      if (dropdown && dropdown.classList.contains('hidden')) {
        openMaterialDropdown();
        renderMaterialDropdownResults(searchInput ? searchInput.value : '');
        searchInput?.focus();
      } else {
        closeMaterialDropdown();
      }
    });
  }

  if (materialListEl) {
    materialListEl.addEventListener('click', (e) => {
      const opt = e.target.closest('.trx-mat-option');
      if (opt) {
        const code = opt.getAttribute('data-code');
        if (code) selectMaterial(code);
      }
    });
  }

  if (changeMatBtn) {
    changeMatBtn.addEventListener('click', () => {
      clearSelectedMaterial();
    });
  }

  if (originSelect) {
    originSelect.addEventListener('change', () => {
      updateSelectedMaterialStockBadge();
      const dropdown = document.getElementById('trx-material-dropdown');
      if (dropdown && !dropdown.classList.contains('hidden')) {
        renderMaterialDropdownResults(searchInput ? searchInput.value : '');
      }
    });
  }

  // Tutup dropdown jika klik di luar container pencarian
  document.addEventListener('click', (e) => {
    const container = document.getElementById('trx-material-search-container');
    if (container && !container.contains(e.target)) {
      closeMaterialDropdown();
    }
  });

  const qtyInput = document.getElementById('trx-qty');
  if (qtyInput) {
    qtyInput.addEventListener('input', () => {
      const originArea = document.getElementById('trx-origin')?.value;
      const qty = parseFloat(qtyInput.value);
      const feedbackEl = document.getElementById('trx-feedback');
      if (selectedMaterialCode && originArea && !isNaN(qty) && qty > 0) {
        const available = getStockForMaterialInArea(selectedMaterialCode, originArea);
        if (qty > available) {
          showFeedback(feedbackEl, `⚠️ Perhatian: Jumlah transfer (${qty}) melebihi saldo stok yang tersedia di ${originArea} (${available})`, 'error');
        }
      }
    });
  }

  document.getElementById('stock-filter-area')?.addEventListener('change', renderStockBalance);
  document.getElementById('stock-search')?.addEventListener('input', renderStockBalance);
  document.getElementById('history-search')?.addEventListener('input', renderTransactionHistory);

  ['dashboard', 'transaction', 'stock', 'history'].forEach(tab => {
    document.getElementById(`nav-btn-${tab}`)?.addEventListener('click', () => switchTab(tab));
  });

  document.getElementById('btn-export-csv')?.addEventListener('click', exportTransactionsCSV);
  document.getElementById('btn-print-history')?.addEventListener('click', () => window.print());

  document.getElementById('btn-open-config')?.addEventListener('click', openConfigModal);
  document.getElementById('btn-login-open-config')?.addEventListener('click', openConfigModal);
  document.getElementById('btn-close-config')?.addEventListener('click', closeConfigModal);
  document.getElementById('btn-save-config')?.addEventListener('click', saveAndTestConfig);
  document.getElementById('btn-copy-sql')?.addEventListener('click', copySqlSchema);

  // Event listener tombol banner peringatan
  document.getElementById('btn-banner-retry')?.addEventListener('click', () => {
    bannerManuallyDismissed = false;
    checkConnectionStatus();
  });
  document.getElementById('btn-banner-config')?.addEventListener('click', openConfigModal);
  document.getElementById('btn-banner-dismiss')?.addEventListener('click', () => {
    document.getElementById('nav-offline-banner')?.classList.add('hidden');
    bannerManuallyDismissed = true;
  });

  // Deteksi event online dan offline browser perangkat
  window.addEventListener('online', () => {
    bannerManuallyDismissed = false;
    checkConnectionStatus();
  });
  window.addEventListener('offline', () => {
    bannerManuallyDismissed = false;
    updateConnectionStatusState('offline_network');
  });

  // Heartbeat otomatis periksa koneksi berkala setiap 35 detik
  setInterval(() => {
    if (navigator.onLine && supabaseClient) {
      checkConnectionStatus(true);
    }
  }, 35000);
}

function showFeedback(el, message, type) {
  if (!el) return;
  el.className = `p-3 rounded-lg text-sm font-medium ${type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`;
  el.textContent = message;
  el.classList.remove('hidden');
  setTimeout(() => {
    el.classList.add('hidden');
  }, 4000);
}

function formatDate(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoStr;
  }
}
