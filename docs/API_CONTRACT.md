# DOKUMEN KONTRAK API (API CONTRACT SPECIFICATION)
## Proyek: Washly Laundry Management System
**Versi:** 1.0.0 (Proposed / Siap Diintegrasikan dengan Backend PHP & MySQL)  
**Bahasa Komunikasi:** JSON over HTTP (REST API)  
**Base URL Usulan:** `/backend/api`  

---

## 1. PENDAHULUAN & PRINSIP INTEGRASI

Dokumen ini mendefinisikan kontrak antarmuka pemrograman aplikasi (API) antara frontend Washly (HTML/CSS/Vanilla JS) dengan backend yang akan dibangun oleh tim PHP & MySQL.

Seluruh request dan response wajib menggunakan:
- Header `Content-Type: application/json`
- Response format konsisten:
  ```json
  {
    "success": true|false,
    "message": "Pesan deskriptif dalam Bahasa Indonesia",
    "data": { ... }
  }
  ```

---

## 2. DAFTAR ENDPOINT USULAN

### 2.1 Autentikasi Pengguna

#### A. Login Pengguna / Admin
- **Endpoint:** `POST /auth/login.php`
- **Request Body:**
  ```json
  {
    "email": "budi@example.com",
    "password": "plain_password_string",
    "role": "customer" // atau "admin"
  }
  ```
- **Response Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login berhasil",
    "data": {
      "token": "jwt_or_session_token_string",
      "user": {
        "id": "usr-001",
        "name": "Budi Santoso",
        "email": "budi@example.com",
        "phone": "0812-3456-7890",
        "address": "Jl. Kemang Raya No. 14, Jakarta Selatan",
        "role": "customer"
      }
    }
  }
  ```
- **Response Gagal (401 Unauthorized):**
  ```json
  {
    "success": false,
    "message": "Email atau kata sandi tidak cocok."
  }
  ```

#### B. Pendaftaran Pelanggan Baru
- **Endpoint:** `POST /auth/register.php`
- **Request Body:**
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "phone": "081234567890",
    "address": "Jl. Kemang Raya No. 14",
    "password": "password123"
  }
  ```
- **Response Sukses (201 Created):**
  ```json
  {
    "success": true,
    "message": "Akun berhasil didaftarkan",
    "data": {
      "user": {
        "id": "usr-002",
        "name": "Budi Santoso",
        "email": "budi@example.com",
        "phone": "081234567890",
        "role": "customer"
      }
    }
  }
  ```

---

### 2.2 Katalog Layanan & Parfum

#### A. Ambil Katalog Layanan
- **Endpoint:** `GET /services/list.php`
- **Response Sukses (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cuci-komplit",
        "name": "Cuci Komplit (Reguler)",
        "unit": "kg",
        "price": 8000,
        "duration": "2 Hari",
        "description": "Pencucian higienis mendalam, pengeringan mesin, dan setrika uap rapi."
      },
      {
        "id": "express",
        "name": "Express Wash Kilat",
        "unit": "kg",
        "price": 14000,
        "duration": "6 Jam",
        "description": "Layanan prioritas cepat kilat untuk kebutuhan mendesak."
      }
    ]
  }
  ```

---

### 2.3 Manajemen Pesanan Pelanggan

#### A. Buat Pesanan Laundry Baru
- **Endpoint:** `POST /orders/create.php`
- **Catatan SOP:** Status awal saat pesanan baru dibuat selalu diatur oleh backend menjadi `Menunggu Penyerahan`. Nilai `actual_weight` dan `final_cost` diset ke `null`.
- **Request Body:**
  ```json
  {
    "customerId": "usr-001",
    "customerName": "Budi Santoso",
    "customerPhone": "081234567890",
    "serviceId": "cuci-komplit",
    "scent": "Lavender Blossom",
    "estimatedWeight": 3.0,
    "notes": "Baju putih dipisah",
    "handoverMethod": "antar-sendiri"
  }
  ```
- **Response Sukses (201 Created):**
  ```json
  {
    "success": true,
    "message": "Pesanan berhasil dibuat",
    "data": {
      "id": "WSH-202610-006",
      "status": "Menunggu Penyerahan",
      "createdAt": "2026-10-29T10:00:00+07:00"
    }
  }
  ```

#### B. Ambil Daftar Pesanan Pelanggan
- **Endpoint:** `GET /orders/customer.php?customer_id=usr-001`
- **Response Sukses (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "WSH-202610-001",
        "serviceName": "Cuci Komplit (Reguler)",
        "status": "Menunggu Penyerahan",
        "actualWeight": null,
        "finalCost": null,
        "createdAt": "2026-10-29T10:15:00+07:00"
      }
    ]
  }
  ```

#### C. Detail & Pelacakan Pesanan
- **Endpoint:** `GET /orders/detail.php?id=WSH-202610-001`
- **Response Sukses (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "WSH-202610-001",
      "customerName": "Budi Santoso",
      "customerPhone": "0812-3456-7890",
      "serviceId": "cuci-komplit",
      "serviceName": "Cuci Komplit (Reguler)",
      "unit": "kg",
      "pricePerUnit": 8000,
      "scent": "Lavender Blossom",
      "scentPrice": 2000,
      "estimatedWeight": 3.0,
      "actualWeight": null,
      "finalCost": null,
      "status": "Menunggu Penyerahan",
      "notes": "Pakaian kerja kantor",
      "timeline": [
        {
          "status": "Menunggu Penyerahan",
          "timestamp": "2026-10-29T10:15:00+07:00",
          "note": "Pesanan dibuat oleh pelanggan."
        }
      ]
    }
  }
  ```

---

### 2.4 Manajemen & Pemrosesan Admin

#### A. Daftar Pesanan untuk Admin
- **Endpoint:** `GET /orders/admin.php?search=...&status=...&serviceId=...`
- **Response Sukses (200 OK):** Mengembalikan array objek pesanan lengkap dengan sorting pesanan terbaru di awal.

#### B. Penimbangan Berat & Pembaruan Status (Core SOP)
- **Endpoint:** `POST /orders/update-status.php`
- **Validasi Backend Wajib:**
  1. Backend PHP wajib memvalidasi urutan status:
     - `Menunggu Penyerahan` → hanya boleh ke `Diproses`
     - `Diproses` → hanya boleh ke `Siap Diambil`
     - `Siap Diambil` → hanya boleh ke `Diambil`
     - Status `Diambil` adalah kondisi final dan tidak dapat dimundurkan.
  2. Backend wajib menghitung `final_cost`:
     `final_cost = (actual_weight * price_per_unit) + scent_price`
- **Request Body:**
  ```json
  {
    "orderId": "WSH-202610-001",
    "actualWeight": 3.4,
    "newStatus": "Diproses",
    "adminNotes": "Pakaian ditimbang 3.4 kg. Noda aman."
  }
  ```
- **Response Sukses (200 OK):**
  ```json
  {
    "success": true,
    "message": "Pesanan berhasil ditimbang dan diperbarui ke Diproses",
    "data": {
      "id": "WSH-202610-001",
      "actualWeight": 3.4,
      "finalCost": 29200,
      "status": "Diproses"
    }
  }
  ```

#### C. Metrik Statistik Dashboard Admin
- **Endpoint:** `GET /orders/metrics.php`
- **Response Sukses (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "total": 5,
      "menunggu": 2,
      "diproses": 1,
      "siap": 1,
      "diambil": 1,
      "revenueToday": 99600
    }
  }
  ```

---

## 3. CATATAN KEPUTUSAN INTEGRASI TERBUKA (UNRESOLVED DECISIONS)

1. **Mekanisme Autentikasi PHP:**  
   Apakah tim backend akan menggunakan PHP Native Sessions (`PHPSESSID` cookie) atau JWT (JSON Web Token) di header `Authorization: Bearer <token>`? Adapter `js/api.js` di frontend sudah disiapkan mendukung keduanya.
2. **Penomoran ID Pesanan:**  
   Format kode yang disepakati frontend adalah `WSH-YYYYMM-XXX` (misal `WSH-202610-001`). Backend dapat menggunakan format ini via trigger MySQL atau sequence.
