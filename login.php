<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PSAS — Campus Parking Space Allocation System">
  <title>Terminal & Staff Login | PSAS</title>

  <!-- Bootstrap 5 CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <!-- Google Fonts: Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    /* ================================================================
       PSAS — Parking Space Allocation System
       Global Styles & Single File Integration
       ================================================================ */
    :root {
      --navy:       #0B1E3D;
      --navy-mid:   #132847;
      --navy-light: #1D3A63;
      --green:      #1A7F5A;
      --green-light:#22A370;
      --green-glow: rgba(26,127,90,0.18);
      --ice:        #F5F8FF;
      --ice-dark:   #EBF0FB;
      --slate:      #64748B;
      --slate-light:#94A3B8;
      --amber:      #F59E0B;
      --amber-light:#FEF3C7;
      --danger:     #DC2626;
      --danger-light:#FEE2E2;
      --white:      #FFFFFF;
      --text-main:  #0F172A;
      --text-sub:   #475569;

      --radius-sm:  6px;
      --radius-md:  12px;
      --radius-lg:  20px;
      --shadow-card: 0 8px 40px rgba(11,30,61,0.13);
      --shadow-btn:  0 4px 14px rgba(26,127,90,0.35);
      --transition:  0.2s ease;
      --font: 'Inter', system-ui, -apple-system, sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; }

    body {
      font-family: var(--font);
      background: var(--ice);
      color: var(--text-main);
      min-height: 100vh;
      margin: 0;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Split Layout ───────────────────────────────────────────────── */
    .psas-split {
      display: flex;
      min-height: 100vh;
    }

    .psas-panel-left {
      flex: 0 0 45%;
      background: var(--navy);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2.5rem;
      position: relative;
      overflow: hidden;
    }

    .psas-panel-left::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(-55deg, transparent, transparent 30px, rgba(255,255,255,0.015) 30px, rgba(255,255,255,0.015) 31px);
      pointer-events: none;
    }

    .psas-brand { position: relative; z-index: 1; text-align: center; max-width: 380px; }

    .psas-logo-ring {
      width: 88px; height: 88px; border-radius: 50%;
      background: var(--green-glow); border: 2px solid rgba(26,127,90,0.5);
      display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;
    }
    .psas-logo-ring i { font-size: 2.6rem; color: var(--green-light); }

    .psas-school-name { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--slate-light); margin-bottom: 0.35rem; }
    .psas-system-name { font-size: 1.65rem; font-weight: 800; color: var(--white); line-height: 1.2; margin-bottom: 0.5rem; }
    .psas-system-name span { color: var(--green-light); }
    .psas-tagline { font-size: 0.85rem; color: var(--slate-light); margin-bottom: 2.5rem; line-height: 1.5; }

    /* Parking grid */
    .parking-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; width: 100%; max-width: 320px; margin: 0 auto 2rem; }
    .p-stall {
      aspect-ratio: 2/3; border-radius: 4px; border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.04); position: relative; overflow: hidden; transition: all 0.4s ease;
    }
    .p-stall.occupied { background: rgba(26,127,90,0.25); border-color: rgba(26,127,90,0.5); }
    .p-stall.occupied::after {
      content: ''; position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%);
      width: 60%; height: 40%; background: rgba(26,127,90,0.55); border-radius: 2px 2px 0 0;
    }
    /* newly allocated animation */
    @keyframes slotAllocated {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
      50% { transform: scale(1.1); box-shadow: 0 0 15px 5px rgba(34, 197, 94, 0.5); background: rgba(34, 197, 94, 0.5); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
    .p-stall.just-allocated { animation: slotAllocated 1s ease-out; }

    .parking-legend { display: flex; gap: 1.2rem; justify-content: center; margin-bottom: 2rem; }
    .legend-item { display: flex; align-items: center; gap: 5px; font-size: 0.7rem; color: var(--slate-light); }
    .legend-dot { width: 10px; height: 10px; border-radius: 2px; }
    .legend-dot.free { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); }
    .legend-dot.taken { background: rgba(26,127,90,0.5); }

    .parking-stats { display: flex; gap: 1.5rem; justify-content: center; }
    .stat-item { text-align: center; }
    .stat-num { display: block; font-size: 1.4rem; font-weight: 800; color: var(--white); line-height: 1; }
    .stat-label { font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--slate-light); }

    /* Right panel */
    .psas-panel-right { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1.5rem; background: var(--ice); overflow-y: auto; }
    .psas-form-wrap { width: 100%; max-width: 480px; }

    .psas-alert {
      border-radius: var(--radius-md); font-size: 0.875rem; padding: 0.75rem 1rem;
      display: none; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem; border: none;
    }
    .psas-alert.show { display: flex; }
    .psas-alert-error { background: var(--danger-light); color: var(--danger); }
    .psas-alert-success { background: #DCFCE7; color: #15803D; }

    /* Cards */
    .psas-card { background: var(--white); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); padding: 2rem; margin-bottom: 1.5rem; }
    .form-section-title { font-size: 1.25rem; font-weight: 700; color: var(--navy); margin-bottom: 0.25rem; }
    .form-section-sub { font-size: 0.82rem; color: var(--slate); margin-bottom: 1.5rem; }

    .dashboard-view { display: none; width: 100%; height: 100%; flex-direction: column; }
    .dashboard-view.active { display: flex; }
    .login-view { display: flex; width: 100%; flex-direction: column; align-items: center; justify-content: center; }
    .login-view.hidden { display: none; }

    .dashboard-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid #E2E8F0; margin-bottom: 2rem; }
    .dashboard-title { font-size: 1.5rem; font-weight: 800; color: var(--navy); margin: 0; }
    .dashboard-user-info { display: flex; align-items: center; gap: 1rem; }
    .user-badge { background: var(--navy-light); color: var(--white); padding: 0.25rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.8rem; font-weight: 600; }
    .btn-logout { background: transparent; border: 1px solid var(--danger); color: var(--danger); padding: 0.4rem 0.8rem; border-radius: var(--radius-sm); font-size: 0.8rem; cursor: pointer; transition: all var(--transition); }
    .btn-logout:hover { background: var(--danger-light); }

    /* RFID Scanner specific */
    .rfid-terminal-area {
      border: 2px dashed #CBD5E1; border-radius: var(--radius-md); padding: 2rem 1.5rem; text-align: center;
      background: var(--ice); transition: all var(--transition); cursor: pointer;
    }
    .rfid-terminal-area.active-scan { border-color: var(--green); background: #F0FDF9; box-shadow: 0 0 0 4px var(--green-glow); }
    .rfid-terminal-area.success-scan { border-color: #22C55E; background: #DCFCE7; }
    .rfid-terminal-area.error-scan { border-color: var(--danger); background: var(--danger-light); }
    
    .rfid-terminal-input { opacity: 0; position: absolute; z-index: -1; }

    /* Tabs */
    .role-tabs-wrap { background: var(--ice-dark); border-radius: var(--radius-md); padding: 4px; display: flex; gap: 2px; margin-bottom: 1.5rem; }
    .role-tab {
      flex: 1; padding: 0.55rem 0.3rem; border: none; background: transparent; border-radius: calc(var(--radius-md) - 3px);
      font-size: 0.8rem; font-weight: 600; color: var(--slate); cursor: pointer; transition: all var(--transition);
    }
    .role-tab.active { background: var(--white); color: var(--navy); box-shadow: 0 1px 6px rgba(11,30,61,0.1); }

    /* Inputs */
    .psas-label { font-size: 0.8rem; font-weight: 600; color: var(--text-sub); margin-bottom: 0.35rem; display: block; }
    .psas-input {
      width: 100%; border: 1.5px solid #CBD5E1; border-radius: var(--radius-sm); padding: 0.6rem 0.875rem;
      font-size: 0.9rem; font-family: var(--font); outline: none; transition: all var(--transition);
    }
    .psas-input:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(26,127,90,0.12); }
    .input-icon-wrap { position: relative; }
    .input-icon-wrap .psas-input { padding-left: 2.4rem; }
    .input-icon-wrap .input-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--slate-light); font-size: 1rem; }
    
    .field-error { font-size: 0.75rem; color: var(--danger); margin-top: 0.3rem; display: none; }
    .field-error.show { display: block; }

    /* Buttons */
    .btn-psas-primary {
      width: 100%; padding: 0.7rem 1rem; background: var(--navy); color: var(--white); border: none; border-radius: var(--radius-sm);
      font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all var(--transition); display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    }
    .btn-psas-primary:hover { background: var(--navy-light); }
    .btn-psas-visitor {
      width: 100%; padding: 0.65rem 1rem; background: var(--amber-light); color: #92400E; border: 1.5px solid #FCD34D;
      border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 1rem;
    }
    
    .divider-or { text-align: center; position: relative; margin: 1.5rem 0; }
    .divider-or::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: #E2E8F0; }
    .divider-or span { position: relative; background: var(--ice); padding: 0 0.75rem; font-size: 0.75rem; color: var(--slate-light); font-weight: 500; }

    .psas-footer { text-align: center; padding: 1.25rem 1rem; font-size: 0.75rem; color: var(--slate-light); width: 100%; }
    
    #loginForm { display: none; }
    #loginForm.active { display: block; }

    /* Responsive */
    .psas-mobile-header { display: none; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid #E2E8F0; }
    @media (max-width: 900px) {
      .psas-panel-left { display: none; }
      .psas-panel-right { padding: 1.5rem 1rem; align-items: stretch; justify-content: flex-start;}
      .psas-mobile-header { display: flex; }
    }
  </style>
</head>
<body>

<div class="psas-split">

  <!-- ══ LEFT PANEL — Branding & Live Grid ════════════════════════════════ -->
  <div class="psas-panel-left">
    <div class="psas-brand">
      <div class="psas-logo-ring"><i class="bi bi-p-circle-fill"></i></div>
      <p class="psas-school-name">Dr. Yanga's Colleges Inc.</p>
      <h1 class="psas-system-name">Parking <span>Space</span><br>Allocation System</h1>
      <p class="psas-tagline">Smart, secure, and seamless campus parking management.</p>

      <!-- Live Parking Grid -->
      <div class="parking-grid" id="parkingGrid">
        <!-- Generated by JS -->
      </div>

      <div class="parking-legend">
        <div class="legend-item"><span class="legend-dot free"></span>Available</div>
        <div class="legend-item"><span class="legend-dot taken"></span>Occupied</div>
      </div>

      <div class="parking-stats">
        <div class="stat-item"><span class="stat-num" id="statAvail">—</span><span class="stat-label">Available</span></div>
        <div class="stat-item"><span class="stat-num" id="statOccup">—</span><span class="stat-label">Occupied</span></div>
        <div class="stat-item"><span class="stat-num" id="statTotal">24</span><span class="stat-label">Total Slots</span></div>
      </div>
    </div>
  </div>

  <!-- ══ RIGHT PANEL — Terminal & Login Form ══════════════════════════════ -->
  <div class="psas-panel-right">
    
    <div class="psas-form-wrap mx-auto login-view" id="authView">
      
      <!-- Mobile Header -->
      <div class="psas-mobile-header">
        <div class="psas-logo-ring" style="width:44px; height:44px; margin:0;"><i class="bi bi-p-circle-fill" style="font-size:1.3rem;"></i></div>
        <div>
          <div style="font-size:0.6rem; color:var(--slate); font-weight:600; letter-spacing:0.1em; text-transform:uppercase;">Dr. Yanga's Colleges Inc.</div>
          <div style="font-size:0.95rem; font-weight:800; color:var(--navy);">PSAS Portal</div>
        </div>
      </div>

      <!-- General Alert Box for Auth -->
      <div id="authAlertBox" class="psas-alert" role="alert"></div>

      <!-- ── STAFF DASHBOARD LOGIN & REGISTER (Admin & Security only) ── -->
      <div class="psas-card" style="width: 100%;">
        <div id="authHeader">
          <h3 class="form-section-title" style="font-size: 1.15rem;" id="formTitle">Staff Portal Login</h3>
          <p class="form-section-sub" id="formSubtitle">System Administration & Security Management</p>
        </div>

        <!-- Login Form -->
        <form id="loginForm" class="active" novalidate>
          <div class="role-tabs-wrap">
            <button type="button" class="role-tab active" data-role="security" onclick="selectLoginRole('security', this)">Security</button>
            <button type="button" class="role-tab" data-role="admin" onclick="selectLoginRole('admin', this)">Admin</button>
          </div>

          <div style="margin-bottom:1rem;">
            <label class="psas-label" id="usernameLabel">Staff ID Number</label>
            <div class="input-icon-wrap">
              <i class="bi bi-person-badge input-icon"></i>
              <input type="text" id="loginUsername" class="psas-input" placeholder="e.g. SEC-001" required>
            </div>
          </div>

          <div style="margin-bottom:1.25rem;">
            <label class="psas-label">Password</label>
            <div class="input-icon-wrap">
              <i class="bi bi-lock input-icon"></i>
              <input type="password" id="loginPassword" class="psas-input" placeholder="Enter password" required>
            </div>
          </div>

          <button type="submit" id="loginSubmitBtn" class="btn-psas-primary">
            <i class="bi bi-shield-lock"></i> Access Dashboard
          </button>
        </form>

      </div>

      <!-- Footer -->
      <footer class="psas-footer">
        <p>&copy; 2026 Dr. Yanga's Colleges Inc. — PSAS Kiosk v1.0</p>
      </footer>
    </div>

    <div class="dashboard-view" id="dashboardView">
      
      <div class="dashboard-header">
        <h2 class="dashboard-title">Dashboard</h2>
        <div class="dashboard-user-info">
          <span class="user-badge" id="dashUserRole">Security</span>
          <span id="dashUserName">SEC-001</span>
          <button class="btn-logout" onclick="logout()">Logout</button>
        </div>
      </div>

      <!-- General Alert Box for Dashboard -->
      <div id="dashAlertBox" class="psas-alert" role="alert"></div>

      <!-- ── RFID ALLOCATION TERMINAL (Students, Faculty, Visitors) ── -->
      <div class="psas-card" style="border-top: 4px solid var(--green); padding-bottom: 1.5rem; max-width: 480px; margin: 0 auto;">
        <div class="text-center mb-3">
          <h2 class="form-section-title">Tap In to Park</h2>
          <p class="form-section-sub mb-0">Scan RFID or QR code to allocate a parking space.</p>
        </div>

        <div class="rfid-terminal-area active-scan" id="rfidTerminal" onclick="document.getElementById('rfidTerminalInput').focus()">
          <i class="bi bi-upc-scan" id="rfidTerminalIcon" style="font-size: 3rem; color: var(--green); display: block; margin-bottom: 0.5rem;"></i>
          <h4 id="rfidTerminalMsg" style="font-size: 1rem; color: var(--navy); font-weight: 700; margin-bottom: 0.2rem;">Ready to Scan</h4>
          <p id="rfidTerminalSub" style="font-size: 0.8rem; color: var(--slate); margin: 0;">Click here to activate scanner</p>
          
          <!-- Hidden real input for physical scanners -->
          <input type="text" id="rfidTerminalInput" class="rfid-terminal-input" autocomplete="off">
        </div>

        <div class="text-center mt-2" style="font-size: 0.7rem; color: var(--slate-light);">
          <i class="bi bi-info-circle"></i> Demo RFIDs: <code>RFID-STU01</code> (Student), <code>RFID-FAC01</code> (Faculty), <code>QR-VIS01</code> (Visitor)
        </div>

        <button type="button" class="btn-psas-visitor" data-bs-toggle="modal" data-bs-target="#visitorModal">
          <i class="bi bi-qr-code"></i> Generate Visitor Pass
        </button>
      </div>

    </div>

  </div>
</div>

<!-- ══ Visitor Registration Modal ═════════════════════════════════════════ -->
<div class="modal fade" id="visitorModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content" style="border-radius:var(--radius-lg); border:none;">
      <div class="modal-header" style="border-bottom:1px solid #F1F5F9; padding:1.25rem 1.5rem 1rem;">
        <div>
          <h5 class="modal-title" style="font-weight:700; color:var(--navy); font-size:1rem;">
            <i class="bi bi-qr-code" style="color:var(--amber);"></i> Generate Visitor QR
          </h5>
          <p style="font-size:0.78rem; color:var(--slate); margin:0;">Fill in details to receive a temporary QR code for scanning.</p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body" style="padding:1.25rem 1.5rem;">
        <form id="visitorForm">
          <div style="margin-bottom:0.85rem;">
            <label class="psas-label">Full Name</label>
            <input type="text" id="visName" class="psas-input" placeholder="e.g. Juan dela Cruz" required>
          </div>
          <div style="margin-bottom:0.85rem;">
            <label class="psas-label">Plate Number</label>
            <input type="text" id="visPlate" class="psas-input" placeholder="e.g. ABC 1234" required style="text-transform:uppercase;">
          </div>
        </form>
      </div>
      <div class="modal-footer" style="border-top:1px solid #F1F5F9;">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-warning" id="genVisitorQR" style="color:#92400E; font-weight:600;">Generate QR Code</button>
      </div>
    </div>
  </div>
</div>

<!-- Scripts -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
'use strict';

const TOTAL_STALLS = 24;
let DEMO_USERS = [
  // Dashboard users (Login only)
  { id: 'admin001', password: 'admin', role: 'admin', name: 'Super Admin' },
  { id: 'sec001',   password: 'sec',   role: 'security', name: 'Guard One' },
  // Terminal users (RFID only)
  { tag: 'RFID-STU01', name: 'Maria Santos',   role: 'Student' },
  { tag: 'RFID-FAC01', name: 'Prof. Dela Cruz',role: 'Faculty' },
  { tag: 'QR-VIS01',   name: 'Juan Cruz',      role: 'Visitor' }
];

let currentUser = null; // null means not logged in
let isLoginMode = true; // true for login, false for register
let activeLoginRole = 'security';

// DOM Elements
const gridEl = document.getElementById('parkingGrid');
const terminalArea = document.getElementById('rfidTerminal');
const terminalInput = document.getElementById('rfidTerminalInput');
const terminalIcon = document.getElementById('rfidTerminalIcon');
const terminalMsg = document.getElementById('rfidTerminalMsg');
const terminalSub = document.getElementById('rfidTerminalSub');

const authView = document.getElementById('authView');
const dashboardView = document.getElementById('dashboardView');
const authAlertBox = document.getElementById('authAlertBox');
const dashAlertBox = document.getElementById('dashAlertBox');

const loginForm = document.getElementById('loginForm');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');


let parkingState = Array(TOTAL_STALLS).fill('free');

function initGrid() {
  gridEl.innerHTML = '';
  let occupiedCount = 0;
  
  // Randomly pre-fill some spots for demo realism (about 40% full)
  for (let i = 0; i < TOTAL_STALLS; i++) {
    const isOccupied = Math.random() < 0.4;
    parkingState[i] = isOccupied ? 'occupied' : 'free';
    if(isOccupied) occupiedCount++;
    
    const stall = document.createElement('div');
    stall.className = `p-stall ${isOccupied ? 'occupied' : ''}`;
    stall.id = `stall-${i}`;
    gridEl.appendChild(stall);
  }
  updateStats();
}

function updateStats() {
  const occ = parkingState.filter(s => s === 'occupied').length;
  document.getElementById('statAvail').textContent = TOTAL_STALLS - occ;
  document.getElementById('statOccup').textContent = occ;
}

function allocateParkingSpace() {
  // Find first free space
  const slotIndex = parkingState.findIndex(s => s === 'free');
  if (slotIndex === -1) return -1; // Full
  
  // Mark occupied
  parkingState[slotIndex] = 'occupied';
  const stallEl = document.getElementById(`stall-${slotIndex}`);
  stallEl.className = 'p-stall occupied just-allocated';
  updateStats();
  
  // Remove animation class after it plays so it can be triggered again later if needed
  setTimeout(() => stallEl.classList.remove('just-allocated'), 1000);
  
  return slotIndex + 1; // Return human readable slot number
}

terminalInput.addEventListener('focus', () => {
  if(!currentUser) return; // Only active if logged in
  terminalArea.className = 'rfid-terminal-area active-scan';
  terminalIcon.className = 'bi bi-upc-scan';
  terminalIcon.style.color = 'var(--green)';
  terminalMsg.textContent = 'Listening for Scanner...';
  terminalSub.textContent = 'Please tap your RFID card or present QR code.';
});

terminalInput.addEventListener('blur', () => {
  terminalArea.className = 'rfid-terminal-area';
  terminalMsg.textContent = 'Scanner Paused';
  terminalSub.textContent = 'Click here to re-activate scanner';
});

terminalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleScan(terminalInput.value.trim());
    terminalInput.value = ''; // clear input
  }
});

function handleScan(scannedTag) {
  if (!scannedTag) return;
  
  const user = DEMO_USERS.find(u => u.tag === scannedTag);
  
  if (user) {
    // Attempt allocation
    const slot = allocateParkingSpace();
    
    if (slot !== -1) {
      // Success
      terminalArea.className = 'rfid-terminal-area success-scan';
      terminalIcon.className = 'bi bi-check-circle-fill';
      terminalIcon.style.color = '#15803D';
      terminalMsg.textContent = `Access Granted: ${user.name} (${user.role})`;
      terminalSub.innerHTML = `<strong style="color:#15803D; font-size:1.1rem;">Please park at Slot #${slot}</strong>`;
    } else {
      // Lot Full
      terminalArea.className = 'rfid-terminal-area error-scan';
      terminalIcon.className = 'bi bi-x-circle-fill';
      terminalIcon.style.color = 'var(--danger)';
      terminalMsg.textContent = 'Parking Lot Full';
      terminalSub.textContent = 'Sorry, there are no available spaces right now.';
    }
  } else {
    // Unrecognized tag
    terminalArea.className = 'rfid-terminal-area error-scan';
    terminalIcon.className = 'bi bi-exclamation-triangle-fill';
    terminalIcon.style.color = 'var(--danger)';
    terminalMsg.textContent = 'Unrecognized Tag';
    terminalSub.textContent = 'Please register your vehicle with the Admin office.';
  }

  // Reset scanner visually after 4 seconds
  setTimeout(() => {
    if(document.activeElement === terminalInput) {
      terminalInput.dispatchEvent(new Event('focus')); // restore listening state
    } else {
      terminalInput.dispatchEvent(new Event('blur'));
    }
  }, 4000);
}

function selectLoginRole(role, btnEl) {
  activeLoginRole = role;
  const tabs = loginForm.querySelectorAll('.role-tab');
  tabs.forEach(t => t.classList.remove('active'));
  btnEl.classList.add('active');
  document.getElementById('usernameLabel').textContent = role === 'admin' ? 'Admin ID' : 'Security Staff ID';
  authAlertBox.classList.remove('show');
}

function showAuthAlert(msg, type) {
  authAlertBox.className = `psas-alert psas-alert-${type} show`;
  authAlertBox.innerHTML = `<i class="bi ${type==='error'?'bi-exclamation-circle':'bi-check-circle'}-fill"></i> ${msg}`;
}

function showDashAlert(msg, type) {
  dashAlertBox.className = `psas-alert psas-alert-${type} show`;
  dashAlertBox.innerHTML = `<i class="bi ${type==='error'?'bi-exclamation-circle':'bi-check-circle'}-fill"></i> ${msg}`;
  setTimeout(() => dashAlertBox.classList.remove('show'), 5000);
}

// Handle Login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('loginUsername').value.trim();
  const pass = document.getElementById('loginPassword').value;
  
  if (!id || !pass) {
    showAuthAlert('Please enter both ID and password.', 'error');
    return;
  }

  const staff = DEMO_USERS.find(u => u.id === id && u.password === pass && u.role === activeLoginRole);
  const btn = document.getElementById('loginSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Verifying...';

  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-shield-lock"></i> Access Dashboard`;
    
    if (staff) {
      loginSuccess(staff);
    } else {
      showAuthAlert('Invalid credentials or incorrect role selected.', 'error');
    }
  }, 800);
});

function loginSuccess(user) {
  currentUser = user;
  
  // Setup Dashboard
  document.getElementById('dashUserName').textContent = user.name || user.id;
  document.getElementById('dashUserRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  
  // Switch Views
  authView.classList.add('hidden');
  dashboardView.classList.add('active');
  
  // Clear forms
  loginForm.reset();
  authAlertBox.classList.remove('show');
  
  // Focus scanner immediately
  setTimeout(() => terminalInput.focus(), 100);
}

function logout() {
  currentUser = null;
  dashboardView.classList.remove('active');
  authView.classList.remove('hidden');
  isLoginMode = true;
  loginForm.classList.add('active'); // Ensure login form is visible
}


document.getElementById('genVisitorQR').addEventListener('click', () => {
  const name = document.getElementById('visName').value;
  if(!name) return alert('Please enter name');
  
  // Mock adding visitor to the system temporarily
  const newTag = `QR-VIS-${Math.floor(Math.random()*1000)}`;
  DEMO_USERS.push({ tag: newTag, name: name, role: 'Visitor' });
  
  bootstrap.Modal.getInstance(document.getElementById('visitorModal')).hide();
  
  terminalInput.value = newTag;
  terminalInput.focus();
  setTimeout(() => handleScan(newTag), 500); // auto scan the generated code
  document.getElementById('visitorForm').reset();
});

initGrid();

</script>
</body>
</html>