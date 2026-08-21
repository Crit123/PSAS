/**
 * includes/js/admin-config.js
 * ============================================================================
 * PSAS ADMIN — System Configuration page logic
 * Reads/writes PSAS.state.config (admin-state.js) through plain form
 * inputs and toggle switches. "Save Changes" batches every field into one
 * PSAS.actions.updateConfig() call; "Reset to Defaults" calls
 * PSAS.actions.resetConfig(). Nothing here calls a real backend — see
 * admin-state.js's FUTURE note on the config slice. Shared helpers come
 * from window.PSASUI — see admin-global.js.
 * ============================================================================
 */
(function () {
  "use strict";

  // Field id -> config key, with a "checkbox" flag for toggles vs. text/number/select.
  const FIELDS = [
    { id: "cfgOrgName", key: "orgName", type: "text" },
    { id: "cfgTimezone", key: "timezone", type: "select" },
    { id: "cfgTotalCapacity", key: "totalCapacity", type: "number" },
    { id: "cfgGateAutoLock", key: "gateAutoLockMins", type: "number" },
    { id: "cfgNotifyEmail", key: "notifyEmailAlerts", type: "checkbox" },
    { id: "cfgNotifySms", key: "notifySmsAlerts", type: "checkbox" },
    { id: "cfgNotifyCriticalOnly", key: "notifyCriticalOnly", type: "checkbox" },
    { id: "cfgHardwarePolling", key: "hardwarePollingSec", type: "number" },
    { id: "cfgSessionTimeout", key: "sessionTimeoutMins", type: "number" },
    { id: "cfgRequire2FA", key: "require2FA", type: "checkbox" },
    { id: "cfgMaintenanceMode", key: "maintenanceMode", type: "checkbox" },
  ];

  // ── Populate form from state ─────────────────────────────────────────────
  function populateForm() {
    const cfg = PSAS.state.config;
    FIELDS.forEach(f => {
      const el = document.getElementById(f.id);
      if (!el) return;
      if (f.type === "checkbox") el.checked = !!cfg[f.key];
      else el.value = cfg[f.key];
    });
    updateMaintenanceNote();
  }

  function updateMaintenanceNote() {
    const note = document.getElementById("cfgMaintenanceNote");
    const checkbox = document.getElementById("cfgMaintenanceMode");
    if (note && checkbox) note.classList.toggle("d-none", !checkbox.checked);
  }

  // ── Collect form -> partial config object ────────────────────────────────
  function collectForm() {
    const partial = {};
    FIELDS.forEach(f => {
      const el = document.getElementById(f.id);
      if (!el) return;
      if (f.type === "checkbox") partial[f.key] = el.checked;
      else if (f.type === "number") partial[f.key] = Number(el.value) || 0;
      else partial[f.key] = el.value;
    });
    return partial;
  }

  function initForm() {
    const maintenanceCheckbox = document.getElementById("cfgMaintenanceMode");
    if (maintenanceCheckbox) maintenanceCheckbox.addEventListener("change", updateMaintenanceNote);

    const saveBtn = document.getElementById("btnSaveConfig");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        PSAS.actions.updateConfig(collectForm());
        PSASUI.showSimFeedback("Configuration saved.", false);
      });
    }

    const resetBtn = document.getElementById("btnResetConfig");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        PSAS.actions.resetConfig();
        PSASUI.showSimFeedback("Configuration reset to defaults.", false);
      });
    }
  }

  // ── Master render + subscription ─────────────────────────────────────────
  // Only re-populate the form from state when it wasn't this page's own
  // save/reset that triggered the change would be ideal, but since
  // populateForm() is idempotent and cheap, simplest is to just always
  // resync — the sim panel doesn't touch config, so no conflict in practice.
  function renderAll() {
    populateForm();
    PSASUI.refreshSimSelectors();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initForm();
    PSASUI.initSimPanel();
    renderAll();

    if (window.PSAS && PSAS.subscribe) PSAS.subscribe(renderAll);
  });
})();