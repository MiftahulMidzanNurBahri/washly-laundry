/**
 * Washly - Centralized API Adapter & Service Layer
 * Abstracts data fetching between simulated local mock storage (Demo Mode)
 * and future PHP/MySQL backend endpoints via native Fetch API.
 */

const WashlyAPI = (() => {
  const CONFIG = window.WASHLY_CONFIG;
  const SEED = window.WASHLY_MOCK_DATA;

  // Proposed backend base URL (when PHP backend is integrated)
  const BACKEND_BASE_URL = '/backend/api';

  // State initialization
  function isDemoMode() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.DEMO_MODE);
    return stored === null ? true : stored === 'true';
  }

  function setDemoMode(enabled) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.DEMO_MODE, enabled ? 'true' : 'false');
  }

  // Local storage orders helper
  function getStoredOrders() {
    try {
      const data = localStorage.getItem(CONFIG.STORAGE_KEYS.ORDERS);
      if (!data) {
        // Seed initial orders
        localStorage.setItem(CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(SEED.ORDERS));
        return SEED.ORDERS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn('Gagal membaca storage order, memulihkan data awal:', e);
      return SEED.ORDERS;
    }
  }

  function saveStoredOrders(orders) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  // Local storage user session helper (Stores only non-sensitive profile info, NEVER passwords)
  function getCurrentUser() {
    try {
      const data = sessionStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);
      // Default to customer Budi Santoso in demo mode for instant evaluation
      const defaultUser = SEED.USERS[0];
      sessionStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
      return defaultUser;
    } catch (e) {
      return SEED.USERS[0];
    }
  }

  function setCurrentUser(user) {
    if (!user) {
      sessionStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
    } else {
      // Ensure no password field is stored in browser storage
      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        avatarText: user.avatarText || (user.name ? user.name.substring(0, 2).toUpperCase() : 'U')
      };
      sessionStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
    }
  }

  // Simulated latency for realistic UI feedback
  function simulateLatency(ms = 200) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return {
    isDemoMode,
    setDemoMode,
    getCurrentUser,
    setCurrentUser,

    // ------------------------------------------------------------------------
    // Authentication Endpoints
    // ------------------------------------------------------------------------
    auth: {
      async login(credentials) {
        const { email, password, role } = credentials;

        if (isDemoMode()) {
          await simulateLatency(250);
          // Match against seed users
          const user = SEED.USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (!user) {
            // In demo mode, if unregistered email, create mock session if role matches
            const demoUser = {
              id: 'usr-' + Date.now().toString(36),
              name: email.split('@')[0],
              email: email,
              phone: '0812-0000-0000',
              address: 'Alamat Pengguna',
              role: role || 'customer',
              avatarText: email.substring(0, 2).toUpperCase()
            };
            setCurrentUser(demoUser);
            return { success: true, user: demoUser, isDemo: true };
          }

          // Check role alignment
          if (role && user.role !== role) {
            throw new Error(`Akun ini terdaftar sebagai ${user.role}, bukan ${role}.`);
          }

          setCurrentUser(user);
          return { success: true, user, isDemo: true };
        } else {
          // Future PHP Endpoint: POST /backend/api/auth/login.php
          try {
            const res = await fetch(`${BACKEND_BASE_URL}/auth/login.php`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, role })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login gagal.');
            setCurrentUser(data.user);
            return { success: true, user: data.user, isDemo: false };
          } catch (err) {
            console.error('API Error, falling back to demo mode:', err);
            throw new Error(`Koneksi Backend PHP gagal: ${err.message}. Pastikan server PHP aktif.`);
          }
        }
      },

      async register(payload) {
        if (isDemoMode()) {
          await simulateLatency(300);
          const newUser = {
            id: 'usr-' + Date.now().toString(36),
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            address: payload.address || '',
            role: 'customer',
            avatarText: payload.name.substring(0, 2).toUpperCase(),
            registeredAt: new Date().toISOString()
          };
          setCurrentUser(newUser);
          return { success: true, user: newUser, isDemo: true };
        } else {
          // Future PHP Endpoint: POST /backend/api/auth/register.php
          const res = await fetch(`${BACKEND_BASE_URL}/auth/register.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Registrasi gagal.');
          setCurrentUser(data.user);
          return { success: true, user: data.user, isDemo: false };
        }
      },

      logout() {
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
        return { success: true };
      }
    },

    // ------------------------------------------------------------------------
    // Services Catalog
    // ------------------------------------------------------------------------
    services: {
      async list() {
        if (isDemoMode()) {
          return CONFIG.SERVICES;
        }
        // Future PHP Endpoint: GET /backend/api/services/list.php
        const res = await fetch(`${BACKEND_BASE_URL}/services/list.php`);
        if (!res.ok) throw new Error('Gagal memuat katalog layanan');
        return await res.json();
      },

      getById(serviceId) {
        return CONFIG.SERVICES.find(s => s.id === serviceId) || CONFIG.SERVICES[0];
      }
    },

    // ------------------------------------------------------------------------
    // Orders Endpoints
    // ------------------------------------------------------------------------
    orders: {
      async listCustomerOrders(customerId) {
        if (isDemoMode()) {
          await simulateLatency(150);
          const orders = getStoredOrders();
          if (!customerId) return orders;
          return orders.filter(o => o.customerId === customerId);
        }
        // Future PHP Endpoint: GET /backend/api/orders/customer.php?customer_id=...
        const res = await fetch(`${BACKEND_BASE_URL}/orders/customer.php?customer_id=${encodeURIComponent(customerId)}`);
        if (!res.ok) throw new Error('Gagal memuat daftar pesanan pelanggan');
        return await res.json();
      },

      async listAdminOrders(filters = {}) {
        if (isDemoMode()) {
          await simulateLatency(150);
          let orders = [...getStoredOrders()];

          if (filters.search) {
            const q = filters.search.toLowerCase().trim();
            orders = orders.filter(o => 
              o.id.toLowerCase().includes(q) ||
              o.customerName.toLowerCase().includes(q) ||
              (o.customerPhone && o.customerPhone.includes(q))
            );
          }

          if (filters.status && filters.status !== 'Semua') {
            orders = orders.filter(o => o.status === filters.status);
          }

          if (filters.serviceId && filters.serviceId !== 'Semua') {
            orders = orders.filter(o => o.serviceId === filters.serviceId);
          }

          // Sort latest first
          orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          return orders;
        }

        // Future PHP Endpoint: GET /backend/api/orders/admin.php?...
        const params = new URLSearchParams(filters);
        const res = await fetch(`${BACKEND_BASE_URL}/orders/admin.php?${params.toString()}`);
        if (!res.ok) throw new Error('Gagal memuat daftar pesanan admin');
        return await res.json();
      },

      async getById(orderId) {
        if (isDemoMode()) {
          await simulateLatency(100);
          const orders = getStoredOrders();
          const found = orders.find(o => o.id === orderId);
          if (!found) throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan.`);
          return found;
        }

        // Future PHP Endpoint: GET /backend/api/orders/detail.php?id=...
        const res = await fetch(`${BACKEND_BASE_URL}/orders/detail.php?id=${encodeURIComponent(orderId)}`);
        if (!res.ok) throw new Error('Pesanan tidak ditemukan di backend');
        return await res.json();
      },

      async create(payload) {
        if (isDemoMode()) {
          await simulateLatency(300);
          const orders = getStoredOrders();
          const service = CONFIG.SERVICES.find(s => s.id === payload.serviceId) || CONFIG.SERVICES[0];
          const scentObj = CONFIG.SCENTS.find(sc => sc.name === payload.scent) || CONFIG.SCENTS[0];

          const newId = 'WSH-' + new Date().toISOString().slice(0,7).replace('-','') + '-' + 
                        String(orders.length + 1).padStart(3, '0');

          const nowIso = new Date().toISOString();

          const newOrder = {
            id: newId,
            customerId: payload.customerId,
            customerName: payload.customerName,
            customerPhone: payload.customerPhone,
            serviceId: service.id,
            serviceName: service.name,
            unit: service.unit,
            pricePerUnit: service.price,
            scent: payload.scent || 'Ocean Fresh',
            scentPrice: scentObj.price || 0,
            estimatedWeight: Number(payload.estimatedWeight) || 1.0,
            actualWeight: null, // Initial status: must wait for admin reception & weighing
            finalCost: null,    // Only computed once admin records actual weight
            notes: payload.notes || '',
            handoverMethod: payload.handoverMethod || 'antar-sendiri',
            status: CONFIG.STATUS.MENUNGGU,
            createdAt: nowIso,
            timeline: [
              {
                status: CONFIG.STATUS.MENUNGGU,
                timestamp: nowIso,
                note: 'Pesanan baru telah berhasil dibuat oleh pelanggan.'
              }
            ]
          };

          orders.unshift(newOrder);
          saveStoredOrders(orders);
          return { success: true, order: newOrder, isDemo: true };
        }

        // Future PHP Endpoint: POST /backend/api/orders/create.php
        const res = await fetch(`${BACKEND_BASE_URL}/orders/create.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal membuat pesanan');
        return { success: true, order: data.order, isDemo: false };
      },

      async updateWeightAndStatus(orderId, updatePayload) {
        if (isDemoMode()) {
          await simulateLatency(250);
          const orders = getStoredOrders();
          const index = orders.findIndex(o => o.id === orderId);
          if (index === -1) throw new Error('Pesanan tidak ditemukan');

          const order = orders[index];
          const { actualWeight, newStatus, adminNotes } = updatePayload;

          // Validate status sequence
          if (newStatus && newStatus !== order.status) {
            const allowed = CONFIG.ALLOWED_TRANSITIONS[order.status] || [];
            if (!allowed.includes(newStatus)) {
              throw new Error(`Transisi status dari '${order.status}' ke '${newStatus}' tidak diperbolehkan sesuai SOP Washly.`);
            }
          }

          // Update actual weight if provided
          if (actualWeight !== undefined && actualWeight !== null && actualWeight !== '') {
            const parsedWeight = parseFloat(actualWeight);
            if (isNaN(parsedWeight) || parsedWeight <= 0) {
              throw new Error('Berat aktual pakaian harus berupa angka positif.');
            }
            order.actualWeight = parsedWeight;
            // Compute final cost: (actualWeight * pricePerUnit) + scentPrice
            order.finalCost = Math.round(order.actualWeight * order.pricePerUnit) + (order.scentPrice || 0);
          }

          // Update status if provided
          const prevStatus = order.status;
          if (newStatus && newStatus !== prevStatus) {
            order.status = newStatus;
            order.timeline.push({
              status: newStatus,
              timestamp: new Date().toISOString(),
              note: adminNotes || `Status diperbarui menjadi ${newStatus} oleh Admin.`
            });
          } else if (adminNotes) {
            // Append note to current status
            order.timeline.push({
              status: order.status,
              timestamp: new Date().toISOString(),
              note: `Catatan admin: ${adminNotes}`
            });
          }

          orders[index] = order;
          saveStoredOrders(orders);
          return { success: true, order, isDemo: true };
        }

        // Future PHP Endpoint: POST /backend/api/orders/update-status.php
        const res = await fetch(`${BACKEND_BASE_URL}/orders/update-status.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, ...updatePayload })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal memperbarui status pesanan');
        return { success: true, order: data.order, isDemo: false };
      },

      async getMetrics() {
        if (isDemoMode()) {
          const orders = getStoredOrders();
          const menunggu = orders.filter(o => o.status === CONFIG.STATUS.MENUNGGU).length;
          const diproses = orders.filter(o => o.status === CONFIG.STATUS.DIPROSES).length;
          const siap = orders.filter(o => o.status === CONFIG.STATUS.SIAP_DIAMBIL).length;
          const diambil = orders.filter(o => o.status === CONFIG.STATUS.DIAMBIL).length;

          // Today's total revenue from completed/in-progress orders with final cost
          const revenueToday = orders
            .filter(o => o.finalCost && o.status !== CONFIG.STATUS.MENUNGGU)
            .reduce((sum, o) => sum + (o.finalCost || 0), 0);

          return {
            total: orders.length,
            menunggu,
            diproses,
            siap,
            diambil,
            revenueToday
          };
        }

        // Future PHP Endpoint: GET /backend/api/orders/metrics.php
        const res = await fetch(`${BACKEND_BASE_URL}/orders/metrics.php`);
        if (!res.ok) throw new Error('Gagal memuat metrik');
        return await res.json();
      },

      // Reset mock data to original factory seed
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
