/**
 * includes/js/admin-global.js
 * ============================================================================
 * PSAS ADMIN — Shared frontend utilities
 * Exposes window.PSASUI with helpers every Admin page script relies on:
 * HTML escaping, time formatting, and the "one open overlay at a time"
 * popover manager. Load this BEFORE admin-header.js and any page script
 * (admin-dashboard.js, admin-parking.js, admin-vehicles.js,
 * admin-accounts.js) — they all call into PSASUI instead of redefining
 * these locally, so behavior/formatting never drifts between pages.
 * ============================================================================
 */
(function (global) {
  "use strict";

  // ── HTML escaping ────────────────────────────────────────────────────────
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  // ── Time formatting ──────────────────────────────────────────────────────
  function fmtTime(iso) {
    try { return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); }
    catch (e) { return iso; }
  }

  function fmtDateTime(iso) {
    try {
      return new Date(iso).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch (e) { return iso; }
  }

  function relativeTime(iso) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.round(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // ── Popover manager ───────────────────────────────────────────────────────
  // Generic "one open overlay at a time" + outside-click + Escape-to-close
  // manager shared by every header popover AND any page-level dropdown
  // (e.g. row action menus on Parking/Vehicles/Accounts tables), so opening
  // one always closes any other and nothing needs to be wired up twice.
  const openPopovers = new Set();
  function registerPopover(panelEl, triggerEl, onClose) {
    function close() {
      if (!panelEl.classList.contains("open")) return;
      panelEl.classList.remove("open");
      triggerEl.setAttribute("aria-expanded", "false");
      openPopovers.delete(close);
      if (onClose) onClose();
    }
    function open() {
      openPopovers.forEach(fn => fn());
      panelEl.classList.add("open");
      triggerEl.setAttribute("aria-expanded", "true");
      openPopovers.add(close);
    }
    function toggle(e) {
      if (e) e.stopPropagation();
      panelEl.classList.contains("open") ? close() : open();
    }
    triggerEl.addEventListener("click", toggle);
    panelEl.addEventListener("click", e => e.stopPropagation());
    return { open, close };
  }
  function closeAllPopovers() { openPopovers.forEach(fn => fn()); }

  document.addEventListener("click", closeAllPopovers);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAllPopovers();
  });

  // ── Generic filter/search table-toolbar wiring ───────────────────────────
  // Shared by any page with a ".psas-toolbar-filter" pill row + a
  // ".psas-toolbar-search input" box (Parking / Vehicles / Accounts).
  // Calls onChange({ filter, search }) whenever either changes.
  function initToolbar(containerEl, onChange) {
    if (!containerEl) return { filter: "all", search: "" };
    const state = { filter: "all", search: "" };
    const filterBtns = containerEl.querySelectorAll(".psas-toolbar-filter");
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.filter = btn.dataset.filter || "all";
        onChange(state);
      });
    });
    const searchInput = containerEl.querySelector(".psas-toolbar-search input");
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.search = searchInput.value.trim();
          onChange(state);
        }, 120);
      });
    }
    return state;
  }

  // ── Simple client-side paginator ─────────────────────────────────────────
  // Shared pagination math so every listing page renders "Page X of Y ·
  // N records" and Prev/Next the same way.
  function paginate(items, page, pageSize) {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    return {
      page: safePage,
      totalPages,
      total: items.length,
      items: items.slice(start, start + pageSize),
    };
  }

  // ── Frontend Simulation Panel wiring ─────────────────────────────────────
  // Shared by every Admin page that ships the sim panel markup (see
  // includes/admin/sim-panel.php). Wires toggle, entry/exit, hardware
  // fail/resolve, and reset against PSAS.actions, plus the feedback toast
  // and the two live-populated <select> elements. Call once per page from
  // that page's DOMContentLoaded handler; call refreshSimSelectors() again
  // inside your PSAS.subscribe callback so the "vehicle inside" list stays
  // current after any state change.
  function showSimFeedback(msg, isError) {
    const el = document.getElementById("simFeedback");
    if (!el) return;
    el.textContent = msg;
    el.className = "sim-feedback" + (isError ? " error" : " success");
    el.classList.remove("d-none");
    clearTimeout(showSimFeedback._t);
    showSimFeedback._t = setTimeout(() => el.classList.add("d-none"), 3200);
  }

  function initSimPanel() {
    const toggle = document.getElementById("simPanelToggle");
    const panel = document.getElementById("simPanel");
    if (toggle && panel) {
      toggle.addEventListener("click", () => {
        const isOpen = panel.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    const entryBtn = document.getElementById("simEntryBtn");
    const entryInput = document.getElementById("simEntryPlate");
    if (entryBtn) {
      entryBtn.addEventListener("click", () => {
        const plate = (entryInput && entryInput.value) || `SIM-${Math.floor(1000 + Math.random() * 9000)}`;
        const res = PSAS.actions.simulateEntry(plate);
        if (res.ok) { showSimFeedback(`${plate.toUpperCase()} allocated to ${res.slot}.`, false); if (entryInput) entryInput.value = ""; }
        else showSimFeedback(res.error, true);
      });
    }

    const exitBtn = document.getElementById("simExitBtn");
    const exitSelect = document.getElementById("simExitPlateSelect");
    if (exitBtn) {
      exitBtn.addEventListener("click", () => {
        const plate = exitSelect ? exitSelect.value : "";
        if (!plate) { showSimFeedback("Select a vehicle currently inside first.", true); return; }
        const res = PSAS.actions.simulateExit(plate);
        if (res.ok) showSimFeedback(`${plate} exited from ${res.slot}.`, false);
        else showSimFeedback(res.error, true);
      });
    }

    const failBtn = document.getElementById("simFailBtn");
    const failSelect = document.getElementById("simHardwareSelect");
    if (failBtn) {
      failBtn.addEventListener("click", () => {
        const id = failSelect ? failSelect.value : "";
        if (!id) { showSimFeedback("Select a hardware component first.", true); return; }
        PSAS.actions.triggerHardwareFailure(id);
        showSimFeedback("Hardware failure triggered.", false);
      });
    }

    const resolveBtn = document.getElementById("simResolveBtn");
    if (resolveBtn) {
      resolveBtn.addEventListener("click", () => {
        const id = failSelect ? failSelect.value : "";
        if (!id) { showSimFeedback("Select a hardware component first.", true); return; }
        PSAS.actions.resolveHardware(id);
        showSimFeedback("Hardware marked resolved.", false);
      });
    }

    const resetBtn = document.getElementById("simResetBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        PSAS.actions.resetSimulation();
        showSimFeedback("Simulation state reset.", false);
      });
    }

    refreshSimSelectors();
  }

  function refreshSimSelectors() {
    const exitSelect = document.getElementById("simExitPlateSelect");
    if (exitSelect && window.PSAS) {
      const inside = Object.values(PSAS.state.vehicles).filter(v => v.status === "inside");
      const current = exitSelect.value;
      exitSelect.innerHTML = `<option value="">Select vehicle inside…</option>` +
        inside.map(v => `<option value="${escapeHtml(v.plate)}">${escapeHtml(v.plate)} — ${escapeHtml(v.slot)}</option>`).join("");
      if (inside.some(v => v.plate === current)) exitSelect.value = current;
    }
    const hwSelect = document.getElementById("simHardwareSelect");
    if (hwSelect && window.PSAS && !hwSelect.dataset.populated) {
      hwSelect.innerHTML = `<option value="">Select hardware…</option>` +
        PSAS.state.hardware.map(h => `<option value="${h.id}">${escapeHtml(h.name)}</option>`).join("");
      hwSelect.dataset.populated = "1";
    }
  }

  // ── Activity/event type metadata ─────────────────────────────────────────
  // Shared by Dashboard's Recent Activity + Activity modal AND the Activity
  // & Audit Logs page, so a "Vehicle Entry" row looks identical everywhere.
  const ACTIVITY_META = {
    entry:            { label: "Vehicle Entry",   icon: "bi-arrow-down-right-circle" },
    exit:             { label: "Vehicle Exit",     icon: "bi-arrow-up-right-circle" },
    hardware_failure: { label: "Hardware Failure", icon: "bi-exclamation-triangle" },
  };

  global.PSASUI = {
    escapeHtml,
    fmtTime,
    fmtDateTime,
    relativeTime,
    registerPopover,
    closeAllPopovers,
    initToolbar,
    paginate,
    initSimPanel,
    refreshSimSelectors,
    showSimFeedback,
    activityMeta: ACTIVITY_META,
  };
})(window);