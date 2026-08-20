<?php
/**
 * COMPONENT: includes/admin/sim-panel.php
 * PURPOSE:   Global "Frontend Simulation" widget — dev/demo aid only, not a
 *            production feature. Lets any Admin page trigger vehicle
 *            entry/exit, hardware failure/resolve, and a full state reset
 *            against the shared PSAS.state store (admin-state.js), so
 *            listing pages (Parking / Vehicles / Accounts) can be watched
 *            updating live, same as the Dashboard.
 *
 * USAGE:
 *   require '../includes/admin/sim-panel.php';
 *   (place just before the closing </body> scripts, same position on
 *   every page)
 *
 * JS:
 *   Wired up by PSASUI.initSimPanel() in includes/js/admin-global.js —
 *   call that once from each page's own script after admin-state.js and
 *   admin-global.js are loaded. Never duplicate this markup or its wiring
 *   per-page; edit this file and admin-global.js instead.
 */
?>
<div class="sim-panel-wrap">
  <button type="button" class="sim-panel-toggle" id="simPanelToggle" aria-expanded="false" aria-controls="simPanel">
    <i class="bi bi-sliders"></i> Frontend Simulation
  </button>
  <div class="sim-panel" id="simPanel">
    <div class="sim-panel-title"><i class="bi bi-flask"></i> Frontend Simulation</div>

    <div class="sim-group">
      <label for="simEntryPlate">Simulate Vehicle Entry</label>
      <input type="text" id="simEntryPlate" placeholder="Plate number (optional)">
      <button type="button" class="sim-btn primary btn-block" id="simEntryBtn">Simulate Entry</button>
    </div>

    <div class="sim-group">
      <label for="simExitPlateSelect">Simulate Vehicle Exit</label>
      <select id="simExitPlateSelect"><option value="">Select vehicle inside…</option></select>
      <button type="button" class="sim-btn primary btn-block" id="simExitBtn">Simulate Exit</button>
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
    <button type="button" class="sim-btn btn-block" id="simResetBtn">Reset Simulation</button>

    <div class="sim-feedback d-none" id="simFeedback"></div>
  </div>
</div>