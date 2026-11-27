<?php
declare(strict_types=1);
require_once __DIR__ . '/../common.php';

api_run(function (): array {
    require_method('GET');
    $user = require_auth('customer');

    // The customer ID comes from the server-side session, never from the query string.
    $stmt = db()->prepare(
        'SELECT order_code FROM orders WHERE customer_id = :customer_id ORDER BY created_at DESC, id DESC'
    );
    $stmt->execute(['customer_id' => (int) $user['id']]);
    $orders = [];
    foreach ($stmt->fetchAll() as $row) {
        $order = fetch_order(db(), (string) $row['order_code'], true);
        if ($order !== null) {
            $orders[] = $order;
        }
    }
    return $orders;
});
