/**
 * Washly - System Configuration & Constants
 * Defines services, status transitions, scent options, and storage keys
 */

const WASHLY_CONFIG = {
  APP_NAME: 'Washly',
  TAGLINE: 'Sistem Manajemen Laundry Modern & Terpercaya',
  VERSION: '1.0.0',
  CURRENCY: 'IDR',

  STORAGE_KEYS: {
    CURRENT_USER: 'washly_current_user',
    ORDERS: 'washly_orders_store',
    DEMO_MODE: 'washly_demo_mode_enabled',
    NOTIFICATION: 'washly_pending_toast'
  },

  // Strict business flow status definitions
  STATUS: {
    MENUNGGU: 'Menunggu Penyerahan',
    DIPROSES: 'Diproses',
    SIAP_DIAMBIL: 'Siap Diambil',
    DIAMBIL: 'Diambil'
  },

  STATUS_DETAILS: {
    'Menunggu Penyerahan': {
      label: 'Menunggu Penyerahan',
      badgeClass: 'badge-status-menunggu',
      stepIndex: 1,
      description: 'Pesanan telah dibuat. Silakan serahkan pakaian ke outlet Washly atau tunggu kurir kami.',
      icon: 'inbox'
    },
    'Diproses': {
      label: 'Diproses',
      badgeClass: 'badge-status-diproses',
      stepIndex: 2,
      description: 'Pakaian telah diterima & ditimbang oleh admin. Sedang dalam tahap pencucian dan penyetrikaan.',
      icon: 'refresh'
    },
    'Siap Diambil': {
      label: 'Siap Diambil',
      badgeClass: 'badge-status-siap',
      stepIndex: 3,
      description: 'Pakaian telah selesai dicuci, disetrika rapi, dan dikemas harum. Siap untuk diambil di outlet.',
      icon: 'check-circle'
    },
    'Diambil': {
      label: 'Diambil',
      badgeClass: 'badge-status-diambil',
      stepIndex: 4,
      description: 'Pakaian telah diambil oleh pelanggan dan transaksi selesai.',
      icon: 'check-all'
    }
  },

  // Status transition progression according to specification
  ALLOWED_TRANSITIONS: {
    'Menunggu Penyerahan': ['Diproses'],
    'Diproses': ['Siap Diambil'],
    'Siap Diambil': ['Diambil'],
    'Diambil': []
  },

  // Laundry services catalog
  SERVICES: [
    {
      id: 'cuci-komplit',
      name: 'Cuci Komplit (Reguler)',
      unit: 'kg',
      price: 8000,
      duration: '2 Hari',
      description: 'Pencucian higienis mendalam, pengeringan mesin, dan setrika uap rapi.',
      icon: 'washer',
      popular: true
    },
    {
      id: 'cuci-kering',
      name: 'Cuci Kering Lipat',
      unit: 'kg',
      price: 6000,
      duration: '1 Hari',
      description: 'Cuci bersih dan kering wangi tanpa setrika, dilipat rapi siap simpan.',
      icon: 'wind',
      popular: false
    },
    {
      id: 'setrika',
      name: 'Setrika Uap Saja',
      unit: 'kg',
      price: 5000,
      duration: '1 Hari',
      description: 'Penyetrikaan uap presisi untuk pakaian yang sudah dicuci sendiri di rumah.',
      icon: 'iron',
      popular: false
    },
    {
      id: 'express',
      name: 'Express Wash Kilat',
      unit: 'kg',
      price: 14000,
      duration: '6 Jam',
      description: 'Layanan prioritas cepat kilat untuk kebutuhan mendesak.',
      icon: 'zap',
      popular: true
    },
    {
      id: 'bedcover',
      name: 'Bed Cover & Selimut',
      unit: 'pcs',
      price: 25000,
      duration: '2 Hari',
      description: 'Perawatan khusus selimut tebal dan bed cover dengan mesin kapasitas besar.',
      icon: 'bed',
      popular: false
    },
    {
      id: 'sepatu-tas',
      name: 'Deep Clean Sepatu & Tas',
      unit: 'pasang',
      price: 30000,
      duration: '3 Hari',
      description: 'Pembersihan detail khusus bahan sneaker, kulit, kanvas dan suede.',
      icon: 'tag',
      popular: false
    }
  ],

  // Scent / Fragrance Options
  SCENTS: [
    { id: 'ocean-fresh', name: 'Ocean Fresh', price: 0, desc: 'Segar dan sejuk' },
    { id: 'lavender', name: 'Lavender Blossom', price: 2000, desc: 'Aroma relaksasi mewah' },
    { id: 'sakura', name: 'Sakura Petals', price: 2000, desc: 'Wangi lembut bunga sakura' },
    { id: 'downy-mystique', name: 'Downy Mystique', price: 2000, desc: 'Aroma parfum tahan lama' },
    { id: 'neutral', name: 'Tanpa Parfum', price: 0, desc: 'Hipoalergenik untuk kulit sensitif' }
  ]
};

// Make available globally in browser window
if (typeof window !== 'undefined') {
  window.WASHLY_CONFIG = WASHLY_CONFIG;
}
