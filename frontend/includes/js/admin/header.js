/**
 * includes/js/admin-header.js
 * ============================================================================
 * PSAS ADMIN — Global Header logic
 * Handles ONLY: real-time clock, notifications dropdown/modal, system status
 * dropdown, header search, profile dropdown. Sidebar interactivity lives in
 * admin-sidebar.js; dashboard content lives in admin-dashboard.js. All three
 * read from the same PSAS.state (admin-state.js) so numbers never diverge.
 * Shared helpers (escapeHtml, relativeTime, popover manager) come from
 * admin-global.js's window.PSASUI — load that file before this one.
 * ============================================================================
 */
(function () {
  "use strict";

  const { escapeHtml, relativeTime, registerPopover } = PSASUI;

  // ── Real-time clock ──────────────────────────────────────────────────────
  // Matches Staff's updateClock() exactly: same time/date formatting so both
  // sides of PSAS read as the same product.
  function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById("topbarClockTime");
    const dateEl = document.getElementById("topbarClockDate");
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
      });
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      });
    }
  }

  // ── Notifications ────────────────────────────────────────────────────────
  function renderNotifDropdown() {
    const list = document.getElementById("notifDropdownList");
    const countBadge = document.getElementById("notifCountBadge");
    if (!list) return;

    const notifs = PSAS.state.notifications
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 6);
    const unread = PSAS.select.unreadNotificationCount();

    if (countBadge) {
      countBadge.textContent = unread;
      countBadge.classList.toggle("d-none", unread === 0);
    }

    if (!notifs.length) {
      list.innerHTML = `
        <div class="state-block">
          <i class="bi bi-bell-slash state-icon"></i>
          <div class="state-label">No active alerts</div>
        </div>`;
      return;
    }

    list.innerHTML = notifs.map(n => `
      <button type="button" class="notif-row${n.read ? "" : " unread"}" data-notif-id="${n.id}">
        <span class="notif-row-dot ${n.level}"></span>
        <span class="notif-row-body">
          <span class="notif-row-title">${escapeHtml(n.title)}</span>
          <span class="notif-row-meta">${escapeHtml(n.meta)} · ${relativeTime(n.timestamp)}</span>
        </span>
      </button>`).join("");

    list.querySelectorAll(".notif-row").forEach(row => {
      row.addEventListener("click", () => {
        PSAS.actions.markNotificationRead(row.dataset.notifId);
      });
    });
  }

  function renderNotifModal() {
    const container = document.getElementById("notifModalList");
    if (!container) return;
    const activeFilter = document.querySelector(".notif-modal-filter.active")?.dataset.filter || "all";

    let notifs = PSAS.state.notifications.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (activeFilter === "unread") notifs = notifs.filter(n => !n.read);
    else if (activeFilter !== "all") notifs = notifs.filter(n => n.category === activeFilter);

    if (!notifs.length) {
      container.innerHTML = `
        <div class="state-block">
          <i class="bi bi-bell-slash state-icon"></i>
          <div class="state-label">No notifications</div>
          <div class="state-hint">Nothing matches this filter right now</div>
        </div>`;
      return;
    }

    container.innerHTML = notifs.map(n => `
      <div class="notif-modal-row${n.read ? "" : " unread"}">
        <span class="notif-row-dot ${n.level}"></span>
        <div class="notif-row-body">
          <div class="notif-row-title">${escapeHtml(n.title)}</div>
          <div class="notif-row-meta">${escapeHtml(n.meta)} · ${relativeTime(n.timestamp)}${n.read ? "" : " · Unread"}</div>
        </div>
        ${n.read ? "" : `<button type="button" class="notif-mark-read-btn" data-notif-id="${n.id}" title="Mark as read"><i class="bi bi-check2"></i></button>`}
      </div>`).join("");

    container.querySelectorAll(".notif-mark-read-btn").forEach(btn => {
      btn.addEventListener("click", () => PSAS.actions.markNotificationRead(btn.dataset.notifId));
    });
  }

  function initNotifications() {
    const trigger = document.getElementById("notifBtn");
    const panel = document.getElementById("notifDropdown");
    if (trigger && panel) registerPopover(panel, trigger);

    const viewAllBtn = document.getElementById("btnViewAllNotifs");
    const modalEl = document.getElementById("notificationsModal");
    if (viewAllBtn && modalEl && window.bootstrap) {
      viewAllBtn.addEventListener("click", () => {
        if (panel) panel.classList.remove("open");
        renderNotifModal();
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      });
    }

    document.querySelectorAll(".notif-modal-filter").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".notif-modal-filter").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderNotifModal();
      });
    });

    const markAllBtn = document.getElementById("btnMarkAllRead");
    if (markAllBtn) markAllBtn.addEventListener("click", () => PSAS.actions.markAllNotificationsRead());
  }

  // ── System status ────────────────────────────────────────────────────────
  function renderSystemStatus() {
    const btn = document.getElementById("sysStatusBtn");
    const dot = document.getElementById("sysStatusDot");
    const label = document.getElementById("sysStatusLabel");
    const list = document.getElementById("sysStatusList");
    const summary = PSAS.select.hardwareSummary();

    if (dot) { dot.className = "sys-status-dot" + (summary.overall === "critical" ? " down" : summary.overall === "warning" ? " warn" : ""); }
    if (label) { label.textContent = summary.overall === "operational" ? "All Systems Operational" : "Attention Required"; }
    if (btn) { btn.classList.toggle("attention", summary.overall !== "operational"); }

    if (list) {
      list.innerHTML = PSAS.state.hardware.map(hw => `
        <div class="sys-status-row">
          <span class="dot ${hw.status === "online" ? "green" : hw.status === "warning" ? "amber" : "red"}"></span>
          <span class="sys-status-row-name">${escapeHtml(hw.name)}</span>
          <span class="sys-status-row-state">${hw.status}</span>
        </div>`).join("");
    }

    const summaryLine = document.getElementById("sysStatusSummaryLine");
    if (summaryLine) {
      summaryLine.textContent = summary.overall === "operational"
        ? "All systems operational"
        : `${summary.attention} component${summary.attention > 1 ? "s" : ""} require attention`;
      summaryLine.className = "sys-status-summary-line " + (summary.overall === "operational" ? "ok" : "attn");
    }
  }

  function initSystemStatus() {
    const trigger = document.getElementById("sysStatusBtn");
    const panel = document.getElementById("sysStatusDropdown");
    if (trigger && panel) registerPopover(panel, trigger, renderSystemStatus);
  }

  // ── Header search ────────────────────────────────────────────────────────
  function renderSearchResults(query) {
    const panel = document.getElementById("headerSearchResults");
    if (!panel) return;

    if (!query.trim()) {
      panel.classList.remove("open");
      panel.innerHTML = "";
      return;
    }

    const result = PSAS.select.search(query);
    const rows = [];

    if (result.vehicle) {
      const badge = result.vehicle.status === "inside" ? "Currently Inside" : "Out";
      rows.push(`
        <div class="search-result-block">
          <div class="search-result-label"><i class="bi bi-car-front"></i> Vehicle</div>
          <div class="search-result-main">${escapeHtml(result.vehicle.plate)}</div>
          <div class="search-result-sub">Parking <strong>${escapeHtml(result.vehicle.slot)}</strong> · ${badge}${result.vehicle.entryTime ? " · Entry " + new Date(result.vehicle.entryTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}</div>
        </div>`);
    }
    if (result.space) {
      rows.push(`
        <div class="search-result-block">
          <div class="search-result-label"><i class="bi bi-grid-3x3-gap"></i> Parking Space</div>
          <div class="search-result-main">${escapeHtml(result.space.id)} <span class="status-chip ${result.space.status}">${result.space.status}</span></div>
          <div class="search-result-sub">${escapeHtml(result.space.zone)}${result.space.plate ? " · " + escapeHtml(result.space.plate) : ""}</div>
        </div>`);
    }
    if (result.hardware) {
      rows.push(`
        <div class="search-result-block">
          <div class="search-result-label"><i class="bi bi-hdd-network"></i> Hardware</div>
          <div class="search-result-main">${escapeHtml(result.hardware.name)} <span class="status-chip ${result.hardware.status}">${result.hardware.status}</span></div>
          <div class="search-result-sub">${escapeHtml(result.hardware.group)}</div>
        </div>`);
    }
    if (result.activity.length) {
      rows.push(`
        <div class="search-result-block">
          <div class="search-result-label"><i class="bi bi-list-ul"></i> Related Activity</div>
          ${result.activity.map(a => `
            <div class="search-result-activity-row">
              <span>${escapeHtml(a.description)}</span>
              <span class="search-result-time">${new Date(a.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>`).join("")}
        </div>`);
    }

    if (!rows.length) {
      panel.innerHTML = `<div class="state-block small"><i class="bi bi-search state-icon"></i><div class="state-label">No matches for "${escapeHtml(query)}"</div></div>`;
    } else {
      panel.innerHTML = rows.join("");
    }
    panel.classList.add("open");
  }

  function initSearch() {
    const input = document.getElementById("headerSearchInput");
    const panel = document.getElementById("headerSearchResults");
    if (!input || !panel) return;

    let debounceTimer;
    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => renderSearchResults(input.value), 120);
    });
    input.addEventListener("focus", () => { if (input.value.trim()) panel.classList.add("open"); });
    panel.addEventListener("click", e => e.stopPropagation());
    document.addEventListener("click", () => panel.classList.remove("open"));
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") { panel.classList.remove("open"); input.blur(); }
    });
  }

  // ── Profile dropdown ─────────────────────────────────────────────────────
  function initProfile() {
    const trigger = document.getElementById("adminProfileBtn");
    const panel = document.getElementById("profileDropdown");
    if (trigger && panel) registerPopover(panel, trigger);

    const logoutBtn = document.getElementById("btnLogout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", e => {
        e.preventDefault();
        window.location.href = "login.php";
      });
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 1000);

    initNotifications();
    initSystemStatus();
    initSearch();
    initProfile();

    renderNotifDropdown();
    renderSystemStatus();

    if (window.PSAS && PSAS.subscribe) {
      PSAS.subscribe(() => {
        renderNotifDropdown();
        renderSystemStatus();
        const modalEl = document.getElementById("notificationsModal");
        if (modalEl && modalEl.classList.contains("show")) renderNotifModal();
      });
    }
  });
})();