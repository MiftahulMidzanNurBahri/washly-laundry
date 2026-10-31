/**
 * Washly - Admin Dashboard & Order Management Controller
 * Handles order inspection, weighing input, live cost calculation, and status progression
 */

document.addEventListener('DOMContentLoaded', () => {
  const page = detectAdminPage();

  switch (page) {
    case 'dashboard':
      initAdminDashboard();
      break;
    case 'orders':
      initAdminOrdersList();
      break;
    case 'order-detail':
      initAdminOrderDetail();
      break;
  }
});

function detectAdminPage() {
  const path = window.location.pathname;
  if (path.includes('order-detail.html')) return 'order-detail';
  if (path.includes('orders.html')) return 'orders';
  if (path.includes('dashboard.html')) return 'dashboard';
  return '';
}

// --------------------------------------------------------------------------
// Admin Dashboard
// --------------------------------------------------------------------------
async function initAdminDashboard() {
  const user = window.WashlyAPI.getCurrentUser();
  if (!user || user.role !== 'admin') {
    // If not logged in as admin, auto set admin session for smooth demo or alert
    const adminUser = window.WASHLY_MOCK_DATA.USERS.find(u => u.role === 'admin');
    window.WashlyAPI.setCurrentUser(adminUser);
  }

  try {
    const metrics = await window.WashlyAPI.orders.getMetrics();

    const mTotal = document.getElementById('metric-total-orders');
    const mMenunggu = document.getElementById('metric-menunggu-count');
    const mDiproses = document.getElementById('metric-diproses-count');
    const mSiap = document.getElementById('metric-siap-count');
    const mRevenue = document.getElementById('metric-revenue-today');

    if (mTotal) mTotal.textContent = metrics.total;
    if (mMenunggu) mMenunggu.textContent = metrics.menunggu;
    if (mDiproses) mDiproses.textContent = metrics.diproses;
    if (mSiap) mSiap.textContent = metrics.siap;
    if (mRevenue) mRevenue.textContent = window.WashlyApp.formatRupiah(metrics.revenueToday);

    // Load Weighing Queue (Orders waiting for handover & weighing)
    const allOrders = await window.WashlyAPI.orders.listAdminOrders();
    const weighingQueue = allOrders.filter(o => o.status === 'Menunggu Penyerahan');
    renderWeighingQueue(weighingQueue);

    // Load Recent Orders
    renderAdminRecentOrders(allOrders.slice(0, 6));
  } catch (err) {
    console.error('Error loading admin dashboard:', err);
    window.WashlyApp.showToast('Gagal memuat data metrik admin.', 'error');
  }
}

function renderWeighingQueue(orders) {
  const container = document.getElementById('weighing-queue-container');
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: var(--space-lg); background: #F8FAFC; border-radius: var(--radius-md);">
        <p class="text-sm text-secondary">Tidak ada cucian yang menunggu penimbangan saat ini. Semua pesanan telah diproses.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="grid gap-sm">
      ${orders.map(order => `
        <div class="card card-hover" style="border-left: 4px solid var(--color-warning);">
          <div class="card-body" style="padding: var(--space-md); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-sm);">
            <div>
              <div class="flex items-center gap-xs">
                <strong>${WashlyValidators.escapeHtml(order.id)}</strong>
                <span class="badge badge-status-menunggu">Perlu Ditimbang</span>
              </div>
              <div class="text-xs text-secondary mt-xs">
                Pelanggan: <strong>${WashlyValidators.escapeHtml(order.customerName)}</strong> • Layanan: ${WashlyValidators.escapeHtml(order.serviceName)}
              </div>
            </div>
            <a href="order-detail.html?id=${encodeURIComponent(order.id)}" class="btn btn-primary btn-sm">
              Timbang & Proses
            </a>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAdminRecentOrders(orders) {
  const tbody = document.getElementById('admin-recent-orders-tbody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">Belum ada pesanan masuk.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td><strong>${WashlyValidators.escapeHtml(order.id)}</strong></td>
      <td>${WashlyValidators.escapeHtml(order.customerName)}</td>
      <td>${WashlyValidators.escapeHtml(order.serviceName)}</td>
      <td>${order.actualWeight ? `${order.actualWeight} ${order.unit}` : '<span class="text-muted">Belum</span>'}</td>
      <td><strong>${window.WashlyApp.formatRupiah(order.finalCost)}</strong></td>
      <td>${window.WashlyApp.renderStatusBadge(order.status)}</td>
      <td class="text-right">
        <a href="order-detail.html?id=${encodeURIComponent(order.id)}" class="btn btn-secondary btn-sm">Kelola</a>
      </td>
    </tr>
  `).join('');
}

// --------------------------------------------------------------------------
// Admin Orders List Page
// --------------------------------------------------------------------------
async function initAdminOrdersList() {
  let currentSearch = '';
  let currentStatus = 'Semua';
  let currentService = 'Semua';

  const searchInput = document.getElementById('admin-order-search');
  const serviceSelect = document.getElementById('admin-service-filter');
  const filterTabs = document.querySelectorAll('.admin-filter-tab');

  const fetchAndRender = async () => {
    try {
      const orders = await window.WashlyAPI.orders.listAdminOrders({
        search: currentSearch,
        status: currentStatus,
        serviceId: currentService
      });

      renderAdminOrdersTable(orders);
    } catch (err) {
      window.WashlyApp.showToast('Gagal memuat pesanan.', 'error');
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim();
      fetchAndRender();
    });
  }

  if (serviceSelect) {
    serviceSelect.addEventListener('change', (e) => {
      currentService = e.target.value;
      fetchAndRender();
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentStatus = tab.dataset.status;
      fetchAndRender();
    });
  });

  fetchAndRender();
}

function renderAdminOrdersTable(orders) {
  const tbody = document.getElementById('admin-orders-tbody');
  const countEl = document.getElementById('admin-order-count');
  if (countEl) countEl.textContent = `${orders.length} Pesanan`;

  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center" style="padding: var(--space-2xl);">
          <div class="empty-state">
            <div class="empty-state-title">Pesanan Tidak Ditemukan</div>
            <div class="empty-state-text">Tidak ada data pesanan yang cocok dengan kriteria filter saat ini.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td><strong>${WashlyValidators.escapeHtml(order.id)}</strong></td>
      <td>
        <div class="font-semibold">${WashlyValidators.escapeHtml(order.customerName)}</div>
        <div class="text-xs text-muted">${WashlyValidators.escapeHtml(order.customerPhone || '-')}</div>
      </td>
      <td>${WashlyValidators.escapeHtml(order.serviceName)}</td>
      <td>${window.WashlyApp.formatDateIndo(order.createdAt, false)}</td>
      <td>
        ${order.actualWeight 
          ? `<strong style="color:var(--color-primary-navy);">${order.actualWeight} ${order.unit}</strong>` 
          : `<span class="badge badge-status-menunggu">Belum Ditimbang</span>`}
      </td>
      <td><strong>${window.WashlyApp.formatRupiah(order.finalCost)}</strong></td>
      <td>${window.WashlyApp.renderStatusBadge(order.status)}</td>
      <td class="text-right">
        <a href="order-detail.html?id=${encodeURIComponent(order.id)}" class="btn btn-navy btn-sm">
          ${order.actualWeight === null ? 'Timbang & Proses' : 'Perbarui Status'}
        </a>
      </td>
    </tr>
  `).join('');
}

// --------------------------------------------------------------------------
// Admin Order Detail & Processing Page
// --------------------------------------------------------------------------
async function initAdminOrderDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  if (!orderId) {
    window.location.href = 'orders.html';
    return;
  }

  try {
    const order = await window.WashlyAPI.orders.getById(orderId);
    renderAdminOrderDetailView(order);
  } catch (err) {
    window.WashlyApp.showToast('Pesanan tidak ditemukan.', 'error');
    setTimeout(() => {
      window.location.href = 'orders.html';
    }, 1500);
  }
}

function renderAdminOrderDetailView(order) {
  // Fill order information
  document.getElementById('admin-detail-order-id').textContent = order.id;
  document.getElementById('admin-detail-status-badge').innerHTML = window.WashlyApp.renderStatusBadge(order.status);
  document.getElementById('admin-detail-customer-name').textContent = order.customerName;
  document.getElementById('admin-detail-customer-phone').textContent = order.customerPhone || '-';
  document.getElementById('admin-detail-service').textContent = `${order.serviceName} (${window.WashlyApp.formatRupiah(order.pricePerUnit)} / ${order.unit})`;
  document.getElementById('admin-detail-scent').textContent = `${order.scent} (${order.scentPrice > 0 ? window.WashlyApp.formatRupiah(order.scentPrice) : 'Gratis'})`;
  document.getElementById('admin-detail-notes').textContent = order.notes || 'Tidak ada catatan pelanggan.';
  document.getElementById('admin-detail-created').textContent = window.WashlyApp.formatDateIndo(order.createdAt);

  // Unit labels
  const unitLabels = document.querySelectorAll('.service-unit-label');
  unitLabels.forEach(el => el.textContent = order.unit);

  // Actual Weight Input
  const weightInput = document.getElementById('admin-input-actual-weight');
  if (weightInput) {
    weightInput.value = order.actualWeight !== null ? order.actualWeight : (order.estimatedWeight || '');
  }

  // Live Cost Recalculator
  const updateAdminCostDisplay = () => {
    const enteredWeight = parseFloat(weightInput.value) || 0;
    const subtotal = Math.round(enteredWeight * order.pricePerUnit);
    const total = subtotal + (order.scentPrice || 0);

    const elSubtotal = document.getElementById('admin-calc-subtotal');
    const elTotal = document.getElementById('admin-calc-total');

    if (elSubtotal) elSubtotal.textContent = window.WashlyApp.formatRupiah(subtotal);
    if (elTotal) {
      elTotal.textContent = enteredWeight > 0 ? window.WashlyApp.formatRupiah(total) : 'Menunggu Berat';
      if (enteredWeight > 0) window.WashlyApp.highlightUpdate(elTotal);
    }
  };

  if (weightInput) {
    weightInput.addEventListener('input', updateAdminCostDisplay);
  }
  updateAdminCostDisplay();

  // Status Progression Radios based on strict business flow:
  // Menunggu Penyerahan -> Diproses -> Siap Diambil -> Diambil
  renderStatusTransitions(order);

  // Render Status Activity History
  renderAdminTimeline(order.timeline);

  // Process Form Submit
  const form = document.getElementById('admin-processing-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newWeight = weightInput ? weightInput.value.trim() : null;
      const selectedRadio = document.querySelector('input[name="admin-next-status"]:checked');
      const newStatus = selectedRadio ? selectedRadio.value : order.status;
      const adminNotes = document.getElementById('admin-processing-notes')?.value.trim();

      if (!newWeight || parseFloat(newWeight) <= 0) {
        window.WashlyApp.showToast('Masukkan berat aktual pakaian terlebih dahulu.', 'error');
        if (weightInput) weightInput.focus();
        return;
      }

      const submitBtn = document.getElementById('btn-save-admin-processing');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Menyimpan Perubahan...';

      try {
        const updatePayload = {
          actualWeight: parseFloat(newWeight),
          newStatus: newStatus,
          adminNotes: adminNotes
        };

        const result = await window.WashlyAPI.orders.updateWeightAndStatus(order.id, updatePayload);
        window.WashlyApp.showToast(`Pesanan ${order.id} berhasil diperbarui ke status: ${result.order.status}!`, 'success');

        setTimeout(() => {
          window.location.reload();
        }, 600);
      } catch (err) {
        window.WashlyApp.showToast(err.message || 'Gagal memperbarui pesanan.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Simpan & Perbarui Status';
      }
    });
  }
}

function renderStatusTransitions(order) {
  const container = document.getElementById('status-transition-options-container');
  if (!container) return;

  const currentStatus = order.status;
  const allowedNext = window.WASHLY_CONFIG.ALLOWED_TRANSITIONS[currentStatus] || [];

  const allStatuses = [
    window.WASHLY_CONFIG.STATUS.MENUNGGU,
    window.WASHLY_CONFIG.STATUS.DIPROSES,
    window.WASHLY_CONFIG.STATUS.SIAP_DIAMBIL,
    window.WASHLY_CONFIG.STATUS.DIAMBIL
  ];

  if (currentStatus === window.WASHLY_CONFIG.STATUS.DIAMBIL) {
    container.innerHTML = `
      <div class="order-notice" style="background:#DCFCE7; border-color:#86EFAC; color:#15803D;">
        <strong>Pesanan Telah Selesai (Diambil)</strong><br>
        Seluruh alur transaksi laundry untuk pesanan ini telah rampung. Pakaian telah diambil pelanggan.
      </div>
    `;
    return;
  }

  container.innerHTML = allStatuses.map(st => {
    const isCurrent = st === currentStatus;
    const isAllowed = allowedNext.includes(st);
    const isDisabled = !isCurrent && !isAllowed;
    const isChecked = isAllowed; // Pre-select the immediate next valid step

    let helperText = '';
    if (isCurrent) helperText = '(Status Saat Ini)';
    else if (isAllowed) helperText = '(Langkah Selanjutnya yang Sah)';
    else helperText = '(Belum diperbolehkan sesuai urutan SOP)';

    return `
      <label class="status-radio-option ${isDisabled ? 'disabled' : ''} ${isChecked ? 'selected' : ''}">
        <input type="radio" name="admin-next-status" value="${st}" ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
        <div>
          <strong style="color:var(--color-primary-navy);">${st}</strong>
          <span class="text-xs text-muted" style="margin-left:6px;">${helperText}</span>
        </div>
      </label>
    `;
  }).join('');

  // Add click toggle highlight
  container.querySelectorAll('.status-radio-option:not(.disabled)').forEach(opt => {
    opt.addEventListener('click', () => {
      container.querySelectorAll('.status-radio-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
}

function renderAdminTimeline(timeline) {
  const container = document.getElementById('admin-timeline-history');
  if (!container || !timeline) return;

  container.innerHTML = timeline.map((item, idx) => `
    <div class="timeline-item ${idx === timeline.length - 1 ? 'active' : 'completed'}">
      <div class="timeline-node"></div>
      <div>
        <div class="flex items-center justify-between mb-xs">
          <strong>${WashlyValidators.escapeHtml(item.status)}</strong>
          <span class="text-xs text-muted">${window.WashlyApp.formatDateIndo(item.timestamp)}</span>
        </div>
        <p class="text-xs text-secondary">${WashlyValidators.escapeHtml(item.note)}</p>
      </div>
    </div>
  `).reverse().join('');
}
