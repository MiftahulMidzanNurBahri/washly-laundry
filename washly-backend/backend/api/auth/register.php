<?php
declare(strict_types=1);
require_once __DIR__ . '/../common.php';

api_run(function (): array {
    require_method('POST');
    $input = json_input();

    $name = trim((string) ($input['name'] ?? ''));
    $email = strtolower(trim((string) ($input['email'] ?? '')));
    $phone = preg_replace('/[^0-9+]/', '', trim((string) ($input['phone'] ?? '')));
    $address = trim((string) ($input['address'] ?? ''));
    $password = (string) ($input['password'] ?? '');

    if (text_length($name) < 3 || text_length($name) > 100) {
        throw new ApiException('Nama harus terdiri dari 3 sampai 100 karakter.', 422);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
        throw new ApiException('Format email tidak valid.', 422);
    }
    if (!preg_match('/^\+?[0-9]{8,16}$/', $phone)) {
        throw new ApiException('Nomor telepon tidak valid.', 422);
    }
    if (strlen($password) < 6) {
        throw new ApiException('Kata sandi minimal 6 karakter.', 422);
    }
    if (text_length($address) > 255) {
        throw new ApiException('Alamat maksimal 255 karakter.', 422);
    }

    $pdo = db();
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    if ($stmt->fetch()) {
        throw new ApiException('Email sudah terdaftar. Gunakan email lain.', 409);
    }

    $insert = $pdo->prepare(
        'INSERT INTO users (name, email, phone, address, password_hash, role)
         VALUES (:name, :email, :phone, :address, :password_hash, \'customer\')'
    );
    $insert->execute([
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'address' => $address,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    ]);

    $userId = (int) $pdo->lastInsertId();
    $select = $pdo->prepare('SELECT id, name, email, phone, address, role FROM users WHERE id = :id');
    $select->execute(['id' => $userId]);
    $user = public_user($select->fetch());

    session_regenerate_id(true);
    $_SESSION['washly_user'] = $user;

    return ['user' => $user];
});
