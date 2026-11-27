<?php
/**
 * Shared Admin Sidebar Navigation Drawer.
 *
 * Expected variables:
 * - string $activeNav ('dashboard' | 'orders')
 */
require_once __DIR__ . '/bootstrap.php';

$activeNav = $activeNav ?? 'dashboard';
?>
    <!-- Sidebar Navigation -->
    <aside class="admin-sidebar" id="admin-sidebar" aria-hidden="true" inert>
      <div class="admin-sidebar-header">
        <a href="dashboard.php" class="brand-logo" style="color: #FFFFFF;">
          <span>Washly</span>
        </a>
        <span class="badge badge-role" style="font-size:10px; background:rgba(255,255,255,0.15); color:#B9ACDA; border:none;">ADMIN</span>
      </div>

      <nav class="admin-sidebar-nav">
        <a href="dashboard.php" class="admin-nav-item<?= $activeNav === 'dashboard' ? ' active' : '' ?>">
          <div class="admin-nav-item-left">
            <span>Dashboard</span>
          </div>
        </a>

        <a href="orders.php" class="admin-nav-item<?= $activeNav === 'orders' ? ' active' : '' ?>">
          <div class="admin-nav-item-left">
            <span>Manajemen Pesanan</span>
          </div>
        </a>

        <a href="../customer/dashboard.php" class="admin-nav-item">
          <div class="admin-nav-item-left">
            <span>Lihat Portal Pelanggan</span>
          </div>
        </a>
      </nav>

      <div class="admin-sidebar-footer">
        <button type="button" class="btn btn-secondary btn-sm btn-logout" style="width: 100%; justify-content:center; background:rgba(255,255,255,0.08); color:#FFFFFF; border-color:rgba(255,255,255,0.12);">
          Keluar Sesi Admin
        </button>
      </div>
    </aside>
