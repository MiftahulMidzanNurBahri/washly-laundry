# PANDUAN ARSITEKTUR & PENGEMBANGAN FRONTEND WASHLY
## (Frontend Developer & Maintenance Guide)

---

## 1. IKHTISAR TEKNOLOGI

Frontend Washly dibangun sesuai batasan non-negotiable spesifikasi:
- **HTML5:** Struktur semantik (`<header>`, `<main>`, `<section>`, `<aside>`, `<nav>`).
- **CSS3 Murni:** CSS Custom Properties (Design Tokens), Flexbox, CSS Grid, media queries responsif.
- **Vanilla JavaScript (ES6+):** Zero dependency, modular, terpisah antara adaptor data, validasi, dan rendering.
- **Inline SVG:** Seluruh icon antarmuka menggunakan vector inline murni tanpa icon font pihak ketiga.
- **Tanpa Framework:** Bebas dari React, Vue, Bootstrap, Tailwind, jQuery, dan build-tools (Vite/Webpack). Dapat dijalankan secara instan di browser atau server web statis.

---

## 2. STRUKTUR DIREKTORI PROYEK

```
washly-laundry/
├── index.html                  # Landing page publik & pelacakan cepat
├── login.html                  # Halaman masuk (Pelanggan / Admin)
├── register.html               # Halaman pendaftaran akun pelanggan
│
├── customer/                   # Area khusus peran Pelanggan
│   ├── dashboard.html          # Ringkasan pesanan aktif & metrik
│   ├── order.html              # Form pemesanan laundry & kalkulator live
│   ├── order-detail.html       # Stepper pelacakan 4-tahap & rincian biaya
│   ├── history.html            # Tabel riwayat pesanan dengan filter status
│   └── profile.html            # Pengaturan profil pelanggan
│
├── admin/                      # Area khusus peran Admin Outlet
│   ├── dashboard.html          # Metrik operasional & antrean penimbangan
│   ├── orders.html             # Daftar seluruh pesanan & pencarian
│   └── order-detail.html       # Antarmuka penimbangan riil & transisi status SOP
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

## 3. SISTEM TOKENS DESAIN (PALET NAVY & ELECTRIC BLUE)

Definisi token warna tersentralisasi di `css/global.css`:

```css
:root {
  /* Brand Palette */
  --color-primary-navy: #0B1F3A;
  --color-navy-dark: #071324;
  --color-navy-light: #163259;
  --color-electric-blue: #1769FF;
  --color-electric-blue-hover: #0F58DE;
  --color-electric-blue-light: #EBF2FF;

  /* Surfaces & Background */
  --color-background: #F5F7FB;
  --color-surface: #FFFFFF;

  /* Text & Border */
  --color-text-primary: #172B4D;
  --color-text-secondary: #64748B;
  --color-border: #E2E8F0;

  /* Status Colors */
  --color-success: #15803D; /* Diambil */
  --color-warning: #B45309; /* Menunggu Penyerahan */
  --color-error: #B91C1C;
  --color-info: #0284C7;    /* Diproses */
}
```

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
- **Mengaktifkan Backend PHP:** Di `js/api.js`, ubah `isDemoMode()` menjadi `false` atau panggil `WashlyAPI.setDemoMode(false)`. Frontend akan langsung melakukan `fetch()` ke endpoint PHP sesuai spesifikasi di `docs/API_CONTRACT.md`.
