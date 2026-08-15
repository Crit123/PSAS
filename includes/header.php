<?php
/**
 * header.php — Reusable HTML head + opening body
 * Usage: include at the top of every PSAS page.
 *
 * Expected variables (set BEFORE including this file):
 *   $page_title  string  — <title> text, e.g. "Login | PSAS"
 *   $body_class  string  — optional extra class on <body>
 */
$page_title ??= 'Parking Space Allocation System | Dr. Yanga\'s Colleges Inc.';
$body_class  ??= '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PSAS — Campus Parking Space Allocation System for Dr. Yanga's Colleges Inc.">
  <title><?= htmlspecialchars($page_title) ?></title>

  <!-- Bootstrap 5 CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <!-- Google Fonts: Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <!-- Custom styles -->
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="<?= htmlspecialchars($body_class) ?>">
