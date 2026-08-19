<?php
/**
 * PAGE: admin-dashboard.php
 * PURPOSE: Main Admin Dashboard (Overview) for PSAS.
 * SCOPE: Frontend only. Mock data throughout — see includes/js/admin-dashboard.js
 *        for clearly labeled FUTURE API placeholders.
 * NOTE: The sidebar shell shared by every Admin module now lives in
 *       includes/admin/sidebar.php (see that file for how future pages —
 *       Parking Management, Vehicle Records, User & Account Management,
 *       etc. — should include it). This file stays focused on dashboard
 *       content only.
 */
session_start();
$page_title      = "Admin Dashboard | PSAS";
$active_nav      = "dashboard";
$page_heading    = "Dashboard Overview";
$page_subheading = "System-wide monitoring and status";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PSAS — Admin Dashboard">
  <title><?= htmlspecialchars($page_title) ?></title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <!-- admin-dashboard.css imports assets/css/admin/sidebar.css -->
  <link rel="stylesheet" href="../includes/css/admin-dashboard.css">
</head>
<body>

<div class="admin-shell">

  <?php require __DIR__ . '/../includes/admin/sidebar.php'; ?>

  <!-- ── Main column ─────────────────────────────────────────────────────── -->
  <div class="admin-main">

    <?php require __DIR__ . '/../includes/admin/header.php'; ?>

    <!-- Content -->
    <main class="admin-content">

      <!-- 1. System Overview — Statistics (click a card to drill down) -->
      <div class="dash-section-label">System Overview</div>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card total clickable m-0" data-drilldown-status="" data-drilldown-label="All Parking Spaces" role="button" tabindex="0">
            <div class="stat-icon"><i class="bi bi-p-square-fill"></i></div>
            <div class="stat-info"><h4 id="stat-total">0</h4><p>Total Spaces</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card available clickable m-0" data-drilldown-status="available" data-drilldown-label="Available Parking Spaces" role="button" tabindex="0">
            <div class="stat-icon"><i class="bi bi-check-circle-fill"></i></div>
            <div class="stat-info"><h4 id="stat-available">0</h4><p>Available</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card occupied clickable m-0" data-drilldown-status="occupied" data-drilldown-label="Occupied Parking Spaces" role="button" tabindex="0">
            <div class="stat-icon"><i class="bi bi-car-front-fill"></i></div>
            <div class="stat-info"><h4 id="stat-occupied">0</h4><p>Occupied</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card reserved clickable m-0" data-drilldown-status="reserved" data-drilldown-label="Reserved Parking Spaces" role="button" tabindex="0">
            <div class="stat-icon"><i class="bi bi-bookmark-star-fill"></i></div>
            <div class="stat-info"><h4 id="stat-reserved">0</h4><p>Reserved</p></div>
          </div>
        </div>
      </div>

      <!-- 2. Parking Status — Utilization + Alerts -->
      <div class="row g-4 mb-4">
        <div class="col-lg-7">
          <div class="psas-card m-0" style="height:100%;">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h3 class="card-title-sm m-0"><i class="bi bi-speedometer"></i> Parking Occupancy</h3>
              <span class="demo-tag">Simulated data</span>
            </div>
            <div class="util-bar-track mb-2"><div class="util-bar-fill" id="utilBarFill" style="width:0%;"></div></div>
            <div class="util-bar-label" id="utilBarLabel">Calculating…</div>

            <div class="row g-3 mt-3">
              <div class="col-6">
                <div class="mini-tile">
                  <div class="mini-tile-header">
                    <span class="mini-tile-title"><i class="bi bi-arrow-down-right-circle-fill" style="color:var(--green);margin-right:4px;"></i>Entries Today</span>
                  </div>
                  <div class="mini-tile-value" id="stat-entries-today">0</div>
                </div>
              </div>
              <div class="col-6">
                <div class="mini-tile">
                  <div class="mini-tile-header">
                    <span class="mini-tile-title"><i class="bi bi-arrow-up-right-circle-fill" style="color:var(--amber);margin-right:4px;"></i>Exits Today</span>
                  </div>
                  <div class="mini-tile-value" id="stat-exits-today">0</div>
                </div>
              </div>
            </div>

            <div class="mt-3 pt-3" style="border-top:1px solid var(--ice-dark);font-size:0.8rem;color:var(--slate);">
              <i class="bi bi-car-front"></i> <strong id="stat-current-vehicles" style="color:var(--navy);">0</strong> vehicles currently inside the parking area
            </div>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="psas-card m-0" style="height:100%;">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h3 class="card-title-sm m-0"><i class="bi bi-exclamation-triangle-fill"></i> Alerts</h3>
              <a href="admin-notifications.php" class="link-quiet">View all</a>
            </div>
            <div id="alertsList"></div>
          </div>
        </div>
      </div>

      <!-- 3 & 4. System Health + Recent Activity -->
      <div class="row g-4 mb-4">
        <div class="col-lg-5">
          <div class="psas-card m-0" style="height:100%;">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <h3 class="card-title-sm m-0"><i class="bi bi-hdd-network-fill"></i> System Health</h3>
              <a href="admin-hardware.php" class="link-quiet">Details</a>
            </div>
            <div style="font-size:0.78rem;color:var(--slate);margin-bottom:0.9rem;" id="hardwareSummaryLabel">Checking hardware…</div>
            <div class="d-flex flex-column gap-2" id="hardwareStatusGrid"></div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="psas-card m-0">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h3 class="card-title-sm m-0"><i class="bi bi-list-ul"></i> Recent Activity <span class="demo-tag">Simulated data</span></h3>
              <div class="d-flex align-items-center gap-3">
                <button type="button" class="link-quiet-btn" id="btnViewAllActivity">View all activity</button>
                <a href="admin-logs.php" class="link-quiet">Full log module</a>
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
                <tbody id="recentActivityBody"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</div>

<!-- ── Parking Drilldown Modal (dashboard-level overview only) ─────────────── -->
<div class="modal fade" id="parkingDrilldownModal" tabindex="-1" aria-labelledby="parkingDrilldownTitle" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content psas-modal-content">
      <div class="modal-header psas-modal-header">
        <div>
          <h5 class="modal-title psas-modal-title" id="parkingDrilldownTitle"><i class="bi bi-grid-3x3-gap me-2"></i>Parking Spaces</h5>
          <div class="psas-modal-eyebrow">Dashboard overview · Full management tools live in Parking Management</div>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body p-0" id="parkingDrilldownBody"></div>
      <div class="psas-modal-footer" style="justify-content:flex-end;">
        <button type="button" class="btn-psas-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<!-- ── View All Activity Modal ──────────────────────────────────────────────── -->
<div class="modal fade" id="activityModal" tabindex="-1" aria-labelledby="activityModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-scrollable">
    <div class="modal-content psas-modal-content">
      <div class="modal-header psas-modal-header">
        <div>
          <h5 class="modal-title psas-modal-title" id="activityModalTitle"><i class="bi bi-list-ul me-2"></i>Full Activity Log</h5>
          <div class="psas-modal-eyebrow">Vehicle Entry · Vehicle Exit · Hardware Failure</div>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="activity-modal-toolbar">
        <div class="activity-modal-filters">
          <button type="button" class="activity-modal-filter active" data-filter="all">All</button>
          <button type="button" class="activity-modal-filter" data-filter="entry">Vehicle Entry</button>
          <button type="button" class="activity-modal-filter" data-filter="exit">Vehicle Exit</button>
          <button type="button" class="activity-modal-filter" data-filter="hardware_failure">Hardware Failure</button>
        </div>
        <div class="activity-modal-search-wrap">
          <i class="bi bi-search"></i>
          <input type="text" id="activityModalSearch" placeholder="Search plate, space…" autocomplete="off">
        </div>
      </div>

      <div class="modal-body p-0">
        <div class="activity-modal-table-wrap">
          <table class="table-psas">
            <thead><tr><th>Time</th><th>Event</th><th>Vehicle</th><th>Description</th></tr></thead>
            <tbody id="activityModalBody"></tbody>
          </table>
        </div>
        <div class="activity-modal-pagination">
          <span class="page-label" id="activityModalPageLabel">Page 1 of 1</span>
          <div class="d-flex gap-2">
            <button type="button" class="btn-psas-secondary" id="activityModalPrev">Previous</button>
            <button type="button" class="btn-psas-secondary" id="activityModalNext">Next</button>
          </div>
        </div>
      </div>

      <div class="psas-modal-footer" style="justify-content:flex-end;">
        <button type="button" class="btn-psas-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<!-- ── FRONTEND SIMULATION panel — dev/demo only, not a production feature ── -->
<div class="sim-panel-wrap">
  <button type="button" class="sim-panel-toggle" id="simPanelToggle" aria-expanded="false" aria-controls="simPanel">
    <i class="bi bi-sliders"></i> Frontend Simulation
  </button>
  <div class="sim-panel" id="simPanel">
    <div class="sim-panel-title"><i class="bi bi-flask"></i> Frontend Simulation</div>

    <div class="sim-group">
      <label for="simEntryPlate">Simulate Vehicle Entry</label>
      <input type="text" id="simEntryPlate" placeholder="Plate number (optional)">
      <button type="button" class="sim-btn primary" id="simEntryBtn" style="width:100%;">Simulate Entry</button>
    </div>

    <div class="sim-group">
      <label for="simExitPlateSelect">Simulate Vehicle Exit</label>
      <select id="simExitPlateSelect"><option value="">Select vehicle inside…</option></select>
      <button type="button" class="sim-btn primary" id="simExitBtn" style="width:100%;">Simulate Exit</button>
    </div>

    <div class="sim-divider"></div>

    <div class="sim-group">
      <label for="simHardwareSelect">Hardware Component</label>
      <select id="simHardwareSelect"><option value="">Select hardware…</option></select>
      <div class="sim-btn-row">
        <button type="button" class="sim-btn danger" id="simFailBtn">Trigger Failure</button>
        <button type="button" class="sim-btn" id="simResolveBtn">Mark Resolved</button>
      </div>
    </div>

    <div class="sim-divider"></div>
    <button type="button" class="sim-btn" id="simResetBtn" style="width:100%;">Reset Simulation</button>

    <div class="sim-feedback d-none" id="simFeedback"></div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="../includes/js/admin-state.js"></script>
<script src="../includes/js/sidebar.js"></script>
<script src="../includes/js/admin-header.js"></script>
<script src="../includes/js/admin-dashboard.js"></script>
</body>
</html>