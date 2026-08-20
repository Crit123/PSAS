<?php
/**
 * PAGE: admin-accounts.php
 * PURPOSE: User & Account Management for PSAS Admin — Admin/Staff account
 *          listing with filter/search/pagination and status actions
 *          (Activate / Deactivate / Suspend / Reinstate), backed by
 *          PSAS.state.accounts (admin-state.js).
 * SCOPE: Frontend only. Mock data — see includes/js/admin-state.js for
 *        clearly labeled FUTURE API placeholders. "Add Account" is a UI
 *        placeholder only (see admin-accounts.js) — full account creation
 *        is out of scope for this frontend preview.
 */
session_start();
$page_title      = "User & Account Management | PSAS";
$active_nav      = "accounts";
$page_heading    = "User & Account Management";
$page_subheading = "Admin and staff accounts — filter, search, and manage status";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PSAS — User & Account Management">
  <title><?= htmlspecialchars($page_title) ?></title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <!-- account-management.css imports admin-global.css (tokens/shell/shared UI), which imports sidebar.css -->
  <link rel="stylesheet" href="../includes/css/admin/account-management.css">
</head>
<body>

<div class="admin-shell">

  <?php require __DIR__ . '/../includes/admin/sidebar.php'; ?>

  <div class="admin-main">

    <?php require __DIR__ . '/../includes/admin/header.php'; ?>

    <main class="admin-content">

      <!-- Stat cards -->
      <div class="dash-section-label">Account Overview</div>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card total m-0">
            <div class="stat-icon"><i class="bi bi-people-fill"></i></div>
            <div class="stat-info"><h4 id="ac-stat-total">0</h4><p>Total Accounts</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card active m-0">
            <div class="stat-icon"><i class="bi bi-person-check-fill"></i></div>
            <div class="stat-info"><h4 id="ac-stat-active">0</h4><p>Active</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card danger m-0">
            <div class="stat-icon"><i class="bi bi-person-x-fill"></i></div>
            <div class="stat-info"><h4 id="ac-stat-suspended">0</h4><p>Suspended</p></div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="psas-card stat-card reserved m-0">
            <div class="stat-icon"><i class="bi bi-person-exclamation"></i></div>
            <div class="stat-info"><h4 id="ac-stat-pending">0</h4><p>Pending</p></div>
          </div>
        </div>
      </div>

      <!-- Accounts listing -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="dash-section-label m-0">All Accounts</div>
        <button type="button" class="btn-psas-primary" id="btnAddAccount"><i class="bi bi-person-plus"></i> Add Account</button>
      </div>
      <div class="psas-card">
        <div class="psas-toolbar" id="accountsToolbar">
          <div class="psas-toolbar-filters">
            <button type="button" class="psas-toolbar-filter active" data-filter="all">All</button>
            <button type="button" class="psas-toolbar-filter" data-filter="active">Active</button>
            <button type="button" class="psas-toolbar-filter" data-filter="inactive">Inactive</button>
            <button type="button" class="psas-toolbar-filter" data-filter="suspended">Suspended</button>
            <button type="button" class="psas-toolbar-filter" data-filter="pending">Pending</button>
          </div>
          <div class="psas-toolbar-search">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Search name, email, department…" autocomplete="off" spellcheck="false">
          </div>
        </div>

        <div class="table-responsive">
          <table class="table-psas">
            <thead>
              <tr>
                <th>Account</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="accountsTableBody"></tbody>
          </table>
        </div>

        <div class="psas-pagination">
          <span class="page-label" id="accountsPageLabel">Page 1 of 1</span>
          <div class="d-flex gap-2">
            <button type="button" class="btn-psas-secondary" id="accountsPrevBtn">Previous</button>
            <button type="button" class="btn-psas-secondary" id="accountsNextBtn">Next</button>
          </div>
        </div>
      </div>

    </main>
  </div>
</div>

<!-- ── FRONTEND SIMULATION panel — dev/demo only, not a production feature ── -->
<?php require __DIR__ . '/../includes/admin/sim-panel.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="../includes/js/admin-global.js"></script>
<script src="../includes/js/admin/state.js"></script>
<script src="../includes/js/admin/sidebar.js"></script>
<script src="../includes/js/admin/header.js"></script>
<script src="../includes/js/admin/account-management.js"></script>
</body>
</html>