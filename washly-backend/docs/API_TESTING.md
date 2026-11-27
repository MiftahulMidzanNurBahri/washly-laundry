# Panduan Uji API Washly

Jalankan Apache dan MySQL XAMPP, impor `database/washly.sql`, lalu buka aplikasi pada `http://localhost/washly-laundry/`.

## 1. Uji registrasi pelanggan

Gunakan halaman `register.html` atau kirim request:

```bash
curl -i -c customer-cookie.txt \
  -H "Content-Type: application/json" \
  -d '{"name":"Budi Test","email":"budi.test@example.com","phone":"081234567890","address":"Tangerang","password":"password123"}' \
  http://localhost/washly-laundry/backend/api/auth/register.php
```

Respons sukses memiliki `success: true` dan `data.user`.

## 2. Uji daftar pesanan pelanggan

```bash
curl -i -b customer-cookie.txt \
  http://localhost/washly-laundry/backend/api/orders/customer.php
```

Pada awalnya hasilnya berupa array kosong di dalam `data`.

## 3. Uji login admin

```bash
curl -i -c admin-cookie.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@washly.id","password":"admin123","role":"admin"}' \
  http://localhost/washly-laundry/backend/api/auth/login.php
```

Gunakan cookie admin tersebut untuk membuka daftar pesanan dan statistik:

```bash
curl -i -b admin-cookie.txt http://localhost/washly-laundry/backend/api/orders/admin.php
curl -i -b admin-cookie.txt http://localhost/washly-laundry/backend/api/orders/metrics.php
```

## 4. Uji akses role

Login sebagai pelanggan, lalu coba akses:

```bash
curl -i -b customer-cookie.txt http://localhost/washly-laundry/backend/api/orders/admin.php
```

Server harus mengembalikan HTTP `403`. Tanpa login, endpoint pelanggan/admin harus mengembalikan HTTP `401`.

## 5. Uji validasi SOP dan CRUD

Uji pembuatan pesanan melalui form pelanggan. Lalu sebagai admin:

1. Buka pesanan baru dan masukkan berat aktual untuk mengubah status `Menunggu Penyerahan` ke `Diproses`.
2. Pastikan `actual_weight` dan `final_cost` terisi pada tabel `orders`.
3. Ubah status berikutnya secara berurutan ke `Siap Diambil`, lalu `Diambil`.
4. Coba melompati status atau mengubah berat setelah diproses; server harus menolak.
5. Hapus pesanan yang masih `Menunggu Penyerahan` melalui tombol Delete yang ditambahkan pada daftar admin. Pesanan yang sudah diproses tidak boleh dihapus.

Pemeriksaan database dapat dilakukan di phpMyAdmin pada tabel `users`, `orders`, dan `order_status_history`.
