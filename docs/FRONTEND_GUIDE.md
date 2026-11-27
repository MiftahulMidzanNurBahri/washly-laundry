# PANDUAN ARSITEKTUR & PENGEMBANGAN FRONTEND WASHLY
## (Frontend Developer & Maintenance Guide)

---

## 1. IKHTISAR TEKNOLOGI

Frontend Washly dibangun sesuai batasan non-negotiable spesifikasi:
- **PHP Murni (Modular Templates):** Halaman dirender dengan komponen modular di folder `includes/` (`require_once`, session helper, XSS escaping `htmlspecialchars()`).
- **HTML5:** Struktur semantik (`<header>`, `<main>`, `<section>`, `<aside>`, `<nav>`).
- **CSS3 Murni:** CSS Custom Properties (Design Tokens), Flexbox, CSS Grid, media queries responsif, serta *Dark Mode*.
- **Vanilla JavaScript (ES6+):** Zero dependency, modular, terpisah antara adaptor data, validasi, dan rendering.
- **Inline SVG:** Seluruh icon antarmuka menggunakan vector inline murni tanpa icon font pihak ketiga.
- **Tanpa Framework:** Bebas dari React, Vue, Bootstrap, Tailwind, jQuery, dan build-tools (Vite/Webpack). Dapat dijalankan langsung di XAMPP, Laragon, atau `php -S localhost:8000`.

---

## 2. STRUKTUR DIREKTORI PROYEK

```
washly-laundry/
├── index.php                   # Landing page publik & pelacakan cepat
├── login.php                   # Halaman masuk (Pelanggan / Admin)
├── register.php                # Halaman pendaftaran akun pelanggan
│
├── includes/                   # Partials & helper PHP bersama
│   ├── bootstrap.php           # Session PHP, XSS escaping & theme toggle helper
│   ├── head.php                # <head> dinamis & pencegah flash Dark Mode
│   ├── customer-header.php     # Header navigasi area pelanggan
│   ├── admin-sidebar.php       # Sidebar navigasi area admin
│   ├── admin-topbar.php        # Topbar area admin
│   └── scripts.php             # Pemuat script JS modular
│
├── customer/                   # Area khusus peran Pelanggan
│   ├── dashboard.php           # Ringkasan pesanan aktif & metrik
│   ├── order.php               # Form pemesanan laundry & kalkulator live
│   ├── order-detail.php        # Stepper pelacakan 4-tahap & rincian biaya
│   ├── history.php             # Tabel riwayat pesanan dengan filter status
│   └── profile.php             # Pengaturan profil pelanggan
│
├── admin/                      # Area khusus peran Admin Outlet
│   ├── dashboard.php           # Metrik operasional & antrean penimbangan
│   ├── orders.php              # Daftar seluruh pesanan & pencarian
│   └── order-detail.php        # Antarmuka penimbangan riil & transisi status SOP
│
├── css/                        # Lapisan styling modular
│   ├── reset.css               # Normalisasi browser modern
│   ├── global.css              # Design tokens, tipografi, utility classes
│   ├── components.css          # Button, Card, Badge, Form, Modal, Toast, Stepper
│   ├── auth.css                # Styling khusus halaman login & registrasi
│   ├── customer.css            # Styling khusus antarmuka pelanggan
│   ├── admin.css               # Styling layout sidebar & panel admin
│   └── responsive.css          # Breakpoints tablet & mobile
│
├── js/                         # Lapisan logika aplikasi
│   ├── config.js               # Konstanta layanan, status, harga, dan wewangian
│   ├── mock-data.js            # Seed data demo awal (pelanggan, admin, pesanan)
│   ├── api.js                  # Adapter API sentral (Demo Storage & PHP Fetch)
│   ├── validators.js           # Validasi email, no hp, kata sandi, dan sanitasi XSS
│   ├── app.js                  # Formatter rupiah/tanggal, toast, modal, icon library
│   ├── navigation.js           # Demo banner switcher, mobile drawer, active nav
│   ├── customer.js             # Logika interaksi seluruh halaman pelanggan
│   └── admin.js                # Logika kalkulator penimbangan & transisi status admin
│
├── docs/                       # Dokumentasi teknis
│   ├── API_CONTRACT.md         # Kontrak REST API untuk tim PHP/MySQL
│   └── FRONTEND_GUIDE.md       # Panduan arsitektur frontend ini
└── README.md                   # Panduan umum & cara menjalankan
```

---

## 3. SISTEM TOKENS DESAIN (PALET LAVENDER WHITE & MIDNIGHT LAVENDER)

Definisi token warna tersentralisasi di `css/global.css`:

```css
:root {
  /* Brand Palette */
  --color-primary-navy: #39345E;
  --color-navy-light: #7569A8;
  --color-electric-blue: #7569A8;
  --color-electric-blue-hover: #39345E;
  --color-electric-blue-light: #EEEAF8;

  /* Surfaces & Background */
  --color-background: #FAF9FD;
  --color-surface: #FFFFFF;
  --color-surface-hover: #EEEAF8;

  /* Text & Border */
  --color-text-primary: #39345E;
  --color-text-secondary: #6F6A80;
  --color-text-muted: #9690A5;
  --color-border: #EEEAF8;

  /* Status Colors */
  --color-success: #15803D; /* Diambil */
  --color-warning: #B45309; /* Menunggu Penyerahan */
  --color-error: #B91C1C;
  --color-info: #0284C7;    /* Diproses */
}
```

Dark mode overrides the same tokens with the Midnight Lavender palette and uses
the existing `data-theme="dark"` attribute. The theme toggle persists through
`localStorage` using the `washly_theme` key, initialized in each page head before styles load.

---

## 4. ALUR STATUS BISNIS (BUSINESS FLOW SOP)

Alur status cucian mengikuti urutan ketat berikut:
1. **Menunggu Penyerahan**: Pesanan dibuat oleh pelanggan melalui `customer/order.html`. Berat aktual masih `null`.
2. **Diproses**: Pelanggan menyerahkan pakaian ke outlet. Admin memasukkan berat riil hasil timbangan di `admin/order-detail.html`. Total biaya final dihitung otomatis dan status berpindah ke `Diproses`.
3. **Siap Diambil**: Proses cuci, kering, dan setrika selesai. Pakaian dikemas harum. Menunggu diambil pelanggan.
4. **Diambil**: Pelanggan mengambil cucian di outlet dan menyelesaikan pembayaran. Transaksi selesai.

---

## 5. CARA MENGUBAH / MENAMBAH FITUR

- **Menambah Layanan Laundry:** Buka `js/config.js` pada array `WASHLY_CONFIG.SERVICES`. Layanan baru akan otomatis muncul di landing page dan form pemesanan pelanggan.
- **Mengaktifkan Backend PHP & MySQL:** Buka `js/config.js` lalu ubah `WASHLY_CONFIG.BACKEND.DEFAULT_DEMO_MODE` menjadi `false` (atau panggil `WashlyAPI.setDemoMode(false)`). Path endpoint `./backend/api` / `../backend/api` akan terdeteksi otomatis di XAMPP/Laragon tanpa perlu merombak file `.html`, lengkap dengan dukungan cookie `$_SESSION` PHP (`credentials: 'include'`), Bearer token, serta pemetaan kolom `camelCase` maupun `snake_case` sesuai spesifikasi di `docs/API_CONTRACT.md`.
