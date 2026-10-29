/**
 * Washly - Navigation Controller & Demo Bar Manager
 * Handles mobile menus, active links, demo role switching, and logout
 */

document.addEventListener('DOMContentLoaded', () => {
  initDemoBanner();
  initMobileNavigation();
  highlightActiveNav();
  initLogoutHandlers();
});

// --------------------------------------------------------------------------
// Demo Banner & Persona Switcher
// --------------------------------------------------------------------------
function initDemoBanner() {
  const existing = document.querySelector('.demo-banner');
  if (existing) return; // Already present in static HTML

  const currentUser = window.WashlyAPI.getCurrentUser();
  const role = currentUser ? currentUser.role : 'guest';
  const roleName = role === 'admin' ? 'Admin Outlet' : (role === 'customer' ? 'Pelanggan' : 'Tamu');
  const userName = currentUser ? currentUser.name : 'Belum Masuk';

  // Determine relative prefix for assets and links
  const path = window.location.pathname;
  const isSubdir = path.includes('/customer/') || path.includes('/admin/');
  const rootPrefix = isSubdir ? '../' : './';

  const banner = document.createElement('div');
  banner.className = 'demo-banner';
  banner.innerHTML = `
    <div class="demo-banner-content">
      <span class="demo-chip">DEMO MODE</span>
      <span>Aktif sebagai: <strong>${userName}</strong> (${roleName})</span>
    </div>
    <div class="demo-actions">
      <button type="button" class="demo-btn" id="btn-switch-customer">👤 Masuk Pelanggan</button>
      <button type="button" class="demo-btn" id="btn-switch-admin">🛡️ Masuk Admin</button>
      <button type="button" class="demo-btn" id="btn-reset-demo" title="Kembalikan data pesanan awal">🔄 Reset Data</button>
    </div>
  `;

  document.body.prepend(banner);

  // Switch to Customer
  document.getElementById('btn-switch-customer')?.addEventListener('click', () => {
    const customerUser = window.WASHLY_MOCK_DATA.USERS[0];
    window.WashlyAPI.setCurrentUser(customerUser);
    window.WashlyApp.showToast('Beralih peran ke Pelanggan (Budi Santoso)', 'info');
    setTimeout(() => {
      window.location.href = rootPrefix + 'customer/dashboard.html';
    }, 300);
  });

  // Switch to Admin
  document.getElementById('btn-switch-admin')?.addEventListener('click', () => {
    const adminUser = window.WASHLY_MOCK_DATA.USERS.find(u => u.role === 'admin');
    window.WashlyAPI.setCurrentUser(adminUser);
    window.WashlyApp.showToast('Beralih peran ke Admin (Siti Aminah)', 'info');
    setTimeout(() => {
      window.location.href = rootPrefix + 'admin/dashboard.html';
    }, 300);
  });

  // Reset Demo Data
  document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan data demonstrasi pesanan ke kondisi awal?')) {
      window.WashlyAPI.orders.resetMockData();
      window.WashlyApp.showToast('Data demo berhasil direset ke kondisi awal.', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  });
}

// --------------------------------------------------------------------------
// Mobile Menu & Sidebar Drawer
// --------------------------------------------------------------------------
function initMobileNavigation() {
  // Customer header mobile hamburger
  const customerToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (customerToggle && navMenu) {
    customerToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      customerToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // Admin sidebar mobile hamburger
  const adminToggle = document.querySelector('.admin-mobile-toggle');
  const adminSidebar = document.querySelector('.admin-sidebar');
  if (adminToggle && adminSidebar) {
    adminToggle.addEventListener('click', () => {
      adminSidebar.classList.toggle('is-open');
    });

    // Close when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (adminSidebar.classList.contains('is-open') &&
          !adminSidebar.contains(e.target) &&
          !adminToggle.contains(e.target)) {
        adminSidebar.classList.remove('is-open');
      }
    });
  }
}

// --------------------------------------------------------------------------
// Highlight Active Nav Link
// --------------------------------------------------------------------------
function highlightActiveNav() {
  const currentPath = window.location.pathname;
  const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

  const links = document.querySelectorAll('.nav-link, .admin-nav-item');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const targetFile = href.substring(href.lastIndexOf('/') + 1);
    if (targetFile === currentFile) {
      link.classList.add('active');
    }
  });
}

// --------------------------------------------------------------------------
// Logout Handlers
// --------------------------------------------------------------------------
function initLogoutHandlers() {
  const logoutButtons = document.querySelectorAll('.btn-logout');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.WashlyAPI.auth.logout();
      window.WashlyApp.showToast('Anda telah keluar dari akun.', 'info');
      const isSubdir = window.location.pathname.includes('/customer/') || window.location.pathname.includes('/admin/');
      const rootPrefix = isSubdir ? '../' : './';
      setTimeout(() => {
        window.location.href = rootPrefix + 'login.html';
      }, 400);
    });
  });
}
