<?php
$pageTitle = 'Dashboard Pelanggan — Washly';
$pageDescription = 'Pantau pesanan laundry berjalan, estimasi selesai, dan riwayat pesanan Anda di Washly.';
$basePrefix = '../';
$extraCss = 'customer.css';
$pageScript = 'customer.js';
$activeNav = 'dashboard';

require_once __DIR__ . '/../includes/head.php';
require_once __DIR__ . '/../includes/customer-header.php';
?>

  <!-- Main Content Container -->
  <main class="container" style="padding-top: var(--space-xl); padding-bottom: var(--space-3xl);">

    <!-- Welcome Hero Banner -->
    <section class="welcome-hero">
      <div class="welcome-text">
        <h1>Selamat Datang di Portal Laundry Anda</h1>
        <p>Pantau proses cucian Anda secara transparan dari serah terima pakaian hingga siap diambil di outlet.</p>
      </div>
      <div>
        <a href="order.php" class="btn btn-primary btn-lg" style="box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
          + Buat Pesanan Baru
        </a>
      </div>
    </section>

    <!-- Overview Stats Cards -->
    <section class="stats-grid">
      <div class="stat-card">
        <div>
          <div class="stat-value" id="stat-active-count">0</div>
          <div class="stat-label">Pesanan Sedang Diproses</div>
        </div>
      </div>

      <div class="stat-card">
        <div>
          <div class="stat-value" id="stat-ready-count">0</div>
          <div class="stat-label">Pakaian Siap Diambil</div>
        </div>
      </div>

      <div class="stat-card">
        <div>
          <div class="stat-value" id="stat-completed-count">0</div>
          <div class="stat-label">Pesanan Selesai</div>
        </div>
      </div>
    </section>

    <!-- Ongoing Spotlight & Quick Track Grid -->
    <div class="grid grid-cols-3 gap-xl mb-xl">
      <!-- Spotlight (2 cols on desktop) -->
      <div style="grid-column: span 2;">
        <div class="flex items-center justify-between mb-sm">
          <h4>Status Pesanan Berjalan</h4>
          <a href="history.php" class="text-xs text-link font-semibold">Semua Pesanan →</a>
        </div>
        <div id="ongoing-order-spotlight">
          <!-- Populated by js/customer.js -->
        </div>
      </div>

      <!-- Quick Tracking Form Widget (1 col) -->
      <div>
        <div class="card" style="padding: var(--space-lg); height: 100%;">
          <div class="flex items-center gap-xs mb-xs" style="color:var(--color-electric-blue);">
            <span class="text-xs font-bold" style="text-transform:uppercase;">Pelacakan Cepat</span>
          </div>
          <h4 style="margin-bottom: var(--space-xs);">Lacak Kode Nota</h4>
          <p class="text-xs text-secondary mb-md">
            Punya kode nota pesanan lain? Ketik kode di bawah untuk langsung membuka rincian status.
          </p>

          <form id="tracking-quick-form">
            <div class="form-group mb-sm">
              <label for="tracking-input-code" class="form-label text-xs">Nomor Kode Pesanan</label>
              <input
                type="text"
                id="tracking-input-code"
                class="form-control"
                placeholder="Contoh: WSH-202610-001"
                required
                style="text-transform: uppercase; font-weight:700;"
              >
            </div>
            <button type="submit" class="btn btn-secondary btn-sm" style="width: 100%;">
              Lacak Pesanan
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Recent Orders Table -->
    <section>
      <div class="flex items-center justify-between mb-sm">
        <h4>Riwayat Pesanan Terbaru</h4>
        <a href="history.php" class="text-xs text-link font-semibold">Lihat Selengkapnya →</a>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Kode Pesanan</th>
              <th>Layanan</th>
              <th>Tanggal</th>
              <th>Berat / Qty</th>
              <th>Total Biaya</th>
              <th>Status</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody id="recent-orders-tbody">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>
    </section>

  </main>

<?php require_once __DIR__ . '/../includes/scripts.php'; ?>
