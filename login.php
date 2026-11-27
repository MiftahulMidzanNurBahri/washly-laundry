<?php
$pageTitle = 'Masuk ke Akun Washly';
$pageDescription = 'Masuk ke portal Washly Laundry untuk memantau status cucian, riwayat pesanan, atau akses dasbor admin.';
$basePrefix = '';
$extraCss = 'auth.css';
$pageScript = 'auth.js';

$initialRole = (isset($_GET['role']) && $_GET['role'] === 'admin') ? 'admin' : 'customer';

require_once __DIR__ . '/includes/head.php';
?>

  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <div class="flex items-center justify-between mb-sm">
          <a href="index.php" class="auth-logo" style="margin-bottom:0;"><span>Washly</span></a>
          <?= washly_theme_toggle_button() . "\n" ?>
        </div>
        <h1 class="auth-title">Selamat Datang Kembali</h1>
        <p class="auth-desc">Masuk untuk memantau cucian atau mengelola outlet</p>
      </div>

      <!-- Demo Accounts Shortcut Box -->
      <div class="auth-demo-accounts">
        <div class="auth-demo-title">
          <span>Coba Akun Demo Sekali Klik:</span>
        </div>
        <div class="auth-demo-buttons">
          <button type="button" class="auth-demo-pill" id="btn-fill-customer">
            Pelanggan (Budi)
          </button>
          <button type="button" class="auth-demo-pill" id="btn-fill-admin">
            Admin (Siti Aminah)
          </button>
        </div>
      </div>

      <!-- Role Selector Tabs -->
      <div class="auth-role-tabs">
        <button type="button" class="auth-role-tab<?= $initialRole === 'customer' ? ' active' : '' ?>" data-role="customer">
          Sebagai Pelanggan
        </button>
        <button type="button" class="auth-role-tab<?= $initialRole === 'admin' ? ' active' : '' ?>" data-role="admin">
          Sebagai Admin Outlet
        </button>
      </div>

      <form id="washly-login-form" novalidate>
        <input type="hidden" id="login-role" value="<?= washly_e($initialRole) ?>">

        <div class="form-group">
          <label for="login-email" class="form-label">
            Alamat Email <span class="required">*</span>
          </label>
          <input
            type="email"
            id="login-email"
            class="form-control"
            placeholder="nama@email.com"
            required
            autocomplete="email"
          >
          <div class="form-error"></div>
        </div>

        <div class="form-group">
          <div class="flex items-center justify-between mb-xs">
            <label for="login-password" class="form-label" style="margin-bottom:0;">
              Kata Sandi <span class="required">*</span>
            </label>
          </div>
          <div class="input-password-wrapper">
            <input
              type="password"
              id="login-password"
              class="form-control"
              placeholder="Masukkan kata sandi"
              required
              autocomplete="current-password"
            >
            <button type="button" class="btn-toggle-password" aria-label="Lihat kata sandi">Lihat</button>
          </div>
          <div class="form-error"></div>
        </div>

        <button type="submit" class="btn btn-primary btn-lg mt-md" style="width: 100%;">
          Masuk ke Akun
        </button>
      </form>

      <div class="auth-footer">
        Belum memiliki akun? <a href="register.php">Daftar Akun Baru</a>
        <div class="mt-xs">
          <a href="index.php" class="text-xs text-muted">← Kembali ke Halaman Utama</a>
        </div>
      </div>
    </div>
  </div>

<?php require_once __DIR__ . '/includes/scripts.php'; ?>
