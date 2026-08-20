/**
 * includes/js/admin-reports.js
 * ============================================================================
 * PSAS ADMIN — Reports & Analytics page logic
 * Reads PSAS.state (admin-state.js) and renders: key metric cards, a
 * per-zone occupancy chart, a 7-day entries/exits trend chart, and an
 * activity-type breakdown — all built with the dependency-free chart-bar
 * and chart-grouped classes in admin-global.css (no chart library added).
 * Shared helpers come from window.PSASUI.
 * ============================================================================
 */
(function () {
  "use strict";

  const { escapeHtml, activityMeta: ACTIVITY_META } = PSASUI;

  // ── Key metric cards ──────────────────────────────────────────────────────
  function renderMetrics() {
    const parking = PSAS.select.parkingSummary();
    const hardware = PSAS.select.hardwareSummary();
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setText("rep-stat-entries", PSAS.state.todayStats.entries);
    setText("rep-stat-exits", PSAS.state.todayStats.exits);
    const occPct = parking.total ? Math.round((parking.occupied / parking.total) * 100) : 0;
    setText("rep-stat-occupancy", occPct + "%");
    const uptimePct = PSAS.state.hardware.length
      ? Math.round(((PSAS.state.hardware.length - hardware.offline) / PSAS.state.hardware.length) * 100)
      : 100;
    setText("rep-stat-uptime", uptimePct + "%");
  }

  // ── Zone occupancy chart ──────────────────────────────────────────────────
  function renderZoneChart() {
    const el = document.getElementById("zoneChart");
    if (!el) return;
    const zones = PSAS.select.zoneBreakdown();
    if (!zones.length) {
      el.innerHTML = `<div class="state-block small"><i class="bi bi-bar-chart state-icon"></i><div class="state-label">No zone data</div></div>`;
      return;
    }
    el.innerHTML = zones.map(z => {
      const pct = z.total ? Math.round((z.occupied / z.total) * 100) : 0;
      const fillClass = pct >= 90 ? "" : pct >= 75 ? "amber" : "";
      return `
        <div class="chart-bar-row">
          <div class="chart-bar-label">${escapeHtml(z.zone)}</div>
          <div class="chart-bar-track"><div class="chart-bar-fill ${fillClass}" style="width:${pct}%;"></div></div>
          <div class="chart-bar-value">${pct}%</div>
        </div>`;
    }).join("");
  }

  // ── Weekly entries/exits trend chart ─────────────────────────────────────
  function renderWeeklyChart() {
    const el = document.getElementById("weeklyChart");
    if (!el) return;
    const trend = PSAS.select.weeklyTrend();
    const max = Math.max(1, ...trend.map(d => Math.max(d.entries, d.exits)));

    el.innerHTML = trend.map(d => {
      const entriesH = Math.round((d.entries / max) * 100);
      const exitsH = Math.round((d.exits / max) * 100);
      return `
        <div class="chart-grouped-col">
          <div class="chart-grouped-bars">
            <div class="chart-grouped-bar entries" style="height:${entriesH}%;" title="${d.entries} entries"></div>
            <div class="chart-grouped-bar exits" style="height:${exitsH}%;" title="${d.exits} exits"></div>
          </div>
          <div class="chart-grouped-label">${escapeHtml(d.day)}</div>
        </div>`;
    }).join("");
  }

  // ── Activity-type breakdown ───────────────────────────────────────────────
  function renderActivityBreakdown() {
    const el = document.getElementById("activityBreakdownChart");
    if (!el) return;
    const all = PSAS.state.activity;
    const counts = { entry: 0, exit: 0, hardware_failure: 0 };
    all.forEach(a => { if (counts[a.type] !== undefined) counts[a.type] += 1; });
    const max = Math.max(1, ...Object.values(counts));

    el.innerHTML = Object.keys(counts).map(type => {
      const meta = ACTIVITY_META[type];
      const pct = Math.round((counts[type] / max) * 100);
      const fillClass = type === "hardware_failure" ? "amber" : type === "exit" ? "amber" : "";
      return `
        <div class="chart-bar-row">
          <div class="chart-bar-label"><i class="bi ${meta.icon} ${type}"></i> ${meta.label}</div>
          <div class="chart-bar-track"><div class="chart-bar-fill ${fillClass}" style="width:${pct}%;"></div></div>
          <div class="chart-bar-value">${counts[type]}</div>
        </div>`;
    }).join("");
  }

  // ── Master render + subscription ─────────────────────────────────────────
  function renderAll() {
    renderMetrics();
    renderZoneChart();
    renderWeeklyChart();
    renderActivityBreakdown();
    PSASUI.refreshSimSelectors();
  }

  function initExport() {
    const btn = document.getElementById("btnPrintReport");
    if (btn) btn.addEventListener("click", () => window.print());
  }

  document.addEventListener("DOMContentLoaded", () => {
    initExport();
    PSASUI.initSimPanel();
    renderAll();

    if (window.PSAS && PSAS.subscribe) PSAS.subscribe(renderAll);
  });
})();