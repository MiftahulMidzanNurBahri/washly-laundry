<?php
declare(strict_types=1);
require_once __DIR__ . '/../common.php';

api_run(function (): array {
    require_method('GET');
    require_auth('admin');

    $where = [];
    $params = [];
    $search = trim((string) ($_GET['search'] ?? ''));
    $status = trim((string) ($_GET['status'] ?? ''));
    $serviceId = trim((string) ($_GET['serviceId'] ?? $_GET['service_id'] ?? ''));

    if ($search !== '') {
        $where[] = '(o.order_code LIKE :search_code OR u.name LIKE :search_name OR u.phone LIKE :search_phone)';
        $like = '%' . $search . '%';
        $params['search_code'] = $like;
        $params['search_name'] = $like;
        $params['search_phone'] = $like;
    }
    if ($status !== '' && $status !== 'Semua') {
        $where[] = 'o.status = :status';
        $params['status'] = $status;
    }
    if ($serviceId !== '' && $serviceId !== 'Semua') {
        $where[] = 'o.service_id = :service_id';
        $params['service_id'] = $serviceId;
    }

    $sql = 'SELECT o.order_code FROM orders o INNER JOIN users u ON u.id = o.customer_id';
    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY o.created_at DESC, o.id DESC';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $orders = [];
    foreach ($stmt->fetchAll() as $row) {
        $order = fetch_order(db(), (string) $row['order_code'], true);
        if ($order !== null) {
            $orders[] = $order;
        }
    }
    return $orders;
});
