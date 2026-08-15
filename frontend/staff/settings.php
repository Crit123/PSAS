<?php
/**
 * PAGE: staff-settings.php
 * PURPOSE: Staff Account Settings & Preferences.
 * NOTE: Frontend demo layout. No real database connections are active.
 */

session_start();

// TODO: verify $_SESSION['role'] === 'security'
// if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'security') {
//     header("Location: login.php");
//     exit;
// }

$page_title = "Account Settings | PSAS";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PSAS — Staff Account Settings">
  <title><?= htmlspecialchars($page_title) ?></title>

  <!-- Bootstrap 5 CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <!-- Google Fonts: Inter + JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <!-- Shared Dashboard Styles -->
  <link rel="stylesheet" href="../includes/css/dashboard.css">
</head>
<body>

<!-- ── Navbar ─────────────────────────────────────────────────────────────── -->
<nav class="dashboard-navbar">
  <div class="nav-brand-wrap">
    <div class="nav-logo"><i class="bi bi-p-circle-fill"></i></div>
    <div>
      <h1 class="nav-title">PSAS Security</h1>
      <div class="nav-subtitle">Gate 1 Checkpoint</div>
    </div>
  </div>

  <div class="nav-actions">
    <a href="#" onclick="window.history.back(); return false;" class="btn-nav-back d-none d-md-flex">
      <i class="bi bi-arrow-left"></i> Dashboard
    </a>
    <div class="dropdown">
      <div class="staff-profile" data-bs-toggle="dropdown" aria-expanded="false">
        <div class="text-end d-none d-md-block">
          <div style="font-size: 0.82rem; font-weight: 700;">Officer Reyes</div>
          <div style="font-size: 0.65rem; color: rgba(255,255,255,0.6); letter-spacing: 0.04em;">ID: SEC-2024</div>
        </div>
        <div class="staff-avatar text-white">R</div>
      </div>
      <ul class="dropdown-menu dropdown-menu-end border-0 shadow-sm" style="border-radius: var(--radius-md); margin-top: 0.5rem;">
        <li><a class="dropdown-item" href="#" onclick="window.history.back(); return false;" style="font-size: 0.85rem;"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item text-danger" href="#" style="font-size: 0.85rem;"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
      </ul>
    </div>
  </div>
</nav>

<!-- ── Main Content ────────────────────────────────────────────────────────── -->
<div class="container-xl py-4 px-3 px-md-4 mt-2">

  <div class="mb-4 d-flex align-items-center justify-content-between">
    <div>
      <!-- Section heading uses console label style: uppercase, tight tracking -->
      <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--slate); margin-bottom: 0.35rem;">Account Settings</div>
      <h2 style="font-weight: 800; color: var(--navy); margin: 0; font-size: 1.35rem; letter-spacing: -0.02em;">Officer Reyes</h2>
      <p style="color: var(--slate); font-size: 0.82rem; margin: 0.2rem 0 0;">Security Personnel · Gate 1 · SEC-2024</p>
    </div>
    <a href="#" onclick="window.history.back(); return false;" class="btn btn-outline-secondary btn-sm d-md-none" style="border-radius: var(--radius-sm); font-size: 0.78rem;">
      <i class="bi bi-arrow-left"></i> Back
    </a>
  </div>

  <div class="settings-layout">

    <!-- Sidebar Navigation -->
    <aside class="settings-sidebar">
      <nav class="settings-nav" id="settingsNav">
        <button class="settings-tab active" data-target="sec-profile">
          <i class="bi bi-person-badge"></i> Profile
        </button>
        <button class="settings-tab" data-target="sec-shift">
          <i class="bi bi-clock-history"></i> Shift
        </button>
        <button class="settings-tab" data-target="sec-notifs">
          <i class="bi bi-bell"></i> Notifications
        </button>
        <button class="settings-tab" data-target="sec-security">
          <i class="bi bi-shield-lock"></i> Security
        </button>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <main class="settings-content">

      <!-- ── Profile Information ──────────────────────────────────────── -->
      <section id="sec-profile" class="settings-section active">
        <div class="psas-card">
          <h4 class="form-section-title">Profile Information</h4>
          <p class="form-section-sub">Update your personal details and contact information on file.</p>

          <form id="profileForm" novalidate>
            <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div class="staff-avatar lg">R</div>
              <div>
                <h5 style="margin: 0; font-weight: 700; color: var(--navy); font-size: 1rem;">Officer Reyes</h5>
                <p style="margin: 0.2rem 0 0; font-size: 0.78rem; color: var(--slate);">Security Personnel</p>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="psas-label">Staff ID</label>
                <!-- Staff ID uses monospace — it's scannable/verifiable data -->
                <input type="text" class="psas-input" value="SEC-2024" readonly
                       title="Staff ID is assigned by Administrator"
                       style="font-family: var(--font-mono); letter-spacing: 0.08em; font-size: 0.875rem;">
                <small style="font-size: 0.68rem; color: var(--slate-light);">Assigned by Administrator · cannot be changed</small>
              </div>
              <div class="col-md-6">
                <label class="psas-label">Full Name</label>
                <input type="text" id="profName" class="psas-input" value="Officer Reyes" required>
                <div class="field-error" id="err-profName">Full name is required.</div>
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="psas-label">Email Address</label>
                <input type="email" id="profEmail" class="psas-input" value="reyes.sec@psas.dyci.edu.ph" required>
                <div class="field-error" id="err-profEmail">Enter a valid email address.</div>
              </div>
              <div class="col-md-6">
                <label class="psas-label">Contact Number</label>
                <input type="tel" id="profPhone" class="psas-input" value="+63 917 123 4567" required>
                <div class="field-error" id="err-profPhone">Contact number is required.</div>
              </div>
            </div>

            <div class="text-end">
              <button type="submit" class="btn-psas-primary" id="btnSaveProfile">
                <i class="bi bi-check2"></i> Save Changes
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- ── Shift Details ────────────────────────────────────────────── -->
      <section id="sec-shift" class="settings-section">
        <div class="psas-card">
          <h4 class="form-section-title">Shift Details</h4>
          <p class="form-section-sub">Your assigned posting and schedule. Contact your supervisor to change these.</p>

          <div class="read-only-list">
            <div class="read-only-item">
              <div>
                <p class="read-only-label">Gate / Posting</p>
                <p class="read-only-desc">Current station</p>
              </div>
              <div class="read-only-val" style="color: var(--navy);">Gate 1 — Main Entry</div>
            </div>
            <div class="read-only-item">
              <div>
                <p class="read-only-label">Default Shift</p>
                <p class="read-only-desc">Standard hours</p>
              </div>
              <!-- Times use monospace — they're read precisely like a timestamp -->
              <div class="read-only-val" style="font-family: var(--font-mono); font-size: 0.8rem; letter-spacing: 0.04em;">06:00 – 14:00 (AM)</div>
            </div>
            <div class="read-only-item">
              <div>
                <p class="read-only-label">Employment Status</p>
                <p class="read-only-desc">Current contract</p>
              </div>
              <div class="read-only-val">
                <span class="status-chip enabled">Full-Time Active</span>
              </div>
            </div>
            <div class="read-only-item">
              <div>
                <p class="read-only-label">Direct Supervisor</p>
                <p class="read-only-desc">Report system issues to this person</p>
              </div>
              <div class="read-only-val">Admin — System Administrator</div>
            </div>
          </div>

          <div class="info-banner">
            <i class="bi bi-info-circle-fill"></i>
            <div>
              <strong style="display: block; margin-bottom: 0.2rem; font-size: 0.8rem;">Managed by Administrator</strong>
              <span style="font-size: 0.78rem;">Shift assignments are set by campus administration. Contact your supervisor to request schedule changes.</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Notifications ────────────────────────────────────────────── -->
      <section id="sec-notifs" class="settings-section">
        <div class="psas-card">
          <h4 class="form-section-title">System Notifications</h4>
          <p class="form-section-sub">Alert rules enforced across all security terminals at this site.</p>

          <div class="read-only-list">
            <div class="read-only-item">
              <div>
                <p class="read-only-label">Invalid Scan Alerts</p>
                <p class="read-only-desc">Popup on expired or unrecognized RFID</p>
              </div>
              <div class="read-only-val"><span class="status-chip enabled">Enabled</span></div>
            </div>
            <div class="read-only-item">
              <div>
                <p class="read-only-label">Slot Capacity Warnings</p>
                <p class="read-only-desc">Alert when lot reaches capacity</p>
              </div>
              <div class="read-only-val"><span class="status-chip enabled">Enabled</span></div>
            </div>
            <div class="read-only-item">
              <div>
                <p class="read-only-label">Audio Alerts</p>
                <p class="read-only-desc">Chime on successful scan; buzzer on error</p>
              </div>
              <div class="read-only-val"><span class="status-chip enabled">Enabled</span></div>
            </div>
            <div class="read-only-item">
              <div>
                <p class="read-only-label">Daily Summary Email</p>
                <p class="read-only-desc">End-of-shift report to your inbox</p>
              </div>
              <div class="read-only-val"><span class="status-chip disabled">Disabled</span></div>
            </div>
          </div>

          <div class="info-banner">
            <i class="bi bi-shield-lock-fill"></i>
            <div>
              <strong style="display: block; margin-bottom: 0.2rem; font-size: 0.8rem;">Terminal Policy Enforced</strong>
              <span style="font-size: 0.78rem;">These settings apply uniformly across all security terminals to maintain standard operating procedures.</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Security & Password ──────────────────────────────────────── -->
      <section id="sec-security" class="settings-section">
        <div class="psas-card">
          <h4 class="form-section-title">Security &amp; Password</h4>
          <p class="form-section-sub">Keep your account secured with a strong, private password.</p>

          <form id="passwordForm" novalidate>
            <div class="mb-4">
              <label class="psas-label">Current Password</label>
              <input type="password" id="pwdCurrent" class="psas-input" placeholder="Enter current password" required>
              <div class="field-error" id="err-pwdCurrent">Current password is required.</div>
            </div>

            <div class="row g-3 mb-2">
              <div class="col-md-6">
                <label class="psas-label">New Password</label>
                <input type="password" id="pwdNew" class="psas-input" placeholder="Minimum 8 characters" required>
                <div class="strength-bar-wrap">
                  <div class="strength-bar" id="strengthBar"></div>
                </div>
                <div class="strength-text" id="strengthText">Enter a password</div>
                <div class="field-error" id="err-pwdNew">Must be at least 8 characters.</div>
              </div>
              <div class="col-md-6">
                <label class="psas-label">Confirm New Password</label>
                <input type="password" id="pwdConfirm" class="psas-input" placeholder="Re-type new password" required>
                <div class="field-error" id="err-pwdConfirm">Passwords do not match.</div>
              </div>
            </div>

            <div class="text-end mt-4">
              <button type="submit" class="btn-psas-primary" id="btnSavePassword">
                <i class="bi bi-shield-check"></i> Update Password
              </button>
            </div>
          </form>
        </div>
      </section>

    </main>
  </div>
</div>

<!-- Toast Container -->
<div class="toast-container" id="toastContainer"></div>

<!-- Bootstrap 5 JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<script>
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ── Tab Switching ────────────────────────────────────────────────
  const tabs     = document.querySelectorAll('.settings-tab');
  const sections = document.querySelectorAll('.settings-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      const targetId = e.currentTarget.getAttribute('data-target');
      e.currentTarget.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // ── Toast System ─────────────────────────────────────────────────
  function showToast(title, message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast     = document.createElement('div');
    toast.className = `psas-toast ${type}`;

    const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
    toast.innerHTML = `
      <i class="bi ${icon}"></i>
      <div class="psas-toast-content">
        <h6>${title}</h6>
        <p>${message}</p>
      </div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateX(8px)';
      toast.style.transition = '0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  }

  // ── Validation Helpers ───────────────────────────────────────────
  function setError(inputId, message) {
    const inputEl = document.getElementById(inputId);
    const errEl   = document.getElementById(`err-${inputId}`);
    inputEl.style.borderColor = 'var(--danger)';
    errEl.textContent = message;
    errEl.classList.add('show');
  }

  function clearError(inputId) {
    const inputEl = document.getElementById(inputId);
    const errEl   = document.getElementById(`err-${inputId}`);
    inputEl.style.borderColor = '';
    if (errEl) errEl.classList.remove('show');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ── Profile Form ─────────────────────────────────────────────────
  const profileForm = document.getElementById('profileForm');
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const name  = document.getElementById('profName').value.trim();
    const email = document.getElementById('profEmail').value.trim();
    const phone = document.getElementById('profPhone').value.trim();

    clearError('profName'); clearError('profEmail'); clearError('profPhone');

    if (!name)                         { setError('profName',  'Full name is required.');          isValid = false; }
    if (!email || !validateEmail(email)){ setError('profEmail', 'Enter a valid email address.');    isValid = false; }
    if (!phone)                         { setError('profPhone', 'Contact number is required.');     isValid = false; }

    if (isValid) {
      const btn          = document.getElementById('btnSaveProfile');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...`;
      btn.disabled = true;

      // TODO: fetch('api/update_profile.php', { method: 'POST', body: ... })
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled  = false;
        showToast('Profile Updated', 'Your profile information has been saved.', 'success');
      }, 800);
    }
  });

  // ── Password Strength ────────────────────────────────────────────
  const pwdNew       = document.getElementById('pwdNew');
  const strengthBar  = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');

  pwdNew.addEventListener('input', (e) => {
    const val = e.target.value;
    clearError('pwdNew');

    if (val.length === 0) {
      strengthBar.style.width = '0%';
      strengthText.textContent = 'Enter a password';
      strengthText.style.color = 'var(--slate)';
    } else if (val.length < 5) {
      strengthBar.style.width           = '33%';
      strengthBar.style.backgroundColor = 'var(--danger)';
      strengthText.textContent          = 'Weak';
      strengthText.style.color          = 'var(--danger)';
    } else if (val.length < 8) {
      strengthBar.style.width           = '66%';
      strengthBar.style.backgroundColor = 'var(--amber)';
      strengthText.textContent          = 'Fair';
      strengthText.style.color          = 'var(--amber)';
    } else {
      strengthBar.style.width           = '100%';
      strengthBar.style.backgroundColor = '#22C55E';
      strengthText.textContent          = 'Strong';
      strengthText.style.color          = '#15803D';
    }
  });

  // ── Password Form ────────────────────────────────────────────────
  const passwordForm = document.getElementById('passwordForm');
  passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const current    = document.getElementById('pwdCurrent').value;
    const newPwd     = document.getElementById('pwdNew').value;
    const confirmPwd = document.getElementById('pwdConfirm').value;

    clearError('pwdCurrent'); clearError('pwdNew'); clearError('pwdConfirm');

    if (!current)            { setError('pwdCurrent', 'Current password is required.');          isValid = false; }
    if (newPwd.length < 8)   { setError('pwdNew',     'New password must be at least 8 characters.'); isValid = false; }
    if (newPwd !== confirmPwd){ setError('pwdConfirm', 'Passwords do not match.');               isValid = false; }

    if (isValid) {
      const btn          = document.getElementById('btnSavePassword');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...`;
      btn.disabled = true;

      // TODO: fetch('api/update_password.php', { method: 'POST', body: ... })
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled  = false;
        passwordForm.reset();
        strengthBar.style.width  = '0%';
        strengthText.textContent = 'Enter a password';
        strengthText.style.color = 'var(--slate)';
        showToast('Password Updated', 'Your security settings have been updated.', 'success');
      }, 1000);
    }
  });

});
</script>
</body>
</html>