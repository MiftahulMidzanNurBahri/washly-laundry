<?php
$pageTitle = 'Daftar Akun — Washly';
$pageDescription = 'Daftarkan akun Washly Laundry untuk mulai memesan layanan laundry, melacak cucian, dan melihat riwayat transaksi.';
$basePrefix = '';
$extraCss = 'auth.css';
$pageScript = 'auth.js';

require_once __DIR__ . '/includes/head.php';
?>

  <div class="auth-wrapper">
    <div class="auth-card" style="max-width: 520px;">
      <div class="auth-header">
        <div class="flex items-center justify-between mb-sm">
          <a href="index.php" class="auth-logo" style="margin-bottom:0;"><span>Washly</span></a>
          <?= washly_theme_toggle_button() . "\n" ?>
        </div>
        <h1 class="auth-title">Daftar Akun Baru</h1>
        <p class="auth-desc">Buat akun Washly untuk mulai memesan layanan laundry</p>
      </div>

      <form id="washly-register-form" novalidate>
        <div class="form-group">
          <label for="reg-name" class="form-label">
            Nama Lengkap <span class="required">*</span>
          </label>
          <input
            type="text"
            id="reg-name"
            class="form-control"
            placeholder="Contoh: Budi Santoso"
            required
            autocomplete="name"
          >
          <div class="form-error"></div>
        </div>

        <div class="grid grid-cols-2 gap-sm">
          <div class="form-group">
            <label for="reg-email" class="form-label">
              Alamat Email <span class="required">*</span>
            </label>
            <input
              type="email"
              id="reg-email"
              class="form-control"
              placeholder="nama@email.com"
              required
              autocomplete="email"
            >
            <div class="form-error"></div>
          </div>

          <div class="form-group">
            <label for="reg-phone" class="form-label">
              Nomor WhatsApp / HP <span class="required">*</span>
            </label>
            <input
              type="tel"
              id="reg-phone"
              class="form-control"
              placeholder="081234567890"
              required
              autocomplete="tel"
            >
            <div class="form-error"></div>
          </div>
        </div>

        <div class="form-group">
          <label for="reg-address" class="form-label">
            Alamat Domisili
          </label>
          <textarea
            id="reg-address"
            class="form-textarea"
            rows="2"
            placeholder="Nama jalan, nomor rumah, RT/RW atau nama apartemen"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-sm">
          <div class="form-group">
            <label for="reg-password" class="form-label">
              Kata Sandi <span class="required">*</span>
            </label>
            <div class="input-password-wrapper">
              <input
                type="password"
                id="reg-password"
                class="form-control"
                placeholder="Minimal 6 karakter"
                required
                autocomplete="new-password"
              >
              <button type="button" class="btn-toggle-password" aria-label="Lihat kata sandi">Lihat</button>
            </div>
            <div class="form-error"></div>
          </div>

          <div class="form-group">
            <label for="reg-confirm-password" class="form-label">
              Ulangi Sandi <span class="required">*</span>
            </label>
            <div class="input-password-wrapper">
              <input
                type="password"
                id="reg-confirm-password"
                class="form-control"
                placeholder="Ketik ulang sandi"
                required
                autocomplete="new-password"
              >
              <button type="button" class="btn-toggle-password" aria-label="Lihat kata sandi">Lihat</button>
            </div>
            <div class="form-error"></div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-lg mt-md" style="width: 100%;">
          Daftarkan Akun Baru
        </button>
      </form>

      <div class="auth-footer">
        Sudah memiliki akun? <a href="login.php">Masuk di sini</a>
        <div class="mt-xs">
          <a href="index.php" class="text-xs text-muted">← Kembali ke Halaman Utama</a>
        </div>
      </div>
    </div>
  </div>

<?php require_once __DIR__ . '/includes/scripts.php'; ?>
