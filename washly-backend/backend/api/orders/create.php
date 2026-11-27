<?php
declare(strict_types=1);
require_once __DIR__ . '/../common.php';

api_run(function (): array {
    require_method('POST');
    $user = require_auth('customer');
    $input = json_input();

    $serviceId = trim((string) ($input['serviceId'] ?? ''));
    $scentName = trim((string) ($input['scent'] ?? 'Ocean Fresh'));
    $estimatedWeight = valid_positive_number($input['estimatedWeight'] ?? null, 'Estimasi berat', 1000);
    $notes = trim((string) ($input['notes'] ?? ''));
    $handoverMethod = trim((string) ($input['handoverMethod'] ?? 'antar-sendiri'));

    if (text_length($notes) > 1000) {
        throw new ApiException('Catatan maksimal 1000 karakter.', 422);
    }
    if (!in_array($handoverMethod, ['antar-sendiri', 'jemput-kurir'], true)) {
        throw new ApiException('Metode penyerahan tidak valid.', 422);
    }

    $pdo = db();
    $serviceStmt = $pdo->prepare(
        'SELECT id, name, unit, price FROM services WHERE id = :id AND is_active = 1 LIMIT 1'
    );
    $serviceStmt->execute(['id' => $serviceId]);
    $service = $serviceStmt->fetch();
    if (!$service) {
        throw new ApiException('Layanan yang dipilih tidak tersedia.', 422);
    }

    $scentStmt = $pdo->prepare('SELECT id, name, price FROM scents WHERE name = :name AND is_active = 1 LIMIT 1');
    $scentStmt->execute(['name' => $scentName]);
    $scent = $scentStmt->fetch();
    if (!$scent) {
        throw new ApiException('Pilihan parfum tidak tersedia.', 422);
    }

    $pdo->beginTransaction();
    try {
        $insert = $pdo->prepare(
            'INSERT INTO orders (
                order_code, customer_id, service_id, scent_id,
                service_name_snapshot, unit_snapshot, price_per_unit_snapshot,
                scent_name_snapshot, scent_price_snapshot,
                estimated_weight, actual_weight, final_cost,
                notes, handover_method, status
             ) VALUES (
                NULL, :customer_id, :service_id, :scent_id,
                :service_name, :unit, :price,
                :scent_name, :scent_price,
                :estimated_weight, NULL, NULL,
                :notes, :handover_method, \'Menunggu Penyerahan\'
             )'
        );
        $insert->execute([
            'customer_id' => (int) $user['id'],
            'service_id' => $service['id'],
            'scent_id' => $scent['id'],
            'service_name' => $service['name'],
            'unit' => $service['unit'],
            'price' => $service['price'],
            'scent_name' => $scent['name'],
            'scent_price' => $scent['price'],
            'estimated_weight' => $estimatedWeight,
            'notes' => $notes,
            'handover_method' => $handoverMethod,
        ]);

        $orderDbId = (int) $pdo->lastInsertId();
        $orderCode = 'WSH-' . date('Ym') . '-' . str_pad((string) $orderDbId, 3, '0', STR_PAD_LEFT);
        $updateCode = $pdo->prepare('UPDATE orders SET order_code = :code WHERE id = :id');
        $updateCode->execute(['code' => $orderCode, 'id' => $orderDbId]);

        insert_order_history(
            $pdo,
            $orderDbId,
            'Menunggu Penyerahan',
            'Pesanan baru dibuat oleh pelanggan.',
            (int) $user['id']
        );
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }

    $order = fetch_order($pdo, $orderCode, true);
    return ['order' => $order];
});
