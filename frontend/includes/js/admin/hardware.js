/**
 * includes/js/admin-hardware.js
 * ============================================================================
 * PSAS ADMIN — Hardware Monitoring page logic
 * Reads PSAS.state.hardware (admin-state.js) — the same store the
 * Dashboard's System Health card and the Frontend Simulation panel read
 * from/write to — and renders: stat cards and a filterable/searchable
 * table with per-row "Trigger Failure" / "Mark Resolved" actions calling
 * PSAS.actions directly (same actions the sim panel uses). Shared helpers
 * come from window.PSASUI — see admin-global.js.
 * ============================================================================
 */
(function () {
  "use strict";

  const { escapeHtml, relativeTime } = PSASUI;

  const listState = { filter: "all", search: "" };

  // ── Stat cards ────────────────────────────────────────────────────────────
  function renderStats() {
    const hw = PSAS.state.hardware;
    const summary = PSAS.select.hardwareSummary();
    const online = hw.length - summary.offline - summary.warning;

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText("hw-stat-total", hw.length);
    setText("hw-stat-online", online);
    setText("hw-stat-warning", summary.warning);
    setText("hw-stat-offline", summary.offline);

    const banner = document.getElementById("hwStatusBanner");
    if (banner) {
      banner.innerHTML = summary.overall === "operational"
        ? `<i class="bi bi-check-circle-fill" style="color:var(--green);"></i> All hardware operational`
        : `<i class="bi bi-exclamation-triangle-fill" style="color:var(--danger);"></i> ${summary.attention} component${summary.attention > 1 ? "s" : ""} need attention`;
    }
  }

  // ── Hardware table ────────────────────────────────────────────────────────
  function getFilteredHardware() {
    let items = PSAS.state.hardware.slice().sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
    if (listState.filter !== "all") items = items.filter(h => h.status === listState.filter);
    if (listState.search) {
      const q = listState.search.toUpperCase();
      items = items.filter(h =>
        h.name.toUpperCase().includes(q) ||
        h.group.toUpperCase().includes(q) ||
        (h.linkedSpace && h.linkedSpace.toUpperCase().includes(q)));
    }
    return items;
  }

  function actionsHtml(hw) {
    if (hw.status === "online") {
      return `<button type="button" class="btn-psas-danger" data-action="fail" data-id="${hw.id}">Trigger Failure</button>`;
    }
    return `<button type="button" class="btn-psas-secondary" data-action="resolve" data-id="${hw.id}">Mark Resolved</button>`;
  }

  function rowHtml(hw) {
    const dotClass = hw.status === "online" ? "green" : hw.status === "warning" ? "amber" : "red";
    return `
      <tr>
        <td><span class="dot ${dotClass}"></span> <strong>${escapeHtml(hw.name)}</strong></td>
        <td>${escapeHtml(hw.group)}</td>
        <td><span class="status-chip ${hw.status}">${hw.status}</span></td>
        <td>${hw.linkedSpace ? escapeHtml(hw.linkedSpace) : "—"}</td>
        <td><div class="row-actions">${actionsHtml(hw)}</div></td>
      </tr>`;
  }

  function renderTable() {
    const tbody = document.getElementById("hardwareTableBody");
    if (!tbody) return;

    const items = getFilteredHardware();
    if (!items.length) {
      tbody.innerHTML = `
        <tr class="empty-state-row"><td colspan="5">
          <i class="bi bi-hdd-network state-icon"></i>
          <div class="state-label">No matching hardware</div>
          <div class="state-hint">Try a different filter or search term</div>
        </td></tr>`;
    } else {
      tbody.innerHTML = items.map(rowHtml).join("");
    }

    tbody.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (btn.dataset.action === "fail") {
          PSAS.actions.triggerHardwareFailure(id);
          PSASUI.showSimFeedback("Hardware failure triggered.", true);
        } else {
          PSAS.actions.resolveHardware(id);
          PSASUI.showSimFeedback("Hardware marked resolved.", false);
        }
      });
    });
  }

  function initToolbar() {
    PSASUI.initToolbar(document.getElementById("hardwareToolbar"), state => {
      listState.filter = state.filter;
      listState.search = state.search;
      renderTable();
    });
  }

  // ── Recent hardware-related notifications (reuses the same alert-item
  // markup the Dashboard uses, filtered to category "hardware") ───────────
  function renderHardwareAlerts() {
    const container = document.getElementById("hwAlertsList");
    if (!container) return;
    const items = PSAS.state.notifications
      .filter(n => n.category === "hardware")
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 6);

    if (!items.length) {
      container.innerHTML = `<div class="state-block small"><i class="bi bi-bell-slash state-icon"></i><div class="state-label">No hardware alerts</div></div>`;
      return;
    }

    container.innerHTML = items.map(n => `
      <div class="alert-item ${n.level}">
        <i class="bi ${n.level === "critical" ? "bi-exclamation-octagon-fill" : "bi-exclamation-triangle-fill"} alert-icon"></i>
        <div>
          <div class="alert-title">${escapeHtml(n.title)}</div>
          <div class="alert-meta">${escapeHtml(n.meta)} · ${relativeTime(n.timestamp)}${n.read ? "" : " · Unread"}</div>
        </div>
      </div>`).join("");
  }

  // ── Master render + subscription ─────────────────────────────────────────
  function renderAll() {
    renderStats();
    renderTable();
    renderHardwareAlerts();
    PSASUI.refreshSimSelectors();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initToolbar();
    PSASUI.initSimPanel();
    renderAll();

    if (window.PSAS && PSAS.subscribe) PSAS.subscribe(renderAll);
  });
})();