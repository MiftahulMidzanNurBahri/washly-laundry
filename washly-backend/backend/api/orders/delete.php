<?php
declare(strict_types=1);
require_once __DIR__ . '/../common.php';

api_run(function (): array {
    require_method('DELETE');
    require_auth('admin');
    $orderCode = trim((string) ($_GET['id'] ?? ''));
    if ($orderCode === '') {
        throw new ApiException('Kode pesanan wajib diisi.', 422);
    }

    $stmt = db()->prepare('SELECT id, status FROM orders WHERE order_code = :code LIMIT 1');
    $stmt->execute(['code' => $orderCode]);
    $order = $stmt->fetch();
    if (!$order) {
        throw new ApiException('Pesanan tidak ditemukan.', 404);
    }
    if ($order['status'] !== 'Menunggu Penyerahan') {
        throw new ApiException('Hanya pesanan yang belum diproses yang boleh dihapus.', 422);
    }

    $delete = db()->prepare('DELETE FROM orders WHERE id = :id');
    $delete->execute(['id' => (int) $order['id']]);
    return ['id' => $orderCode, 'deleted' => true];
});
