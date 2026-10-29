# Washly — Laundry Management System (Frontend)

Sistem manajemen dan layanan laundry modern dengan antarmuka pelanggan intuitif, pelacakan status pesanan real-time, dan konsol administrasi penimbangan akurat.

---

## 1. IKHTISAR PROYEK & BATASAN TEKNOLOGI

Aplikasi ini dibangun khusus memenuhi batasan ketat tanpa framework:
- **Teknologi yang Digunakan:** HTML5, CSS3, Vanilla JavaScript (ES6+), Inline SVG.
- **Teknologi Terlarang:** Tanpa React, Vue, Angular, Svelte, Bootstrap, Tailwind CSS, jQuery, Vite, Webpack, atau npm dependencies.
- **Arah Desain:** *Soft Luxury — Navy & Electric Blue* (#0B1F3A, #1769FF, #F5F7FB, #FFFFFF).
- **Bahasa Antarmuka:** Bahasa Indonesia secara menyeluruh.
- **Kesiapan Backend:** Dilengkapi adapter API sentral (`js/api.js`) yang siap terhubung dengan backend PHP & database MySQL tim backend.

---

## 2. STRUKTUR FOLDER PROYEK

```
washly-laundry/
├── index.html                  # Landing page publik & pelacakan instan
├── login.html                  # Halaman masuk (Role switcher & 1-click demo filler)
├── register.html               # Halaman registrasi akun pelanggan
│
├── customer/                   # Area Pelanggan
│   ├── dashboard.html          # Dasbor pelanggan, statistik pesanan & pelacakan cepat
│   ├── order.html              # Form pemesanan laundry & kalkulator live
│   ├── order-detail.html       # Stepper pelacakan 4-tahap, rincian berat & biaya
│   ├── history.html            # Riwayat transaksi lengkap dengan filter status & pencarian
│   └── profile.html            # Pengaturan profil pelanggan
│
├── admin/                      # Area Administrasi Outlet
│   ├── dashboard.html          # Dasbor operasional, metrik pendapatan & antrean penimbangan
│   ├── orders.html             # Manajemen pesanan masuk dengan multi-filter
│   └── order-detail.html       # Antarmuka penimbangan pakaian riil & transisi status SOP
│
├── css/                        # Lapisan Style Modular
│   ├── reset.css               # Modern CSS reset
│   ├── global.css              # Design tokens, tipografi, utility classes
│   ├── components.css          # Button, Card, Badge, Form, Modal, Toast, Stepper
│   ├── auth.css                # Style khusus autentikasi
│   ├── customer.css            # Style portal pelanggan
│   ├── admin.css               # Style konsol admin
│   └── responsive.css          # Penyesuaian responsif mobile & tablet
│
├── js/                         # Logika & Layanan Data
│   ├── config.js               # Konfigurasi layanan, harga, status, wewangian
│   ├── mock-data.js            # Seed data demo awal
│   ├── api.js                  # Adapter API terpusat (Demo mode & Fetch PHP)
│   ├── validators.js           # Form validation & sanitasi input
│   ├── app.js                  # Formatter rupiah/tanggal, toast, modal, SVG icon
│   ├── navigation.js           # Pengendali navbar, mobile menu & banner demo
│   ├── customer.js             # Logika interaktif area pelanggan
│   └── admin.js                # Logika penimbangan & transisi status admin
│
├── docs/
│   ├── API_CONTRACT.md         # Usulan spesifikasi REST API untuk tim PHP/MySQL
│   └── FRONTEND_GUIDE.md       # Panduan arsitektur frontend & pemeliharaan
└── README.md                   # Dokumen utama ini
```

---

## 3. CARA MENJALANKAN (SETUP & RUN)

Karena aplikasi menggunakan teknologi web murni tanpa build step:

### Opsi A: Menggunakan Live Server atau Simple HTTP Server (Direkomendasikan)
Gunakan salah satu perintah berikut di terminal pada folder proyek:

```bash
# Python 3
python -m http.server 8000

# Node.js (npx http-server)
npx http-server -p 8000

# PHP Built-in Server
php -S localhost:8000
```
Buka browser dan akses: `http://localhost:8000`

### Opsi B: Buka Langsung File HTML
Buka file `index.html` langsung dengan klik dua kali di file explorer Anda pada peramban Google Chrome, Edge, atau Firefox.

---

## 4. PANDUAN PENGUJIAN MODE DEMO (DEMO PERSONAS)

Aplikasi memiliki **Demo Bar interaktif** di bagian paling atas setiap halaman yang memungkinkan pergantian peran seketika tanpa perlu login ulang manual:

1. **Peran Pelanggan:**
   - Nama: **Budi Santoso**
   - Email: `budi@example.com`
   - Akses: Dashboard Pelanggan, Buat Pesanan Baru, Riwayat Pesanan, Pelacakan Status.
2. **Peran Admin Outlet:**
   - Nama: **Siti Aminah (Admin Outlet)**
   - Email: `admin@washly.id`
   - Akses: Dashboard Admin, Antrean Penimbangan, Input Berat Riil, Pembaruan Status SOP.
3. **Tombol Reset Data Demo:**
   - Tersedia di banner atas (`🔄 Reset Data`) untuk mengembalikan pesanan simulasi ke data awal kapan saja.

---

## 5. ALUR BISNIS YANG DIIMPLEMENTASIKAN

Sistem mengikuti urutan status SOP Washly:
$$\text{Menunggu Penyerahan} \longrightarrow \text{Diproses} \longrightarrow \text{Siap Diambil} \longrightarrow \text{Diambil}$$

1. **Pelanggan Membuat Pesanan (`customer/order.html`):**
   - Pelanggan memilih paket layanan, aroma parfum, dan perkiraan berat.
   - Pesanan diterbitkan dengan status awal **Menunggu Penyerahan**.
   - Berat aktual dan total biaya final masih bertuliskan `Menunggu Penimbangan`.
2. **Admin Menerima & Menimbang Pakaian (`admin/order-detail.html`):**
   - Admin membuka pesanan dari antrean penimbangan.
   - Admin memasukkan berat riil hasil timbangan (contoh: `3.5 kg`).
   - Sistem secara otomatis menghitung: `(Berat x Tarif) + Biaya Parfum = Biaya Final`.
   - Admin memperbarui status ke **Diproses**.
3. **Penyelesaian & Pengambilan:**
   - Setelah cucian selesai, Admin mengubah status ke **Siap Diambil**.
   - Pelanggan dapat memantau status pesanan yang telah berganti menjadi hijau/siap diambil di portal pelanggan.
   - Saat pakaian diserahkan ke pelanggan, Admin mengubah status akhir menjadi **Diambil**.

---

## 6. STATUS INTEGRASI BACKEND & DATABASE

- **Status Saat Ini:** Frontend menggunakan `Demo Mode` dengan penyimpanan reaktif via `localStorage` sehingga perubahan data pesanan oleh admin langsung tercermin pada halaman pelanggan.
- **Kesiapan PHP/MySQL:** Modul `js/api.js` telah dipersiapkan dengan antarmuka metode asinkron standar `fetch()`. Ketika endpoint PHP telah dibuat oleh tim backend sesuai `docs/API_CONTRACT.md`, pergantian ke API riil cukup dengan mematikan flag demo mode (`WashlyAPI.setDemoMode(false)`).
