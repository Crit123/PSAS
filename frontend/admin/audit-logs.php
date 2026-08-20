<?php
/**
 * PAGE: admin-logs.php
 * PURPOSE: Activity & Audit Logs for PSAS Admin — the canonical, unabridged
 *          version of the Vehicle Entry / Vehicle Exit / Hardware Failure
 *          log the Dashboard's "Recent Activity" card previews. Backed by
 *          the same PSAS.state.activity store (admin-state.js).
 * SCOPE: Frontend only. Mock data — see includes/js/admin-state.js for
 *        clearly labeled FUTURE API placeholders.
 */
session_start();
$page_title      = "Activity & Audit Logs | PSAS";
$active_nav      = "logs";
$page_heading    = "Activity & Audit Logs";
$page_subheading = "Full operational log — filter, search, and review history";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PSAS — Activity & Audit Logs">
  <title><?= htmlspecialchars($page_title) ?></title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <!-- admin-logs.css imports admin-global.css (tokens/shell/shared UI), which imports sidebar.css -->
  <link rel="stylesheet" href="../includes/css/admin/audit-logs.css">
</head>
<body>

<div class="admin-shell">

  <?php require __DIR__ . '/../includes/admin/sidebar.php'; ?>

  <div class="admin-main">

    <?php require __DIR__ . '/../includes/admin/header.php'; ?>

    <main class="admin-content">

      <!-- Stat cards -->
      <div class="dash-section-label">Log Overview</div>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card total m-0">
            <div class="stat-icon"><i class="bi bi-list-ul"></i></div>
            <div class="stat-info"><h4 id="log-stat-total">0</h4><p>Total Events</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card available m-0">
            <div class="stat-icon"><i class="bi bi-arrow-down-right-circle-fill"></i></div>
            <div class="stat-info"><h4 id="log-stat-entries">0</h4><p>Vehicle Entries</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card reserved m-0">
            <div class="stat-icon"><i class="bi bi-arrow-up-right-circle-fill"></i></div>
            <div class="stat-info"><h4 id="log-stat-exits">0</h4><p>Vehicle Exits</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card danger m-0">
            <div class="stat-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
            <div class="stat-info"><h4 id="log-stat-failures">0</h4><p>Hardware Failures</p></div>
          </div>
        </div>
      </div>

      <!-- Log listing -->
      <div class="dash-section-label">Full Activity Log <span class="demo-tag">Simulated data</span></div>
      <div class="psas-card">
        <div class="psas-toolbar" id="logsToolbar">
          <div class="psas-toolbar-filters">
            <button type="button" class="psas-toolbar-filter active" data-filter="all">All</button>
            <button type="button" class="psas-toolbar-filter" data-filter="entry">Vehicle Entry</button>
            <button type="button" class="psas-toolbar-filter" data-filter="exit">Vehicle Exit</button>
            <button type="button" class="psas-toolbar-filter" data-filter="hardware_failure">Hardware Failure</button>
          </div>
          <div class="psas-toolbar-search">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Search plate, space, description…" autocomplete="off" spellcheck="false">
          </div>
        </div>

        <div class="table-responsive">
          <table class="table-psas">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Vehicle</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody id="logsTableBody"></tbody>
          </table>
        </div>

        <div class="psas-pagination">
          <span class="page-label" id="logsPageLabel">Page 1 of 1</span>
          <div class="d-flex gap-2">
            <button type="button" class="btn-psas-secondary" id="logsPrevBtn">Previous</button>
            <button type="button" class="btn-psas-secondary" id="logsNextBtn">Next</button>
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
<script src="../includes/js/admin/audit-logs.js"></script>
</body>
</html>