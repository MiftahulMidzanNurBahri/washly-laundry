<?php
/**
 * Shared JS Scripts & Closing HTML Tags.
 *
 * Expected variables:
 * - string $basePrefix    ('' for root pages, '../' for subdir pages)
 * - ?string $pageScript   (e.g. 'auth.js', 'customer.js', 'admin.js')
 * - ?string $inlineScript (optional inline <script> logic)
 */
require_once __DIR__ . '/bootstrap.php';

$basePrefix = $basePrefix ?? '';
$pageScript = $pageScript ?? null;
$inlineScript = $inlineScript ?? null;
?>
  <!-- Scripts -->
  <script src="<?= washly_e($basePrefix) ?>js/config.js"></script>
  <script src="<?= washly_e($basePrefix) ?>js/mock-data.js"></script>
  <script src="<?= washly_e($basePrefix) ?>js/validators.js"></script>
  <script src="<?= washly_e($basePrefix) ?>js/api.js"></script>
  <script src="<?= washly_e($basePrefix) ?>js/app.js"></script>
  <script src="<?= washly_e($basePrefix) ?>js/navigation.js"></script>
<?php if (!empty($pageScript)): ?>
  <script src="<?= washly_e($basePrefix . 'js/' . $pageScript) ?>"></script>
<?php endif; ?>
<?php if (!empty($inlineScript)): ?>
  <script>
<?= $inlineScript . "\n" ?>
  </script>
<?php endif; ?>
</body>
</html>
