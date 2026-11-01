/**
 * Washly - Customer Experience Controller
 * Manages Customer Dashboard, Order Creation, Order Tracking & History
 */

document.addEventListener('DOMContentLoaded', () => {
  const page = detectCustomerPage();

  switch (page) {
    case 'dashboard':
      initCustomerDashboard();
      break;
    case 'order':
      initOrderCreationPage();
      break;
    case 'order-detail':
      initOrderDetailPage();
      break;
    case 'history':
      initCustomerHistoryPage();
      break;
    case 'profile':
      initCustomerProfilePage();
      break;
  }
});

function detectCustomerPage() {
  const path = window.location.pathname;
  if (path.includes('order-detail.html')) return 'order-detail';
  if (path.includes('order.html')) return 'order';
  if (path.includes('history.html')) return 'history';
  if (path.includes('profile.html')) return 'profile';
  if (path.includes('dashboard.html')) return 'dashboard';
  return '';
}

// --------------------------------------------------------------------------
// Customer Dashboard
// --------------------------------------------------------------------------
async function initCustomerDashboard() {
  const user = window.WashlyAPI.getCurrentUser();
  if (!user) {
    window.location.href = '../login.html';
    return;
  }

  // Update greeting
  const greetingEl = document.getElementById('user-greeting-name');
  if (greetingEl) greetingEl.textContent = user.name;

  try {
    const orders = await window.WashlyAPI.orders.listCustomerOrders(user.id);

    // Compute stats
    const activeOrders = orders.filter(o => o.status === 'Menunggu Penyerahan' || o.status === 'Diproses');
    const readyOrders = orders.filter(o => o.status === 'Siap Diambil');
    const completedOrders = orders.filter(o => o.status === 'Diambil');

    const statActive = document.getElementById('stat-active-count');
    const statReady = document.getElementById('stat-ready-count');
    const statCompleted = document.getElementById('stat-completed-count');

    if (statActive) statActive.textContent = activeOrders.length;
    if (statReady) statReady.textContent = readyOrders.length;
    if (statCompleted) statCompleted.textContent = completedOrders.length;

    // Render ongoing order spotlight card
    renderOngoingOrderCard(activeOrders.concat(readyOrders)[0]);

    // Render recent orders table
    renderRecentOrdersTable(orders.slice(0, 5));
  } catch (err) {
    console.error('Error loading dashboard data:', err);
    window.WashlyApp.showToast('Gagal memuat data dashboard.', 'error');
  }

  // Tracking code search box shortcut
  const trackForm = document.getElementById('tracking-quick-form');
  if (trackForm) {
    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const codeInput = document.getElementById('tracking-input-code');
      const code = codeInput.value.trim().toUpperCase();
      if (!code) {
        window.WashlyApp.showToast('Masukkan kode pesanan terlebih dahulu.', 'warning');
        return;
      }
      window.location.href = `order-detail.html?id=${encodeURIComponent(code)}`;
    });
  }
}

function renderOngoingOrderCard(order) {
  const container = document.getElementById('ongoing-order-spotlight');
  if (!container) return;

  if (!order) {
    container.innerHTML = `
      <div class="empty-state" style="padding: var(--space-xl) var(--space-md); border: 1px dashed var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface);">
        <div class="empty-state-title">Tidak Ada Pesanan Berjalan</div>
        <div class="empty-state-text">Semua pakaian Anda telah selesai atau belum ada pesanan baru.</div>
        <a href="order.html" class="btn btn-primary btn-sm">Buat Pesanan Laundry Sekarang</a>
      </div>
    `;
    return;
  }

  const statusDetails = window.WASHLY_CONFIG.STATUS_DETAILS[order.status];
  const stepIndex = statusDetails ? statusDetails.stepIndex : 1;

  container.innerHTML = `
    <div class="card card-hover" style="border-left: 4px solid var(--color-electric-blue);">
      <div class="card-body">
        <div class="flex items-center justify-between mb-sm flex-wrap gap-xs">
          <div>
            <span class="text-xs text-muted font-medium">Pesanan Aktif</span>
            <h3 style="margin-top: 2px;">${WashlyValidators.escapeHtml(order.id)}</h3>
          </div>
          ${window.WashlyApp.renderStatusBadge(order.status)}
        </div>

        <p class="text-sm text-secondary mb-md">
          Layanan: <strong>${WashlyValidators.escapeHtml(order.serviceName)}</strong> • Pilihan Parfum: <strong>${WashlyValidators.escapeHtml(order.scent)}</strong>
        </p>

        <!-- Stepper Indicator -->
        <div class="stepper mb-md">
          <div class="step-item ${stepIndex >= 1 ? (stepIndex > 1 ? 'completed' : 'active') : ''}">
            <div class="step-circle">1</div>
            <div class="step-title">Menunggu Penyerahan</div>
          </div>
          <div class="step-item ${stepIndex >= 2 ? (stepIndex > 2 ? 'completed' : 'active') : ''}">
            <div class="step-circle">2</div>
            <div class="step-title">Diproses</div>
          </div>
          <div class="step-item ${stepIndex >= 3 ? (stepIndex > 3 ? 'completed' : 'active') : ''}">
            <div class="step-circle">3</div>
            <div class="step-title">Siap Diambil</div>
          </div>
          <div class="step-item ${stepIndex >= 4 ? 'completed' : ''}">
            <div class="step-circle">4</div>
            <div class="step-title">Diambil</div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-sm flex-wrap gap-xs" style="border-top: 1px solid var(--color-border-light);">
          <div class="text-xs text-secondary">
            ${order.actualWeight 
              ? `Berat: <strong>${order.actualWeight} ${order.unit}</strong> | Total: <strong style="color:var(--color-primary-navy);">${window.WashlyApp.formatRupiah(order.finalCost)}</strong>` 
              : `Estimasi: <strong>${order.estimatedWeight} ${order.unit}</strong> (Menunggu Penimbangan)`}
          </div>
          <a href="order-detail.html?id=${encodeURIComponent(order.id)}" class="btn btn-outline-primary btn-sm">
            Lihat Detail & Lacak
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderRecentOrdersTable(orders) {
  const tbody = document.getElementById('recent-orders-tbody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center" style="padding: var(--space-xl);">
          <p class="text-sm text-muted">Belum ada riwayat pesanan.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td><strong style="color:var(--color-primary-navy);">${WashlyValidators.escapeHtml(order.id)}</strong></td>
      <td>${WashlyValidators.escapeHtml(order.serviceName)}</td>
      <td>${window.WashlyApp.formatDateIndo(order.createdAt, false)}</td>
      <td>${order.actualWeight ? `${order.actualWeight} ${order.unit}` : `${order.estimatedWeight} ${order.unit} (est)`}</td>
      <td><strong>${window.WashlyApp.formatRupiah(order.finalCost)}</strong></td>
      <td>${window.WashlyApp.renderStatusBadge(order.status)}</td>
      <td class="text-right">
        <a href="order-detail.html?id=${encodeURIComponent(order.id)}" class="btn btn-secondary btn-sm">Detail</a>
      </td>
    </tr>
  `).join('');
}

// --------------------------------------------------------------------------
// Order Creation Form
// --------------------------------------------------------------------------
function initOrderCreationPage() {
  const form = document.getElementById('order-create-form');
  if (!form) return;

  const user = window.WashlyAPI.getCurrentUser();
  if (!user) {
    window.location.href = '../login.html';
    return;
  }

  // Pre-fill user data
  const custNameInput = document.getElementById('order-customer-name');
  const custPhoneInput = document.getElementById('order-customer-phone');
  if (custNameInput) custNameInput.value = user.name;
  if (custPhoneInput) custPhoneInput.value = user.phone;

  // Render Services Grid
  renderServicesSelection();

  // Render Scents Selection
  renderScentsSelection();

  // Weight stepper buttons & input listener
  const weightInput = document.getElementById('order-weight-estimate');
  const btnWeightMinus = document.getElementById('btn-weight-minus');
  const btnWeightPlus = document.getElementById('btn-weight-plus');

  if (weightInput) {
    weightInput.addEventListener('input', updateOrderCalculation);
    if (btnWeightMinus) {
      btnWeightMinus.addEventListener('click', () => {
        let val = parseFloat(weightInput.value) || 1;
        if (val > 1) {
          weightInput.value = (val - 1).toFixed(1);
          updateOrderCalculation();
        }
      });
    }
    if (btnWeightPlus) {
      btnWeightPlus.addEventListener('click', () => {
        let val = parseFloat(weightInput.value) || 1;
        weightInput.value = (val + 1).toFixed(1);
        updateOrderCalculation();
      });
    }
  }

  // Form submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedServiceEl = document.querySelector('.service-card.selected');
    if (!selectedServiceEl) {
      window.WashlyApp.showToast('Silakan pilih salah satu layanan laundry.', 'error');
      return;
    }

    const serviceId = selectedServiceEl.dataset.serviceId;
    const selectedScentEl = document.querySelector('.scent-option.selected');
    const scentName = selectedScentEl ? selectedScentEl.dataset.scentName : 'Ocean Fresh';
    const estimatedWeight = parseFloat(weightInput.value) || 1.0;
    const notes = document.getElementById('order-notes').value.trim();
    const handoverMethod = document.querySelector('input[name="handover-method"]:checked')?.value || 'antar-sendiri';

    const submitBtn = document.getElementById('btn-submit-order');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Membuat Pesanan...';

    try {
      const payload = {
        customerId: user.id,
        customerName: custNameInput.value.trim() || user.name,
        customerPhone: custPhoneInput.value.trim() || user.phone,
        serviceId: serviceId,
        scent: scentName,
        estimatedWeight: estimatedWeight,
        notes: notes,
        handoverMethod: handoverMethod
      };

      const result = await window.WashlyAPI.orders.create(payload);
      window.WashlyApp.showToast(`Pesanan ${result.order.id} berhasil dibuat!`, 'success');

      setTimeout(() => {
        window.location.href = `order-detail.html?id=${encodeURIComponent(result.order.id)}`;
      }, 600);
    } catch (err) {
      window.WashlyApp.showToast(err.message || 'Gagal membuat pesanan.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Konfirmasi & Buat Pesanan';
    }
  });

  // Initial calculation
  updateOrderCalculation();
}

function renderServicesSelection() {
  const container = document.getElementById('services-grid-container');
  if (!container) return;

  const services = window.WASHLY_CONFIG.SERVICES;
  container.innerHTML = services.map((svc, idx) => `
    <div class="service-card ${idx === 0 ? 'selected' : ''}" data-service-id="${svc.id}" data-price="${svc.price}" data-unit="${svc.unit}">
      <div class="service-name">${WashlyValidators.escapeHtml(svc.name)}</div>
      <div class="service-price">${window.WashlyApp.formatRupiah(svc.price)} / ${svc.unit}</div>
      <div class="service-desc">${WashlyValidators.escapeHtml(svc.description)}</div>
      <div class="service-duration">
        <span>Estimasi: ${svc.duration}</span>
      </div>
    </div>
  `).join('');

  // Attach card selection listeners
  container.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      updateOrderCalculation();
    });
  });
}

function renderScentsSelection() {
  const container = document.getElementById('scents-grid-container');
  if (!container) return;

  const scents = window.WASHLY_CONFIG.SCENTS;
  container.innerHTML = scents.map((scent, idx) => `
    <div class="scent-option ${idx === 0 ? 'selected' : ''}" data-scent-name="${scent.name}" data-scent-price="${scent.price}">
      <div>${WashlyValidators.escapeHtml(scent.name)}</div>
      <div class="text-xs text-muted" style="margin-top:2px;">
        ${scent.price > 0 ? `+${window.WashlyApp.formatRupiah(scent.price)}` : 'Gratis'}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.scent-option').forEach(opt => {
    opt.addEventListener('click', () => {
      container.querySelectorAll('.scent-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      updateOrderCalculation();
    });
  });
}

function updateOrderCalculation() {
  const selectedCard = document.querySelector('.service-card.selected');
  if (!selectedCard) return;

  const pricePerUnit = parseInt(selectedCard.dataset.price, 10);
  const unit = selectedCard.dataset.unit;
  const serviceName = selectedCard.querySelector('.service-name').textContent;

  const selectedScent = document.querySelector('.scent-option.selected');
  const scentName = selectedScent ? selectedScent.dataset.scentName : 'Ocean Fresh';
  const scentPrice = selectedScent ? parseInt(selectedScent.dataset.scentPrice, 10) : 0;

  const weightInput = document.getElementById('order-weight-estimate');
  const weight = parseFloat(weightInput ? weightInput.value : 1.0) || 1.0;

  const subtotalService = pricePerUnit * weight;
  const totalEstimated = subtotalService + scentPrice;

  // Update Summary UI elements
  const elSvcName = document.getElementById('summary-service-name');
  const elSvcRate = document.getElementById('summary-service-rate');
  const elSvcScent = document.getElementById('summary-scent-name');
  const elScentPrice = document.getElementById('summary-scent-price');
  const elEstWeight = document.getElementById('summary-estimated-weight');
  const elEstSubtotal = document.getElementById('summary-service-subtotal');
  const elEstTotal = document.getElementById('summary-total-estimate');

  if (elSvcName) elSvcName.textContent = serviceName;
  if (elSvcRate) elSvcRate.textContent = `${window.WashlyApp.formatRupiah(pricePerUnit)} / ${unit}`;
  if (elSvcScent) elSvcScent.textContent = scentName;
  if (elScentPrice) elScentPrice.textContent = scentPrice > 0 ? window.WashlyApp.formatRupiah(scentPrice) : 'Gratis';
  if (elEstWeight) elEstWeight.textContent = `${weight} ${unit}`;
  if (elEstSubtotal) elEstSubtotal.textContent = window.WashlyApp.formatRupiah(subtotalService);
  if (elEstTotal) {
    elEstTotal.textContent = window.WashlyApp.formatRupiah(totalEstimated);
    window.WashlyApp.highlightUpdate(elEstTotal);
  }
}

// --------------------------------------------------------------------------
// Order Detail & Tracking Page
// --------------------------------------------------------------------------
async function initOrderDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  if (!orderId) {
    window.location.href = 'dashboard.html';
    return;
  }

  try {
    const order = await window.WashlyAPI.orders.getById(orderId);
    renderOrderDetailView(order);
  } catch (err) {
    const mainContainer = document.getElementById('order-detail-container');
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-title">Pesanan Tidak Ditemukan</div>
          <div class="empty-state-text">Pesanan dengan kode <strong>${WashlyValidators.escapeHtml(orderId)}</strong> tidak terdaftar dalam sistem Washly.</div>
          <a href="dashboard.html" class="btn btn-secondary">Kembali ke Dashboard</a>
        </div>
      `;
    }
  }
}

function renderOrderDetailView(order) {
  // Order Code & Status Badge
  const codeEl = document.getElementById('detail-order-code');
  const badgeEl = document.getElementById('detail-status-badge');
  const dateEl = document.getElementById('detail-order-date');

  if (codeEl) codeEl.textContent = order.id;
  if (badgeEl) badgeEl.innerHTML = window.WashlyApp.renderStatusBadge(order.status);
  if (dateEl) dateEl.textContent = window.WashlyApp.formatDateIndo(order.createdAt);

  // Stepper Progression
  const statusDetails = window.WASHLY_CONFIG.STATUS_DETAILS[order.status] || { stepIndex: 1 };
  const currentStep = statusDetails.stepIndex;

  const stepperEl = document.getElementById('detail-stepper');
  if (stepperEl) {
    stepperEl.innerHTML = `
      <div class="step-item ${currentStep >= 1 ? (currentStep > 1 ? 'completed' : 'active') : ''}">
        <div class="step-circle">1</div>
        <div class="step-title">Menunggu Penyerahan</div>
        <div class="step-time">${findTimelineTime(order.timeline, 'Menunggu Penyerahan')}</div>
      </div>
      <div class="step-item ${currentStep >= 2 ? (currentStep > 2 ? 'completed' : 'active') : ''}">
        <div class="step-circle">2</div>
        <div class="step-title">Diproses</div>
        <div class="step-time">${findTimelineTime(order.timeline, 'Diproses')}</div>
      </div>
      <div class="step-item ${currentStep >= 3 ? (currentStep > 3 ? 'completed' : 'active') : ''}">
        <div class="step-circle">3</div>
        <div class="step-title">Siap Diambil</div>
        <div class="step-time">${findTimelineTime(order.timeline, 'Siap Diambil')}</div>
      </div>
      <div class="step-item ${currentStep >= 4 ? 'completed' : ''}">
        <div class="step-circle">4</div>
        <div class="step-title">Diambil</div>
        <div class="step-time">${findTimelineTime(order.timeline, 'Diambil')}</div>
      </div>
    `;
  }

  // Weight & Cost calculation box
  const weightBox = document.getElementById('detail-weight-cost-box');
  if (weightBox) {
    if (order.actualWeight === null) {
      weightBox.innerHTML = `
        <div class="order-notice mb-md" style="background:var(--color-warning-bg); border-color:var(--color-warning-border); color:var(--color-warning);">
          <strong>Pakaian Menunggu Penimbangan</strong><br>
          Petugas outlet Washly akan menimbang cucian Anda saat pakaian diserahkan. Setelah ditimbang, berat riil dan total biaya pasti akan otomatis tampil di sini.
        </div>
        <div class="summary-row">
          <span>Estimasi Berat Pelanggan:</span>
          <strong>${order.estimatedWeight} ${order.unit}</strong>
        </div>
        <div class="summary-row">
          <span>Tarif Layanan:</span>
          <strong>${window.WashlyApp.formatRupiah(order.pricePerUnit)} / ${order.unit}</strong>
        </div>
        <div class="summary-row">
          <span>Pilihan Parfum:</span>
          <strong>${WashlyValidators.escapeHtml(order.scent)} (${order.scentPrice > 0 ? window.WashlyApp.formatRupiah(order.scentPrice) : 'Gratis'})</strong>
        </div>
        <div class="summary-total">
          <span class="summary-total-label">Total Tagihan:</span>
          <span class="summary-total-value" style="font-size:var(--font-size-lg); color:var(--color-warning);">Menunggu Penimbangan</span>
        </div>
      `;
    } else {
      const subtotalWeight = Math.round(order.actualWeight * order.pricePerUnit);
      weightBox.innerHTML = `
        <div class="summary-row">
          <span>Berat Riil Ditimbang:</span>
          <strong style="color:var(--color-electric-blue); font-size:var(--font-size-base);">${order.actualWeight} ${order.unit}</strong>
        </div>
        <div class="summary-row">
          <span>Tarif (${order.actualWeight} ${order.unit} x ${window.WashlyApp.formatRupiah(order.pricePerUnit)}):</span>
          <strong>${window.WashlyApp.formatRupiah(subtotalWeight)}</strong>
        </div>
        <div class="summary-row">
          <span>Parfum Eksklusif (${WashlyValidators.escapeHtml(order.scent)}):</span>
          <strong>${order.scentPrice > 0 ? window.WashlyApp.formatRupiah(order.scentPrice) : 'Gratis'}</strong>
        </div>
        <div class="summary-total">
          <span class="summary-total-label">Total Tagihan Final:</span>
          <span class="summary-total-value">${window.WashlyApp.formatRupiah(order.finalCost)}</span>
        </div>
      `;
    }
  }

  // Order Details List
  document.getElementById('detail-service-name').textContent = order.serviceName;
  document.getElementById('detail-customer-name').textContent = order.customerName;
  document.getElementById('detail-customer-phone').textContent = order.customerPhone || '-';
  document.getElementById('detail-handover-method').textContent = order.handoverMethod === 'antar-sendiri' ? 'Antar Sendiri ke Outlet' : 'Minta Penjemputan Kurir';
  document.getElementById('detail-order-notes').textContent = order.notes || 'Tidak ada catatan khusus.';

  // Timeline Activity List
  const timelineListEl = document.getElementById('detail-timeline-list');
  if (timelineListEl && order.timeline) {
    timelineListEl.innerHTML = order.timeline.map((item, idx) => `
      <div class="timeline-item ${idx === order.timeline.length - 1 ? 'active' : 'completed'}">
        <div class="timeline-node"></div>
        <div>
          <div class="flex items-center justify-between mb-xs">
            <strong style="color:var(--color-primary-navy);">${WashlyValidators.escapeHtml(item.status)}</strong>
            <span class="text-xs text-muted">${window.WashlyApp.formatDateIndo(item.timestamp)}</span>
          </div>
          <p class="text-xs text-secondary">${WashlyValidators.escapeHtml(item.note)}</p>
        </div>
      </div>
    `).reverse().join('');
  }

  // Action buttons
  const btnCopy = document.getElementById('btn-copy-code');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(order.id).then(() => {
        window.WashlyApp.showToast(`Kode ${order.id} berhasil disalin ke clipboard!`, 'success');
      });
    });
  }

  const btnPrint = document.getElementById('btn-print-order');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }
}

function findTimelineTime(timeline, statusName) {
  if (!timeline) return '';
  const item = timeline.find(t => t.status === statusName);
  return item ? window.WashlyApp.formatDateIndo(item.timestamp, true) : 'Belum tercapai';
}

// --------------------------------------------------------------------------
// Customer History Page
// --------------------------------------------------------------------------
async function initCustomerHistoryPage() {
  const user = window.WashlyAPI.getCurrentUser();
  if (!user) {
    window.location.href = '../login.html';
    return;
  }

  const orders = await window.WashlyAPI.orders.listCustomerOrders(user.id);
  let activeStatusFilter = 'Semua';
  let searchQuery = '';

  const render = () => {
    let filtered = [...orders];

    if (activeStatusFilter !== 'Semua') {
      filtered = filtered.filter(o => o.status === activeStatusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(q) || 
        o.serviceName.toLowerCase().includes(q)
      );
    }

    const tbody = document.getElementById('history-orders-tbody');
    const countEl = document.getElementById('history-total-count');
    if (countEl) countEl.textContent = `${filtered.length} Pesanan`;

    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center" style="padding: var(--space-2xl);">
            <div class="empty-state">
              <div class="empty-state-title">Tidak ada pesanan ditemukan</div>
              <div class="empty-state-text">Coba ubah kata kunci pencarian atau filter status pesanan.</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(order => `
      <tr>
        <td><strong style="color:var(--color-primary-navy);">${WashlyValidators.escapeHtml(order.id)}</strong></td>
        <td>${window.WashlyApp.formatDateIndo(order.createdAt, false)}</td>
        <td>${WashlyValidators.escapeHtml(order.serviceName)}</td>
        <td>${WashlyValidators.escapeHtml(order.scent)}</td>
        <td>${order.actualWeight ? `${order.actualWeight} ${order.unit}` : `${order.estimatedWeight} ${order.unit} (est)`}</td>
        <td><strong>${window.WashlyApp.formatRupiah(order.finalCost)}</strong></td>
        <td>${window.WashlyApp.renderStatusBadge(order.status)}</td>
        <td class="text-right">
          <a href="order-detail.html?id=${encodeURIComponent(order.id)}" class="btn btn-secondary btn-sm">Lihat Detail</a>
        </td>
      </tr>
    `).join('');
  };

  // Filter tab buttons
  const filterBtns = document.querySelectorAll('.history-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatusFilter = btn.dataset.status;
      render();
    });
  });

  // Search input
  const searchInput = document.getElementById('history-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      render();
    });
  }

  render();
}

// --------------------------------------------------------------------------
// Customer Profile Page
// --------------------------------------------------------------------------
function initCustomerProfilePage() {
  const user = window.WashlyAPI.getCurrentUser();
  if (!user) {
    window.location.href = '../login.html';
    return;
  }

  const nameInput = document.getElementById('profile-name');
  const emailInput = document.getElementById('profile-email');
  const phoneInput = document.getElementById('profile-phone');
  const addressInput = document.getElementById('profile-address');
  const form = document.getElementById('customer-profile-form');

  if (nameInput) nameInput.value = user.name || '';
  if (emailInput) emailInput.value = user.email || '';
  if (phoneInput) phoneInput.value = user.phone || '';
  if (addressInput) addressInput.value = user.address || '';

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!WashlyValidators.minLength(nameInput.value, 3)) {
        window.WashlyApp.showToast('Nama minimal 3 karakter.', 'error');
        return;
      }

      if (!WashlyValidators.isIndonesianPhone(phoneInput.value)) {
        window.WashlyApp.showToast('Nomor HP tidak valid.', 'error');
        return;
      }

      const updatedUser = {
        ...user,
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: addressInput.value.trim()
      };

      window.WashlyAPI.setCurrentUser(updatedUser);
      window.WashlyApp.showToast('Profil berhasil diperbarui.', 'success');
      setTimeout(() => window.location.reload(), 400);
    });
  }
}
