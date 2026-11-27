<?php
declare(strict_types=1);
require_once __DIR__ . '/../common.php';

api_run(function (): array {
    require_method('GET');
    require_auth('admin');
    $pdo = db();

    $counts = $pdo->query(
        "SELECT
            COUNT(*) AS total,
            SUM(status = 'Menunggu Penyerahan') AS menunggu,
            SUM(status = 'Diproses') AS diproses,
            SUM(status = 'Siap Diambil') AS siap,
            SUM(status = 'Diambil') AS diambil
         FROM orders"
    )->fetch();

    $revenueStmt = $pdo->query(
        "SELECT COALESCE(SUM(final_cost), 0) AS revenue_today
         FROM orders
         WHERE status = 'Diambil' AND DATE(updated_at) = CURDATE()"
    );
    $revenue = $revenueStmt->fetch();

    return [
        'total' => (int) ($counts['total'] ?? 0),
        'menunggu' => (int) ($counts['menunggu'] ?? 0),
        'diproses' => (int) ($counts['diproses'] ?? 0),
        'siap' => (int) ($counts['siap'] ?? 0),
        'diambil' => (int) ($counts['diambil'] ?? 0),
        'revenueToday' => (int) round((float) ($revenue['revenue_today'] ?? 0)),
    ];
});
