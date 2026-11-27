<?php
/**
 * Washly - Frontend PHP Bootstrap & Shared View Helpers
 * Handles session initialization, XSS-safe output escaping, and shared UI snippets.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Escape string safely for HTML output.
 */
function washly_e(?string $value): string
{
    return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES, 'UTF-8');
}

/**
 * Retrieve active user info from PHP $_SESSION (if populated by Backend PHP)
 * with graceful fallback defaults for initial render / Demo Mode.
 */
function washly_current_user(string $defaultRole = 'customer'): array
{
    if (!empty($_SESSION['user']) && is_array($_SESSION['user'])) {
        $u = $_SESSION['user'];
        $name = trim((string) ($u['name'] ?? $u['full_name'] ?? 'Pengguna'));
        $initials = (string) ($u['avatarText'] ?? $u['avatar_text'] ?? strtoupper(substr($name, 0, 2)));
        return [
            'name' => $name,
            'email' => (string) ($u['email'] ?? ''),
            'phone' => (string) ($u['phone'] ?? $u['phone_number'] ?? ''),
            'address' => (string) ($u['address'] ?? ''),
            'role' => (string) ($u['role'] ?? $defaultRole),
            'initials' => $initials !== '' ? $initials : 'U',
        ];
    }

    if ($defaultRole === 'admin') {
        return [
            'name' => 'Siti Aminah',
            'email' => 'admin@washly.id',
            'phone' => '0812-3456-7890',
            'address' => 'Washly Outlet Pusat Jakarta',
            'role' => 'admin',
            'initials' => 'WA',
        ];
    }

    return [
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
        'phone' => '0812-3456-7890',
        'address' => 'Jl. Kemang Raya No. 14, Jakarta Selatan',
        'role' => 'customer',
        'initials' => 'BS',
    ];
}

/**
 * Render the accessible Light / Dark Mode toggle switch button.
 */
function washly_theme_toggle_button(): string
{
    return <<<'HTML'
<button type="button" class="theme-toggle-btn" id="theme-toggle" aria-label="Beralih ke mode gelap" title="Beralih Mode Gelap / Terang">
  <span class="theme-toggle-icon icon-sun" aria-hidden="true">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
  </span>
  <span class="theme-toggle-icon icon-moon" aria-hidden="true">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
  </span>
</button>
HTML;
}
