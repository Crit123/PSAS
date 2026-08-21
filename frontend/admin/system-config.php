<?php
/**
 * PAGE: admin-config.php
 * PURPOSE: System Configuration for PSAS Admin — general settings,
 *          notification preferences, hardware/monitoring intervals, and
 *          security options. Reads/writes PSAS.state.config
 *          (admin-state.js) through plain form controls; "Save Changes"
 *          and "Reset to Defaults" are the only two actions.
 * SCOPE: Frontend only. Mock data/persistence — see includes/js/
 *        admin-state.js for the clearly labeled FUTURE API placeholder
 *        (PATCH /api/admin/config). Nothing here writes to a backend.
 */
session_start();
$page_title      = "System Configuration | PSAS";
$active_nav      = "config";
$page_heading    = "System Configuration";
$page_subheading = "General, notification, hardware, and security settings";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PSAS — System Configuration">
  <title><?= htmlspecialchars($page_title) ?></title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <!-- admin-config.css imports admin-global.css (tokens/shell/shared UI), which imports sidebar.css -->
  <link rel="stylesheet" href="../includes/css/admin/system-config.css">
</head>
<body>

<div class="admin-shell">

  <?php require __DIR__ . '/../includes/admin/sidebar.php'; ?>

  <div class="admin-main">

    <?php require __DIR__ . '/../includes/admin/header.php'; ?>

    <main class="admin-content">

      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="dash-section-label m-0">Settings <span class="demo-tag">Simulated data</span></div>
        <div class="d-flex gap-2">
          <button type="button" class="btn-psas-secondary" id="btnResetConfig">Reset to Defaults</button>
          <button type="button" class="btn-psas-primary" id="btnSaveConfig"><i class="bi bi-check2"></i> Save Changes</button>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-6">

          <!-- General -->
          <div class="psas-card mb-4">
            <div class="settings-section-title"><i class="bi bi-building"></i> General</div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Organization Name</div>
                <div class="settings-row-hint">Shown in the topbar and on printed reports.</div>
              </div>
              <div class="settings-row-control">
                <input type="text" id="cfgOrgName" class="form-control-psas">
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Timezone</div>
                <div class="settings-row-hint">Used for the topbar clock and all logged timestamps.</div>
              </div>
              <div class="settings-row-control">
                <select id="cfgTimezone" class="form-select-psas">
                  <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                  <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="America/Los_Angeles">America/Los Angeles (GMT-8)</option>
                </select>
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Total Parking Capacity</div>
                <div class="settings-row-hint">Total number of managed spaces across all zones.</div>
              </div>
              <div class="settings-row-control">
                <input type="number" id="cfgTotalCapacity" class="form-control-psas narrow" min="0">
              </div>
            </div>
          </div>

          <!-- Hardware & Monitoring -->
          <div class="psas-card">
            <div class="settings-section-title"><i class="bi bi-hdd-network"></i> Hardware &amp; Monitoring</div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Hardware Polling Interval</div>
                <div class="settings-row-hint">How often (seconds) sensors and readers are checked for status changes.</div>
              </div>
              <div class="settings-row-control">
                <input type="number" id="cfgHardwarePolling" class="form-control-psas narrow" min="5">
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Gate Auto-Lock</div>
                <div class="settings-row-hint">Minutes of inactivity before a gate controller re-locks automatically.</div>
              </div>
              <div class="settings-row-control">
                <input type="number" id="cfgGateAutoLock" class="form-control-psas narrow" min="1">
              </div>
            </div>
          </div>

        </div>

        <div class="col-lg-6">

          <!-- Notifications -->
          <div class="psas-card mb-4">
            <div class="settings-section-title"><i class="bi bi-bell"></i> Notification Preferences</div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Email Alerts</div>
                <div class="settings-row-hint">Send an email whenever a new notification is created.</div>
              </div>
              <div class="settings-row-control">
                <label class="switch"><input type="checkbox" id="cfgNotifyEmail"><span class="switch-track"></span></label>
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">SMS Alerts</div>
                <div class="settings-row-hint">Send a text message for critical-level notifications.</div>
              </div>
              <div class="settings-row-control">
                <label class="switch"><input type="checkbox" id="cfgNotifySms"><span class="switch-track"></span></label>
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Critical Alerts Only</div>
                <div class="settings-row-hint">Suppress warning-level notifications from email/SMS delivery.</div>
              </div>
              <div class="settings-row-control">
                <label class="switch"><input type="checkbox" id="cfgNotifyCriticalOnly"><span class="switch-track"></span></label>
              </div>
            </div>
          </div>

          <!-- Security -->
          <div class="psas-card">
            <div class="settings-section-title"><i class="bi bi-shield-lock"></i> Security</div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Session Timeout</div>
                <div class="settings-row-hint">Minutes of inactivity before an Admin session signs out.</div>
              </div>
              <div class="settings-row-control">
                <input type="number" id="cfgSessionTimeout" class="form-control-psas narrow" min="5">
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Require Two-Factor Authentication</div>
                <div class="settings-row-hint">Require a second verification step for every Admin account.</div>
              </div>
              <div class="settings-row-control">
                <label class="switch"><input type="checkbox" id="cfgRequire2FA"><span class="switch-track"></span></label>
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Maintenance Mode</div>
                <div class="settings-row-hint">Show a maintenance banner and block new vehicle entries system-wide.</div>
              </div>
              <div class="settings-row-control">
                <label class="switch"><input type="checkbox" id="cfgMaintenanceMode"><span class="switch-track"></span></label>
              </div>
            </div>

            <div class="settings-danger-note d-none" id="cfgMaintenanceNote">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <span>Maintenance Mode will block new vehicle entries system-wide once saved. Staff-side entry will show a maintenance notice.</span>
            </div>
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
<script src="../includes/js/admin/system-config.js"></script>
</body>
</html>