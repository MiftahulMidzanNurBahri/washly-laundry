<?php
declare(strict_types=1);

date_default_timezone_set('Asia/Jakarta');

// PHP session cookie: browser JavaScript cannot read it (HttpOnly).
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name('WASHLYSESSID');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

require_once __DIR__ . '/../config/database.php';

final class ApiException extends RuntimeException
{
    public int $httpStatus;

    public function __construct(string $message, int $httpStatus = 400)
    {
        parent::__construct($message);
        $this->httpStatus = $httpStatus;
    }
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = require __DIR__ . '/../config/database.php';
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        $config['host'],
        $config['port'],
        $config['database'],
        $config['charset']
    );

    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $pdo->exec("SET time_zone = '+07:00'");

    return $pdo;
}

function json_response(bool $success, string $message, mixed $data = null, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

    $response = [
        'success' => $success,
        'message' => $message,
    ];
    if ($data !== null) {
        $response['data'] = $data;
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function api_run(callable $callback): never
{
    try {
        $result = $callback();
        json_response(true, 'Permintaan berhasil.', $result, 200);
    } catch (ApiException $e) {
        json_response(false, $e->getMessage(), null, $e->httpStatus);
    } catch (PDOException $e) {
        error_log('[Washly DB] ' . $e->getMessage());
        if ((string) $e->getCode() === '23000') {
            json_response(false, 'Data sudah terdaftar atau melanggar relasi database.', null, 409);
        }
        json_response(false, 'Terjadi masalah pada database. Periksa konfigurasi dan koneksi MySQL.', null, 500);
    } catch (Throwable $e) {
        error_log('[Washly API] ' . $e->getMessage());
        json_response(false, 'Terjadi kesalahan pada server.', null, 500);
    }
}

function require_method(string ...$methods): void
{
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if (!in_array($method, $methods, true)) {
        header('Allow: ' . implode(', ', $methods));
        throw new ApiException('Metode request tidak diizinkan.', 405);
    }
}

function json_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        throw new ApiException('Body request harus berupa JSON yang valid.', 400);
    }
    return $decoded;
}

function require_auth(?string $role = null): array
{
    $user = $_SESSION['washly_user'] ?? null;
    if (!is_array($user) || empty($user['id'])) {
        throw new ApiException('Sesi tidak ditemukan. Silakan login terlebih dahulu.', 401);
    }

    if ($role !== null && ($user['role'] ?? '') !== $role) {
        throw new ApiException('Anda tidak memiliki hak akses untuk fitur ini.', 403);
    }

    return $user;
}

function public_user(array $row): array
{
    $name = (string) ($row['name'] ?? '');
    return [
        'id' => (int) $row['id'],
        'name' => $name,
        'email' => (string) $row['email'],
        'phone' => (string) ($row['phone'] ?? ''),
        'address' => (string) ($row['address'] ?? ''),
        'role' => (string) $row['role'],
        'avatarText' => strtoupper(substr($name, 0, 2)),
    ];
}

function normalize_datetime(?string $value): ?string
{
    if ($value === null || $value === '') {
        return null;
    }
    $date = new DateTimeImmutable($value, new DateTimeZone('Asia/Jakarta'));
    return $date->format(DateTimeInterface::ATOM);
}

function text_length(string $value): int
{
    $count = preg_match_all('/./us', $value);
    return $count === false ? strlen($value) : $count;
}

function valid_positive_number(mixed $value, string $field, float $maximum = 1000): float
{
    if (!is_numeric($value)) {
        throw new ApiException($field . ' harus berupa angka.', 422);
    }
    $number = (float) $value;
    if (!is_finite($number) || $number <= 0 || $number > $maximum) {
        throw new ApiException($field . ' harus lebih besar dari 0 dan tidak melebihi ' . $maximum . '.', 422);
    }
    return round($number, 2);
}

function fetch_order(PDO $pdo, string $orderCode, bool $withTimeline = true): ?array
{
    $stmt = $pdo->prepare(
        'SELECT o.*, u.name AS customer_name, u.phone AS customer_phone
         FROM orders o
         INNER JOIN users u ON u.id = o.customer_id
         WHERE o.order_code = :order_code
         LIMIT 1'
    );
    $stmt->execute(['order_code' => $orderCode]);
    $row = $stmt->fetch();
    if (!$row) {
        return null;
    }

    $order = [
        'id' => (string) $row['order_code'],
        'customerId' => (int) $row['customer_id'],
        'customerName' => (string) $row['customer_name'],
        'customerPhone' => (string) $row['customer_phone'],
        'serviceId' => (string) $row['service_id'],
        'serviceName' => (string) $row['service_name_snapshot'],
        'unit' => (string) $row['unit_snapshot'],
        'pricePerUnit' => (int) $row['price_per_unit_snapshot'],
        'scent' => (string) $row['scent_name_snapshot'],
        'scentPrice' => (int) $row['scent_price_snapshot'],
        'estimatedWeight' => (float) $row['estimated_weight'],
        'actualWeight' => $row['actual_weight'] === null ? null : (float) $row['actual_weight'],
        'finalCost' => $row['final_cost'] === null ? null : (int) round((float) $row['final_cost']),
        'notes' => (string) ($row['notes'] ?? ''),
        'handoverMethod' => (string) $row['handover_method'],
        'status' => (string) $row['status'],
        'createdAt' => normalize_datetime((string) $row['created_at']),
        'updatedAt' => normalize_datetime((string) $row['updated_at']),
    ];

    if ($withTimeline) {
        $history = $pdo->prepare(
            'SELECT status, note, created_at
             FROM order_status_history
             WHERE order_id = :order_id
             ORDER BY id ASC'
        );
        $history->execute(['order_id' => (int) $row['id']]);
        $order['timeline'] = array_map(static function (array $item): array {
            return [
                'status' => (string) $item['status'],
                'timestamp' => normalize_datetime((string) $item['created_at']),
                'note' => (string) ($item['note'] ?? ''),
            ];
        }, $history->fetchAll());
    }

    return $order;
}

function insert_order_history(PDO $pdo, int $orderId, string $status, ?string $note, int $userId): void
{
    $stmt = $pdo->prepare(
        'INSERT INTO order_status_history (order_id, status, note, changed_by)
         VALUES (:order_id, :status, :note, :changed_by)'
    );
    $stmt->execute([
        'order_id' => $orderId,
        'status' => $status,
        'note' => $note,
        'changed_by' => $userId,
    ]);
}
