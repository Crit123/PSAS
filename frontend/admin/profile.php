<?php
/**
 * PAGE: admin-profile.php
 * PURPOSE: Profile / Account for PSAS Admin — the signed-in admin's own
 *          profile (hero card + editable Name/Email/Department) and a
 *          mock Change Password form. Backed by PSAS.select.currentAdmin(),
 *          which resolves PSAS.state.currentAdminId against the SAME
 *          PSAS.state.accounts store User & Account Management manages —
 *          editing your profile here updates the record listed there too.
 * SCOPE: Frontend only. Mock data/persistence — see includes/js/
 *        admin-state.js for the clearly labeled FUTURE API placeholder.
 *        Change Password does not touch real authentication.
 */
session_start();
$page_title      = "Profile / Account | PSAS";
$active_nav      = "profile";
$page_heading    = "Profile / Account";
$page_subheading = "Your account details and security settings";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PSAS — Profile / Account">
  <title><?= htmlspecialchars($page_title) ?></title>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <!-- admin-profile.css imports admin-global.css (tokens/shell/shared UI), which imports sidebar.css -->
  <link rel="stylesheet" href="../includes/css/admin/profile.css">
</head>
<body>

<div class="admin-shell">

  <?php require __DIR__ . '/../includes/admin/sidebar.php'; ?>

  <div class="admin-main">

    <?php require __DIR__ . '/../includes/admin/header.php'; ?>

    <main class="admin-content">

      <!-- Hero card -->
      <div class="psas-card mb-4">
        <div class="profile-hero">
          <div class="admin-avatar lg" id="profileAvatar">—</div>
          <div class="profile-hero-info">
            <div class="profile-hero-name" id="profileHeroName">—</div>
            <div class="profile-hero-meta">
              <span class="role-badge" id="profileHeroRole">—</span>
              <span class="status-chip" id="profileHeroStatus">—</span>
              <span class="helper-text" id="profileHeroDept">—</span>
            </div>
            <div class="profile-hero-email" id="profileHeroEmail">—</div>
          </div>
          <div class="profile-hero-stats">
            <div class="profile-hero-stat">
              <div class="profile-hero-stat-value" id="profileHeroLastLogin">—</div>
              <div class="profile-hero-stat-label">Last Login</div>
            </div>
            <div class="profile-hero-stat">
              <div class="profile-hero-stat-value" id="profileHeroId">—</div>
              <div class="profile-hero-stat-label">Account ID</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-6">

          <!-- Edit Profile -->
          <div class="psas-card">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <div class="settings-section-title m-0"><i class="bi bi-person"></i> Edit Profile</div>
              <span class="demo-tag d-none" id="profDirtyBadge">Unsaved</span>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Full Name</div>
                <div class="settings-row-hint">Shown in the topbar and on the Accounts table.</div>
              </div>
              <div class="settings-row-control">
                <input type="text" id="prof-name" class="form-control-psas">
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Email Address</div>
                <div class="settings-row-hint">Used for sign-in and notification delivery.</div>
              </div>
              <div class="settings-row-control">
                <input type="email" id="prof-email" class="form-control-psas">
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Department</div>
                <div class="settings-row-hint">Displayed alongside your role on the Accounts table.</div>
              </div>
              <div class="settings-row-control">
                <input type="text" id="prof-department" class="form-control-psas">
              </div>
            </div>

            <div class="d-flex justify-content-end mt-3">
              <button type="button" class="btn-psas-primary" id="btnSaveProfile"><i class="bi bi-check2"></i> Save Profile</button>
            </div>
          </div>

        </div>

        <div class="col-lg-6">

          <!-- Change Password -->
          <div class="psas-card">
            <div class="settings-section-title"><i class="bi bi-shield-lock"></i> Change Password <span class="demo-tag">Frontend preview</span></div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Current Password</div>
                <div class="settings-row-hint">Confirm it's you before setting a new password.</div>
              </div>
              <div class="settings-row-control">
                <input type="password" id="prof-currentPassword" class="form-control-psas" autocomplete="current-password">
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">New Password</div>
                <div class="settings-row-hint">At least 8 characters.</div>
              </div>
              <div class="settings-row-control">
                <input type="password" id="prof-newPassword" class="form-control-psas" autocomplete="new-password">
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Confirm New Password</div>
                <div class="settings-row-hint">Re-enter the new password to confirm.</div>
              </div>
              <div class="settings-row-control">
                <input type="password" id="prof-confirmPassword" class="form-control-psas" autocomplete="new-password">
              </div>
            </div>

            <div class="settings-danger-note">
              <i class="bi bi-info-circle-fill"></i>
              <span>This is a frontend preview — no real authentication is connected, so password changes aren't persisted.</span>
            </div>

            <div class="d-flex justify-content-end mt-3">
              <button type="button" class="btn-psas-primary" id="btnChangePassword"><i class="bi bi-shield-check"></i> Update Password</button>
            </div>
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
<script src="../includes/js/admin/profile.js"></script>
</body>
</html>