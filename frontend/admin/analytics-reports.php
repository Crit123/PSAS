<?php
/**
 * PAGE: admin-reports.php
 * PURPOSE: Reports & Analytics for PSAS Admin — key metrics, per-zone
 *          occupancy, a 7-day entries/exits trend, and an activity-type
 *          breakdown. Charts are plain CSS bars (no external chart
 *          library) built on the chart-bar and chart-grouped classes in
 *          includes/css/admin-global.css.
 * SCOPE: Frontend only. Mock data — see includes/js/admin-state.js for
 *        clearly labeled FUTURE API placeholders (weeklyTrend is seeded
 *        mock data; everything else derives from the live PSAS.state).
 */
session_start();
$page_title      = "Reports & Analytics | PSAS";
$active_nav      = "reports";
$page_heading    = "Reports & Analytics";
$page_subheading = "System-wide metrics and trends";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PSAS — Reports & Analytics">
  <title><?= htmlspecialchars($page_title) ?></title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <!-- admin-reports.css imports admin-global.css (tokens/shell/shared UI + chart classes), which imports sidebar.css -->
  <link rel="stylesheet" href="../includes/css/admin/analytics-reports.css">
</head>
<body>

<div class="admin-shell">

  <?php require __DIR__ . '/../includes/admin/sidebar.php'; ?>

  <div class="admin-main">

    <?php require __DIR__ . '/../includes/admin/header.php'; ?>

    <main class="admin-content">

      <!-- Key metrics -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="dash-section-label m-0">Key Metrics</div>
        <button type="button" class="btn-psas-primary" id="btnPrintReport"><i class="bi bi-printer"></i> Print Report</button>
      </div>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card available m-0">
            <div class="stat-icon"><i class="bi bi-arrow-down-right-circle-fill"></i></div>
            <div class="stat-info"><h4 id="rep-stat-entries">0</h4><p>Entries Today</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card reserved m-0">
            <div class="stat-icon"><i class="bi bi-arrow-up-right-circle-fill"></i></div>
            <div class="stat-info"><h4 id="rep-stat-exits">0</h4><p>Exits Today</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card occupied m-0">
            <div class="stat-icon"><i class="bi bi-speedometer"></i></div>
            <div class="stat-info"><h4 id="rep-stat-occupancy">0%</h4><p>Current Occupancy</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card total m-0">
            <div class="stat-icon"><i class="bi bi-hdd-network-fill"></i></div>
            <div class="stat-info"><h4 id="rep-stat-uptime">0%</h4><p>Hardware Uptime</p></div>
          </div>
        </div>
      </div>

      <!-- Weekly trend + Zone occupancy -->
      <div class="row g-4 mb-4">
        <div class="col-lg-7">
          <div class="psas-card m-0 h-100">
            <div class="report-card-title">
              <h3 class="card-title-sm m-0"><i class="bi bi-graph-up"></i> Weekly Entries vs Exits <span class="demo-tag">Simulated data</span></h3>
              <div class="chart-legend">
                <span class="chart-legend-item"><span class="chart-legend-dot entries"></span>Entries</span>
                <span class="chart-legend-item"><span class="chart-legend-dot exits"></span>Exits</span>
              </div>
            </div>
            <div class="chart-grouped" id="weeklyChart"></div>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="psas-card m-0 h-100">
            <h3 class="card-title-sm mb-3"><i class="bi bi-grid-3x3-gap"></i> Occupancy by Zone</h3>
            <div id="zoneChart"></div>
          </div>
        </div>
      </div>

      <!-- Activity breakdown -->
      <div class="dash-section-label">Activity Breakdown</div>
      <div class="psas-card">
        <h3 class="card-title-sm mb-3"><i class="bi bi-list-ul"></i> Logged Events by Type <span class="demo-tag">Simulated data</span></h3>
        <div id="activityBreakdownChart"></div>
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
<script src="../includes/js/admin/analytics-reports.js"></script>
</body>
</html>