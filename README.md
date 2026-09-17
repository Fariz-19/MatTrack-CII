# Material Tracking System — Static Web

Aplikasi tracking penerimaan & pengembalian material antar *stock control area*.
Murni **HTML + CSS + JavaScript** (tanpa Node.js, tanpa build step, tanpa bundler).

## Struktur

```
index.html          # Seluruh markup & tampilan
src/style.css       # Styling custom (font, scrollbar, print)
src/config.js       # Konfigurasi & helper Supabase (localStorage)
src/app.js          # Seluruh logika aplikasi (vanilla JS)
.nojekyll           # Mencegah GitHub Pages memproses file lewat Jekyll
```

## Cara menjalankan di lokal

Buka `index.html` langsung lewat browser sudah cukup.
Kalau ingin lebih mirip kondisi hosting:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

## Deploy ke GitHub Pages

1. Buat repository baru di GitHub, lalu push seluruh isi folder ini ke branch `main`
   (file `index.html` harus berada di **root** repository, bukan di dalam subfolder).

   ```bash
   git init
   git add .
   git commit -m "Material Tracking System - static web"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```

2. Di GitHub: **Settings → Pages**
   - Source: `Deploy from a branch`
   - Branch: `main`, folder: `/ (root)`
   - Save

3. Tunggu 1–2 menit. Situs tersedia di
   `https://USERNAME.github.io/NAMA-REPO/`

## Konfigurasi Supabase

Aplikasi tidak memakai file `.env`. Setelah situs terbuka:

1. Klik **Pengaturan Supabase** di halaman login.
2. Isi **Project URL** dan **Anon Key** (keduanya tersimpan di `localStorage` browser masing-masing pengguna).
3. Salin **Script SQL** dari modal tersebut, jalankan di *SQL Editor* Supabase untuk membuat tabel.
4. Login memakai **User ID** yang terdaftar pada tabel `users`.

Alternatif: isi `DEFAULT_URL` dan `DEFAULT_ANON_KEY` di `src/config.js` supaya
tidak perlu diisi manual tiap browser.

## Catatan penting

- **Butuh internet.** Tailwind CSS dan Supabase JS dimuat dari CDN, dan Supabase
  sendiri berupa layanan online. Aplikasi tidak bisa berjalan sepenuhnya offline.
- **Anon key bersifat publik.** Semua yang dikirim ke browser bisa dibaca siapa pun
  yang membuka situs. Keamanan data sepenuhnya bergantung pada **Row Level Security (RLS)**
  di Supabase — atur RLS sebelum dipakai untuk data sungguhan.
- **Login di sini bukan autentikasi.** Pengecekan User ID hanya dilakukan di sisi
  browser, jadi siapa pun bisa melewatinya. Untuk kontrol akses nyata, gunakan
  Supabase Auth + RLS.
- Tailwind dimuat via `cdn.tailwindcss.com` yang secara resmi ditujukan untuk
  development, jadi akan muncul peringatan di console. Fungsional, tapi untuk
  produksi lebih baik memakai file CSS Tailwind hasil build.
