/**
 * includes/js/admin-vehicles.js
 * ============================================================================
 * PSAS ADMIN — Vehicle Records page logic
 * Reads PSAS.state.vehicles (admin-state.js, same store the dashboard's
 * entry/exit simulation writes to) and renders: stat cards, a
 * filterable/searchable/paginated vehicle records table, and a Vehicle
 * Details modal. Shared helpers come from window.PSASUI — see
 * admin-global.js. No separate data store, no local mock data — this file
 * only derives view state (filter/search/page) and formats what PSAS.state
 * already contains.
 *
 * Sections below: State - Statistics - Filtering/Searching - Duration -
 * Rendering (table + details modal) - Pagination - Toolbar actions -
 * Initialization - State subscription.
 * ============================================================================
 */
(function () {
  "use strict";

  const { escapeHtml, fmtDateTime } = PSASUI;

  // -- State (view-only -- derived from PSAS.state, not a parallel store) ---
  const listState = { page: 1, pageSize: 10, filter: "all", search: "" };

  // -- Statistics -------------------------------------------------------------
  function renderStats() {
    const records = PSAS.select.vehicleRecords();
    const inside = records.filter(v => v.status === "inside").length;
    const out = records.filter(v => v.status === "out").length;

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText("vr-stat-total", records.length);
    setText("vr-stat-inside", inside);
    setText("vr-stat-out", out);
    setText("vr-stat-entries-today", PSAS.state.todayStats.entries);
  }

  // -- Filtering / Searching ----------------------------------------------------
  function getFilteredRecords() {
    let items = PSAS.select.vehicleRecords();
    if (listState.filter !== "all") items = items.filter(v => v.status === listState.filter);
    if (listState.search) {
      const q = listState.search.toUpperCase();
      items = items.filter(v =>
        v.plate.toUpperCase().includes(q) ||
        (v.slot && v.slot.toUpperCase().includes(q)));
    }
    return items;
  }

  // -- Duration -----------------------------------------------------------------
  // Only meaningful for vehicles still "inside" -- time elapsed since entry.
  // PSAS.state does not currently record an exit timestamp, so an "out"
  // vehicle's true parked duration (exitTime - entryTime) can't be computed
  // honestly. Rather than keep counting up from entryTime forever (which
  // would silently show a wrong, ever-growing number), exited vehicles show
  // "Not available" here. When admin-state.js gains an exitTime field, this
  // is the only function that needs to change.
  function formatDuration(vehicle) {
    if (vehicle.status !== "inside" || !vehicle.entryTime) {
      return { text: "Not available", unavailable: true };
    }
    const mins = Math.max(0, Math.round((Date.now() - new Date(vehicle.entryTime).getTime()) / 60000));
    if (mins < 60) return { text: `${mins}m`, unavailable: false };
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return { text: `${hrs}h ${String(rem).padStart(2, "0")}m`, unavailable: false };
  }

  // -- Rendering: table -----------------------------------------------------------
  function statusCellHtml(status) {
    return status === "inside"
      ? `<span class="status-chip active vr-status-cell"><i class="bi bi-check-circle-fill"></i>Inside</span>`
      : `<span class="status-chip inactive vr-status-cell"><i class="bi bi-box-arrow-right"></i>Exited</span>`;
  }

  function rowHtml(v) {
    const duration = formatDuration(v);
    return `
      <tr class="vr-row" data-plate="${escapeHtml(v.plate)}" tabindex="0" role="button"
          aria-label="View details for ${escapeHtml(v.plate)}">
        <td>
          <div class="vr-plate-cell">
            <i class="bi bi-car-front vr-plate-icon" aria-hidden="true"></i>
            <span class="vr-plate-badge">${escapeHtml(v.plate)}</span>
          </div>
        </td>
        <td>${v.slot ? escapeHtml(v.slot) : "-"}</td>
        <td>${statusCellHtml(v.status)}</td>
        <td>${v.entryTime ? fmtDateTime(v.entryTime) : "-"}</td>
        <td><span class="vr-duration${duration.unavailable ? " vr-duration-unavailable" : ""}">${duration.text}</span></td>
        <td>
          <button type="button" class="vr-row-open-btn" data-plate="${escapeHtml(v.plate)}"
                  aria-label="View details for ${escapeHtml(v.plate)}" title="View details">
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </td>
      </tr>`;
  }

  function emptyStateHtml() {
    const hasAnyRecords = PSAS.select.vehicleRecords().length > 0;
    if (!hasAnyRecords) {
      return `
        <tr class="empty-state-row vr-empty-row"><td colspan="6">
          <i class="bi bi-car-front state-icon"></i>
          <div class="state-label">No vehicle records yet</div>
          <div class="state-hint">Records appear here as vehicles enter the parking area</div>
        </td></tr>`;
    }
    return `
      <tr class="empty-state-row vr-empty-row"><td colspan="6">
        <i class="bi bi-car-front state-icon"></i>
        <div class="state-label">No vehicle records found</div>
        <div class="state-hint">Try adjusting your search or filter</div>
      </td></tr>`;
  }

  function renderTable() {
    const tbody = document.getElementById("vehiclesTableBody");
    const pageLabel = document.getElementById("vehiclesPageLabel");
    const prevBtn = document.getElementById("vehiclesPrevBtn");
    const nextBtn = document.getElementById("vehiclesNextBtn");
    if (!tbody) return;

    const all = getFilteredRecords();
    const { page, totalPages, total, items } = PSASUI.paginate(all, listState.page, listState.pageSize);
    listState.page = page;

    tbody.innerHTML = items.length ? items.map(rowHtml).join("") : emptyStateHtml();

    if (pageLabel) pageLabel.textContent = `Page ${page} of ${totalPages} - ${total} record${total === 1 ? "" : "s"}`;
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= totalPages;

    tbody.querySelectorAll(".vr-row").forEach(row => {
      row.addEventListener("click", () => openDetails(row.dataset.plate));
      row.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDetails(row.dataset.plate); }
      });
    });
    tbody.querySelectorAll(".vr-row-open-btn").forEach(btn => {
      btn.addEventListener("click", e => { e.stopPropagation(); openDetails(btn.dataset.plate); });
    });
  }

  // -- Rendering: Vehicle Details modal ----------------------------------------
  function detailRow(label, value, opts) {
    opts = opts || {};
    const cls = "vr-detail-value" + (opts.mono ? " mono" : "") + (opts.muted ? " muted" : "");
    return `
      <div class="vr-detail-row">
        <span class="vr-detail-label">${escapeHtml(label)}</span>
        <span class="${cls}">${value}</span>
      </div>`;
  }

  function openDetails(plate) {
    const vehicle = PSAS.state.vehicles[plate];
    const body = document.getElementById("vehicleDetailsBody");
    const modalEl = document.getElementById("vehicleDetailsModal");
    if (!vehicle || !body || !modalEl || !window.bootstrap) return;

    const duration = formatDuration(vehicle);

    body.innerHTML = [
      detailRow("Plate Number", `<span class="vr-plate-badge">${escapeHtml(vehicle.plate)}</span>`),
      detailRow("Parking Space", vehicle.slot ? escapeHtml(vehicle.slot) : "Not available"),
      detailRow("Status", statusCellHtml(vehicle.status)),
      detailRow("Entry Time", vehicle.entryTime ? fmtDateTime(vehicle.entryTime) : "Not available"),
      detailRow("Exit Time", "Not available", { muted: true }),
      detailRow("Duration", duration.text, { mono: !duration.unavailable, muted: duration.unavailable }),
    ].join("");

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  // -- Pagination -----------------------------------------------------------------
  function initPagination() {
    const prevBtn = document.getElementById("vehiclesPrevBtn");
    const nextBtn = document.getElementById("vehiclesNextBtn");
    if (prevBtn) prevBtn.addEventListener("click", () => { listState.page--; renderTable(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { listState.page++; renderTable(); });
  }

  // -- Toolbar: filter + search (via shared PSASUI.initToolbar) + refresh/clear --
  function setFilterButtonsPressedState(activeFilter) {
    document.querySelectorAll("#vehiclesToolbar .psas-toolbar-filter").forEach(btn => {
      btn.setAttribute("aria-pressed", String(btn.dataset.filter === activeFilter));
    });
  }

  function initToolbar() {
    PSASUI.initToolbar(document.getElementById("vehiclesToolbar"), state => {
      listState.filter = state.filter;
      listState.search = state.search;
      listState.page = 1;
      setFilterButtonsPressedState(state.filter);
      renderTable();
    });

    const clearBtn = document.getElementById("vehiclesClearBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        listState.filter = "all";
        listState.search = "";
        listState.page = 1;

        const searchInput = document.getElementById("vehiclesSearchInput");
        if (searchInput) searchInput.value = "";
        document.querySelectorAll("#vehiclesToolbar .psas-toolbar-filter").forEach(btn => {
          btn.classList.toggle("active", btn.dataset.filter === "all");
        });
        setFilterButtonsPressedState("all");
        renderTable();
      });
    }

    const refreshBtn = document.getElementById("vehiclesRefreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        renderAll();
        refreshBtn.classList.add("spinning");
        setTimeout(() => refreshBtn.classList.remove("spinning"), 500);
      });
    }
  }

  // -- Initialization + state subscription -------------------------------------
  function renderAll() {
    renderStats();
    renderTable();
    PSASUI.refreshSimSelectors();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initToolbar();
    initPagination();
    PSASUI.initSimPanel();
    renderAll();

    if (window.PSAS && PSAS.subscribe) PSAS.subscribe(renderAll);
  });
})();