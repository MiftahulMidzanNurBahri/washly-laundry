<?php
declare(strict_types=1);
require_once __DIR__ . '/../common.php';

api_run(function (): array {
    require_method('POST');
    $input = json_input();
    $email = strtolower(trim((string) ($input['email'] ?? '')));
    $password = (string) ($input['password'] ?? '');
    $requestedRole = trim((string) ($input['role'] ?? ''));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        throw new ApiException('Email atau kata sandi tidak cocok.', 401);
    }

    $stmt = db()->prepare(
        'SELECT id, name, email, phone, address, password_hash, role
         FROM users WHERE email = :email LIMIT 1'
    );
    $stmt->execute(['email' => $email]);
    $row = $stmt->fetch();

    if (!$row || !password_verify($password, (string) $row['password_hash'])) {
        throw new ApiException('Email atau kata sandi tidak cocok.', 401);
    }
    if ($requestedRole !== '' && $requestedRole !== $row['role']) {
        throw new ApiException('Akun ini tidak memiliki peran ' . $requestedRole . '.', 403);
    }

    session_regenerate_id(true);
    $user = public_user($row);
    $_SESSION['washly_user'] = $user;

    return ['token' => null, 'user' => $user, 'authType' => 'PHP Session'];
});
