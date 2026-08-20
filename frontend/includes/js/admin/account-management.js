/**
 * includes/js/admin-accounts.js
 * ============================================================================
 * PSAS ADMIN — User & Account Management page logic
 * Reads PSAS.state.accounts (admin-state.js) and renders: stat cards and a
 * filterable/searchable/paginated accounts table with per-row
 * activate/suspend actions (PSAS.actions.setAccountStatus — mock/frontend
 * only, see admin-state.js FUTURE notes). Shared helpers come from
 * window.PSASUI — see admin-global.js.
 * ============================================================================
 */
(function () {
  "use strict";

  const { escapeHtml, relativeTime } = PSASUI;

  const listState = { page: 1, pageSize: 8, filter: "all", search: "" };

  // ── Stat cards ────────────────────────────────────────────────────────────
  function renderStats() {
    const s = PSAS.select.accountsSummary();
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText("ac-stat-total", s.total);
    setText("ac-stat-active", s.active);
    setText("ac-stat-suspended", s.suspended);
    setText("ac-stat-pending", s.pending);
  }

  // ── Accounts table ────────────────────────────────────────────────────────
  function getFilteredAccounts() {
    let items = PSAS.state.accounts.slice().sort((a, b) => a.name.localeCompare(b.name));
    if (listState.filter !== "all") items = items.filter(a => a.status === listState.filter);
    if (listState.search) {
      const q = listState.search.toUpperCase();
      items = items.filter(a =>
        a.name.toUpperCase().includes(q) ||
        a.email.toUpperCase().includes(q) ||
        a.department.toUpperCase().includes(q));
    }
    return items;
  }

  function initials(name) {
    return name.split(" ").filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join("");
  }

  function actionsHtml(acc) {
    if (acc.status === "active") {
      return `<button type="button" class="btn-psas-secondary" data-action="deactivate" data-id="${acc.id}">Deactivate</button>
              <button type="button" class="btn-psas-danger" data-action="suspend" data-id="${acc.id}">Suspend</button>`;
    }
    if (acc.status === "suspended") {
      return `<button type="button" class="btn-psas-secondary" data-action="activate" data-id="${acc.id}">Reinstate</button>`;
    }
    // inactive or pending
    return `<button type="button" class="btn-psas-secondary" data-action="activate" data-id="${acc.id}">Activate</button>`;
  }

  function rowHtml(acc) {
    return `
      <tr>
        <td>
          <div class="account-cell">
            <div class="account-avatar">${escapeHtml(initials(acc.name))}</div>
            <div>
              <div class="account-name">${escapeHtml(acc.name)}</div>
              <div class="account-email">${escapeHtml(acc.email)}</div>
            </div>
          </div>
        </td>
        <td><span class="role-badge ${acc.role}">${acc.role}</span></td>
        <td>${escapeHtml(acc.department)}</td>
        <td><span class="status-chip ${acc.status}">${acc.status}</span></td>
        <td>${acc.lastLogin ? relativeTime(acc.lastLogin) : "Never"}</td>
        <td><div class="row-actions">${actionsHtml(acc)}</div></td>
      </tr>`;
  }

  function renderTable() {
    const tbody = document.getElementById("accountsTableBody");
    const pageLabel = document.getElementById("accountsPageLabel");
    const prevBtn = document.getElementById("accountsPrevBtn");
    const nextBtn = document.getElementById("accountsNextBtn");
    if (!tbody) return;

    const all = getFilteredAccounts();
    const { page, totalPages, total, items } = PSASUI.paginate(all, listState.page, listState.pageSize);
    listState.page = page;

    if (!items.length) {
      tbody.innerHTML = `
        <tr class="empty-state-row"><td colspan="6">
          <i class="bi bi-people state-icon"></i>
          <div class="state-label">No matching accounts</div>
          <div class="state-hint">Try a different filter or search term</div>
        </td></tr>`;
    } else {
      tbody.innerHTML = items.map(rowHtml).join("");
    }

    if (pageLabel) pageLabel.textContent = `Page ${page} of ${totalPages} · ${total} account${total === 1 ? "" : "s"}`;
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= totalPages;

    tbody.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const nextStatus = action === "suspend" ? "suspended" : action === "deactivate" ? "inactive" : "active";
        const res = PSAS.actions.setAccountStatus(id, nextStatus);
        if (res.ok) PSASUI.showSimFeedback(`Account status updated to "${nextStatus}".`, false);
      });
    });
  }

  function initToolbarAndPagination() {
    PSASUI.initToolbar(document.getElementById("accountsToolbar"), state => {
      listState.filter = state.filter;
      listState.search = state.search;
      listState.page = 1;
      renderTable();
    });

    const prevBtn = document.getElementById("accountsPrevBtn");
    const nextBtn = document.getElementById("accountsNextBtn");
    if (prevBtn) prevBtn.addEventListener("click", () => { listState.page--; renderTable(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { listState.page++; renderTable(); });

    const addBtn = document.getElementById("btnAddAccount");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        PSASUI.showSimFeedback("Account creation isn't wired up in this frontend preview yet.", true);
      });
    }
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