/**
 * includes/js/admin-logs.js
 * ============================================================================
 * PSAS ADMIN — Activity & Audit Logs page logic
 * Full-page listing of PSAS.state.activity (admin-state.js) — the same
 * Vehicle Entry / Vehicle Exit / Hardware Failure log the Dashboard's
 * "Recent Activity" card and "View all" modal preview. This page is the
 * canonical, unabridged version: stat cards, filter/search toolbar, and a
 * larger paginated table. Shared helpers come from window.PSASUI — see
 * admin-global.js.
 * ============================================================================
 */
(function () {
  "use strict";

  const { escapeHtml, fmtDateTime, activityMeta: ACTIVITY_META } = PSASUI;

  const listState = { page: 1, pageSize: 15, filter: "all", search: "" };

  // ── Stat cards ────────────────────────────────────────────────────────────
  function renderStats() {
    const all = PSAS.state.activity;
    const entries = all.filter(a => a.type === "entry").length;
    const exits = all.filter(a => a.type === "exit").length;
    const failures = all.filter(a => a.type === "hardware_failure").length;

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText("log-stat-total", all.length);
    setText("log-stat-entries", entries);
    setText("log-stat-exits", exits);
    setText("log-stat-failures", failures);
  }

  // ── Log table ─────────────────────────────────────────────────────────────
  function getFilteredLogs() {
    let items = PSAS.state.activity.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (listState.filter !== "all") items = items.filter(a => a.type === listState.filter);
    if (listState.search) {
      const q = listState.search.toUpperCase();
      items = items.filter(a =>
        (a.vehicle && a.vehicle.toUpperCase().includes(q)) ||
        (a.slot && a.slot.toUpperCase().includes(q)) ||
        a.description.toUpperCase().includes(q));
    }
    return items;
  }

  function rowHtml(item) {
    const meta = ACTIVITY_META[item.type];
    const plate = item.vehicle ? `<span class="plate-badge">${escapeHtml(item.vehicle)}</span>` : "—";
    const slot = item.slot ? ` <span class="activity-slot-arrow">→ ${escapeHtml(item.slot)}</span>` : "";
    return `
      <tr>
        <td class="log-ts">${fmtDateTime(item.timestamp)}</td>
        <td><span class="activity-type"><i class="bi ${meta.icon} ${item.type}"></i>${meta.label}</span></td>
        <td>${plate}${slot}</td>
        <td>${escapeHtml(item.description)}</td>
      </tr>`;
  }

  function renderTable() {
    const tbody = document.getElementById("logsTableBody");
    const pageLabel = document.getElementById("logsPageLabel");
    const prevBtn = document.getElementById("logsPrevBtn");
    const nextBtn = document.getElementById("logsNextBtn");
    if (!tbody) return;

    const all = getFilteredLogs();
    const { page, totalPages, total, items } = PSASUI.paginate(all, listState.page, listState.pageSize);
    listState.page = page;

    if (!items.length) {
      tbody.innerHTML = `
        <tr class="empty-state-row"><td colspan="4">
          <i class="bi bi-list-ul state-icon"></i>
          <div class="state-label">No matching log entries</div>
          <div class="state-hint">Try a different filter or search term</div>
        </td></tr>`;
    } else {
      tbody.innerHTML = items.map(rowHtml).join("");
    }

    if (pageLabel) pageLabel.textContent = `Page ${page} of ${totalPages} · ${total} entr${total === 1 ? "y" : "ies"}`;
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= totalPages;
  }

  function initToolbarAndPagination() {
    PSASUI.initToolbar(document.getElementById("logsToolbar"), state => {
      listState.filter = state.filter;
      listState.search = state.search;
      listState.page = 1;
      renderTable();
    });

    const prevBtn = document.getElementById("logsPrevBtn");
    const nextBtn = document.getElementById("logsNextBtn");
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