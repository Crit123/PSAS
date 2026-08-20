/**
 * includes/js/admin-parking.js
 * ============================================================================
 * PSAS ADMIN — Parking Management page logic
 * Reads PSAS.state.parkingSpaces (admin-state.js) and renders: stat cards,
 * an occupancy bar, and a filterable/searchable/paginated spaces table.
 * Shared helpers (escapeHtml, fmtTime, toolbar wiring, pagination, sim
 * panel) come from window.PSASUI — see admin-global.js.
 * ============================================================================
 */
(function () {
  "use strict";

  const { escapeHtml, fmtTime } = PSASUI;

  const listState = { page: 1, pageSize: 10, filter: "all", search: "" };

  // ── Stat cards + occupancy bar (same summary the Dashboard shows) ───────
  function renderStats() {
    const s = PSAS.select.parkingSummary();
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText("pk-stat-total", s.total);
    setText("pk-stat-available", s.available);
    setText("pk-stat-occupied", s.occupied);
    setText("pk-stat-reserved", s.reserved);

    const utilPct = s.total ? Math.round((s.occupied / s.total) * 100) : 0;
    const fill = document.getElementById("pkUtilBarFill");
    const label = document.getElementById("pkUtilBarLabel");
    if (fill) {
      fill.style.width = utilPct + "%";
      fill.classList.toggle("warn", utilPct >= 75 && utilPct < 90);
      fill.classList.toggle("crit", utilPct >= 90);
    }
    if (label) {
      label.innerHTML = `<strong>${utilPct}%</strong> of total capacity in use &nbsp;·&nbsp; Available ${s.available} · Reserved ${s.reserved} · Unknown ${s.unknown}`;
    }
  }

  // ── Spaces table ──────────────────────────────────────────────────────────
  function getFilteredSpaces() {
    let items = PSAS.state.parkingSpaces.slice().sort((a, b) => a.id.localeCompare(b.id));
    if (listState.filter !== "all") items = items.filter(s => s.status === listState.filter);
    if (listState.search) {
      const q = listState.search.toUpperCase();
      items = items.filter(s =>
        s.id.toUpperCase().includes(q) ||
        s.zone.toUpperCase().includes(q) ||
        (s.plate && s.plate.toUpperCase().includes(q)));
    }
    return items;
  }

  function rowHtml(s) {
    return `
      <tr>
        <td><strong>${escapeHtml(s.id)}</strong></td>
        <td><span class="zone-chip">${escapeHtml(s.zone)}</span></td>
        <td><span class="status-chip ${s.status}">${s.status}</span></td>
        <td>${s.plate ? `<span class="plate-badge">${escapeHtml(s.plate)}</span>` : "—"}</td>
        <td>${s.entryTime ? fmtTime(s.entryTime) : "—"}</td>
      </tr>`;
  }

  function renderTable() {
    const tbody = document.getElementById("parkingTableBody");
    const pageLabel = document.getElementById("parkingPageLabel");
    const prevBtn = document.getElementById("parkingPrevBtn");
    const nextBtn = document.getElementById("parkingNextBtn");
    if (!tbody) return;

    const all = getFilteredSpaces();
    const { page, totalPages, total, items } = PSASUI.paginate(all, listState.page, listState.pageSize);
    listState.page = page;

    if (!items.length) {
      tbody.innerHTML = `
        <tr class="empty-state-row"><td colspan="5">
          <i class="bi bi-grid-3x3-gap state-icon"></i>
          <div class="state-label">No matching parking spaces</div>
          <div class="state-hint">Try a different filter or search term</div>
        </td></tr>`;
    } else {
      tbody.innerHTML = items.map(rowHtml).join("");
    }

    if (pageLabel) pageLabel.textContent = `Page ${page} of ${totalPages} · ${total} space${total === 1 ? "" : "s"}`;
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= totalPages;
  }

  function initToolbarAndPagination() {
    PSASUI.initToolbar(document.getElementById("parkingToolbar"), state => {
      listState.filter = state.filter;
      listState.search = state.search;
      listState.page = 1;
      renderTable();
    });

    const prevBtn = document.getElementById("parkingPrevBtn");
    const nextBtn = document.getElementById("parkingNextBtn");
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