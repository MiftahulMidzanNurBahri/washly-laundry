<?php
/**
 * Shared Customer Portal Navigation Header.
 *
 * Expected variables:
 * - string $activeNav ('dashboard' | 'order' | 'history' | 'profile' | '')
 */
require_once __DIR__ . '/bootstrap.php';

$activeNav = $activeNav ?? '';
$customerUser = washly_current_user('customer');
?>
  <!-- Navigation Header -->
  <header class="app-header">
    <div class="container header-container">
      <a href="../index.php" class="brand-logo">
        <span>Washly</span>
      </a>

      <nav class="nav-menu" id="customer-nav">
        <a href="dashboard.php" class="nav-link<?= $activeNav === 'dashboard' ? ' active' : '' ?>">Dashboard</a>
        <a href="order.php" class="nav-link<?= $activeNav === 'order' ? ' active' : '' ?>">Buat Pesanan Baru</a>
        <a href="history.php" class="nav-link<?= $activeNav === 'history' ? ' active' : '' ?>">Riwayat Pesanan</a>
        <a href="profile.php" class="nav-link<?= $activeNav === 'profile' ? ' active' : '' ?>">Profil Saya</a>
      </nav>

      <div class="flex items-center gap-md">
        <?= washly_theme_toggle_button() . "\n" ?>
        <div class="user-profile-widget">
          <div class="user-avatar" id="header-user-avatar"><?= washly_e($customerUser['initials']) ?></div>
          <div class="user-info">
            <span class="user-name" id="user-greeting-name"><?= washly_e($customerUser['name']) ?></span>
            <span class="user-role-label">Pelanggan</span>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm btn-logout" title="Keluar">Keluar</button>
        <button type="button" class="mobile-nav-toggle" aria-label="Toggle menu">Menu</button>
      </div>
    </div>
  </header>
