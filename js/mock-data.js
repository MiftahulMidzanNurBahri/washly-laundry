/**
 * Washly - Mock Data & Initial Seed
 * Provides realistic demo records across all statuses and roles
 */

const WASHLY_MOCK_DATA = {
  USERS: [
    {
      id: 'usr-001',
      name: 'Budi Santoso',
      email: 'budi@example.com',
      phone: '0812-3456-7890',
      address: 'Jl. Kemang Raya No. 14, Jakarta Selatan',
      role: 'customer',
      avatarText: 'BS',
      registeredAt: '2026-09-15'
    },
    {
      id: 'usr-002',
      name: 'Siti Rahma',
      email: 'siti@example.com',
      phone: '0857-1122-3344',
      address: 'Apartemen Sudirman Tower A Lt. 12, Jakarta Pusat',
      role: 'customer',
      avatarText: 'SR',
      registeredAt: '2026-10-01'
    },
    {
      id: 'usr-admin',
      name: 'Siti Aminah (Admin Outlet)',
      email: 'admin@washly.id',
      phone: '0811-8899-0011',
      address: 'Washly Outlet Pusat, Jakarta Selatan',
      role: 'admin',
      avatarText: 'WA',
      registeredAt: '2026-01-01'
    }
  ],

  ORDERS: [
    {
      id: 'WSH-202610-001',
      customerId: 'usr-001',
      customerName: 'Budi Santoso',
      customerPhone: '0812-3456-7890',
      serviceId: 'cuci-komplit',
      serviceName: 'Cuci Komplit (Reguler)',
      unit: 'kg',
      pricePerUnit: 8000,
      scent: 'Lavender Blossom',
      scentPrice: 2000,
      estimatedWeight: 3.0,
      actualWeight: null, // Waiting for admin weighing
      finalCost: null,
      notes: 'Pakaian kerja kantor, kemeja putih tolong jangan dicampur baju luntur.',
      handoverMethod: 'antar-sendiri',
      status: 'Menunggu Penyerahan',
      createdAt: '2026-10-29T10:15:00+07:00',
      timeline: [
        {
          status: 'Menunggu Penyerahan',
          timestamp: '2026-10-29T10:15:00+07:00',
          note: 'Pesanan dibuat oleh pelanggan melalui portal Washly.'
        }
      ]
    },
    {
      id: 'WSH-202610-002',
      customerId: 'usr-002',
      customerName: 'Siti Rahma',
      customerPhone: '0857-1122-3344',
      serviceId: 'cuci-komplit',
      serviceName: 'Cuci Komplit (Reguler)',
      unit: 'kg',
      pricePerUnit: 8000,
      scent: 'Ocean Fresh',
      scentPrice: 0,
      estimatedWeight: 4.0,
      actualWeight: 4.2,
      finalCost: 33600, // 4.2 * 8000
      notes: 'Dress katun tolong disetrika dengan suhu sedang.',
      handoverMethod: 'antar-sendiri',
      status: 'Diproses',
      createdAt: '2026-10-28T14:20:00+07:00',
      timeline: [
        {
          status: 'Menunggu Penyerahan',
          timestamp: '2026-10-28T14:20:00+07:00',
          note: 'Pesanan berhasil dibuat.'
        },
        {
          status: 'Diproses',
          timestamp: '2026-10-28T16:05:00+07:00',
          note: 'Pakaian telah ditimbang oleh Admin Siti Aminah (4.2 kg). Tahap pencucian dimulai.'
        }
      ]
    },
    {
      id: 'WSH-202610-003',
      customerId: 'usr-001',
      customerName: 'Budi Santoso',
      customerPhone: '0812-3456-7890',
      serviceId: 'express',
      serviceName: 'Express Wash Kilat',
      unit: 'kg',
      pricePerUnit: 14000,
      scent: 'Sakura Petals',
      scentPrice: 2000,
      estimatedWeight: 2.0,
      actualWeight: 2.5,
      finalCost: 37000, // (2.5 * 14000) + 2000
      notes: 'Baju futsal dan kaos olahraga.',
      handoverMethod: 'antar-sendiri',
      status: 'Siap Diambil',
      createdAt: '2026-10-29T08:00:00+07:00',
      timeline: [
        {
          status: 'Menunggu Penyerahan',
          timestamp: '2026-10-29T08:00:00+07:00',
          note: 'Pesanan kilat dibuat.'
        },
        {
          status: 'Diproses',
          timestamp: '2026-10-29T08:45:00+07:00',
          note: 'Pakaian diterima & ditimbang (2.5 kg). Proses pencucian kilat dimulai.'
        },
        {
          status: 'Siap Diambil',
          timestamp: '2026-10-29T12:30:00+07:00',
          note: 'Pakaian selesai disetrika dan dipacking. Menunggu pengambilan pelanggan.'
        }
      ]
    },
    {
      id: 'WSH-202610-004',
      customerId: 'usr-002',
      customerName: 'Siti Rahma',
      customerPhone: '0857-1122-3344',
      serviceId: 'setrika',
      serviceName: 'Setrika Uap Saja',
      unit: 'kg',
      pricePerUnit: 5000,
      scent: 'Downy Mystique',
      scentPrice: 2000,
      estimatedWeight: 5.0,
      actualWeight: 5.4,
      finalCost: 29000, // (5.4 * 5000) + 2000
      notes: 'Gamis dan jilbab plisket.',
      handoverMethod: 'antar-sendiri',
      status: 'Diambil',
      createdAt: '2026-10-25T11:00:00+07:00',
      timeline: [
        {
          status: 'Menunggu Penyerahan',
          timestamp: '2026-10-25T11:00:00+07:00',
          note: 'Pesanan setrika dibuat.'
        },
        {
          status: 'Diproses',
          timestamp: '2026-10-25T13:10:00+07:00',
          note: 'Pakaian ditimbang 5.4 kg. Memulai penyetrikaan uap.'
        },
        {
          status: 'Siap Diambil',
          timestamp: '2026-10-26T10:00:00+07:00',
          note: 'Penyetrikaan selesai, rapi dalam gantungan khusus.'
        },
        {
          status: 'Diambil',
          timestamp: '2026-10-26T17:30:00+07:00',
          note: 'Pakaian diambil oleh pelanggan Siti Rahma. Pembayaran tunai lunas.'
        }
      ]
    },
    {
      id: 'WSH-202610-005',
      customerId: 'usr-001',
      customerName: 'Budi Santoso',
      customerPhone: '0812-3456-7890',
      serviceId: 'bedcover',
      serviceName: 'Bed Cover & Selimut',
      unit: 'pcs',
      pricePerUnit: 25000,
      scent: 'Ocean Fresh',
      scentPrice: 0,
      estimatedWeight: 2, // 2 pcs
      actualWeight: null,
      finalCost: null,
      notes: 'Bed cover king size motif garis biru.',
      handoverMethod: 'antar-sendiri',
      status: 'Menunggu Penyerahan',
      createdAt: '2026-10-29T11:40:00+07:00',
      timeline: [
        {
          status: 'Menunggu Penyerahan',
          timestamp: '2026-10-29T11:40:00+07:00',
          note: 'Pesanan bed cover diterima di sistem Washly.'
        }
      ]
    }
  ]
};

if (typeof window !== 'undefined') {
  window.WASHLY_MOCK_DATA = WASHLY_MOCK_DATA;
}
