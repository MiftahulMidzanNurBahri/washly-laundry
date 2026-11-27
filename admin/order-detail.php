<?php
$requestedOrderId = isset($_GET['id']) ? trim((string) $_GET['id']) : '';
$pageTitle = ($requestedOrderId !== '' ? "Proses {$requestedOrderId} — " : '') . 'Proses & Timbang Pesanan — Admin Washly';
$pageDescription = 'Antarmuka penimbangan pakaian, kalkulasi biaya riil, dan pembaruan tahapan status pesanan Washly.';
$basePrefix = '../';
$extraCss = 'admin.css';
$pageScript = 'admin.js';
$activeNav = 'orders';
$topbarTitle = 'Pemrosesan Pesanan & Penimbangan';
$topbarSubtitle = 'SOP Penetapan Berat Riil & Pembaruan Status';

require_once __DIR__ . '/../includes/head.php';
?>

  <div class="admin-layout">

<?php require_once __DIR__ . '/../includes/admin-sidebar.php'; ?>

    <!-- Main Shell -->
    <div class="admin-main">

<?php require_once __DIR__ . '/../includes/admin-topbar.php'; ?>

      <!-- Main Content -->
      <main class="admin-content">

        <div class="mb-lg">
          <a href="orders.php" class="text-xs text-link font-semibold mb-xs" style="display:inline-block;">← Kembali ke Daftar Pesanan</a>
          <div class="flex items-center justify-between flex-wrap gap-sm">
            <div class="flex items-center gap-sm">
              <h2 id="admin-detail-order-id"><?= $requestedOrderId !== '' ? washly_e($requestedOrderId) : 'Memuat...' ?></h2>
              <div id="admin-detail-status-badge"></div>
            </div>
          </div>
        </div>

        <!-- 2 Column Processing Layout -->
        <div class="admin-processing-layout">

          <!-- Left Column: Order Data & Activity History -->
          <div>

            <div class="card mb-lg">
              <div class="card-header">
                <h3 class="card-title">Rincian Informasi Pesanan</h3>
              </div>
              <div class="card-body">
                <div class="grid grid-cols-2 gap-md">
                  <div>
                    <span class="text-xs text-muted block">Nama Pelanggan:</span>
                    <strong id="admin-detail-customer-name" style="font-size:var(--font-size-base);">-</strong>
                  </div>
                  <div>
                    <span class="text-xs text-muted block">Nomor WhatsApp:</span>
                    <strong id="admin-detail-customer-phone" style="font-size:var(--font-size-base);">-</strong>
                  </div>
                  <div>
                    <span class="text-xs text-muted block">Paket Layanan:</span>
                    <strong id="admin-detail-service" style="color:var(--color-electric-blue);">-</strong>
                  </div>
                  <div>
                    <span class="text-xs text-muted block">Metode Penyerahan:</span>
                    <strong id="admin-detail-handover">Penjemputan Kurir</strong>
                  </div>
                  <div>
                    <span class="text-xs text-muted block">Parfum Laundry:</span>
                    <strong id="admin-detail-scent">Mengikuti Parfum Laundry</strong>
                  </div>
                  <div>
                    <span class="text-xs text-muted block">Waktu Dibuat:</span>
                    <span id="admin-detail-created" class="text-sm font-medium">-</span>
                  </div>
                </div>

                <div class="mt-md pt-sm" style="border-top:1px solid var(--color-border-light);">
                  <span class="text-xs text-muted block mb-2xs">Catatan / Permintaan Khusus Pelanggan:</span>
                  <p id="admin-detail-notes" class="text-sm text-secondary" style="font-style:italic;">
                    -
                  </p>
                </div>
              </div>
            </div>

            <!-- Activity History Log -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Riwayat Log Status &amp; Audit</h3>
              </div>
              <div class="card-body">
                <div class="timeline" id="admin-timeline-history">
                  <!-- Dynamically populated by js/admin.js -->
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column: Weighing & Status Update Form -->
          <div>
            <div class="card" style="box-shadow: var(--shadow-lg); border-color: var(--color-border);">
              <div class="card-header" style="background:var(--color-surface-hover);">
                <div>
                  <h3 class="card-title">Penimbangan &amp; Transisi Status</h3>
                  <p class="card-subtitle">Wajib isi berat aktual pakaian saat serah terima di outlet</p>
                </div>
              </div>

              <div class="card-body">
                <form id="admin-processing-form">

                  <!-- Weight Input Field -->
                  <div class="form-group mb-md">
                    <label for="admin-input-actual-weight" class="form-label">
                      Berat Aktual Pakaian Ditimbang <span class="required">*</span>
                    </label>
                    <div class="weight-input-box highlight">
                      <div class="weight-display-group">
                        <input
                          type="number"
                          id="admin-input-actual-weight"
                          step="0.1"
                          min="0.1"
                          max="200"
                          placeholder="0.0"
                          required
                        >
                        <span class="weight-unit service-unit-label">kg</span>
                      </div>
                      <div class="text-xs text-muted mt-xs">
                        Masukkan angka hasil timbangan digital outlet.
                      </div>
                    </div>
                  </div>

                  <!-- Live Cost Calculation Card -->
                  <div class="cost-calculation-panel mb-lg">
                    <span class="text-xs font-bold text-muted block mb-2xs" style="text-transform:uppercase;">Perhitungan Otomatis:</span>
                    <div class="cost-row">
                      <span>Subtotal Cucian:</span>
                      <strong id="admin-calc-subtotal">-</strong>
                    </div>
                    <div class="cost-row total">
                      <span>Total Biaya Akhir:</span>
                      <strong id="admin-calc-total" style="color:var(--color-electric-blue); font-size:var(--font-size-lg);">-</strong>
                    </div>
                  </div>

                  <!-- Status Transition Radio Selector -->
                  <div class="form-group mb-md">
                    <label class="form-label">Perbarui Tahapan Status SOP:</label>
                    <div class="status-transition-selector" id="status-transition-options-container">
                      <!-- Dynamically populated with strict SOP validation by js/admin.js -->
                    </div>
                  </div>

                  <!-- Admin Notes Field -->
                  <div class="form-group mb-lg">
                    <label for="admin-processing-notes" class="form-label">
                      Catatan Petugas (Opsional)
                    </label>
                    <textarea
                      id="admin-processing-notes"
                      class="form-textarea"
                      rows="2"
                      placeholder="Contoh: Ada 1 kemeja bernoda kopi di kerah, luntur dicek aman."
                    ></textarea>
                  </div>

                  <button type="submit" id="btn-save-admin-processing" class="btn btn-primary btn-lg" style="width: 100%;">
                    Simpan &amp; Perbarui Status
                  </button>

                </form>
              </div>
            </div>
          </div>

        </div>

      </main>

    </div>

  </div>

<?php require_once __DIR__ . '/../includes/scripts.php'; ?>
