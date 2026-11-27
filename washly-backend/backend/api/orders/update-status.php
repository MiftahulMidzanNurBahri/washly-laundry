<?php
declare(strict_types=1);
require_once __DIR__ . '/../common.php';

api_run(function (): array {
    require_method('POST');
    $admin = require_auth('admin');
    $input = json_input();

    $orderCode = trim((string) ($input['orderId'] ?? ''));
    $newStatus = trim((string) ($input['newStatus'] ?? ''));
    $adminNotes = trim((string) ($input['adminNotes'] ?? ''));
    if ($orderCode === '' || $newStatus === '') {
        throw new ApiException('Kode pesanan dan status baru wajib diisi.', 422);
    }
    if (text_length($adminNotes) > 1000) {
        throw new ApiException('Catatan admin maksimal 1000 karakter.', 422);
    }

    $transitions = [
        'Menunggu Penyerahan' => ['Diproses'],
        'Diproses' => ['Siap Diambil'],
        'Siap Diambil' => ['Diambil'],
        'Diambil' => [],
    ];
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $lock = $pdo->prepare('SELECT * FROM orders WHERE order_code = :code FOR UPDATE');
        $lock->execute(['code' => $orderCode]);
        $orderRow = $lock->fetch();
        if (!$orderRow) {
            throw new ApiException('Pesanan tidak ditemukan.', 404);
        }

        $currentStatus = (string) $orderRow['status'];
        if ($newStatus !== $currentStatus && !in_array($newStatus, $transitions[$currentStatus] ?? [], true)) {
            throw new ApiException(
                "Transisi status dari '{$currentStatus}' ke '{$newStatus}' tidak diperbolehkan sesuai SOP Washly.",
                422
            );
        }

        $actualWeight = $orderRow['actual_weight'] === null ? null : (float) $orderRow['actual_weight'];
        $finalCost = $orderRow['final_cost'] === null ? null : (float) $orderRow['final_cost'];

        if ($currentStatus === 'Menunggu Penyerahan' && $newStatus === 'Diproses') {
            $actualWeight = valid_positive_number($input['actualWeight'] ?? null, 'Berat aktual', 1000);
            $finalCost = round($actualWeight * (float) $orderRow['price_per_unit_snapshot'])
                + (float) $orderRow['scent_price_snapshot'];
        } elseif (isset($input['actualWeight']) && $input['actualWeight'] !== '' && $input['actualWeight'] !== null) {
            // Front-end currently sends the displayed weight on every status update.
            // Accept an unchanged value, but do not allow the final weight to be edited later.
            $submittedWeight = valid_positive_number($input['actualWeight'], 'Berat aktual', 1000);
            if ($actualWeight === null || abs($submittedWeight - $actualWeight) > 0.001) {
                throw new ApiException('Berat aktual tidak dapat diubah setelah pesanan mulai diproses.', 422);
            }
        }

        $update = $pdo->prepare(
            'UPDATE orders SET actual_weight = :actual_weight, final_cost = :final_cost, status = :status
             WHERE id = :id'
        );
        $update->execute([
            'actual_weight' => $actualWeight,
            'final_cost' => $finalCost,
            'status' => $newStatus,
            'id' => (int) $orderRow['id'],
        ]);

        if ($newStatus !== $currentStatus || $adminNotes !== '') {
            $note = $adminNotes !== ''
                ? $adminNotes
                : 'Status diperbarui menjadi ' . $newStatus . ' oleh Admin.';
            insert_order_history($pdo, (int) $orderRow['id'], $newStatus, $note, (int) $admin['id']);
        }

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }

    return ['order' => fetch_order($pdo, $orderCode, true)];
});
