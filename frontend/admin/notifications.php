<?php
/**
 * PAGE: admin-notifications.php
 * PURPOSE: Notifications for PSAS Admin — the canonical, unabridged version
 *          of the header bell's dropdown/"View all" modal preview. Backed
 *          by the same PSAS.state.notifications store (admin-state.js).
 * SCOPE: Frontend only. Mock data — see includes/js/admin-state.js for
 *        clearly labeled FUTURE API placeholders.
 */
session_start();
$page_title      = "Notifications | PSAS";
$active_nav      = "notifications";
$page_heading    = "Notifications";
$page_subheading = "System-wide alerts — filter, search, and manage";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PSAS — Notifications">
  <title><?= htmlspecialchars($page_title) ?></title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <!-- admin-notifications.css imports admin-global.css (tokens/shell/shared UI), which imports sidebar.css -->
  <link rel="stylesheet" href="../includes/css/admin/notifications.css">
</head>
<body>

<div class="admin-shell">

  <?php require __DIR__ . '/../includes/admin/sidebar.php'; ?>

  <div class="admin-main">

    <?php require __DIR__ . '/../includes/admin/header.php'; ?>

    <main class="admin-content">

      <!-- Stat cards -->
      <div class="dash-section-label">Notification Overview</div>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card total m-0">
            <div class="stat-icon"><i class="bi bi-bell-fill"></i></div>
            <div class="stat-info"><h4 id="notif-stat-total">0</h4><p>Total</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card occupied m-0">
            <div class="stat-icon"><i class="bi bi-envelope-exclamation-fill"></i></div>
            <div class="stat-info"><h4 id="notif-stat-unread">0</h4><p>Unread</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card danger m-0">
            <div class="stat-icon"><i class="bi bi-exclamation-octagon-fill"></i></div>
            <div class="stat-info"><h4 id="notif-stat-critical">0</h4><p>Critical</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card reserved m-0">
            <div class="stat-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
            <div class="stat-info"><h4 id="notif-stat-warning">0</h4><p>Warning</p></div>
          </div>
        </div>
      </div>

      <!-- Notification list -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="dash-section-label m-0">All Notifications</div>
        <button type="button" class="link-quiet-btn" id="btnMarkAllReadPage"><i class="bi bi-check2-all me-1"></i>Mark all as read</button>
      </div>
      <div class="psas-card">
        <div class="psas-toolbar" id="notifToolbar">
          <div class="psas-toolbar-filters">
            <button type="button" class="psas-toolbar-filter active" data-filter="all">All</button>
            <button type="button" class="psas-toolbar-filter" data-filter="unread">Unread</button>
            <button type="button" class="psas-toolbar-filter" data-filter="parking">Parking</button>
            <button type="button" class="psas-toolbar-filter" data-filter="hardware">Hardware</button>
          </div>
          <div class="psas-toolbar-search">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Search notifications…" autocomplete="off" spellcheck="false">
          </div>
        </div>

        <div id="notifListBody"></div>

        <div class="psas-pagination">
          <span class="page-label" id="notifPageLabel">Page 1 of 1</span>
          <div class="d-flex gap-2">
            <button type="button" class="btn-psas-secondary" id="notifPrevBtn">Previous</button>
            <button type="button" class="btn-psas-secondary" id="notifNextBtn">Next</button>
          </div>
        </div>
      </div>

    </main>
  </div>
</div>

<!-- ── FRONTEND SIMULATION panel — dev/demo only, not a production feature ── -->
<?php require __DIR__ . '/../includes/admin/sim-panel.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="../includes/js/admin-global.js"></script>
<script src="../includes/js/admin/state.js"></script>
<script src="../includes/js/admin/sidebar.js"></script>
<script src="../includes/js/admin/header.js"></script>
<script src="../includes/js/admin/notifications.js"></script>
</body>
</html>