<?php
declare(strict_types=1);
require_once __DIR__ . '/../common.php';

api_run(function (): array {
    require_method('GET');
    $user = require_auth();
    return ['user' => $user];
});
