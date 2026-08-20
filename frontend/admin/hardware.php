<?php
/**
 * PAGE: admin-hardware.php
 * PURPOSE: Hardware Monitoring for PSAS Admin — every RFID reader, parking
 *          sensor, and gate controller with live status, plus per-item
 *          Trigger Failure / Mark Resolved actions and recent
 *          hardware-related alerts. Backed by the same PSAS.state.hardware
 *          store (admin-state.js) the Dashboard's System Health card and
 *          System Status dropdown read.
 * SCOPE: Frontend only. Mock data — see includes/js/admin-state.js for
 *        clearly labeled FUTURE API placeholders.
 */
session_start();
$page_title      = "Hardware Monitoring | PSAS";
$active_nav      = "hardware";
$page_heading    = "Hardware Monitoring";
$page_subheading = "RFID readers, sensors, and gate controllers — live status";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PSAS — Hardware Monitoring">
  <title><?= htmlspecialchars($page_title) ?></title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <!-- admin-hardware.css imports admin-global.css (tokens/shell/shared UI), which imports sidebar.css -->
  <link rel="stylesheet" href="../includes/css/admin/hardware.css">
</head>
<body>

<div class="admin-shell">

  <?php require __DIR__ . '/../includes/admin/sidebar.php'; ?>

  <div class="admin-main">

    <?php require __DIR__ . '/../includes/admin/header.php'; ?>

    <main class="admin-content">

      <!-- Stat cards -->
      <div class="dash-section-label">Hardware Overview</div>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card total m-0">
            <div class="stat-icon"><i class="bi bi-hdd-network-fill"></i></div>
            <div class="stat-info"><h4 id="hw-stat-total">0</h4><p>Total Components</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card active m-0">
            <div class="stat-icon"><i class="bi bi-wifi"></i></div>
            <div class="stat-info"><h4 id="hw-stat-online">0</h4><p>Online</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card reserved m-0">
            <div class="stat-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
            <div class="stat-info"><h4 id="hw-stat-warning">0</h4><p>Warning</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card danger m-0">
            <div class="stat-icon"><i class="bi bi-wifi-off"></i></div>
            <div class="stat-info"><h4 id="hw-stat-offline">0</h4><p>Offline</p></div>
          </div>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-lg-8">
          <!-- Hardware listing -->
          <div class="dash-section-label">All Hardware</div>
          <div class="psas-card">
            <div class="helper-text mb-3" id="hwStatusBanner">Checking hardware…</div>

            <div class="psas-toolbar" id="hardwareToolbar">
              <div class="psas-toolbar-filters">
                <button type="button" class="psas-toolbar-filter active" data-filter="all">All</button>
                <button type="button" class="psas-toolbar-filter" data-filter="online">Online</button>
                <button type="button" class="psas-toolbar-filter" data-filter="warning">Warning</button>
                <button type="button" class="psas-toolbar-filter" data-filter="offline">Offline</button>
              </div>
              <div class="psas-toolbar-search">
                <i class="bi bi-search"></i>
                <input type="text" placeholder="Search component, group…" autocomplete="off" spellcheck="false">
              </div>
            </div>

            <div class="table-responsive">
              <table class="table-psas">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Group</th>
                    <th>Status</th>
                    <th>Linked Space</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="hardwareTableBody"></tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="dash-section-label">Hardware Alerts</div>
          <div class="psas-card">
            <div id="hwAlertsList"></div>
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
<script src="../includes/js/admin/hardware.js"></script>
</body>
</html>