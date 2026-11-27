/**
 * Washly - API Adapter (Demo Mode + PHP/MySQL)
 * Replace the repository's current js/api.js with this file when integrating
 * the PHP backend. All PHP responses use { success, message, data } envelopes.
 */

const WashlyAPI = (() => {
  const CONFIG = window.WASHLY_CONFIG;
  const SEED = window.WASHLY_MOCK_DATA;
  // XAMPP project at C:/xampp/htdocs/washly-laundry -> /washly-laundry/backend/api
  // Change this value if your project folder / URL is different.
  const BACKEND_BASE_URL = window.WASHLY_API_BASE_URL || '/washly-laundry/backend/api';

  function isDemoMode() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.DEMO_MODE);
    return stored === null ? true : stored === 'true';
  }

  function setDemoMode(enabled) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.DEMO_MODE, enabled ? 'true' : 'false');
    if (!enabled) {
      // Remove demo identity; a real login will repopulate this session profile.
      sessionStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
    }
  }

  async function request(endpoint, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body !== undefined && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${BACKEND_BASE_URL}/${endpoint}`, {
      ...options,
      headers,
      credentials: 'same-origin'
    });

    let body;
    try {
      body = await response.json();
    } catch (_error) {
      throw new Error('Server tidak mengirim respons JSON yang valid. Periksa URL dan konfigurasi PHP.');
    }

    if (!response.ok || body.success === false) {
      throw new Error(body.message || `Request gagal (HTTP ${response.status}).`);
    }
    return body.data;
  }

  function getStoredOrders() {
    try {
      const data = localStorage.getItem(CONFIG.STORAGE_KEYS.ORDERS);
      if (!data) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(SEED.ORDERS));
        return [...SEED.ORDERS];
      }
      return JSON.parse(data);
    } catch (error) {
      console.warn('Gagal membaca data demo:', error);
      return [...SEED.ORDERS];
    }
  }

  function saveStoredOrders(orders) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  function getCurrentUser() {
    try {
      const stored = sessionStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
      if (stored) return JSON.parse(stored);
      if (!isDemoMode()) return null;
      const demoUser = SEED.USERS[0];
      setCurrentUser(demoUser);
      return demoUser;
    } catch (_error) {
      return isDemoMode() ? SEED.USERS[0] : null;
    }
  }

  function setCurrentUser(user) {
    if (!user) {
      sessionStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
      return;
    }
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address || '',
      role: user.role,
      avatarText: user.avatarText || (user.name ? user.name.substring(0, 2).toUpperCase() : 'U')
    };
    sessionStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
  }

  function simulateLatency(ms = 150) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function demoOrderById(orderId) {
    const order = getStoredOrders().find(item => item.id === orderId);
    if (!order) throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan.`);
    return order;
  }

  return {
    isDemoMode,
    setDemoMode,
    getCurrentUser,
    setCurrentUser,

    auth: {
      async login(credentials) {
        const { email, password, role } = credentials;
        if (isDemoMode()) {
          await simulateLatency(200);
          const user = SEED.USERS.find(item => item.email.toLowerCase() === email.toLowerCase());
          if (!user) throw new Error('Akun demo tidak ditemukan. Gunakan tombol akun demo atau daftar di mode backend.');
          if (role && user.role !== role) throw new Error(`Akun ini terdaftar sebagai ${user.role}, bukan ${role}.`);
          setCurrentUser(user);
          return { success: true, user, isDemo: true };
        }

        const data = await request('auth/login.php', {
          method: 'POST',
          body: JSON.stringify({ email, password, role })
        });
        setCurrentUser(data.user);
        return { success: true, user: data.user, isDemo: false };
      },

      async register(payload) {
        if (isDemoMode()) {
          await simulateLatency(200);
          const user = {
            id: 'usr-' + Date.now().toString(36),
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            address: payload.address || '',
            role: 'customer',
            avatarText: payload.name.substring(0, 2).toUpperCase()
          };
          setCurrentUser(user);
          return { success: true, user, isDemo: true };
        }

        const data = await request('auth/register.php', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setCurrentUser(data.user);
        return { success: true, user: data.user, isDemo: false };
      },

      async logout() {
        try {
          if (!isDemoMode()) {
            await request('auth/logout.php', { method: 'POST' });
          }
        } finally {
          setCurrentUser(null);
        }
        return { success: true };
      },

      async me() {
        const data = await request('auth/me.php');
        setCurrentUser(data.user);
        return data.user;
      }
    },

    services: {
      async list() {
        if (isDemoMode()) return CONFIG.SERVICES;
        return await request('services/list.php');
      },
      getById(serviceId) {
        return CONFIG.SERVICES.find(item => item.id === serviceId) || CONFIG.SERVICES[0];
      }
    },

    orders: {
      async listCustomerOrders(customerId) {
        if (isDemoMode()) {
          await simulateLatency();
          const orders = getStoredOrders();
          return customerId ? orders.filter(order => order.customerId === customerId) : orders;
        }
        const query = customerId ? `?customer_id=${encodeURIComponent(customerId)}` : '';
        return await request(`orders/customer.php${query}`);
      },

      async listAdminOrders(filters = {}) {
        if (isDemoMode()) {
          await simulateLatency();
          let orders = [...getStoredOrders()];
          if (filters.search) {
            const query = filters.search.toLowerCase().trim();
            orders = orders.filter(order =>
              order.id.toLowerCase().includes(query) ||
              order.customerName.toLowerCase().includes(query) ||
              (order.customerPhone && order.customerPhone.includes(query))
            );
          }
          if (filters.status && filters.status !== 'Semua') {
            orders = orders.filter(order => order.status === filters.status);
          }
          if (filters.serviceId && filters.serviceId !== 'Semua') {
            orders = orders.filter(order => order.serviceId === filters.serviceId);
          }
          return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        const params = new URLSearchParams(filters);
        const query = params.toString() ? `?${params.toString()}` : '';
        return await request(`orders/admin.php${query}`);
      },

      async getById(orderId) {
        if (isDemoMode()) {
          await simulateLatency(100);
          return demoOrderById(orderId);
        }
        return await request(`orders/detail.php?id=${encodeURIComponent(orderId)}`);
      },

      async create(payload) {
        if (isDemoMode()) {
          await simulateLatency(200);
          const orders = getStoredOrders();
          const service = CONFIG.SERVICES.find(item => item.id === payload.serviceId) || CONFIG.SERVICES[0];
          const scent = CONFIG.SCENTS.find(item => item.name === payload.scent) || CONFIG.SCENTS[0];
          const newId = 'WSH-' + new Date().toISOString().slice(0, 7).replace('-', '') + '-' +
            String(orders.length + 1).padStart(3, '0');
          const now = new Date().toISOString();
          const order = {
            id: newId,
            customerId: payload.customerId,
            customerName: payload.customerName,
            customerPhone: payload.customerPhone,
            serviceId: service.id,
            serviceName: service.name,
            unit: service.unit,
            pricePerUnit: service.price,
            scent: payload.scent || 'Ocean Fresh',
            scentPrice: scent.price || 0,
            estimatedWeight: Number(payload.estimatedWeight) || 1,
            actualWeight: null,
            finalCost: null,
            notes: payload.notes || '',
            handoverMethod: payload.handoverMethod || 'antar-sendiri',
            status: CONFIG.STATUS.MENUNGGU,
            createdAt: now,
            timeline: [{ status: CONFIG.STATUS.MENUNGGU, timestamp: now, note: 'Pesanan dibuat oleh pelanggan.' }]
          };
          orders.unshift(order);
          saveStoredOrders(orders);
          return { success: true, order, isDemo: true };
        }

        const data = await request('orders/create.php', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        return { success: true, order: data.order || data, isDemo: false };
      },

      async updateWeightAndStatus(orderId, updatePayload) {
        if (isDemoMode()) {
          await simulateLatency(200);
          const orders = getStoredOrders();
          const index = orders.findIndex(item => item.id === orderId);
          if (index < 0) throw new Error('Pesanan tidak ditemukan.');
          const order = orders[index];
          const { actualWeight, newStatus, adminNotes } = updatePayload;
          if (newStatus && newStatus !== order.status) {
            const allowed = CONFIG.ALLOWED_TRANSITIONS[order.status] || [];
            if (!allowed.includes(newStatus)) throw new Error('Transisi status tidak diperbolehkan sesuai SOP Washly.');
          }
          if (actualWeight !== undefined && actualWeight !== null && actualWeight !== '') {
            const weight = Number(actualWeight);
            if (!Number.isFinite(weight) || weight <= 0) throw new Error('Berat aktual harus berupa angka positif.');
            order.actualWeight = weight;
            order.finalCost = Math.round(weight * order.pricePerUnit) + (order.scentPrice || 0);
          }
          if (newStatus && newStatus !== order.status) {
            order.status = newStatus;
            order.timeline.push({ status: newStatus, timestamp: new Date().toISOString(), note: adminNotes || `Status diperbarui menjadi ${newStatus} oleh Admin.` });
          } else if (adminNotes) {
            order.timeline.push({ status: order.status, timestamp: new Date().toISOString(), note: `Catatan admin: ${adminNotes}` });
          }
          saveStoredOrders(orders);
          return { success: true, order, isDemo: true };
        }

        const data = await request('orders/update-status.php', {
          method: 'POST',
          body: JSON.stringify({ orderId, ...updatePayload })
        });
        return { success: true, order: data.order || data, isDemo: false };
      },

      async delete(orderId) {
        if (isDemoMode()) {
          const orders = getStoredOrders();
          const order = orders.find(item => item.id === orderId);
          if (!order) throw new Error('Pesanan tidak ditemukan.');
          if (order.status !== CONFIG.STATUS.MENUNGGU) {
            throw new Error('Hanya pesanan yang belum diproses yang boleh dihapus.');
          }
          saveStoredOrders(orders.filter(item => item.id !== orderId));
          return { success: true, id: orderId, deleted: true, isDemo: true };
        }
        const data = await request(`orders/delete.php?id=${encodeURIComponent(orderId)}`, { method: 'DELETE' });
        return { success: true, ...data, isDemo: false };
      },

      async getMetrics() {
        if (isDemoMode()) {
          const orders = getStoredOrders();
          const count = status => orders.filter(order => order.status === status).length;
          const revenueToday = orders
            .filter(order => order.finalCost && order.status !== CONFIG.STATUS.MENUNGGU)
            .reduce((sum, order) => sum + order.finalCost, 0);
          return {
            total: orders.length,
            menunggu: count(CONFIG.STATUS.MENUNGGU),
            diproses: count(CONFIG.STATUS.DIPROSES),
            siap: count(CONFIG.STATUS.SIAP_DIAMBIL),
            diambil: count(CONFIG.STATUS.DIAMBIL),
            revenueToday
          };
        }
        return await request('orders/metrics.php');
      },

      resetMockData() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(SEED.ORDERS));
        return true;
      }
    }
  };
})();

if (typeof window !== 'undefined') {
  window.WashlyAPI = WashlyAPI;
}
