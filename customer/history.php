<?php
$pageTitle = 'Riwayat Pesanan — Washly';
$pageDescription = 'Daftar seluruh riwayat pesanan laundry dan status cucian Anda di Washly.';
$basePrefix = '../';
$extraCss = 'customer.css';
$pageScript = 'customer.js';
$activeNav = 'history';

$statusFilters = [
    'Semua',
    'Menunggu Penyerahan',
    'Diproses',
    'Siap Diambil',
    'Diambil',
];

require_once __DIR__ . '/../includes/head.php';
require_once __DIR__ . '/../includes/customer-header.php';
?>

  <!-- Main Container -->
  <main class="container" style="padding-top: var(--space-xl); padding-bottom: var(--space-3xl);">

    <div class="flex items-center justify-between mb-xl flex-wrap gap-sm">
      <div>
        <h2>Riwayat Pesanan Laundry</h2>
        <p class="text-secondary text-sm">
          Semua catatan transaksi dan pemantauan pakaian yang pernah Anda pesan.
        </p>
      </div>
      <div>
        <a href="order.php" class="btn btn-primary btn-sm">
          + Buat Pesanan Baru
        </a>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="card mb-lg" style="padding: var(--space-md);">
      <div class="flex items-center justify-between flex-wrap gap-md">

        <!-- Status Filter Tabs -->
        <div class="flex items-center gap-xs flex-wrap">
          <?php foreach ($statusFilters as $idx => $statusLabel): ?>
          <button type="button" class="btn btn-secondary btn-sm history-filter-btn<?= $idx === 0 ? ' active' : '' ?>" data-status="<?= washly_e($statusLabel) ?>"><?= washly_e($statusLabel) ?></button>
          <?php endforeach; ?>
        </div>

        <!-- Search Input -->
        <div style="min-width: 260px;">
          <input
            type="text"
            id="history-search-input"
            class="form-control"
            placeholder="Cari kode pesanan / layanan..."
            style="padding: 0.4rem 0.75rem;"
          >
        </div>

      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card">
      <div class="card-header">
        <h4 class="card-title">Daftar Transaksi</h4>
        <span class="text-xs text-secondary font-semibold" id="history-total-count">0 Pesanan</span>
      </div>

      <div class="table-container" style="border:none; border-radius:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Kode Pesanan</th>
              <th>Tanggal</th>
              <th>Layanan</th>
              <th>Berat / Qty</th>
              <th>Total Biaya</th>
              <th>Status</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody id="history-orders-tbody">
            <!-- Dynamically populated by js/customer.js -->
          </tbody>
        </table>
      </div>
    </div>

  </main>

<?php require_once __DIR__ . '/../includes/scripts.php'; ?>
