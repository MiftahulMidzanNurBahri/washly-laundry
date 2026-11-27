<?php
declare(strict_types=1);
require_once __DIR__ . '/../common.php';

api_run(function (): array {
    require_method('GET');
    $user = require_auth();
    $orderCode = trim((string) ($_GET['id'] ?? ''));
    if ($orderCode === '') {
        throw new ApiException('Kode pesanan wajib diisi.', 422);
    }

    $order = fetch_order(db(), $orderCode, true);
    if ($order === null) {
        throw new ApiException('Pesanan tidak ditemukan.', 404);
    }
    if ($user['role'] !== 'admin' && (int) $order['customerId'] !== (int) $user['id']) {
        throw new ApiException('Anda tidak memiliki akses ke pesanan ini.', 403);
    }
    return $order;
});
