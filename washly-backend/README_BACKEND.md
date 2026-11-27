-# Washly Laundry - Backend PHP Native + MySQL

Backend ini dibuat mengikuti naskah sumatif Pemrograman Web dan kontrak API yang sudah ada di `docs/API_CONTRACT.md` pada repository Washly. Teknologi yang digunakan hanya PHP Native, PDO, MySQL, dan PHP Session (tanpa framework).

## 1. Struktur folder

```text
washly-laundry/
├── backend/
│   ├── config/database.php
│   └── api/
│       ├── common.php
│       ├── auth/
│       │   ├── register.php
│       │   ├── login.php
│       │   ├── logout.php
│       │   └── me.php
│       ├── services/list.php
│       └── orders/
│           ├── create.php
│           ├── customer.php
│           ├── detail.php
│           ├── admin.php
│           ├── update-status.php
│           ├── metrics.php
│           └── delete.php
├── database/washly.sql
├── docs/FRONTEND_INTEGRATION.md
├── docs/API_TESTING.md
├── docs/ERD.md
└── js/api.js
```

## 2. Instalasi lokal dengan XAMPP

1. Salin folder proyek `washly-laundry` ke `C:\xampp\htdocs\washly-laundry`.
2. Buka XAMPP, lalu jalankan Apache dan MySQL.
3. Buka `http://localhost/phpmyadmin`.
4. Pilih menu **Import**, lalu impor file `database/washly.sql`.
5. Pastikan database `washly_laundry` dan lima tabel berikut terbentuk: `users`, `services`, `scents`, `orders`, dan `order_status_history`.
6. Periksa `backend/config/database.php`. Default XAMPP: host `127.0.0.1`, database `washly_laundry`, user `root`, password kosong. Sesuaikan jika konfigurasi MySQL kamu berbeda.
7. Ikuti `docs/FRONTEND_INTEGRATION.md` untuk menghubungkan `js/api.js` dan mematikan Demo Mode. Untuk pengujian endpoint manual, baca `docs/API_TESTING.md`.
8. Buka `http://localhost/washly-laundry/`.

## 3. Akun pengujian

- Email admin: `admin@washly.id`
- Password awal: `admin123`

Akun tersebut dibuat untuk pengujian lokal. Ganti password sebelum aplikasi dipasang ke hosting atau digunakan secara publik. Pelanggan mendaftar melalui halaman registrasi.

## 4. Relasi database

- `users` 1:N `orders`: satu pelanggan dapat memiliki banyak pesanan.
- `services` 1:N `orders`: satu layanan dapat dipakai pada banyak pesanan.
- `scents` 1:N `orders`: satu pilihan parfum dapat dipakai pada banyak pesanan.
- `orders` 1:N `order_status_history`: satu pesanan memiliki banyak catatan perubahan status.
- `users` 1:N `order_status_history`: satu pengguna/admin dapat mencatat banyak perubahan status.

Nilai nama layanan, tarif, parfum, dan harga parfum juga disimpan sebagai snapshot pada tabel `orders`, sehingga riwayat pesanan tidak berubah ketika katalog diperbarui.

## 5. Endpoint

Semua endpoint mengembalikan format JSON konsisten: `success`, `message`, dan `data`.

| Method | Endpoint | Akses | Fungsi |
|---|---|---|---|
| POST | `/backend/api/auth/register.php` | Publik | Registrasi pelanggan |
| POST | `/backend/api/auth/login.php` | Publik | Login dan membuat session |
| POST | `/backend/api/auth/logout.php` | Login | Menghapus session |
| GET | `/backend/api/auth/me.php` | Login | Memeriksa session aktif |
| GET | `/backend/api/services/list.php` | Publik | Membaca katalog layanan |
| POST | `/backend/api/orders/create.php` | Customer | Membuat pesanan |
| GET | `/backend/api/orders/customer.php` | Customer | Membaca pesanan milik sendiri |
| GET | `/backend/api/orders/detail.php?id=KODE` | Customer/Admin | Membaca detail pesanan |
| GET | `/backend/api/orders/admin.php` | Admin | Membaca semua pesanan + filter |
| POST | `/backend/api/orders/update-status.php` | Admin | Menimbang dan mengubah status |
| GET | `/backend/api/orders/metrics.php` | Admin | Statistik dashboard |
| DELETE | `/backend/api/orders/delete.php?id=KODE` | Admin | Menghapus pesanan yang belum diproses |

Endpoint DELETE ditambahkan untuk melengkapi persyaratan CRUD sumatif. Penghapusan dibatasi hanya untuk pesanan berstatus `Menunggu Penyerahan` agar riwayat pesanan yang sudah diproses tidak hilang.

## 6. Aturan bisnis pesanan

Status mengikuti SOP front-end:

`Menunggu Penyerahan -> Diproses -> Siap Diambil -> Diambil`

Tidak boleh melompati tahap atau mundur. Saat pesanan berubah dari `Menunggu Penyerahan` ke `Diproses`, admin wajib memasukkan berat aktual. Server menghitung biaya final dengan rumus:

`final_cost = ROUND(actual_weight * price_per_unit) + scent_price`

Server mengambil identitas pelanggan dari PHP Session. Backend tidak mempercayai `customerId`, nama pelanggan, atau nomor telepon yang dikirim browser.

## 7. Keamanan yang diterapkan

- Password disimpan dengan `password_hash()` dan dicek memakai `password_verify()`.
- Query database menggunakan PDO prepared statements.
- Session ID diregenerasi setelah login/registrasi.
- Cookie session memakai HttpOnly dan SameSite=Lax.
- Akses endpoint dibatasi berdasarkan role customer/admin.
- Customer hanya dapat membaca pesanan miliknya sendiri.
- Harga, status awal, dan total final ditentukan/dihitung di server.
- Validasi input dilakukan kembali di PHP, bukan hanya mengandalkan JavaScript.
- Error database dicatat di log server; detail internal tidak dikirim ke browser.

## 8. Catatan pengujian dan keterbatasan

Semua file PHP sudah diperiksa menggunakan `php -l` dan file adapter JavaScript sudah diperiksa menggunakan `node --check`. Pengujian request end-to-end ke MySQL belum dapat dijalankan di lingkungan pembuatan paket ini karena ekstensi PHP `pdo_mysql` tidak tersedia; lakukan uji integrasi di XAMPP setelah memastikan ekstensi `pdo_mysql` aktif.

## 9. Catatan penting

Proyek di GitHub saat dianalisis masih menggunakan front-end Demo Mode. Backend ini tidak otomatis masuk ke repository karena koneksi repository saat ini hanya memberikan akses baca. Salin folder `backend`, `database`, dan file `js/api.js` ke project lokal, lalu commit ke branch kelompok setelah diuji.
