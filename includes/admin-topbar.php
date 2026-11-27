<?php
/**
 * Shared Admin Topbar Header.
 *
 * Expected variables:
 * - string $topbarTitle
 * - string $topbarSubtitle
 */
require_once __DIR__ . '/bootstrap.php';

$topbarTitle = $topbarTitle ?? 'Dashboard Operasional Outlet';
$topbarSubtitle = $topbarSubtitle ?? 'Washly Outlet Pusat Jakarta';
$adminUser = washly_current_user('admin');
?>
      <!-- Top Bar -->
      <header class="admin-topbar">
        <div class="flex items-center gap-sm">
          <button type="button" class="admin-mobile-toggle" aria-label="Open navigation menu" aria-expanded="false" aria-controls="admin-sidebar">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <div>
            <h3 style="font-size: var(--font-size-base); margin:0;"><?= washly_e($topbarTitle) ?></h3>
            <span class="text-xs text-muted"><?= washly_e($topbarSubtitle) ?></span>
          </div>
        </div>

        <div class="flex items-center gap-md">
          <?= washly_theme_toggle_button() . "\n" ?>
          <div class="user-profile-widget">
            <div class="user-avatar" style="background:var(--color-electric-blue);"><?= washly_e($adminUser['initials']) ?></div>
            <div class="user-info">
              <span class="user-name"><?= washly_e($adminUser['name']) ?></span>
              <span class="user-role-label">Petugas & Penimbang</span>
            </div>
          </div>
        </div>
      </header>
