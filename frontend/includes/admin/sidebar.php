<?php
/**
 * COMPONENT: includes/admin/sidebar.php
 * PURPOSE:   Global Admin sidebar — shared navigation shell for every
 *            Admin page (Dashboard, Parking Management, Vehicle Records,
 *            User & Account Management, Activity & Audit Logs, Reports,
 *            Hardware Monitoring, Notifications, System Configuration,
 *            Profile).
 *
 * USAGE:
 *   Each Admin page should set $active_nav BEFORE including this file, e.g.
 *
 *     $active_nav = "dashboard";
 *     require '../includes/admin/sidebar.php';
 *
 *   Recognized $active_nav values:
 *     dashboard | parking | vehicles | accounts | logs | reports |
 *     hardware | notifications | config | profile
 *
 * FALLBACK:
 *   If a page forgets to set $active_nav, it is derived automatically from
 *   the current filename so the sidebar never silently shows the wrong
 *   active state (and never hardcodes Dashboard as permanently active).
 *
 * BADGES:
 *   $sidebar_hw_badge / $sidebar_notif_badge may be set by the including
 *   page to override the counts below. Defaults are FRONTEND MOCK DATA.
 */

if (!isset($active_nav)) {
  $current_file = basename($_SERVER['PHP_SELF'] ?? '', '.php');
  $nav_map = [
    'admin-dashboard'     => 'dashboard',
    'admin-parking'       => 'parking',
    'admin-vehicles'      => 'vehicles',
    'admin-accounts'      => 'accounts',
    'admin-logs'          => 'logs',
    'admin-reports'       => 'reports',
    'admin-hardware'      => 'hardware',
    'admin-notifications' => 'notifications',
    'admin-config'        => 'config',
    'admin-profile'       => 'profile',
  ];
  $active_nav = $nav_map[$current_file] ?? '';
}

// FRONTEND MOCK DATA
// FUTURE: Replace with backend/API response (unread notification / hardware
// issue counts). Pages can override by setting these before the include.
$sidebar_hw_badge    = $sidebar_hw_badge    ?? 1;
$sidebar_notif_badge = $sidebar_notif_badge ?? 3;

$sidebar_links = [
  ['key' => 'dashboard',     'href' => 'admin-dashboard.php',     'icon' => 'bi-speedometer2',          'label' => 'Dashboard'],
  ['key' => 'parking',       'href' => 'admin-parking.php',       'icon' => 'bi-grid-3x3-gap-fill',     'label' => 'Parking Management'],
  ['key' => 'vehicles',      'href' => 'admin-vehicles.php',      'icon' => 'bi-car-front-fill',        'label' => 'Vehicle Records'],
  ['key' => 'accounts',      'href' => 'admin-accounts.php',      'icon' => 'bi-people-fill',           'label' => 'User &amp; Account Management'],
  ['key' => 'logs',          'href' => 'admin-logs.php',          'icon' => 'bi-list-ul',               'label' => 'Activity &amp; Audit Logs'],
  ['key' => 'reports',       'href' => 'admin-reports.php',       'icon' => 'bi-bar-chart-fill',        'label' => 'Reports &amp; Analytics'],
  ['key' => 'hardware',      'href' => 'admin-hardware.php',      'icon' => 'bi-hdd-network-fill',      'label' => 'Hardware Monitoring', 'badge' => $sidebar_hw_badge],
  ['key' => 'notifications', 'href' => 'admin-notifications.php', 'icon' => 'bi-bell-fill',             'label' => 'Notifications',       'badge' => $sidebar_notif_badge],
  ['key' => 'config',        'href' => 'admin-config.php',        'icon' => 'bi-gear-fill',             'label' => 'System Configuration'],
];
?>
<div class="sidebar-backdrop" id="sidebarBackdrop"></div>
<aside class="admin-sidebar" id="adminSidebar">
  <div class="sidebar-brand">
    <div class="brand-icon"><i class="bi bi-p-circle-fill"></i></div>
    <div>
      <div class="brand-title">PSAS Admin</div>
      <div class="brand-subtitle">Management Console</div>
    </div>
  </div>

  <nav class="sidebar-nav">
    <?php foreach ($sidebar_links as $link): ?>
      <a class="sidebar-link<?= $active_nav === $link['key'] ? ' active' : '' ?>"
         href="<?= htmlspecialchars($link['href']) ?>"
         <?= $active_nav === $link['key'] ? 'aria-current="page"' : '' ?>>
        <i class="bi <?= htmlspecialchars($link['icon']) ?>"></i> <?= $link['label'] ?>
        <?php if (!empty($link['badge'])): ?>
          <span class="badge-pill"><?= (int) $link['badge'] ?></span>
        <?php endif; ?>
      </a>
    <?php endforeach; ?>

    <div class="sidebar-section-label">Account</div>
    <a class="sidebar-link<?= $active_nav === 'profile' ? ' active' : '' ?>" href="admin-profile.php"
       <?= $active_nav === 'profile' ? 'aria-current="page"' : '' ?>>
      <i class="bi bi-person-circle"></i> Profile / Account
    </a>
  </nav>

  <div class="sidebar-footer">
    <a href="#" id="btn-logout"><i class="bi bi-box-arrow-right"></i> Logout</a>
  </div>
</aside>