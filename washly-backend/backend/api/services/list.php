<?php
declare(strict_types=1);
require_once __DIR__ . '/../common.php';

api_run(function (): array {
    require_method('GET');
    $stmt = db()->query(
        'SELECT id, name, unit, price, duration, description
         FROM services WHERE is_active = 1 ORDER BY sort_order ASC, name ASC'
    );
    return array_map(static function (array $row): array {
        return [
            'id' => (string) $row['id'],
            'name' => (string) $row['name'],
            'unit' => (string) $row['unit'],
            'price' => (int) $row['price'],
            'duration' => (string) $row['duration'],
            'description' => (string) $row['description'],
        ];
    }, $stmt->fetchAll());
});
