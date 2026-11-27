<?php
$pageTitle = 'Admin Dashboard — Washly';
$pageDescription = 'Pusat kendali operasional outlet Washly Laundry. Pantau antrean penimbangan, proses pencucian, dan status pesanan.';
$basePrefix = '../';
$extraCss = 'admin.css';
$pageScript = 'admin.js';
$activeNav = 'dashboard';
$topbarTitle = 'Dashboard Operasional Outlet';
$topbarSubtitle = 'Washly Outlet Pusat Jakarta';

require_once __DIR__ . '/../includes/head.php';
?>

  <div class="admin-layout">

<?php require_once __DIR__ . '/../includes/admin-sidebar.php'; ?>

    <!-- Main Content Shell -->
    <div class="admin-main">

<?php require_once __DIR__ . '/../includes/admin-topbar.php'; ?>

      <!-- Main Content -->
      <main class="admin-content">

        <!-- Metrics 4-grid -->
        <section class="admin-metrics-grid">
          <div class="admin-metric-card">
            <div class="admin-metric-info">
              <span class="admin-metric-label">Total Pesanan</span>
              <span class="admin-metric-value" id="metric-total-orders">0</span>
            </div>
          </div>

          <div class="admin-metric-card">
            <div class="admin-metric-info">
              <span class="admin-metric-label">Perlu Ditimbang</span>
              <span class="admin-metric-value" id="metric-menunggu-count" style="color:var(--color-warning);">0</span>
            </div>
          </div>

          <div class="admin-metric-card">
            <div class="admin-metric-info">
              <span class="admin-metric-label">Sedang Dicuci</span>
              <span class="admin-metric-value" id="metric-diproses-count" style="color:var(--color-electric-blue);">0</span>
            </div>
          </div>

          <div class="admin-metric-card">
            <div class="admin-metric-info">
              <span class="admin-metric-label">Siap Diambil</span>
              <span class="admin-metric-value" id="metric-siap-count" style="color:var(--color-electric-blue);">0</span>
            </div>
          </div>
        </section>

        <!-- Antrean Penimbangan Pakaian (High Priority Action) -->
        <section class="card mb-xl">
          <div class="card-header">
            <div>
              <h3 class="card-title">Antrean Penyerahan &amp; Penimbangan Pakaian</h3>
              <p class="card-subtitle">Cucian yang baru diserahkan pelanggan dan membutuhkan input berat riil serta penetapan biaya final</p>
            </div>
            <span class="badge badge-status-menunggu">Prioritas Input</span>
          </div>
          <div class="card-body" id="weighing-queue-container">
            <!-- Dynamically populated by js/admin.js -->
          </div>
        </section>

        <!-- Recent Orders Table -->
        <section class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Pesanan Masuk Terbaru</h3>
              <p class="card-subtitle">Semua status aktivitas cucian terkini di outlet</p>
            </div>
            <a href="orders.php" class="btn btn-outline-primary btn-sm">Buka Semua Pesanan →</a>
          </div>
          <div class="table-container" style="border:none; border-radius:0;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kode Pesanan</th>
                  <th>Nama Pelanggan</th>
                  <th>Layanan</th>
                  <th>Berat Ditimbang</th>
                  <th>Total Biaya</th>
                  <th>Status</th>
                  <th class="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody id="admin-recent-orders-tbody">
                <!-- Dynamically populated by js/admin.js -->
              </tbody>
            </table>
          </div>
        </section>

      </main>

    </div>

  </div>

<?php require_once __DIR__ . '/../includes/scripts.php'; ?>
