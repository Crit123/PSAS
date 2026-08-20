<?php
/**
 * PAGE: admin-vehicles.php
 * PURPOSE: Vehicle Records for PSAS Admin — every vehicle that has entered
 *          this session (currently inside or already exited), backed by
 *          the same PSAS.state store (admin-state.js) the Dashboard's
 *          entry/exit simulation writes to.
 * SCOPE: Frontend only. Mock data — see includes/js/admin-state.js for
 *        clearly labeled FUTURE API placeholders.
 */
session_start();
$page_title      = "Vehicle Records | PSAS";
$active_nav      = "vehicles";
$page_heading    = "Vehicle Records";
$page_subheading = "Entry/exit history — filter, search, and monitor status";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PSAS — Vehicle Records">
  <title><?= htmlspecialchars($page_title) ?></title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <!-- admin-vehicles.css imports admin-global.css (tokens/shell/shared UI), which imports sidebar.css -->
  <link rel="stylesheet" href="../includes/css/admin-vehicles.css">
</head>
<body>

<div class="admin-shell">

  <?php require __DIR__ . '/../includes/admin/sidebar.php'; ?>

  <div class="admin-main">

    <?php require __DIR__ . '/../includes/admin/header.php'; ?>

    <main class="admin-content">

      <!-- Stat cards -->
      <div class="dash-section-label">Vehicle Overview</div>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card total m-0">
            <div class="stat-icon"><i class="bi bi-card-list"></i></div>
            <div class="stat-info"><h4 id="vr-stat-total">0</h4><p>Total Records</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card active m-0">
            <div class="stat-icon"><i class="bi bi-car-front-fill"></i></div>
            <div class="stat-info"><h4 id="vr-stat-inside">0</h4><p>Currently Inside</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card inactive m-0">
            <div class="stat-icon"><i class="bi bi-box-arrow-right"></i></div>
            <div class="stat-info"><h4 id="vr-stat-out">0</h4><p>Exited</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card m-0">
            <div class="stat-icon"><i class="bi bi-arrow-down-right-circle-fill"></i></div>
            <div class="stat-info"><h4 id="vr-stat-entries-today">0</h4><p>Entries Today</p></div>
          </div>
        </div>
      </div>

      <!-- Records listing -->
      <div class="dash-section-label">All Vehicle Records <span class="demo-tag">Simulated data</span></div>
      <div class="psas-card">
        <div class="psas-toolbar" id="vehiclesToolbar">
          <div class="psas-toolbar-filters">
            <button type="button" class="psas-toolbar-filter active" data-filter="all">All</button>
            <button type="button" class="psas-toolbar-filter" data-filter="inside">Currently Inside</button>
            <button type="button" class="psas-toolbar-filter" data-filter="out">Exited</button>
          </div>
          <div class="psas-toolbar-search">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Search plate, space…" autocomplete="off" spellcheck="false">
          </div>
        </div>

        <div class="table-responsive">
          <table class="table-psas">
            <thead>
              <tr>
                <th>Plate</th>
                <th>Space</th>
                <th>Status</th>
                <th>Entry Time</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody id="vehiclesTableBody"></tbody>
          </table>
        </div>

        <div class="psas-pagination">
          <span class="page-label" id="vehiclesPageLabel">Page 1 of 1</span>
          <div class="d-flex gap-2">
            <button type="button" class="btn-psas-secondary" id="vehiclesPrevBtn">Previous</button>
            <button type="button" class="btn-psas-secondary" id="vehiclesNextBtn">Next</button>
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
<script src="../includes/js/admin-state.js"></script>
<script src="../includes/js/sidebar.js"></script>
<script src="../includes/js/admin-header.js"></script>
<script src="../includes/js/admin-vehicles.js"></script>
</body>
</html>