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

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1769FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    const duration = 3800;

    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; z-index:1;">
        ${iconSvg}
        <span style="font-weight:500;">${WashlyValidators.escapeHtml(message)}</span>
      </div>
      <button type="button" class="toast-close-btn" style="background:transparent; border:none; color:#94A3B8; padding:4px; cursor:pointer; display:flex; align-items:center; border-radius:4px; z-index:1; transition:color 150ms ease;" aria-label="Tutup notifikasi">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
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

  // Global SVG Icons Library
  const icons = {
    logo: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="18" height="20" rx="3"/><circle cx="12" cy="13" r="5"/><circle cx="12" cy="13" r="2"/><circle cx="7" cy="6" r="1"/></svg>`,
    washer: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="18" height="20" rx="3"/><circle cx="12" cy="13" r="5"/><path d="M12 10a3 3 0 0 1 3 3"/></svg>`,
    wind: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>`,
    iron: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15h18v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2z"/><path d="M5 15l2-8h11a2 2 0 0 1 2 2v6"/><circle cx="11" cy="11" r="1"/></svg>`,
    zap: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    bed: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>`,
    tag: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
    check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    scale: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`
  };

  return {
    formatRupiah,
    formatDateIndo,
    renderStatusBadge,
    showToast,
    highlightUpdate,
    openModal,
    closeModal,
    icons
  };
})();

if (typeof window !== 'undefined') {
  window.WashlyApp = WashlyApp;
}
