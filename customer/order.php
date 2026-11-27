<?php
$pageTitle = 'Buat Pesanan Laundry Baru — Washly';
$pageDescription = 'Pilih paket layanan laundry terbaik dengan layanan penjemputan kurir langsung ke alamat Anda di Washly.';
$basePrefix = '../';
$extraCss = 'customer.css';
$pageScript = 'customer.js';
$activeNav = 'order';

require_once __DIR__ . '/../includes/head.php';
require_once __DIR__ . '/../includes/customer-header.php';
?>

  <!-- Main Container -->
  <main class="container" style="padding-top: var(--space-xl); padding-bottom: var(--space-3xl);">

    <div class="mb-xl">
      <a href="dashboard.php" class="text-xs text-link font-semibold mb-xs" style="display:inline-block;">← Kembali ke Dashboard</a>
      <h2>Buat Pesanan Laundry Baru</h2>
      <p class="text-secondary text-sm">
        Pilih layanan laundry yang Anda butuhkan dan konfirmasi alamat penjemputan kurir. Penimbangan berat akan dilakukan langsung oleh pihak laundry.
      </p>
    </div>

    <form id="order-create-form" novalidate>
      <input type="hidden" name="handover-method" id="order-handover-method" value="jemput-kurir">

      <div class="order-layout">

        <!-- Left Column: Form Configuration -->
        <div>

          <!-- Step 1: Select Service -->
          <div class="card mb-lg">
            <div class="card-header">
              <div>
                <h3 class="card-title">1. Pilih Layanan Laundry</h3>
                <p class="card-subtitle">Pilih jenis perawatan pakaian sesuai kebutuhan Anda</p>
              </div>
            </div>
            <div class="card-body">
              <div class="service-selection-grid" id="services-grid-container">
                <!-- Dynamically populated by js/customer.js -->
              </div>
            </div>
          </div>

          <!-- Step 2: Pickup Information & Notes -->
          <div class="card mb-lg">
            <div class="card-header">
              <div>
                <h3 class="card-title">2. Detail Penjemputan Kurir &amp; Catatan</h3>
                <p class="card-subtitle">Informasi kontak, alamat penjemputan, dan instruksi penanganan pakaian</p>
              </div>
            </div>
            <div class="card-body">

              <div class="grid grid-cols-2 gap-sm mb-md">
                <div class="form-group">
                  <label for="order-customer-name" class="form-label">Nama Pemesan</label>
                  <input type="text" id="order-customer-name" class="form-control" readonly>
                </div>
                <div class="form-group">
                  <label for="order-customer-phone" class="form-label">Nomor WhatsApp</label>
                  <input type="text" id="order-customer-phone" class="form-control" readonly>
                </div>
              </div>

              <div class="form-group mb-md">
                <label for="order-customer-address" class="form-label">
                  Alamat Penjemputan Kurir <span class="required">*</span>
                </label>
                <textarea
                  id="order-customer-address"
                  class="form-textarea"
                  rows="2"
                  required
                  placeholder="Masukkan alamat lengkap penjemputan pakaian oleh kurir Washly"
                ></textarea>
              </div>

              <div class="form-group mb-md">
                <label class="form-label">Metode Penyerahan &amp; Ketentuan Laundry</label>
                <div class="order-notice" style="margin-top:0; background:var(--color-surface-hover); border-color:var(--color-border); color:var(--color-text-primary);">
                  <div><strong>Metode Penyerahan:</strong> Penjemputan Kurir ke Alamat Pelanggan</div>
                  <div class="mt-2xs text-secondary"><strong>Parfum &amp; Berat Cucian:</strong> Parfum mengikuti parfum yang tersedia di laundry (tanpa biaya tambahan), dan berat pakaian akan ditimbang secara akurat oleh pihak laundry.</div>
                </div>
              </div>

              <div class="form-group">
                <label for="order-notes" class="form-label">
                  Catatan Khusus / Permintaan Khusus (Opsional)
                </label>
                <textarea
                  id="order-notes"
                  class="form-textarea"
                  rows="3"
                  placeholder="Contoh: Patokan rumah pagar hitam, baju putih kemeja kerja tolong dipisah, dll."
                ></textarea>
                <div class="form-hint">Kurir dan petugas laundry kami akan membaca catatan ini sebelum memproses cucian.</div>
              </div>

            </div>
          </div>

        </div>

        <!-- Right Column: Sticky Order Summary -->
        <div>
          <div class="card order-summary-card">
            <div class="card-header">
              <h3 class="card-title">Ringkasan Pesanan</h3>
            </div>
            <div class="card-body">

              <div class="summary-row">
                <span>Layanan Dipilih:</span>
                <strong id="summary-service-name">-</strong>
              </div>

              <div class="summary-row">
                <span>Tarif Layanan:</span>
                <strong id="summary-service-rate">-</strong>
              </div>

              <div class="summary-row">
                <span>Metode Penyerahan:</span>
                <strong>Jemput Kurir</strong>
              </div>

              <div class="summary-row">
                <span>Parfum:</span>
                <strong>Sesuai Parfum Laundry</strong>
              </div>

              <div class="summary-row">
                <span>Berat Pakaian:</span>
                <strong class="text-muted">Ditimbang Pihak Laundry</strong>
              </div>

              <div class="summary-total">
                <span class="summary-total-label">Total Biaya:</span>
                <span class="summary-total-value" id="summary-total-estimate" style="font-size: var(--font-size-base);">Menunggu Penimbangan</span>
              </div>

              <div class="order-notice">
                <strong>Informasi Penimbangan:</strong><br>
                Setelah pesanan dibuat, kurir kami akan menjemput pakaian Anda. Total biaya akhir akan otomatis tertera setelah pakaian ditimbang oleh pihak laundry.
              </div>

              <button type="submit" id="btn-submit-order" class="btn btn-primary btn-lg mt-lg" style="width: 100%;">
                Konfirmasi &amp; Minta Jemput Kurir
              </button>

            </div>
          </div>
        </div>

      </div>
    </form>

  </main>

<?php require_once __DIR__ . '/../includes/scripts.php'; ?>
