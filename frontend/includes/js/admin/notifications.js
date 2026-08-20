/**
 * includes/js/admin-notifications.js
 * ============================================================================
 * PSAS ADMIN — Notifications page logic
 * Full-page, canonical version of the header bell's dropdown/modal preview
 * (admin-header.js). Reads/writes the same PSAS.state.notifications store
 * (admin-state.js), reusing its .notif-modal-row / .notif-mark-read-btn
 * markup so a notification looks identical whether seen in the header
 * popover, the header's "View all" modal, or this page. Shared helpers
 * come from window.PSASUI — see admin-global.js.
 * ============================================================================
 */
(function () {
  "use strict";

  const { escapeHtml, relativeTime } = PSASUI;

  const listState = { page: 1, pageSize: 10, filter: "all", search: "" };

  // ── Stat cards ────────────────────────────────────────────────────────────
  function renderStats() {
    const all = PSAS.state.notifications;
    const unread = PSAS.select.unreadNotificationCount();
    const critical = all.filter(n => n.level === "critical").length;
    const warning = all.filter(n => n.level === "warning").length;

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText("notif-stat-total", all.length);
    setText("notif-stat-unread", unread);
    setText("notif-stat-critical", critical);
    setText("notif-stat-warning", warning);
  }

  // ── Notification list ─────────────────────────────────────────────────────
  function getFilteredNotifications() {
    let items = PSAS.state.notifications.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (listState.filter === "unread") items = items.filter(n => !n.read);
    else if (listState.filter !== "all") items = items.filter(n => n.category === listState.filter);

    if (listState.search) {
      const q = listState.search.toUpperCase();
      items = items.filter(n =>
        n.title.toUpperCase().includes(q) ||
        n.meta.toUpperCase().includes(q));
    }
    return items;
  }

  function rowHtml(n) {
    return `
      <div class="notif-modal-row${n.read ? "" : " unread"}">
        <span class="notif-row-dot ${n.level}"></span>
        <div class="notif-row-body">
          <div class="notif-row-title">${escapeHtml(n.title)}</div>
          <div class="notif-row-meta">${escapeHtml(n.meta)} · ${relativeTime(n.timestamp)}${n.read ? "" : " · Unread"}</div>
        </div>
        ${n.read ? "" : `<button type="button" class="notif-mark-read-btn" data-notif-id="${n.id}" title="Mark as read"><i class="bi bi-check2"></i></button>`}
      </div>`;
  }

  function renderList() {
    const container = document.getElementById("notifListBody");
    const pageLabel = document.getElementById("notifPageLabel");
    const prevBtn = document.getElementById("notifPrevBtn");
    const nextBtn = document.getElementById("notifNextBtn");
    if (!container) return;

    const all = getFilteredNotifications();
    const { page, totalPages, total, items } = PSASUI.paginate(all, listState.page, listState.pageSize);
    listState.page = page;

    if (!items.length) {
      container.innerHTML = `
        <div class="state-block">
          <i class="bi bi-bell-slash state-icon"></i>
          <div class="state-label">No notifications</div>
          <div class="state-hint">Nothing matches this filter right now</div>
        </div>`;
    } else {
      container.innerHTML = items.map(rowHtml).join("");
    }

    if (pageLabel) pageLabel.textContent = `Page ${page} of ${totalPages} · ${total} notification${total === 1 ? "" : "s"}`;
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= totalPages;

    container.querySelectorAll(".notif-mark-read-btn").forEach(btn => {
      btn.addEventListener("click", () => PSAS.actions.markNotificationRead(btn.dataset.notifId));
    });
  }

  function initToolbarAndPagination() {
    PSASUI.initToolbar(document.getElementById("notifToolbar"), state => {
      listState.filter = state.filter;
      listState.search = state.search;
      listState.page = 1;
      renderList();
    });

    const prevBtn = document.getElementById("notifPrevBtn");
    const nextBtn = document.getElementById("notifNextBtn");
    if (prevBtn) prevBtn.addEventListener("click", () => { listState.page--; renderList(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { listState.page++; renderList(); });

    const markAllBtn = document.getElementById("btnMarkAllReadPage");
    if (markAllBtn) markAllBtn.addEventListener("click", () => PSAS.actions.markAllNotificationsRead());
  }

  // ── Master render + subscription ─────────────────────────────────────────
  function renderAll() {
    renderStats();
    renderList();
    PSASUI.refreshSimSelectors();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initToolbarAndPagination();
    PSASUI.initSimPanel();
    renderAll();

    if (window.PSAS && PSAS.subscribe) PSAS.subscribe(renderAll);
  });
})();