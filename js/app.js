/**
 * Washly - Core Application Helpers, UI Utilities, and Modal/Toast Engine
 */

const WashlyApp = (() => {
  // Format Indonesian Rupiah
  function formatRupiah(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return 'Menunggu Penimbangan';
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
  }

  // Format Date in Indonesian Locale
  function formatDateIndo(dateStr, includeTime = true) {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];

      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();

      if (!includeTime) {
        return `${day} ${month} ${year}`;
      }

      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
    } catch (e) {
      return dateStr;
    }
  }

  // Status Badge Component Generator
  function renderStatusBadge(status) {
    const details = window.WASHLY_CONFIG.STATUS_DETAILS[status] || {
      badgeClass: 'badge-status-menunggu',
      label: status
    };
    return `<span class="badge ${details.badgeClass}"><span class="badge-dot"></span>${details.label}</span>`;
  }

  // Toast Notification Engine
  function showToast(message, type = 'info') {
    let container = document.getElementById('washly-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'washly-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    const duration = 3800;

    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; z-index:1;">
        <span style="font-weight:600;">${WashlyValidators.escapeHtml(message)}</span>
      </div>
      <button type="button" class="toast-close-btn" style="background:transparent; border:none; color:var(--color-text-muted); padding:2px 6px; cursor:pointer; font-size:16px; font-weight:700; border-radius:4px; z-index:1; transition:color 150ms ease;" aria-label="Tutup notifikasi">&times;</button>
      <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;

    const closeToast = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(110%) scale(0.95)';
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 220);
    };

    toast.querySelector('.toast-close-btn')?.addEventListener('click', closeToast);
    container.appendChild(toast);

    setTimeout(closeToast, duration);
  }

  // Visual feedback highlight for live calculation ticker
  function highlightUpdate(element) {
    if (!element) return;
    element.classList.remove('price-flash');
    // Force reflow
    void element.offsetWidth;
    element.classList.add('price-flash');
    setTimeout(() => {
      element.classList.remove('price-flash');
    }, 650);
  }

  // Modal Handlers
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  // Global Icons Library (No icons mode)
  const icons = {
    logo: ``,
    washer: ``,
    wind: ``,
    iron: ``,
    zap: ``,
    bed: ``,
    tag: ``,
    check: ``,
    clock: ``,
    search: ``,
    scale: ``
  };

  // Theme Management Engine (Light / Dark Mode with Persistence)
  const Theme = {
    STORAGE_KEY: 'washly_theme',

    get current() {
      try {
        return localStorage.getItem(this.STORAGE_KEY) || 'light';
      } catch (e) {
        return 'light';
      }
    },

    set(theme) {
      const validTheme = theme === 'dark' ? 'dark' : 'light';
      try {
        localStorage.setItem(this.STORAGE_KEY, validTheme);
      } catch (e) {}
      document.documentElement.setAttribute('data-theme', validTheme);
      this.updateUI(validTheme);
      return validTheme;
    },

    toggle() {
      const nextTheme = this.current === 'dark' ? 'light' : 'dark';
      return this.set(nextTheme);
    },

    updateUI(theme) {
      const isDark = theme === 'dark';
      document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.setAttribute('aria-label', isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap');
        btn.setAttribute('title', isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap');
        btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      });
    },

    init() {
      const active = this.current;
      this.set(active);
    }
  };

  return {
    formatRupiah,
    formatDateIndo,
    renderStatusBadge,
    showToast,
    highlightUpdate,
    openModal,
    closeModal,
    icons,
    Theme
  };
})();

if (typeof window !== 'undefined') {
  window.WashlyApp = WashlyApp;
}
