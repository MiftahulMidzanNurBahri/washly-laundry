<?php
$pageTitle = 'Manajemen Pesanan — Admin Washly';
$pageDescription = 'Kelola seluruh pesanan masuk, lakukan penimbangan pakaian, dan perbarui tahapan status pencucian.';
$basePrefix = '../';
$extraCss = 'admin.css';
$pageScript = 'admin.js';
$activeNav = 'orders';
$topbarTitle = 'Daftar Seluruh Pesanan';
$topbarSubtitle = 'Filter, timbang berat, dan perbarui proses laundry';

$adminStatusTabs = [
    ['value' => 'Semua',               'label' => 'Semua Status'],
    ['value' => 'Menunggu Penyerahan', 'label' => 'Menunggu Penyerahan'],
    ['value' => 'Diproses',            'label' => 'Diproses'],
    ['value' => 'Siap Diambil',        'label' => 'Siap Diambil'],
    ['value' => 'Diambil',             'label' => 'Diambil'],
];

$serviceFilterOptions = [
    'Semua'        => 'Semua Layanan',
    'cuci-komplit' => 'Cuci Komplit',
    'cuci-kering'  => 'Cuci Kering Lipat',
    'setrika'      => 'Setrika Saja',
    'express'      => 'Express Wash',
    'bedcover'     => 'Bed Cover & Selimut',
    'sepatu-tas'   => 'Sepatu & Tas',
];

require_once __DIR__ . '/../includes/head.php';
?>

  <div class="admin-layout">

<?php require_once __DIR__ . '/../includes/admin-sidebar.php'; ?>

    <!-- Main Content Shell -->
    <div class="admin-main">

<?php require_once __DIR__ . '/../includes/admin-topbar.php'; ?>

      <!-- Main Content Area -->
      <main class="admin-content">

        <!-- Filter Card -->
        <div class="card mb-lg" style="padding: var(--space-md);">
          <div class="flex items-center justify-between flex-wrap gap-md">

            <!-- Status Tabs -->
            <div class="flex items-center gap-xs flex-wrap">
              <?php foreach ($adminStatusTabs as $idx => $tab): ?>
              <button type="button" class="btn btn-secondary btn-sm admin-filter-tab<?= $idx === 0 ? ' active' : '' ?>" data-status="<?= washly_e($tab['value']) ?>"><?= washly_e($tab['label']) ?></button>
              <?php endforeach; ?>
            </div>

            <!-- Search and Dropdown Filter -->
            <div class="flex items-center gap-sm flex-wrap">
              <select id="admin-service-filter" class="form-select" style="width: auto; padding: 0.4rem 0.75rem; font-size: var(--font-size-xs);">
                <?php foreach ($serviceFilterOptions as $val => $label): ?>
                <option value="<?= washly_e($val) ?>"><?= washly_e($label) ?></option>
                <?php endforeach; ?>
              </select>

              <input
                type="text"
                id="admin-order-search"
                class="form-control"
                placeholder="Cari ID / Pelanggan / HP..."
                style="padding: 0.4rem 0.75rem; width: 220px;"
              >
            </div>

          </div>
        </div>

        <!-- Orders Table Card -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Daftar Pesanan Laundry</h3>
            <span class="text-xs font-semibold text-secondary" id="admin-order-count">0 Pesanan</span>
          </div>

          <div class="table-container" style="border:none; border-radius:0;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kode Pesanan</th>
                  <th>Pelanggan</th>
                  <th>Layanan</th>
                  <th>Tanggal Masuk</th>
                  <th>Berat Riil</th>
                  <th>Total Biaya</th>
                  <th>Status</th>
                  <th class="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody id="admin-orders-tbody">
                <!-- Dynamically populated by js/admin.js -->
              </tbody>
            </table>
          </div>
        </div>

      </main>

    </div>

  </div>

<?php require_once __DIR__ . '/../includes/scripts.php'; ?>
