/**
 * login.js — PSAS Login Page Client Logic
 * All "processing" here is simulated (frontend-only demo mode).
 * Replace simulation blocks with real fetch() calls once backend is connected.
 */

'use strict';

// ── Simulated user store (demo only — remove when backend is live) ──────────
const DEMO_USERS = [
  { id: 'admin001',    password: 'Admin@123',    role: 'admin',    name: 'System Administrator' },
  { id: 'faculty001',  password: 'Faculty@123',  role: 'faculty',  name: 'Prof. Juan dela Cruz' },
  { id: '2024-00001',  password: 'Student@123',  role: 'student',  name: 'Maria Santos' },
  { id: 'SEC-001',     password: 'Security@123', role: 'security', name: 'Guard Reyes' },
  { rfid: 'RFID-A1B2C3D4', role: 'faculty',      name: 'Prof. Dela Cruz (RFID)' },
  { rfid: 'QR-STU2024001', role: 'student',      name: 'Jose Rizal (QR)' },
];

// ── DOM references ──────────────────────────────────────────────────────────
const roleTabs      = document.querySelectorAll('.role-tab');
const loginForm     = document.getElementById('loginForm');
const alertBox      = document.getElementById('alertBox');
const rfidInput     = document.getElementById('rfidInput');
const rfidSection   = document.getElementById('rfidSection');
const rfidBadge     = document.getElementById('rfidBadge');
const submitBtn     = document.getElementById('submitBtn');
const passwordInput = document.getElementById('password');
const togglePassBtn = document.getElementById('togglePassword');
const visitorBtn    = document.getElementById('visitorBtn');
const visitorModal  = document.getElementById('visitorModal');
const visitorForm   = document.getElementById('visitorForm');
const visitorSubmit = document.getElementById('visitorSubmitBtn');
const registerLink  = document.getElementById('registerLink');

let activeRole = 'student'; // default

// ── Role tab switching ──────────────────────────────────────────────────────
roleTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    roleTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeRole = tab.dataset.role;
    clearAlert();
    clearAllErrors();
    updateFormForRole(activeRole);
  });
});

function updateFormForRole(role) {
  const idLabel    = document.getElementById('usernameLabel');
  const idInput    = document.getElementById('username');
  const regSection = document.getElementById('registerSection');

  const config = {
    admin:    { label: 'Admin Username',     placeholder: 'e.g. admin001',    showReg: false },
    faculty:  { label: 'Faculty ID / Email', placeholder: 'e.g. faculty001',  showReg: true  },
    student:  { label: 'Student ID Number',  placeholder: 'e.g. 2024-00001',  showReg: true  },
    visitor:  { label: 'Full Name or Email', placeholder: 'e.g. Juan Cruz',   showReg: false },
    security: { label: 'Staff ID',           placeholder: 'e.g. SEC-001',     showReg: false },
  };

  const c = config[role] || config.student;
  idLabel.textContent     = c.label;
  idInput.placeholder     = c.placeholder;
  if (regSection) regSection.style.display = c.showReg ? 'block' : 'none';
}

// ── Alert helpers ───────────────────────────────────────────────────────────
function showAlert(message, type = 'error') {
  const icons = { error: 'bi-exclamation-circle-fill', success: 'bi-check-circle-fill', warning: 'bi-exclamation-triangle-fill' };
  alertBox.className = `psas-alert psas-alert-${type} show`;
  alertBox.innerHTML = `<i class="bi ${icons[type]}"></i><span>${message}</span>`;
  alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearAlert() {
  alertBox.className = 'psas-alert';
  alertBox.innerHTML = '';
}

// ── Field error helpers ─────────────────────────────────────────────────────
function setError(inputId, message) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(inputId + 'Error');
  if (input) input.classList.add('is-invalid');
  if (err)   { err.textContent = message; err.classList.add('show'); }
}

function clearError(inputId) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(inputId + 'Error');
  if (input) { input.classList.remove('is-invalid'); input.classList.remove('is-valid'); }
  if (err)   err.classList.remove('show');
}

function markValid(inputId) {
  const input = document.getElementById(inputId);
  if (input) { input.classList.remove('is-invalid'); input.classList.add('is-valid'); }
}

function clearAllErrors() {
  ['username', 'password'].forEach(id => clearError(id));
  clearAlert();
}

// ── Real-time validation ────────────────────────────────────────────────────
document.getElementById('username')?.addEventListener('input', function () {
  if (this.value.trim()) { clearError('username'); markValid('username'); }
  else clearError('username');
});

passwordInput?.addEventListener('input', function () {
  if (this.value.length >= 6) { clearError('password'); markValid('password'); }
  else clearError('password');
});

// ── Password toggle ─────────────────────────────────────────────────────────
togglePassBtn?.addEventListener('click', () => {
  const isText = passwordInput.type === 'text';
  passwordInput.type      = isText ? 'password' : 'text';
  togglePassBtn.innerHTML = `<i class="bi bi-eye${isText ? '' : '-slash'}"></i>`;
});

// ── RFID / QR scan simulation ────────────────────────────────────────────────
rfidInput?.addEventListener('focus', () => {
  rfidSection.classList.add('scanning');
  rfidBadge.textContent  = 'Scanning…';
  rfidBadge.className    = 'rfid-badge active';
});

rfidInput?.addEventListener('blur', () => {
  if (!rfidInput.value) {
    rfidSection.classList.remove('scanning');
    rfidBadge.textContent = 'Ready';
    rfidBadge.className   = 'rfid-badge';
  }
});

rfidInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    processRfidScan(rfidInput.value.trim());
  }
});

function processRfidScan(tag) {
  if (!tag) return;

  rfidSection.classList.remove('scanning');
  console.log('[PSAS DEMO] RFID/QR scan:', tag);

  // TODO: Replace with fetch('/api/rfid-lookup.php', { method:'POST', body: JSON.stringify({ tag }) })
  const match = DEMO_USERS.find(u => u.rfid === tag);

  if (match) {
    rfidSection.classList.add('scan-success');
    rfidBadge.textContent = '✓ Matched';
    rfidBadge.className   = 'rfid-badge active';
    showAlert(`RFID/QR matched: <strong>${match.name}</strong> (${match.role}). Simulating login…`, 'success');

    setTimeout(() => {
      showAlert(`✓ Welcome, ${match.name}! Redirecting to dashboard… <em>(demo)</em>`, 'success');
      // TODO: window.location.href = 'dashboard.php';
    }, 1500);
  } else {
    rfidSection.classList.remove('scan-success');
    rfidBadge.textContent = 'Not found';
    rfidBadge.className   = 'rfid-badge';
    showAlert('RFID/QR tag not recognized. Try manual login or check registration status.', 'error');
    rfidInput.classList.add('is-invalid');
    setTimeout(() => {
      rfidInput.classList.remove('is-invalid');
      rfidInput.value = '';
    }, 2000);
  }
}

// ── Form validation & submit simulation ─────────────────────────────────────
loginForm?.addEventListener('submit', function (e) {
  e.preventDefault();
  clearAllErrors();

  const username = document.getElementById('username').value.trim();
  const password = passwordInput.value;
  let valid = true;

  // Validate username
  if (!username) {
    setError('username', 'This field is required.');
    valid = false;
  } else if (activeRole === 'student' && !/^\d{4}-\d{5}$/.test(username) && !username.includes('@')) {
    // allow email OR ID format
    if (!/\S+@\S+\.\S+/.test(username)) {
      setError('username', 'Enter a valid Student ID (e.g. 2024-00001) or email address.');
      valid = false;
    }
  }

  // Validate password
  if (!password) {
    setError('password', 'Password is required.');
    valid = false;
  } else if (password.length < 6) {
    setError('password', 'Password must be at least 6 characters.');
    valid = false;
  }

  if (!valid) return;

  // Loading state
  setButtonLoading(true);

  // Simulate network delay (demo)
  setTimeout(() => {
    simulateLogin(username, password);
  }, 1400);
});

function setButtonLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.innerHTML = isLoading
    ? `<span class="btn-spinner"></span> Verifying…`
    : `<i class="bi bi-box-arrow-in-right"></i> Sign In`;
}

function simulateLogin(username, password) {
  // TODO: Replace this entire block with:
  // const res = await fetch('login.php', { method: 'POST', body: formData });
  // const data = await res.json();
  // then handle redirect or errors from data

  const match = DEMO_USERS.find(u =>
    (u.id === username || u.email === username) && u.password === password && u.role === activeRole
  );

  setButtonLoading(false);

  if (match) {
    console.log('[PSAS DEMO] Login success:', match);
    showAlert(`✓ Welcome, <strong>${match.name}</strong>! Redirecting to ${match.role} dashboard… <em>(demo)</em>`, 'success');
    // TODO: window.location.href = `${match.role}-dashboard.php`;
  } else {
    // Simulate some specific error cases for realism
    const userExists = DEMO_USERS.find(u => u.id === username || u.email === username);
    if (userExists && userExists.role !== activeRole) {
      showAlert('Role mismatch — this account is not registered as a <strong>' + activeRole + '</strong>. Please select the correct role.', 'warning');
    } else if (userExists) {
      showAlert('Incorrect password. Please try again.', 'error');
      setError('password', 'Incorrect password.');
    } else {
      showAlert('Account not found. Check your ID/email or <a href="register.php" class="psas-link">register here</a>.', 'error');
    }
    console.log('[PSAS DEMO] Login failed for:', username, 'role:', activeRole);
  }
}

// ── Visitor modal handling ───────────────────────────────────────────────────
visitorBtn?.addEventListener('click', () => {
  const modal = new bootstrap.Modal(visitorModal);
  modal.show();
});

visitorForm?.addEventListener('submit', function (e) {
  e.preventDefault();
  const name    = document.getElementById('visitorName').value.trim();
  const plate   = document.getElementById('visitorPlate').value.trim();
  const contact = document.getElementById('visitorContact').value.trim();

  let valid = true;

  if (!name)    { setError('visitorName', 'Full name is required.');    valid = false; }
  if (!plate)   { setError('visitorPlate', 'Plate number is required.'); valid = false; }
  if (!contact) { setError('visitorContact', 'Contact number is required.'); valid = false; }
  else if (!/^[0-9+\-()\s]{7,15}$/.test(contact)) {
    setError('visitorContact', 'Enter a valid contact number.');
    valid = false;
  }

  if (!valid) return;

  visitorSubmit.disabled = true;
  visitorSubmit.innerHTML = `<span class="btn-spinner"></span> Processing…`;

  setTimeout(() => {
    // TODO: POST to visitor-checkin.php
    console.log('[PSAS DEMO] Visitor check-in:', { name, plate, contact });
    bootstrap.Modal.getInstance(visitorModal).hide();
    visitorSubmit.disabled = false;
    visitorSubmit.innerHTML = `<i class="bi bi-qr-code-scan"></i> Request Visitor Pass`;
    visitorForm.reset();
    showAlert(`✓ Visitor pass requested for <strong>${name}</strong> (${plate}). Security will verify entry. <em>(demo)</em>`, 'success');
  }, 1500);
});

// clear visitor errors on input
['visitorName','visitorPlate','visitorContact'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => clearError(id));
});

// ── Init ─────────────────────────────────────────────────────────────────────
updateFormForRole(activeRole);
console.log('[PSAS] Login page ready — demo mode active. No real backend connected yet.');
