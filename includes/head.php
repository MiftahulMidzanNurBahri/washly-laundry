<?php
/**
 * Shared HTML <head> partial with early Dark Mode initialization (anti-FOUC).
 *
 * Expected variables:
 * - string $pageTitle
 * - string $pageDescription
 * - string $basePrefix       ('' for root pages, '../' for subdir pages)
 * - ?string $extraCss        (e.g. 'auth.css', 'customer.css', 'admin.css')
 * - ?string $inlineStyles    (optional inline <style> content)
 */
require_once __DIR__ . '/bootstrap.php';

$pageTitle = $pageTitle ?? 'Washly Laundry';
$pageDescription = $pageDescription ?? 'Sistem manajemen dan layanan laundry modern Washly.';
$basePrefix = $basePrefix ?? '';
$extraCss = $extraCss ?? null;
$inlineStyles = $inlineStyles ?? null;
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= washly_e($pageTitle) ?></title>
  <script>
    (function() {
      try {
        var theme = localStorage.getItem('washly_theme');
        if (theme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
        }
      } catch (e) {}
    })();
  </script>
  <meta name="description" content="<?= washly_e($pageDescription) ?>">

  <link rel="stylesheet" href="<?= washly_e($basePrefix) ?>css/reset.css">
  <link rel="stylesheet" href="<?= washly_e($basePrefix) ?>css/global.css">
  <link rel="stylesheet" href="<?= washly_e($basePrefix) ?>css/components.css">
<?php if (!empty($extraCss)): ?>
  <link rel="stylesheet" href="<?= washly_e($basePrefix . 'css/' . $extraCss) ?>">
<?php endif; ?>
  <link rel="stylesheet" href="<?= washly_e($basePrefix) ?>css/responsive.css">
<?php if (!empty($inlineStyles)): ?>
  <style>
<?= $inlineStyles . "\n" ?>
  </style>
<?php endif; ?>
</head>
<body>
