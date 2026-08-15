<?php
/**
 * PAGE: security-dashboard.php
 * PURPOSE: Main Security Dashboard for PSAS (Gate Checkpoint).
 * NOTE: Frontend demo layout. Contains simulated logic for RFID scanning and Zone Occupancy.
 */
session_start();
$page_title = "Security Dashboard | PSAS";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PSAS — Security Dashboard">
  <title><?= htmlspecialchars($page_title) ?></title>

  <!-- Bootstrap 5 CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <!-- Google Fonts: Inter + JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <!-- Dashboard Styles -->
  <link rel="stylesheet" href="../includes/css/dashboard.css">
  <style>
    /* Hard override: nullify any .stat-card border rules from shared style.css */
    .stat-card,
    .stat-card.occupied,
    .stat-card.available,
    .stat-card.total,
    .stat-card.reserved,
    .psas-card.stat-card,
    .psas-card.stat-card.occupied,
    .psas-card.stat-card.available,
    .psas-card.stat-card.total,
    .psas-card.stat-card.reserved {
      border: none !important;
      border-left: none !important;
      background: #ffffff !important;
      opacity: 1 !important;
    }
    .plate-badge {
      background: #F1F5F9 !important;
      color: #0B1E3D !important;
      border: 1px solid #CBD5E1 !important;
      font-family: 'JetBrains Mono', monospace !important;
      font-weight: 700 !important;
      letter-spacing: 0.1em !important;
    }
  </style>
</head>
<body>

<!-- ── Navbar ─────────────────────────────────────────────────────────────── -->
<nav class="dashboard-navbar">
  <div class="nav-brand-wrap">
    <div class="nav-logo"><i class="bi bi-p-circle-fill"></i></div>
    <div>
      <h1 class="nav-title">PSAS Security</h1>
      <div class="nav-subtitle">Gate 1 Checkpoint</div>
    </div>
  </div>

  <div class="nav-actions">
    <!-- Live shift indicator -->
    <div class="shift-status d-none d-md-flex">
      <span class="live-dot"></span>
      ON SHIFT
    </div>

    <!-- Notifications -->
    <div class="dropdown">
      <button class="notif-btn" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Notifications">
        <i class="bi bi-bell-fill"></i>
        <span class="notif-badge d-none" id="notif-count">0</span>
      </button>
      <div class="dropdown-menu dropdown-menu-end border-0 shadow-sm" style="width: 280px; border-radius: var(--radius-md); padding: 0; border: var(--border) !important;">
        <div class="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
          <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--slate);">Alerts</span>
          <a href="#" id="view-all-notifs" style="font-size: 0.72rem; color: var(--slate); font-weight: 600;">Clear all</a>
        </div>
        <div id="notif-list-container" style="max-height: 200px; overflow-y: auto;">
          <div class="text-center py-4 text-muted" id="no-notifs-msg" style="font-size: 0.8rem;">
            <i class="bi bi-bell-slash d-block mb-1" style="font-size: 1.2rem; color: var(--slate-light);"></i>
            No active alerts
          </div>
        </div>
      </div>
    </div>

    <!-- Staff profile -->
    <div class="dropdown">
      <div class="staff-profile" data-bs-toggle="dropdown" aria-expanded="false">
        <div class="text-end d-none d-md-block">
          <div style="font-size: 0.82rem; font-weight: 700;">Officer Reyes</div>
          <div style="font-size: 0.65rem; color: rgba(255,255,255,0.6); letter-spacing: 0.04em;">ID: SEC-2024</div>
        </div>
        <div class="staff-avatar">R</div>
      </div>
      <ul class="dropdown-menu dropdown-menu-end border-0 shadow-sm" style="border-radius: var(--radius-md); margin-top: 0.5rem;">
        <li><a class="dropdown-item" href="staff-settings.php" style="font-size: 0.85rem;"><i class="bi bi-gear me-2"></i>Settings</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item text-danger" href="#" style="font-size: 0.85rem;"><i class="bi bi-box-arrow-right me-2"></i>End Shift &amp; Logout</a></li>
      </ul>
    </div>
  </div>
</nav>

<!-- ── Main Content ────────────────────────────────────────────────────────── -->
<div class="container-xl py-4 px-3 px-md-4 mt-2">

  <!-- Stat Row — Occupied & Available are operator-critical, given more weight -->
  <div class="row g-3 mb-4">
    <div class="col-6 col-md-3">
      <div class="psas-card stat-card occupied p-3 m-0">
        <div class="stat-icon"><i class="bi bi-car-front-fill"></i></div>
        <div class="stat-info">
          <h4 id="stat-occupied">142</h4>
          <p>Parked Inside</p>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="psas-card stat-card available p-3 m-0">
        <div class="stat-icon"><i class="bi bi-p-square"></i></div>
        <div class="stat-info">
          <h4 id="stat-available">58</h4>
          <p>Available</p>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="psas-card stat-card total p-3 m-0">
        <div class="stat-icon"><i class="bi bi-arrow-down-right-circle-fill"></i></div>
        <div class="stat-info">
          <h4 id="sum-entries">385</h4>
          <p>Entries Today</p>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="psas-card stat-card reserved p-3 m-0">
        <div class="stat-icon"><i class="bi bi-arrow-up-right-circle-fill"></i></div>
        <div class="stat-info">
          <h4 id="sum-exits">243</h4>
          <p>Exits Today</p>
        </div>
      </div>
    </div>
  </div>

  <div class="row g-4 mb-4">

    <!-- Live RFID Scanner — signature element of the page -->
    <div class="col-lg-5">
      <div class="psas-card m-0" style="height: 100%;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="card-title-sm m-0"><i class="bi bi-upc-scan"></i> Live Scanner</h3>
          <span class="status-chip live"><i class="bi bi-broadcast-pin"></i> Active</span>
        </div>

        <!-- The Scanner Terminal -->
        <div class="scanner-box">
          <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--slate); margin-bottom: 0.875rem;">RFID / QR / BARCODE</div>
          <label for="rfid-input" class="visually-hidden">RFID Input</label>
          <input type="text" id="rfid-input" class="rfid-input mb-2" placeholder="SCAN OR ENTER UID" autocomplete="off" autofocus spellcheck="false">
          <div style="font-size: 0.68rem; color: var(--slate-light); margin-top: 0.5rem;">Press Enter to simulate physical scan</div>

          <button id="btn-nfc" class="btn btn-sm btn-outline-secondary mt-3 mx-auto d-flex align-items-center gap-1" style="font-size: 0.75rem; border-radius: var(--radius-sm);">
            <i class="bi bi-phone"></i> Simulate NFC Tap
          </button>
        </div>

        <!-- Scan Result Card — three states: hidden / valid / invalid -->
        <div id="scan-result" class="scan-result-card">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span id="detected-action-badge" class="status-chip entry">ENTRY</span>
            <span style="font-size: 0.72rem; font-weight: 600; color: var(--slate);" id="lbl-action">Entry</span>
          </div>

          <div class="result-header">
            <img id="res-photo" src="https://placehold.co/100x100/1D3A63/FFFFFF?text=?" alt="Driver" class="driver-photo">
            <div class="driver-info">
              <h5 id="res-name">Driver Name</h5>
              <div class="d-flex align-items-center gap-2 mt-1 flex-wrap">
                <span id="res-role" class="status-chip student">Role</span>
                <span id="res-plate" class="plate-badge">ABC-1234</span>
              </div>
            </div>
          </div>

          <div id="res-status-box" class="status-box">
            <i id="res-status-icon" class="bi bi-check-circle-fill text-success"></i>
            <span id="res-status-text" style="color: #15803D;">Permit Valid — Ready</span>
          </div>

          <div class="d-flex gap-2 mt-1">
            <button onclick="approveScan()" class="btn-psas-primary flex-grow-1"><i class="bi bi-check2-circle"></i> Approve</button>
            <button onclick="denyScan()" class="btn-psas-danger flex-grow-1"><i class="bi bi-x-circle"></i> Deny</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Zone Occupancy Overview -->
    <div class="col-lg-7">
      <div class="psas-card m-0" id="zoneOccupancyCard" style="height: 100%;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 class="card-title-sm m-0"><i class="bi bi-diagram-3"></i> Zone Occupancy</h3>
            <div style="font-size: 0.75rem; color: var(--slate); margin-top: 3px;">Live counts from scanned entries and exits</div>
          </div>
        </div>

        <!-- Zone cards injected via renderZoneCards() -->
        <div class="row g-3 flex-grow-1" id="zoneCardsContainer"></div>

        <div class="mt-4 pt-3 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div style="font-size: 0.73rem; color: var(--slate);">
            <i class="bi bi-arrow-up-right text-success fw-bold"></i>
            <span id="zoneTrendText">23 entries today · +5 vs yesterday</span>
          </div>
          <div class="d-flex gap-3" style="font-size: 0.72rem; font-weight: 700;">
            <span style="color: var(--green);"><i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i>Normal</span>
            <span style="color: var(--amber);"><i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i>Near Full</span>
            <span style="color: var(--danger);"><i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i>Full</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Activity Log -->
  <div class="psas-card m-0">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="card-title-sm m-0"><i class="bi bi-list-ul"></i> Activity Log</h3>
      <div class="d-flex flex-column align-items-end gap-1">
        <span style="font-size: 0.7rem; color: var(--slate-light); font-weight: 600;">Showing latest 10 · newest first</span>
        <button id="btn-view-all-logs" class="btn btn-sm" data-bs-toggle="modal" data-bs-target="#allLogsModal"
          style="font-size: 0.7rem; font-weight: 700; color: var(--green); border: none; background: none; padding: 0; display: flex; align-items: center; gap: 0.3rem;">
          <i class="bi bi-arrow-up-right-square"></i> View all logs
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table-psas">
        <thead>
          <tr>
            <th>Time</th>
            <th>Plate No.</th>
            <th>Driver</th>
            <th>Role</th>
            <th>Action</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody id="log-tbody">
          <tr class="empty-state-row" id="log-empty-state">
            <td colspan="6">
              <i class="bi bi-arrow-down-right-circle empty-icon"></i>
              <span class="empty-label">No scans logged yet this shift</span>
              <span class="empty-hint">Entries and exits will appear here as you scan</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</div>

<!-- ── All Logs Modal ──────────────────────────────────────────────────────── -->
<div class="modal fade" id="allLogsModal" tabindex="-1" aria-labelledby="allLogsModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-scrollable">
    <div class="modal-content" style="border: none; border-radius: var(--radius-lg); overflow: hidden;">

      <div class="modal-header" style="background: var(--navy); border-bottom: none; padding: 1rem 1.5rem;">
        <div>
          <h5 class="modal-title" id="allLogsModalLabel" style="font-family: var(--font); color: var(--white); font-weight: 700; font-size: 0.95rem; margin: 0;">
            <i class="bi bi-list-ul me-2"></i>Full Activity Log
          </h5>
          <div style="font-size: 0.65rem; color: var(--slate-light); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px;">
            This shift · <span id="modal-log-count">0</span> entries total
          </div>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body p-0">
        <!-- Search & Filter Bar -->
        <div style="padding: 0.875rem 1.5rem; border-bottom: 1px solid var(--ice-dark); display: flex; align-items: center; gap: 0.75rem; background: var(--white);">
          <div style="position: relative; flex: 1; max-width: 280px;">
            <i class="bi bi-search" style="position: absolute; left: 0.625rem; top: 50%; transform: translateY(-50%); color: var(--slate-light); font-size: 0.8rem;"></i>
            <input type="text" id="modal-log-search" placeholder="Search plate, driver…"
              style="width: 100%; border: var(--border); border-radius: var(--radius-sm); padding: 0.45rem 0.75rem 0.45rem 2rem; font-family: var(--font); font-size: 0.82rem; outline: none; color: var(--text-main);">
          </div>
          <select id="modal-log-filter-action" style="border: var(--border); border-radius: var(--radius-sm); padding: 0.45rem 0.75rem; font-family: var(--font); font-size: 0.82rem; color: var(--text-main); outline: none;">
            <option value="">All Actions</option>
            <option value="entry">Entry</option>
            <option value="exit">Exit</option>
          </select>
          <select id="modal-log-filter-result" style="border: var(--border); border-radius: var(--radius-sm); padding: 0.45rem 0.75rem; font-family: var(--font); font-size: 0.82rem; color: var(--text-main); outline: none;">
            <option value="">All Results</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
        </div>

        <!-- Full Log Table -->
        <div style="overflow-y: auto; max-height: 60vh;">
          <table class="table-psas" style="width: 100%;">
            <thead>
              <tr>
                <th style="position: sticky; top: 0; z-index: 10; background: var(--white);">#</th>
                <th style="position: sticky; top: 0; z-index: 10; background: var(--white);">Time</th>
                <th style="position: sticky; top: 0; z-index: 10; background: var(--white);">Plate No.</th>
                <th style="position: sticky; top: 0; z-index: 10; background: var(--white);">Driver</th>
                <th style="position: sticky; top: 0; z-index: 10; background: var(--white);">Role</th>
                <th style="position: sticky; top: 0; z-index: 10; background: var(--white);">Action</th>
                <th style="position: sticky; top: 0; z-index: 10; background: var(--white);">Result</th>
              </tr>
            </thead>
            <tbody id="modal-log-tbody">
              <tr class="empty-state-row">
                <td colspan="7">
                  <i class="bi bi-arrow-down-right-circle empty-icon"></i>
                  <span class="empty-label">No activity yet this shift</span>
                  <span class="empty-hint">Entries and exits will appear here as you scan</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-footer" style="border-top: 1px solid var(--ice-dark); padding: 0.75rem 1.5rem; background: var(--white); justify-content: space-between;">
        <span id="modal-log-filtered-count" style="font-size: 0.75rem; color: var(--slate); font-weight: 600;"></span>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal"
          style="font-size: 0.8rem; border-radius: var(--radius-sm); font-weight: 600;">Close</button>
      </div>

    </div>
  </div>
</div>

<!-- Toast Container -->
<div class="toast-container" id="toastContainer"></div>

<!-- Bootstrap 5 JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<!-- Dashboard Logic -->
<script src="../includes/js/dashboard.js"></script>

</body>
</html>