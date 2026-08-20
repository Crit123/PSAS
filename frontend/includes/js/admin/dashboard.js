/**
 * includes/js/admin-dashboard.js
 * ============================================================================
 * PSAS ADMIN — Dashboard Overview logic
 * Reads everything from the shared PSAS.state store (admin-state.js) and
 * re-renders whenever it changes. Handles ONLY dashboard content: stat
 * cards, parking occupancy, hardware summary, alerts, activity log +
 * "View all" modal, and the frontend simulation panel. Header behavior
 * (clock, notifications, search, profile) lives in admin-header.js;
 * sidebar behavior lives in admin-sidebar.js. Shared helpers come from
 * admin-global.js's window.PSASUI — load that file before this one.
 * ============================================================================
 */
(function () {
  "use strict";

  const { escapeHtml, fmtTime, activityMeta: ACTIVITY_META } = PSASUI;

  // ── Stat cards + Parking Occupancy ───────────────────────────────────────
  function renderParkingStats() {
    const s = PSAS.select.parkingSummary();
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText("stat-total", s.total);
    setText("stat-available", s.available);
    setText("stat-occupied", s.occupied);
    setText("stat-reserved", s.reserved);
    setText("stat-current-vehicles", PSAS.select.currentVehicleCount());
    setText("stat-entries-today", PSAS.state.todayStats.entries);
    setText("stat-exits-today", PSAS.state.todayStats.exits);

    const utilPct = s.total ? Math.round((s.occupied / s.total) * 100) : 0;
    const fill = document.getElementById("utilBarFill");
    const label = document.getElementById("utilBarLabel");
    if (fill) {
      fill.style.width = utilPct + "%";
      fill.classList.toggle("warn", utilPct >= 75 && utilPct < 90);
      fill.classList.toggle("crit", utilPct >= 90);
    }
    if (label) {
      label.innerHTML = `<strong>${utilPct}%</strong> of total capacity in use &nbsp;·&nbsp; Available ${s.available} · Reserved ${s.reserved} · Unknown ${s.unknown}`;
    }
  }

  // Clicking a stat card opens a read-only breakdown modal — dashboard-level
  // drill-down only, not the full Parking Management page (built later).
  function openParkingDrilldown(statusFilter, titleLabel) {
    const modalEl = document.getElementById("parkingDrilldownModal");
    if (!modalEl || !window.bootstrap) return;
    document.getElementById("parkingDrilldownTitle").textContent = titleLabel;

    const spaces = statusFilter
      ? PSAS.state.parkingSpaces.filter(s => s.status === statusFilter)
      : PSAS.state.parkingSpaces.slice();
    const body = document.getElementById("parkingDrilldownBody");

    if (!spaces.length) {
      body.innerHTML = `<div class="state-block"><i class="bi bi-grid-3x3-gap state-icon"></i><div class="state-label">No spaces in this state</div></div>`;
    } else {
      body.innerHTML = `
        <table class="table-psas">
          <thead><tr><th>Space</th><th>Zone</th><th>Plate</th><th>Since</th></tr></thead>
          <tbody>
            ${spaces.map(s => `
              <tr>
                <td><strong>${escapeHtml(s.id)}</strong></td>
                <td>${escapeHtml(s.zone)}</td>
                <td>${s.plate ? `<span class="plate-badge">${escapeHtml(s.plate)}</span>` : "—"}</td>
                <td>${s.entryTime ? fmtTime(s.entryTime) : "—"}</td>
              </tr>`).join("")}
          </tbody>
        </table>`;
    }
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  function initParkingDrilldown() {
    document.querySelectorAll("[data-drilldown-status]").forEach(el => {
      const trigger = () => openParkingDrilldown(el.dataset.drilldownStatus, el.dataset.drilldownLabel || "Parking Spaces");
      el.addEventListener("click", trigger);
      el.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); trigger(); }
      });
    });
  }

  // ── Hardware ──────────────────────────────────────────────────────────────
  function renderHardwareStatus() {
    const container = document.getElementById("hardwareStatusGrid");
    if (!container) return;
    const hw = PSAS.state.hardware;

    if (!hw.length) {
      container.innerHTML = `
        <div class="state-block">
          <i class="bi bi-hdd-network state-icon"></i>
          <div class="state-label">No hardware registered</div>
        </div>`;
      return;
    }

    container.innerHTML = hw.map(item => {
      const dotClass = item.status === "online" ? "green" : item.status === "warning" ? "amber" : "red";
      return `
        <div class="mini-tile">
          <div class="mini-tile-header">
            <span class="mini-tile-title">${escapeHtml(item.name)}</span>
            <span class="status-chip ${item.status}"><span class="dot ${dotClass}"></span>${item.status}</span>
          </div>
          <div style="font-size:0.72rem;color:var(--slate);">${escapeHtml(item.group)}</div>
        </div>`;
    }).join("");

    const summary = PSAS.select.hardwareSummary();
    const summaryEl = document.getElementById("hardwareSummaryLabel");
    if (summaryEl) {
      summaryEl.textContent = summary.attention === 0
        ? "All hardware operational"
        : `${summary.attention} component${summary.attention > 1 ? "s" : ""} need attention`;
    }
  }

  // ── Alerts (derived from unread notifications) ──────────────────────────
  // PREVIEW-CAP CONVENTION: dashboard cards show a short preview, not the
  // full record set — full history lives behind "View all" (modal/page).
  // Narrow cards (Alerts, ~5 cols): cap at 4. Wide cards (Recent Activity,
  // ~7 cols): cap at 10. Match these caps when adding new preview cards.
  function renderAlerts() {
    const container = document.getElementById("alertsList");
    if (!container) return;
    const alerts = PSAS.select.alerts();

    if (!alerts.length) {
      container.innerHTML = `
        <div class="state-block">
          <i class="bi bi-shield-check state-icon"></i>
          <div class="state-label">No active alerts</div>
          <div class="state-hint">System warnings and hardware alerts will show up here</div>
        </div>`;
      return;
    }

    container.innerHTML = alerts.slice(0, 4).map(a => `
      <div class="alert-item ${a.level}">
        <i class="bi ${a.level === "critical" ? "bi-exclamation-octagon" : "bi-exclamation-triangle"} alert-icon"></i>
        <div>
          <div class="alert-title">${escapeHtml(a.title)}</div>
          <div class="alert-meta">${escapeHtml(a.meta)} · ${fmtTime(a.timestamp)}</div>
        </div>
      </div>`).join("");
  }

  // ── Recent Activity (dashboard preview) + View All modal ────────────────
  function renderRecentActivity() {
    const tbody = document.getElementById("recentActivityBody");
    if (!tbody) return;
    const items = PSAS.state.activity.slice(0, 10);

    if (!items.length) {
      tbody.innerHTML = `
        <tr class="empty-state-row"><td colspan="4">
          <i class="bi bi-arrow-down-right-circle state-icon"></i>
          <div class="state-label">No activity recorded today</div>
        </td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(rowHtml).join("");
  }

  function rowHtml(item) {
    const meta = ACTIVITY_META[item.type];
    const plate = item.vehicle ? `<span class="plate-badge">${escapeHtml(item.vehicle)}</span>` : "—";
    const slot = item.slot ? ` <span class="activity-slot-arrow">→ ${escapeHtml(item.slot)}</span>` : "";
    return `
      <tr>
        <td class="log-ts">${fmtTime(item.timestamp)}</td>
        <td><span class="activity-type"><i class="bi ${meta.icon} ${item.type}"></i>${meta.label}</span></td>
        <td>${plate}${slot}</td>
        <td>${escapeHtml(item.description)}</td>
      </tr>`;
  }

  const activityModalState = { page: 1, pageSize: 10, filter: "all", search: "" };

  function getFilteredActivity() {
    let items = PSAS.state.activity.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (activityModalState.filter !== "all") items = items.filter(a => a.type === activityModalState.filter);
    if (activityModalState.search) {
      const q = activityModalState.search.toUpperCase();
      items = items.filter(a =>
        (a.vehicle && a.vehicle.toUpperCase().includes(q)) ||
        (a.slot && a.slot.toUpperCase().includes(q)) ||
        a.description.toUpperCase().includes(q));
    }
    return items;
  }

  function renderActivityModal() {
    const tbody = document.getElementById("activityModalBody");
    const pageLabel = document.getElementById("activityModalPageLabel");
    const prevBtn = document.getElementById("activityModalPrev");
    const nextBtn = document.getElementById("activityModalNext");
    if (!tbody) return;

    const all = getFilteredActivity();
    const totalPages = Math.max(1, Math.ceil(all.length / activityModalState.pageSize));
    activityModalState.page = Math.min(activityModalState.page, totalPages);
    const start = (activityModalState.page - 1) * activityModalState.pageSize;
    const pageItems = all.slice(start, start + activityModalState.pageSize);

    if (!pageItems.length) {
      tbody.innerHTML = `
        <tr class="empty-state-row"><td colspan="4">
          <i class="bi bi-arrow-down-right-circle state-icon"></i>
          <div class="state-label">No matching activity</div>
          <div class="state-hint">Try a different filter or search term</div>
        </td></tr>`;
    } else {
      tbody.innerHTML = pageItems.map(rowHtml).join("");
    }

    if (pageLabel) pageLabel.textContent = `Page ${activityModalState.page} of ${totalPages} · ${all.length} record${all.length === 1 ? "" : "s"}`;
    if (prevBtn) prevBtn.disabled = activityModalState.page <= 1;
    if (nextBtn) nextBtn.disabled = activityModalState.page >= totalPages;
  }

  function initActivityModal() {
    const modalEl = document.getElementById("activityModal");
    const openBtn = document.getElementById("btnViewAllActivity");
    if (openBtn && modalEl && window.bootstrap) {
      openBtn.addEventListener("click", () => {
        activityModalState.page = 1;
        renderActivityModal();
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      });
    }

    document.querySelectorAll(".activity-modal-filter").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".activity-modal-filter").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activityModalState.filter = btn.dataset.filter;
        activityModalState.page = 1;
        renderActivityModal();
      });
    });

    const searchInput = document.getElementById("activityModalSearch");
    if (searchInput) {
      // stopPropagation keeps typing/clicking inside the modal's search box
      // from bubbling into anything that could reset scroll or steal focus.
      searchInput.addEventListener("click", e => e.stopPropagation());
      searchInput.addEventListener("input", () => {
        activityModalState.search = searchInput.value;
        activityModalState.page = 1;
        renderActivityModal();
      });
    }

    const prevBtn = document.getElementById("activityModalPrev");
    const nextBtn = document.getElementById("activityModalNext");
    if (prevBtn) prevBtn.addEventListener("click", () => { activityModalState.page--; renderActivityModal(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { activityModalState.page++; renderActivityModal(); });
  }

  // ── Master render + subscription ─────────────────────────────────────────
  function renderAll() {
    renderParkingStats();
    renderHardwareStatus();
    renderAlerts();
    renderRecentActivity();
    PSASUI.refreshSimSelectors();

    const activityModalEl = document.getElementById("activityModal");
    if (activityModalEl && activityModalEl.classList.contains("show")) renderActivityModal();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initParkingDrilldown();
    initActivityModal();
    PSASUI.initSimPanel();
    renderAll();

    if (window.PSAS && PSAS.subscribe) PSAS.subscribe(renderAll);
  });
})();