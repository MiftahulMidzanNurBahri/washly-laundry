<?php
$requestedOrderId = isset($_GET['id']) ? trim((string) $_GET['id']) : '';
$pageTitle = ($requestedOrderId !== '' ? "Pesanan {$requestedOrderId} — " : '') . 'Detail & Pelacakan Pesanan — Washly';
$pageDescription = 'Lacak kemajuan tahapan pencucian pakaian Anda secara langsung di Washly.';
$basePrefix = '../';
$extraCss = 'customer.css';
$pageScript = 'customer.js';
$activeNav = '';

require_once __DIR__ . '/../includes/head.php';
require_once __DIR__ . '/../includes/customer-header.php';
?>

  <!-- Main Container -->
  <main class="container" style="padding-top: var(--space-xl); padding-bottom: var(--space-3xl);" id="order-detail-container">

    <!-- Top Action Bar -->
    <div class="flex items-center justify-between mb-lg flex-wrap gap-sm">
      <div>
        <a href="history.php" class="text-xs text-link font-semibold mb-xs" style="display:inline-block;">← Kembali ke Riwayat Pesanan</a>
        <div class="flex items-center gap-sm flex-wrap">
          <h2 id="detail-order-code"><?= $requestedOrderId !== '' ? washly_e($requestedOrderId) : 'Memuat...' ?></h2>
          <div id="detail-status-badge"></div>
        </div>
        <p class="text-xs text-muted mt-2xs">
          Waktu Pemesanan: <span id="detail-order-date">-</span>
        </p>
      </div>

      <div class="flex items-center gap-xs">
        <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-code">
          Salin Kode
        </button>
        <button type="button" class="btn btn-secondary btn-sm" id="btn-print-order">
          Cetak Nota
        </button>
      </div>
    </div>

    <!-- Stepper Progress Card -->
    <div class="card mb-xl">
      <div class="card-header">
        <h3 class="card-title">Tahapan Status Cucian</h3>
      </div>
      <div class="card-body">
        <div class="stepper" id="detail-stepper">
          <!-- Dynamically populated by js/customer.js -->
        </div>
      </div>
    </div>

    <!-- 2 Column Details Layout -->
    <div class="order-layout">

      <!-- Left Column: Order Info & Timeline -->
      <div>
        <!-- Information Card -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">Informasi Layanan &amp; Pelanggan</h3>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-2 gap-md">
              <div>
                <span class="text-xs text-muted block">Jenis Layanan:</span>
                <strong id="detail-service-name" style="font-size: var(--font-size-sm);">-</strong>
              </div>
              <div>
                <span class="text-xs text-muted block">Nama Pelanggan:</span>
                <strong id="detail-customer-name" style="font-size: var(--font-size-sm);">-</strong>
              </div>
              <div>
                <span class="text-xs text-muted block">Nomor Telepon:</span>
                <span id="detail-customer-phone" class="text-sm font-medium">-</span>
              </div>
              <div>
                <span class="text-xs text-muted block">Metode Serah Terima:</span>
                <span id="detail-handover-method" class="text-sm font-medium">-</span>
              </div>
            </div>

            <div class="mt-md pt-sm" style="border-top: 1px solid var(--color-border-light);">
              <span class="text-xs text-muted block mb-2xs">Catatan Khusus Pelanggan:</span>
              <p id="detail-order-notes" class="text-sm text-secondary">-</p>
            </div>
          </div>
        </div>

        <!-- Activity Log Card -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Riwayat Aktivitas &amp; Catatan</h3>
          </div>
          <div class="card-body">
            <div class="timeline" id="detail-timeline-list">
              <!-- Dynamically populated by js/customer.js -->
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Weight, Billing & Outlet Instructions -->
      <div>
        <!-- Cost & Weight Card -->
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">Rincian Berat &amp; Tagihan</h3>
          </div>
          <div class="card-body" id="detail-weight-cost-box">
            <!-- Dynamically populated by js/customer.js -->
          </div>
        </div>

        <!-- Outlet Info Card -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Lokasi &amp; Pengambilan</h3>
          </div>
          <div class="card-body text-xs text-secondary">
            <strong style="color:var(--color-primary-navy); display:block; margin-bottom:4px;">Outlet Utama Washly</strong>
            <p>Jl. Kemang Raya No. 14, Mampang Prapatan, Jakarta Selatan</p>
            <p class="mt-xs">Jam Operasional: <strong>07:00 – 21:00 WIB</strong></p>
            <div class="order-notice mt-sm" style="background:var(--color-surface-hover); border-color:var(--color-border); color:var(--color-text-secondary);">
              Tunjukkan kode pesanan ini kepada kasir saat mengambil pakaian di outlet.
            </div>
          </div>
        </div>

      </div>

    </div>

  </main>

<?php require_once __DIR__ . '/../includes/scripts.php'; ?>
