<?php
declare(strict_types=1);

/**
 * Database configuration for Washly.
 * Prefer environment variables on hosting. Defaults are suitable for a basic
 * XAMPP installation (MySQL root with an empty password).
 */
return [
    'host' => getenv('DB_HOST') ?: '127.0.0.1',
    'port' => getenv('DB_PORT') ?: '3306',
    'database' => getenv('DB_NAME') ?: 'washly_laundry',
    'username' => getenv('DB_USER') ?: 'root',
    'password' => getenv('DB_PASS') !== false ? getenv('DB_PASS') : '',
    'charset' => 'utf8mb4',
];
