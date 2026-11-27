/**
 * Washly - Centralized API Adapter & Service Layer
 * Abstracts data fetching between simulated local mock storage (Demo Mode)
 * and future PHP/MySQL backend endpoints via native Fetch API.
 */

const WashlyAPI = (() => {
  const CONFIG = window.WASHLY_CONFIG;
  const SEED = window.WASHLY_MOCK_DATA;

  // Resolve backend base URL dynamically so subfolders in XAMPP/Laragon (e.g. /washly-laundry/) work without 404
  function getBackendBaseUrl() {
    if (CONFIG.BACKEND && CONFIG.BACKEND.API_BASE_URL) {
      return CONFIG.BACKEND.API_BASE_URL.replace(/\/+$/, '');
    }
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const isSubdir = /\/(customer|admin)\//.test(path);
    return isSubdir ? '../backend/api' : './backend/api';
  }

  // State initialization
  function isDemoMode() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.DEMO_MODE);
    if (stored !== null) {
      return stored === 'true';
    }
    return CONFIG.BACKEND ? CONFIG.BACKEND.DEFAULT_DEMO_MODE !== false : true;
  }

  function setDemoMode(enabled) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.DEMO_MODE, enabled ? 'true' : 'false');
  }

  // Auth token helper (optional JWT / session token support alongside PHP session cookies)
  function getAuthToken() {
    try {
      return sessionStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN) || null;
    } catch (e) {
      return null;
    }
  }

  function setAuthToken(token) {
    try {
      if (!token) {
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      } else {
        sessionStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, String(token));
      }
    } catch (e) {}
  }

  // Data normalizers (accept both camelCase from API_CONTRACT.md and snake_case from MySQL rows)
  function normalizeUser(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const name = String(raw.name || raw.full_name || 'Pengguna').trim();
    const avatar = raw.avatarText || raw.avatar_text || (name ? name.substring(0, 2).toUpperCase() : 'U');
    return {
      id: String(raw.id ?? raw.user_id ?? ''),
      name: name,
      email: String(raw.email ?? ''),
      phone: String(raw.phone ?? raw.phone_number ?? ''),
      address: String(raw.address ?? ''),
      role: raw.role === 'admin' ? 'admin' : 'customer',
      avatarText: avatar
    };
  }

  function normalizeService(raw) {
    if (!raw || typeof raw !== 'object') return raw;
    return {
      id: String(raw.id ?? raw.service_id ?? ''),
      name: String(raw.name ?? raw.service_name ?? ''),
      unit: String(raw.unit ?? 'kg'),
      price: Number(raw.price ?? raw.price_per_unit ?? 0),
      duration: String(raw.duration ?? '-'),
      description: String(raw.description ?? ''),
      icon: raw.icon || 'washer',
      popular: Boolean(raw.popular)
    };
  }

  function normalizeOrder(raw) {
    if (!raw || typeof raw !== 'object') return raw;
    const serviceId = String(raw.serviceId ?? raw.service_id ?? '');
    const fallbackSvc = CONFIG.SERVICES.find(s => s.id === serviceId);
    const rawActual = raw.actualWeight !== undefined ? raw.actualWeight : raw.actual_weight;
    const rawFinal = raw.finalCost !== undefined ? raw.finalCost : raw.final_cost;

    return {
      ...raw,
      id: String(raw.id ?? raw.order_id ?? raw.order_code ?? ''),
      customerId: String(raw.customerId ?? raw.customer_id ?? ''),
      customerName: String(raw.customerName ?? raw.customer_name ?? '-'),
      customerPhone: String(raw.customerPhone ?? raw.customer_phone ?? ''),
      serviceId: serviceId,
      serviceName: String(raw.serviceName ?? raw.service_name ?? (fallbackSvc ? fallbackSvc.name : '-')),
      unit: String(raw.unit ?? (fallbackSvc ? fallbackSvc.unit : 'kg')),
      pricePerUnit: Number(raw.pricePerUnit ?? raw.price_per_unit ?? (fallbackSvc ? fallbackSvc.price : 0)),
      scent: CONFIG.DEFAULT_SCENT || 'Mengikuti Parfum Laundry',
      scentPrice: 0,
      estimatedWeight: null,
      actualWeight: (rawActual === null || rawActual === undefined || rawActual === '') ? null : Number(rawActual),
      finalCost: (rawFinal === null || rawFinal === undefined || rawFinal === '') ? null : Number(rawFinal),
      notes: String(raw.notes ?? ''),
      handoverMethod: 'jemput-kurir',
      status: String(raw.status ?? CONFIG.STATUS.MENUNGGU),
      createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
      timeline: Array.isArray(raw.timeline)
        ? raw.timeline.map(item => ({
            status: String(item.status ?? ''),
            timestamp: String(item.timestamp ?? item.created_at ?? ''),
            note: String(item.note ?? item.notes ?? '')
          }))
        : []
    };
  }

  function normalizeMetrics(raw) {
    if (!raw || typeof raw !== 'object') {
      return { total: 0, menunggu: 0, diproses: 0, siap: 0, diambil: 0, revenueToday: 0 };
    }
    return {
      total: Number(raw.total ?? raw.total_orders ?? 0),
      menunggu: Number(raw.menunggu ?? raw.menunggu_penyerahan ?? 0),
      diproses: Number(raw.diproses ?? 0),
      siap: Number(raw.siap ?? raw.siap_diambil ?? 0),
      diambil: Number(raw.diambil ?? 0),
      revenueToday: Number(raw.revenueToday ?? raw.revenue_today ?? 0)
    };
  }

  // Centralized HTTP Fetch helper for PHP/MySQL REST API
  async function apiRequest(endpoint, options = {}) {
    const url = `${getBackendBaseUrl()}${endpoint}`;
    const headers = {
      'Accept': 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    };

    const token = getAuthToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let res;
    try {
      res = await fetch(url, {
        ...options,
        headers,
        credentials: options.credentials || 'include' // Ensures PHP $_SESSION cookies are sent
      });
    } catch (networkErr) {
      throw new Error('Tidak dapat terhubung ke server Backend PHP. Pastikan Apache & MySQL (XAMPP/Laragon) sedang aktif.');
    }

    const rawText = await res.text();
    let json = null;
    if (rawText) {
      try {
        json = JSON.parse(rawText);
      } catch (parseErr) {
        throw new Error(`Respons server PHP bukan JSON yang valid (HTTP ${res.status}). Periksa error pada file ${endpoint}.`);
      }
    }

    if (!res.ok || (json && json.success === false)) {
      if (res.status === 401 && !endpoint.includes('/auth/login.php')) {
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
        setAuthToken(null);
      }
      const message = (json && json.message) ? json.message : `Permintaan ke server gagal (HTTP ${res.status}).`;
      throw new Error(message);
    }

    // Unwrap standard API_CONTRACT.md envelope { success, message, data } or return raw JSON
    return (json && json.data !== undefined) ? json.data : json;
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

  // Local storage users helper (for standalone local auth when MySQL backend is off)
  function buildSeedUsers() {
    return (SEED.USERS || []).map(u => ({
      ...u,
      password: u.password || (u.role === 'admin' ? 'admin123' : 'password123')
    }));
  }

  function getStoredUsers() {
    const key = CONFIG.STORAGE_KEYS.USERS || 'washly_users_store_v1';
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        const initialUsers = buildSeedUsers();
        localStorage.setItem(key, JSON.stringify(initialUsers));
        return initialUsers;
      }
      return JSON.parse(data);
    } catch (e) {
      return buildSeedUsers();
    }
  }

  function saveStoredUsers(users) {
    const key = CONFIG.STORAGE_KEYS.USERS || 'washly_users_store_v1';
    localStorage.setItem(key, JSON.stringify(users));
  }

  // Local storage user session helper (Stores only non-sensitive profile info, NEVER passwords)
  function getCurrentUser() {
    try {
      const data = sessionStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (!user) {
      sessionStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
    } else {
      const safeUser = normalizeUser(user);
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
    getBackendBaseUrl,
    getCurrentUser,
    setCurrentUser,
    getAuthToken,
    setAuthToken,

    // ------------------------------------------------------------------------
    // Authentication Endpoints
    // ------------------------------------------------------------------------
    auth: {
      async login(credentials) {
        const { email, password } = credentials;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (isDemoMode()) {
          await simulateLatency(250);
          const users = getStoredUsers();
          const matched = users.find(u => String(u.email || '').toLowerCase() === normalizedEmail);
          if (!matched || matched.password !== password) {
            throw new Error('Email atau kata sandi tidak cocok.');
          }

          const cleanUser = normalizeUser(matched);
          setCurrentUser(cleanUser);
          return { success: true, user: cleanUser, isDemo: true };
        } else {
          // PHP Endpoint: POST /backend/api/auth/login.php
          const payload = await apiRequest('/auth/login.php', {
            method: 'POST',
            body: JSON.stringify({ email: normalizedEmail, password })
          });

          if (payload && payload.token) {
            setAuthToken(payload.token);
          }

          const rawUser = (payload && payload.user) ? payload.user : payload;
          const user = normalizeUser(rawUser);
          if (!user || !user.email) {
            throw new Error('Data pengguna dari server tidak lengkap.');
          }

          setCurrentUser(user);
          return { success: true, user, isDemo: false };
        }
      },

      async register(payload) {
        const normalizedEmail = String(payload.email || '').trim().toLowerCase();

        if (isDemoMode()) {
          await simulateLatency(300);
          const users = getStoredUsers();
          const exists = users.some(u => String(u.email || '').toLowerCase() === normalizedEmail);
          if (exists) {
            throw new Error('Email sudah terdaftar. Silakan masuk ke akun Anda.');
          }

          const newUserRecord = {
            id: 'usr-' + Date.now().toString(36),
            name: payload.name,
            email: normalizedEmail,
            phone: payload.phone,
            address: payload.address || '',
            password: payload.password,
            role: 'customer',
            avatarText: payload.name.substring(0, 2).toUpperCase(),
            registeredAt: new Date().toISOString()
          };
          users.push(newUserRecord);
          saveStoredUsers(users);

          const cleanUser = normalizeUser(newUserRecord);
          setCurrentUser(cleanUser);
          return { success: true, user: cleanUser, isDemo: true };
        } else {
          // PHP Endpoint: POST /backend/api/auth/register.php
          const resData = await apiRequest('/auth/register.php', {
            method: 'POST',
            body: JSON.stringify(payload)
          });

          if (resData && resData.token) {
            setAuthToken(resData.token);
          }

          const rawUser = (resData && resData.user) ? resData.user : {
            ...payload,
            ...(resData || {}),
            role: 'customer'
          };
          const user = normalizeUser(rawUser);
          setCurrentUser(user);
          return { success: true, user, isDemo: false };
        }
      },

      async logout() {
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
        setAuthToken(null);

        if (!isDemoMode()) {
          // Optional PHP Endpoint: POST /backend/api/auth/logout.php (destroy PHP session)
          try {
            await fetch(`${getBackendBaseUrl()}/auth/logout.php`, {
              method: 'POST',
              credentials: 'include'
            });
          } catch (e) {
            // Safe to ignore if logout.php is not implemented yet
          }
        }
        return { success: true };
      }
    },

    // ------------------------------------------------------------------------
    // Users / Customer Profile Endpoints
    // ------------------------------------------------------------------------
    users: {
      async updateProfile(payload) {
        const current = getCurrentUser() || {};

        if (isDemoMode()) {
          await simulateLatency(200);
          const updatedUser = normalizeUser({
            ...current,
            name: payload.name,
            phone: payload.phone,
            address: payload.address
          });
          const users = getStoredUsers();
          const idx = users.findIndex(u => u.id === current.id || String(u.email || '').toLowerCase() === String(current.email || '').toLowerCase());
          if (idx !== -1) {
            users[idx] = { ...users[idx], name: updatedUser.name, phone: updatedUser.phone, address: updatedUser.address, avatarText: updatedUser.avatarText };
            saveStoredUsers(users);
          }
          setCurrentUser(updatedUser);
          return { success: true, user: updatedUser, isDemo: true };
        }

        // PHP Endpoint: POST /backend/api/users/update-profile.php
        const resData = await apiRequest('/users/update-profile.php', {
          method: 'POST',
          body: JSON.stringify({
            id: payload.id || current.id,
            name: payload.name,
            phone: payload.phone,
            address: payload.address
          })
        });

        const rawUser = (resData && resData.user) ? resData.user : {
          ...current,
          ...payload,
          ...(resData || {})
        };
        const updatedUser = normalizeUser(rawUser);
        setCurrentUser(updatedUser);
        return { success: true, user: updatedUser, isDemo: false };
      }
    },

    // ------------------------------------------------------------------------
    // Services Catalog
    // ------------------------------------------------------------------------
    services: {
      async list() {
        if (isDemoMode()) {
          return CONFIG.SERVICES.filter(s => s.id !== 'sepatu-tas');
        }
        // PHP Endpoint: GET /backend/api/services/list.php
        const resData = await apiRequest('/services/list.php');
        const list = Array.isArray(resData) ? resData : (resData && Array.isArray(resData.services) ? resData.services : null);
        const normalized = list ? list.map(normalizeService) : CONFIG.SERVICES;
        return normalized.filter(s => s.id !== 'sepatu-tas');
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
        // PHP Endpoint: GET /backend/api/orders/customer.php?customer_id=...
        const query = customerId ? `?customer_id=${encodeURIComponent(customerId)}` : '';
        const resData = await apiRequest(`/orders/customer.php${query}`);
        const list = Array.isArray(resData) ? resData : (resData && Array.isArray(resData.orders) ? resData.orders : []);
        return list.map(normalizeOrder);
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

        // PHP Endpoint: GET /backend/api/orders/admin.php?search=...&status=...&serviceId=...
        const cleanParams = new URLSearchParams();
        if (filters.search && filters.search.trim()) {
          cleanParams.set('search', filters.search.trim());
        }
        if (filters.status && filters.status !== 'Semua') {
          cleanParams.set('status', filters.status);
        }
        if (filters.serviceId && filters.serviceId !== 'Semua') {
          cleanParams.set('serviceId', filters.serviceId);
        }

        const qs = cleanParams.toString();
        const resData = await apiRequest(`/orders/admin.php${qs ? `?${qs}` : ''}`);
        const list = Array.isArray(resData) ? resData : (resData && Array.isArray(resData.orders) ? resData.orders : []);
        return list.map(normalizeOrder);
      },

      async getById(orderId) {
        if (isDemoMode()) {
          await simulateLatency(100);
          const orders = getStoredOrders();
          const found = orders.find(o => o.id === orderId);
          if (!found) throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan.`);
          return found;
        }

        // PHP Endpoint: GET /backend/api/orders/detail.php?id=...
        const resData = await apiRequest(`/orders/detail.php?id=${encodeURIComponent(orderId)}`);
        const rawOrder = (resData && resData.order) ? resData.order : resData;
        if (!rawOrder || (!rawOrder.id && !rawOrder.order_id && !rawOrder.order_code)) {
          throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan.`);
        }
        return normalizeOrder(rawOrder);
      },

      async create(payload) {
        if (isDemoMode()) {
          await simulateLatency(300);
          const orders = getStoredOrders();
          const service = CONFIG.SERVICES.find(s => s.id === payload.serviceId) || CONFIG.SERVICES[0];

          const newId = 'WSH-' + new Date().toISOString().slice(0,7).replace('-','') + '-' + 
                        String(orders.length + 1).padStart(3, '0');

          const nowIso = new Date().toISOString();

          const newOrder = {
            id: newId,
            customerId: payload.customerId,
            customerName: payload.customerName,
            customerPhone: payload.customerPhone,
            customerAddress: payload.customerAddress || '',
            serviceId: service.id,
            serviceName: service.name,
            unit: service.unit,
            pricePerUnit: service.price,
            scent: CONFIG.DEFAULT_SCENT || 'Mengikuti Parfum Laundry',
            scentPrice: 0,
            estimatedWeight: null,
            actualWeight: null, // Weighed by laundry staff upon pickup reception
            finalCost: null,    // Computed once laundry records actual weight
            notes: payload.notes || '',
            handoverMethod: 'jemput-kurir',
            status: CONFIG.STATUS.MENUNGGU,
            createdAt: nowIso,
            timeline: [
              {
                status: CONFIG.STATUS.MENUNGGU,
                timestamp: nowIso,
                note: 'Pesanan baru berhasil dibuat. Menunggu penjemputan kurir Washly.'
              }
            ]
          };

          orders.unshift(newOrder);
          saveStoredOrders(orders);
          return { success: true, order: newOrder, isDemo: true };
        }

        // PHP Endpoint: POST /backend/api/orders/create.php
        // Includes default scent & placeholder estimatedWeight=1 for compatibility with backend DB schema
        const backendPayload = {
          ...payload,
          handoverMethod: 'jemput-kurir',
          scent: 'Ocean Fresh',
          estimatedWeight: 1
        };
        const resData = await apiRequest('/orders/create.php', {
          method: 'POST',
          body: JSON.stringify(backendPayload)
        });
        const rawOrder = (resData && resData.order) ? resData.order : resData;
        return { success: true, order: normalizeOrder({ ...payload, ...(rawOrder || {}) }), isDemo: false };
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
            // Compute final cost purely from actualWeight * pricePerUnit
            order.finalCost = Math.round(order.actualWeight * order.pricePerUnit);
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

        // PHP Endpoint: POST /backend/api/orders/update-status.php
        const resData = await apiRequest('/orders/update-status.php', {
          method: 'POST',
          body: JSON.stringify({ orderId, ...updatePayload })
        });
        const rawOrder = (resData && resData.order) ? resData.order : {
          id: orderId,
          status: updatePayload.newStatus,
          actualWeight: updatePayload.actualWeight,
          ...(resData || {})
        };
        return { success: true, order: normalizeOrder(rawOrder), isDemo: false };
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

        // PHP Endpoint: GET /backend/api/orders/metrics.php
        const resData = await apiRequest('/orders/metrics.php');
        const rawMetrics = (resData && resData.metrics) ? resData.metrics : resData;
        return normalizeMetrics(rawMetrics);
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
