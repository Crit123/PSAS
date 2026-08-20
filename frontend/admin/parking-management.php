<?php
/**
 * PAGE: admin-parking.php
 * PURPOSE: Parking Management for PSAS Admin — full space listing with
 *          filter/search/pagination, backed by the same PSAS.state store
 *          (admin-state.js) the Dashboard reads/writes.
 * SCOPE: Frontend only. Mock data — see includes/js/admin-state.js for
 *        clearly labeled FUTURE API placeholders.
 */
session_start();
$page_title      = "Parking Management | PSAS";
$active_nav      = "parking";
$page_heading    = "Parking Management";
$page_subheading = "Full space inventory — filter, search, and monitor status";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PSAS — Parking Management">
  <title><?= htmlspecialchars($page_title) ?></title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <!-- admin-parking.css imports admin-global.css (tokens/shell/shared UI), which imports sidebar.css -->
  <link rel="stylesheet" href="../includes/css/admin/parking.css">
</head>
<body>

<div class="admin-shell">

  <?php require __DIR__ . '/../includes/admin/sidebar.php'; ?>

  <div class="admin-main">

    <?php require __DIR__ . '/../includes/admin/header.php'; ?>

    <main class="admin-content">

      <!-- Stat cards -->
      <div class="dash-section-label">Space Overview</div>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card total m-0">
            <div class="stat-icon"><i class="bi bi-p-square-fill"></i></div>
            <div class="stat-info"><h4 id="pk-stat-total">0</h4><p>Total Spaces</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card available m-0">
            <div class="stat-icon"><i class="bi bi-check-circle-fill"></i></div>
            <div class="stat-info"><h4 id="pk-stat-available">0</h4><p>Available</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card occupied m-0">
            <div class="stat-icon"><i class="bi bi-car-front-fill"></i></div>
            <div class="stat-info"><h4 id="pk-stat-occupied">0</h4><p>Occupied</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card reserved m-0">
            <div class="stat-icon"><i class="bi bi-bookmark-star-fill"></i></div>
            <div class="stat-info"><h4 id="pk-stat-reserved">0</h4><p>Reserved</p></div>
          </div>
        </div>
      </div>

      <!-- Occupancy -->
      <div class="dash-section-label">Occupancy</div>
      <div class="psas-card mb-4">
        <div class="util-bar-track mb-2"><div class="util-bar-fill" id="pkUtilBarFill" style="width:0%;"></div></div>
        <div class="util-bar-label" id="pkUtilBarLabel">Calculating…</div>
      </div>

      <!-- Space listing -->
      <div class="dash-section-label">All Parking Spaces</div>
      <div class="psas-card">
        <div class="psas-toolbar" id="parkingToolbar">
          <div class="psas-toolbar-filters">
            <button type="button" class="psas-toolbar-filter active" data-filter="all">All</button>
            <button type="button" class="psas-toolbar-filter" data-filter="available">Available</button>
            <button type="button" class="psas-toolbar-filter" data-filter="occupied">Occupied</button>
            <button type="button" class="psas-toolbar-filter" data-filter="reserved">Reserved</button>
            <button type="button" class="psas-toolbar-filter" data-filter="unknown">Unknown</button>
          </div>
          <div class="psas-toolbar-search">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Search space, zone, plate…" autocomplete="off" spellcheck="false">
          </div>
        </div>

        <div class="table-responsive">
          <table class="table-psas">
            <thead>
              <tr>
                <th>Space</th>
                <th>Zone</th>
                <th>Status</th>
                <th>Plate</th>
                <th>Since</th>
              </tr>
            </thead>
            <tbody id="parkingTableBody"></tbody>
          </table>
        </div>

        <div class="psas-pagination">
          <span class="page-label" id="parkingPageLabel">Page 1 of 1</span>
          <div class="d-flex gap-2">
            <button type="button" class="btn-psas-secondary" id="parkingPrevBtn">Previous</button>
            <button type="button" class="btn-psas-secondary" id="parkingNextBtn">Next</button>
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
<script src="../includes/js/admin/parking.js"></script>
</body>
</html>s