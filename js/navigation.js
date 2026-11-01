/**
 * Washly - Navigation Controller & Demo Bar Manager
 * Handles mobile menus, active links, demo role switching, and logout
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  initPageTransitions();
  initDemoBanner();
  initMobileNavigation();
  highlightActiveNav();
  initLogoutHandlers();
});

// --------------------------------------------------------------------------
// Smooth Page Transitions & Navigation Progress Bar
// --------------------------------------------------------------------------
function initPageTransitions() {
  // Ensure progress bar element exists
  let progressBar = document.getElementById('washly-page-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'washly-page-progress';
    document.body.prepend(progressBar);
  }
  // Finish entrance animation
  document.body.classList.add('page-enter');
  progressBar.style.width = '100%';
  setTimeout(() => {
    progressBar.style.opacity = '0';
    setTimeout(() => {
      progressBar.style.width = '0%';
      progressBar.style.opacity = '1';
    }, 200);
    document.body.classList.remove('page-enter');
  }, 260);

  // Handle BFcache (Back/Forward navigation restore)
  window.addEventListener('pageshow', (event) => {
    document.body.classList.remove('page-exit');
    document.body.classList.add('page-enter');
    setTimeout(() => document.body.classList.remove('page-enter'), 260);
  });

  // Intercept eligible internal link clicks for smooth transition
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Filter out anchors, protocols, targets, and modifiers
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      e.ctrlKey || e.metaKey || e.shiftKey || e.altKey
    ) {
      return;
    }

    // Check if origin matches or is relative
    const isRelative = !href.startsWith('http://') && !href.startsWith('https://');
    const isSameOrigin = href.startsWith(window.location.origin);
    if (!isRelative && !isSameOrigin) return;

    e.preventDefault();

    // Trigger visual exit transition
    if (progressBar) {
      progressBar.style.width = '70%';
    }
    document.body.classList.add('page-exit');

    setTimeout(() => {
      window.location.href = href;
    }, 130);
  });
}

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
      <button type="button" class="demo-btn" id="btn-switch-customer">Masuk Pelanggan</button>
      <button type="button" class="demo-btn" id="btn-switch-admin">Masuk Admin</button>
      <button type="button" class="demo-btn" id="btn-reset-demo" title="Kembalikan data pesanan awal">Reset Data</button>
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
    customerToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('is-open');
      customerToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking nav link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        customerToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('is-open') &&
          !navMenu.contains(e.target) &&
          !customerToggle.contains(e.target)) {
        navMenu.classList.remove('is-open');
        customerToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Admin sidebar mobile hamburger & backdrop
  const adminToggle = document.querySelector('.admin-mobile-toggle');
  const adminSidebar = document.querySelector('.admin-sidebar');
  if (adminSidebar) {
    // Inject backdrop overlay if not present
    let backdrop = document.querySelector('.admin-sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'admin-sidebar-backdrop';
      adminSidebar.parentElement?.appendChild(backdrop);
    }

    const toggleAdminSidebar = (open) => {
      const shouldOpen = open !== undefined ? open : !adminSidebar.classList.contains('is-open');
      adminSidebar.classList.toggle('is-open', shouldOpen);
      backdrop.classList.toggle('is-open', shouldOpen);
      if (adminToggle) adminToggle.setAttribute('aria-expanded', shouldOpen);
    };

    if (adminToggle) {
      adminToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAdminSidebar();
      });
    }

    backdrop.addEventListener('click', () => {
      toggleAdminSidebar(false);
    });

    adminSidebar.querySelectorAll('.admin-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          toggleAdminSidebar(false);
        }
      });
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

// --------------------------------------------------------------------------
// Theme Switcher & Persistence Controller
// --------------------------------------------------------------------------
function initThemeSwitcher() {
  if (window.WashlyApp && window.WashlyApp.Theme) {
    window.WashlyApp.Theme.init();
  }

  // Delegated click handler for theme toggles anywhere in DOM
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-toggle-btn');
    if (!btn) return;

    e.preventDefault();
    if (window.WashlyApp && window.WashlyApp.Theme) {
      const next = window.WashlyApp.Theme.toggle();
      const message = next === 'dark' ? 'Mode Gelap diaktifkan' : 'Mode Terang diaktifkan';
      window.WashlyApp.showToast(message, 'info');
    }
  });

  // Inject fallback toggle button into headers if not already hardcoded
  ensureThemeToggleButton();
}

function ensureThemeToggleButton() {
  const existing = document.querySelector('.theme-toggle-btn');
  if (existing) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle-btn';
  btn.id = 'theme-toggle';
  const isDark = window.WashlyApp?.Theme?.current === 'dark';
  btn.setAttribute('aria-label', isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap');
  btn.setAttribute('title', isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap');
  btn.innerHTML = `
    <span class="theme-toggle-icon icon-sun" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
    </span>
    <span class="theme-toggle-icon icon-moon" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
    </span>
  `;

  const customerContainer = document.querySelector('.app-header .header-container > .flex');
  const adminContainer = document.querySelector('.admin-topbar > .flex:last-child');
  const authHeader = document.querySelector('.auth-header');

  if (customerContainer) {
    customerContainer.prepend(btn);
  } else if (adminContainer) {
    adminContainer.prepend(btn);
  } else if (authHeader) {
    authHeader.appendChild(btn);
  }
}
