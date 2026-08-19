<?php
/**
 * COMPONENT: includes/admin/header.php
 * PURPOSE:   Global Admin topbar — shared, functional header for every
 *            Admin page, same reuse pattern as includes/admin/sidebar.php.
 *
 * USAGE:
 *   Each Admin page sets $page_heading / $page_subheading BEFORE including
 *   this file (falls back to sensible defaults if omitted), e.g.
 *
 *     $page_heading    = "Dashboard Overview";
 *     $page_subheading = "System-wide monitoring and status";
 *     require '../includes/admin/header.php';
 *
 * RESPONSIBILITIES (see includes/js/admin-header.js):
 *   Real-time clock, notifications (dropdown + "View all" modal), system
 *   status (dropdown driven by simulated hardware state), header search
 *   (reads PSAS.state), profile dropdown (Profile / Settings / Logout).
 *   Sidebar toggle/collapse stays in admin-sidebar.js; dashboard content
 *   stays in admin-dashboard.js — this file/script never touches either.
 *
 * ICONS: outline/skeleton Bootstrap Icons only (bi-search, bi-bell,
 *   bi-activity, bi-person, bi-gear, bi-box-arrow-right) — no filled,
 *   colored, or illustrative icons, matching the sidebar's icon language.
 *
 * DATA: notification/status content below is rendered client-side from
 *   PSAS.state (includes/js/admin-state.js) — FRONTEND MOCK DATA.
 *   FUTURE: replace admin-state.js's seed data with backend/API responses.
 */

$page_heading    = $page_heading    ?? 'Dashboard Overview';
$page_subheading = $page_subheading ?? '';

$admin_display_name = $admin_display_name ?? 'Admin Santos';
$admin_display_role = $admin_display_role ?? 'System Administrator';
?>
<header class="admin-topbar">
  <div class="d-flex align-items-center gap-2">
    <button class="sidebar-toggle-btn" id="sidebarToggle" aria-label="Toggle navigation">
      <i class="bi bi-list"></i>
    </button>
    <div>
      <h1 class="topbar-title"><?= htmlspecialchars($page_heading) ?></h1>
      <?php if ($page_subheading !== ''): ?>
        <div class="topbar-sub"><?= htmlspecialchars($page_subheading) ?></div>
      <?php endif; ?>
    </div>
  </div>

  <!-- Header search — frontend-only, reads PSAS.state -->
  <div class="header-search d-none d-md-block">
    <i class="bi bi-search header-search-icon"></i>
    <input type="text" id="headerSearchInput" class="header-search-input"
           placeholder="Search plate, space, hardware…" autocomplete="off" spellcheck="false">
    <div class="header-search-results" id="headerSearchResults"></div>
  </div>

  <div class="topbar-actions">
    <!-- Real-time clock — format/typography matches Staff's .nav-clock -->
    <div class="topbar-clock d-none d-lg-flex">
      <span class="topbar-clock-time" id="topbarClockTime">--:--:-- --</span>
      <span class="topbar-clock-date" id="topbarClockDate">Loading…</span>
    </div>

    <!-- System Status -->
    <div class="header-popover-wrap">
      <button class="sys-status-btn d-none d-md-flex" id="sysStatusBtn" type="button" aria-haspopup="true" aria-expanded="false" title="System Status">
        <span class="sys-status-dot warn" id="sysStatusDot"></span>
        <span id="sysStatusLabel">Checking…</span>
        <i class="bi bi-chevron-down header-caret"></i>
      </button>
      <div class="header-dropdown sys-status-dropdown" id="sysStatusDropdown" role="menu">
        <div class="header-dropdown-title">System Status</div>
        <div id="sysStatusList" class="sys-status-list"></div>
        <div class="sys-status-summary-line" id="sysStatusSummaryLine">Checking hardware…</div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="header-popover-wrap">
      <button class="notif-btn" id="notifBtn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Notifications" title="Notifications">
        <i class="bi bi-bell"></i>
        <span class="notif-badge d-none" id="notifCountBadge">0</span>
      </button>
      <div class="header-dropdown notif-dropdown" id="notifDropdown" role="menu">
        <div class="header-dropdown-title">Notifications</div>
        <div id="notifDropdownList" class="notif-dropdown-list"></div>
        <button type="button" class="header-dropdown-footer-link" id="btnViewAllNotifs">
          View all notifications
        </button>
      </div>
    </div>

    <!-- Admin profile -->
    <div class="header-popover-wrap">
      <button class="admin-profile" id="adminProfileBtn" type="button" aria-haspopup="true" aria-expanded="false" title="Admin Profile">
        <div class="admin-avatar"><?= htmlspecialchars(strtoupper(substr($admin_display_name, 0, 1))) ?></div>
        <div class="text-start d-none d-md-block">
          <div class="admin-name"><?= htmlspecialchars($admin_display_name) ?></div>
          <div class="admin-role"><?= htmlspecialchars($admin_display_role) ?></div>
        </div>
        <i class="bi bi-chevron-down header-caret d-none d-md-inline"></i>
      </button>
      <div class="header-dropdown profile-dropdown" id="profileDropdown" role="menu">
        <a class="profile-dropdown-item" href="admin-profile.php">
          <i class="bi bi-person"></i> Profile
        </a>
        <a class="profile-dropdown-item" href="admin-config.php">
          <i class="bi bi-gear"></i> Settings
        </a>
        <div class="header-dropdown-divider"></div>
        <button type="button" class="profile-dropdown-item danger" id="btnLogout">
          <i class="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>
    </div>
  </div>
</header>

<!-- ── Notifications Modal (global) ─────────────────────────────────────── -->
<div class="modal fade" id="notificationsModal" tabindex="-1" aria-labelledby="notificationsModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content psas-modal-content">
      <div class="modal-header psas-modal-header">
        <div>
          <h5 class="modal-title psas-modal-title" id="notificationsModalLabel">
            <i class="bi bi-bell me-2"></i>Notifications
          </h5>
          <div class="psas-modal-eyebrow">All notification history for this session</div>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body p-0">
        <div class="notif-modal-filter-bar" id="notifModalFilterBar">
          <button type="button" class="notif-modal-filter active" data-filter="all">All</button>
          <button type="button" class="notif-modal-filter" data-filter="unread">Unread</button>
          <button type="button" class="notif-modal-filter" data-filter="parking">Parking</button>
          <button type="button" class="notif-modal-filter" data-filter="hardware">Hardware</button>
        </div>
        <div class="notif-modal-list" id="notifModalList"></div>
      </div>

      <div class="modal-footer psas-modal-footer">
        <button type="button" id="btnMarkAllRead" class="link-quiet-btn">
          <i class="bi bi-check2-all me-1"></i>Mark all as read
        </button>
        <button type="button" class="btn-psas-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>