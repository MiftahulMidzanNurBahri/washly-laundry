# Integrasi Front-End Washly dengan Backend PHP

## A. Pasang file backend

Salin folder `backend/` dan `database/` dari paket ini ke root folder repository Washly. Jangan menaruh folder `backend` di dalam `js`, `customer`, atau `admin`.

## B. Ganti API adapter

Ganti file repository `js/api.js` dengan file `js/api.js` yang disertakan dalam paket ini. Adapter baru membaca format respons kontrak API `success/message/data`, menggunakan cookie PHP Session, dan tetap mempertahankan Demo Mode.

Jika project dibuka melalui `http://localhost/washly-laundry/`, base URL default sudah disetel ke:

```js
'/washly-laundry/backend/api'
```

Jika project ditempatkan langsung pada web root (misalnya `http://localhost/`), ubah konstanta `BACKEND_BASE_URL` di `js/api.js` menjadi:

```js
'/backend/api'
```

## C. Matikan banner dan tombol simulasi setelah integrasi

Dalam `js/navigation.js`, tambahkan pemeriksaan ini di awal fungsi `initDemoBanner()`, setelah pemeriksaan `existing`:

```js
if (!window.WashlyAPI.isDemoMode()) return;
```

Dengan begitu tombol pindah peran dan reset data demo tidak tampil saat backend aktif.

Pada handler logout di fungsi `initLogoutHandlers()`, sebaiknya ubah pemanggilan menjadi asynchronous agar server selesai menghapus session sebelum diarahkan ke login:

```js
btn.addEventListener('click', async (e) => {
  e.preventDefault();
  try {
    await window.WashlyAPI.auth.logout();
  } catch (error) {
    console.error('Logout gagal:', error);
  }
  window.WashlyApp.showToast('Anda telah keluar dari akun.', 'info');
  const isSubdir = window.location.pathname.includes('/customer/') || window.location.pathname.includes('/admin/');
  const rootPrefix = isSubdir ? '../' : './';
  window.location.href = rootPrefix + 'login.html';
});
```

## D. Pastikan halaman admin hanya dapat dibuka oleh admin

`js/admin.js` saat ini otomatis memasang akun admin mock jika role belum sesuai, untuk kebutuhan demo. Setelah backend aktif, ubah bagian awal listener `DOMContentLoaded` menjadi pemeriksaan role berikut sebelum `switch (page)`:

```js
if (!window.WashlyAPI.isDemoMode()) {
  const user = window.WashlyAPI.getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = '../login.html';
    return;
  }
}
```

API PHP tetap memeriksa role di server. Pemeriksaan JavaScript ini hanya untuk pengalaman pengguna, bukan pengganti keamanan server.

## E. Aktifkan backend

1. Buka halaman Washly.
2. Buka Developer Tools browser (F12), pilih Console.
3. Jalankan:

```js
window.WashlyAPI.setDemoMode(false);
```

4. Refresh halaman.
5. Login dengan akun admin dari README backend, atau daftarkan akun pelanggan baru.

Mode ini tersimpan pada `localStorage`. Untuk kembali ke demo:

```js
window.WashlyAPI.setDemoMode(true);
```

## F. Pengujian alur utama

1. Daftarkan pelanggan.
2. Logout, lalu login sebagai pelanggan.
3. Buat pesanan baru dengan layanan, parfum, estimasi berat, dan catatan.
4. Pastikan pesanan tersimpan di MySQL dengan status `Menunggu Penyerahan`, `actual_weight` dan `final_cost` masih `NULL`.
5. Logout, login sebagai admin (`admin@washly.id` / `admin123`).
6. Buka daftar pesanan, lalu ubah status pertama menjadi `Diproses` dengan memasukkan berat aktual.
7. Pastikan server menghitung biaya final dan menulis riwayat status.
8. Ubah status berurutan menjadi `Siap Diambil` lalu `Diambil`.
9. Login kembali sebagai pelanggan. Pastikan riwayat dan detail memperlihatkan data yang sama.
10. Coba mengakses detail pesanan pelanggan lain atau endpoint admin menggunakan akun pelanggan. Server harus menolak dengan HTTP 403.

## G. Catatan fitur Delete

Untuk melengkapi CRUD pada rubrik sumatif, backend menyediakan:

```http
DELETE /backend/api/orders/delete.php?id=WSH-202611-001
```

Hanya admin yang dapat menghapus pesanan, dan hanya jika statusnya masih `Menunggu Penyerahan`. Front-End perlu menambahkan tombol hapus pada daftar pesanan admin dan memanggil endpoint tersebut jika fitur Delete ingin tersedia langsung dari antarmuka.


## H. Tambahkan tombol Delete pada daftar admin

Backend dan adapter sudah menyediakan `WashlyAPI.orders.delete(orderId)`. Agar operasi Delete terlihat di antarmuka, edit fungsi `renderAdminOrdersTable(orders)` pada `js/admin.js`.

Pada kolom Aksi, setelah link `Timbang & Proses / Perbarui Status`, tambahkan tombol berikut:

```js
${order.status === 'Menunggu Penyerahan' ? `
  <button type="button" class="btn btn-secondary btn-sm btn-delete-order"
    data-order-id="${encodeURIComponent(order.id)}">Hapus</button>
` : ''}
```

Setelah baris `tbody.innerHTML = ... .join('');`, tambahkan event handler:

```js
tbody.querySelectorAll('.btn-delete-order').forEach(button => {
  button.addEventListener('click', async () => {
    const orderId = decodeURIComponent(button.dataset.orderId || '');
    if (!orderId || !confirm(`Hapus pesanan ${orderId}?`)) return;

    try {
      await window.WashlyAPI.orders.delete(orderId);
      window.WashlyApp.showToast('Pesanan berhasil dihapus.', 'success');
      window.location.reload();
    } catch (error) {
      window.WashlyApp.showToast(error.message || 'Gagal menghapus pesanan.', 'error');
    }
  });
});
```

Tombol hanya muncul untuk pesanan berstatus `Menunggu Penyerahan`. Backend tetap memvalidasi status dan role, jadi permintaan yang dimanipulasi dari browser tetap ditolak.
