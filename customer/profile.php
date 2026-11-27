<?php
$pageTitle = 'Pengaturan Profil — Washly';
$pageDescription = 'Kelola informasi profil, nomor WhatsApp, dan alamat domisili pelanggan Washly.';
$basePrefix = '../';
$extraCss = 'customer.css';
$pageScript = 'customer.js';
$activeNav = 'profile';

require_once __DIR__ . '/../includes/head.php';
require_once __DIR__ . '/../includes/customer-header.php';

$profileUser = washly_current_user('customer');
?>

  <!-- Main Container -->
  <main class="container-narrow" style="padding-top: var(--space-xl); padding-bottom: var(--space-3xl);">

    <div class="mb-xl">
      <a href="dashboard.php" class="text-xs text-link font-semibold mb-xs" style="display:inline-block;">← Kembali ke Dashboard</a>
      <h2>Pengaturan Profil Pelanggan</h2>
      <p class="text-secondary text-sm">
        Perbarui informasi kontak dan alamat pengambilan laundry Anda.
      </p>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="flex items-center gap-md">
          <div class="user-avatar" style="width: 52px; height: 52px; font-size: var(--font-size-lg);">
            <?= washly_e($profileUser['initials']) ?>
          </div>
          <div>
            <h3 class="card-title"><?= washly_e($profileUser['name']) ?></h3>
            <span class="badge badge-role mt-2xs">Pelanggan Terverifikasi</span>
          </div>
        </div>
      </div>

      <div class="card-body">
        <form id="customer-profile-form">
          <div class="form-group">
            <label for="profile-name" class="form-label">Nama Lengkap</label>
            <input type="text" id="profile-name" class="form-control" required>
          </div>

          <div class="grid grid-cols-2 gap-md">
            <div class="form-group">
              <label for="profile-email" class="form-label">Alamat Email</label>
              <input type="email" id="profile-email" class="form-control" readonly style="background-color: var(--color-surface-hover);">
              <span class="form-hint">Email digunakan sebagai ID akun masuk utama.</span>
            </div>

            <div class="form-group">
              <label for="profile-phone" class="form-label">Nomor WhatsApp / HP</label>
              <input type="tel" id="profile-phone" class="form-control" required>
            </div>
          </div>

          <div class="form-group">
            <label for="profile-address" class="form-label">Alamat Domisili</label>
            <textarea id="profile-address" class="form-textarea" rows="3" placeholder="Alamat rumah atau kantor"></textarea>
          </div>

          <div class="flex justify-end pt-md" style="border-top: 1px solid var(--color-border);">
            <button type="submit" class="btn btn-primary">
              Simpan Perubahan Profil
            </button>
          </div>
        </form>
      </div>
    </div>

  </main>

<?php require_once __DIR__ . '/../includes/scripts.php'; ?>
