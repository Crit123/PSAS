/**
 * includes/js/admin-vehicles.js
 * ============================================================================
 * PSAS ADMIN — Vehicle Records page logic
 * Reads PSAS.state.vehicles (admin-state.js, same store the dashboard's
 * entry/exit simulation writes to) and renders: stat cards and a
 * filterable/searchable/paginated vehicle records table. Shared helpers
 * come from window.PSASUI — see admin-global.js.
 * ============================================================================
 */
(function () {
  "use strict";

  const { escapeHtml, fmtDateTime } = PSASUI;

  const listState = { page: 1, pageSize: 10, filter: "all", search: "" };

  // ── Stat cards ────────────────────────────────────────────────────────────
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

  // ── Records table ─────────────────────────────────────────────────────────
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

  function durationSince(iso) {
    if (!iso) return "—";
    const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hrs}h ${rem}m`;
  }

  function rowHtml(v) {
    const badge = v.status === "inside"
      ? `<span class="status-chip active">Inside</span>`
      : `<span class="status-chip inactive">Out</span>`;
    return `
      <tr>
        <td><span class="plate-badge">${escapeHtml(v.plate)}</span></td>
        <td>${v.slot ? escapeHtml(v.slot) : "—"}</td>
        <td>${badge}</td>
        <td>${v.entryTime ? fmtDateTime(v.entryTime) : "—"}</td>
        <td><span class="duration-badge">${durationSince(v.entryTime)}</span></td>
      </tr>`;
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

    if (!items.length) {
      tbody.innerHTML = `
        <tr class="empty-state-row"><td colspan="5">
          <i class="bi bi-car-front state-icon"></i>
          <div class="state-label">No matching vehicle records</div>
          <div class="state-hint">Try a different filter or search term</div>
        </td></tr>`;
    } else {
      tbody.innerHTML = items.map(rowHtml).join("");
    }

    if (pageLabel) pageLabel.textContent = `Page ${page} of ${totalPages} · ${total} record${total === 1 ? "" : "s"}`;
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= totalPages;
  }

  function initToolbarAndPagination() {
    PSASUI.initToolbar(document.getElementById("vehiclesToolbar"), state => {
      listState.filter = state.filter;
      listState.search = state.search;
      listState.page = 1;
      renderTable();
    });

    const prevBtn = document.getElementById("vehiclesPrevBtn");
    const nextBtn = document.getElementById("vehiclesNextBtn");
    if (prevBtn) prevBtn.addEventListener("click", () => { listState.page--; renderTable(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { listState.page++; renderTable(); });
  }

  // ── Master render + subscription ─────────────────────────────────────────
  function renderAll() {
    renderStats();
    renderTable();
    PSASUI.refreshSimSelectors();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initToolbarAndPagination();
    PSASUI.initSimPanel();
    renderAll();

    if (window.PSAS && PSAS.subscribe) PSAS.subscribe(renderAll);
  });
})();