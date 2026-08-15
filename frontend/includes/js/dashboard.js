/* PSAS — Security Dashboard Logic (DEMO MODE) | includes/js/dashboard.js */

// TODO: Replace mock arrays and timeouts with actual fetch() calls to backend endpoints.

const DEMO_VEHICLES = {
  '123456789': { name: 'Maria Dela Cruz', role: 'Student', plate: 'ABC-1234', status: 'Valid', photo: 'M' },
  '987654321': { name: 'Prof. Juan Santos', role: 'Faculty', plate: 'XYZ-987', status: 'Valid', photo: 'J' },
  'VISITOR-1': { name: 'Guest Driver', role: 'Visitor', plate: 'GHT-555', status: 'Expired', photo: 'G' },
  'PLATE-TEST':{ name: 'Manual Tester', role: 'Staff', plate: 'TEST-01', status: 'Valid', photo: 'T' },
  'NFC-MOCK-1':{ name: 'NFC Driver A', role: 'Student', plate: 'NFC-111', status: 'Valid', photo: 'A' },
  'NFC-MOCK-2':{ name: 'NFC Driver B', role: 'Faculty', plate: 'NFC-222', status: 'Valid', photo: 'B' }
};

// Zone Tracking Data
const DEMO_ZONES = {
  'Zone A': { name: 'Zone A', role: 'Faculty',  occupied: 42, capacity: 50  },
  'Zone B': { name: 'Zone B', role: 'Student',  occupied: 85, capacity: 100 },
  'Zone C': { name: 'Zone C', role: 'Visitor',  occupied: 15, capacity: 50  }
};

// State Variables
let detectedMode = 'entry';
let pendingScan = null;
let unreadNotifs = 0;
let shiftStats = { entries: 385, exits: 243, denied: 0 };
const currentlyParkedPlates = new Set(['ABC-1234', 'NFC-111']);

// DOM Elements
const rfidInput         = document.getElementById('rfid-input');
const scanResult        = document.getElementById('scan-result');
const resName           = document.getElementById('res-name');
const resRole           = document.getElementById('res-role');
const resPlate          = document.getElementById('res-plate');
const resPhoto          = document.getElementById('res-photo');
const resStatusBox      = document.getElementById('res-status-box');
const resStatusIcon     = document.getElementById('res-status-icon');
const resStatusText     = document.getElementById('res-status-text');
const lblAction         = document.getElementById('lbl-action');
const detectedActionBadge = document.getElementById('detected-action-badge');

// ── INITIALIZATION ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderZoneCards();
  rfidInput.focus();
  simulateRealTimeAlerts();
});

// Keep focus on scanner for hardware RFID input
document.addEventListener('click', (e) => {
  if (!e.target.closest('input') && !e.target.closest('button') && !e.target.closest('.dropdown-menu')) {
    rfidInput.focus();
  }
});

// ── SCAN LOGIC ──────────────────────────────────────────────────────────────
rfidInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    const code = this.value.trim().toUpperCase();
    this.value = '';
    if (code) processCode(code);
  }
});

document.getElementById('btn-nfc').addEventListener('click', () => {
  const keys = Object.keys(DEMO_VEHICLES);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  processCode(randomKey);
});

function processCode(code) {
  // TODO: fetch('api/validate_rfid.php?code=' + code)
  const data = DEMO_VEHICLES[code];

  if (data) {
    pendingScan = data;
    detectedMode = currentlyParkedPlates.has(data.plate) ? 'exit' : 'entry';
    showResultCard(data, detectedMode);
  } else {
    showToast('Scan Error', 'RFID/QR not found in database.', 'error');
    updateShiftStats('denied');
    resetScanner();
  }
}

function showResultCard(data, mode) {
  // Remove previous state classes
  scanResult.classList.remove('state-valid', 'state-invalid');
  scanResult.classList.add('show');

  resName.innerText  = data.name;
  resPlate.innerText = data.plate;
  resRole.innerText  = data.role;
  lblAction.innerText = mode === 'entry' ? 'Entry' : 'Exit';

  // Detected action badge — status-chip class system
  detectedActionBadge.innerText = mode.toUpperCase();
  detectedActionBadge.className = mode === 'entry'
    ? 'status-chip entry'
    : 'status-chip exit';

  // Driver photo
  resPhoto.src = `https://placehold.co/100x100/1D3A63/FFFFFF?text=${data.photo}`;

  // Role chip — status-chip modifier by role
  const roleMap = { Faculty: 'faculty', Student: 'student', Visitor: 'visitor', Staff: 'visitor' };
  resRole.className = `status-chip ${roleMap[data.role] || 'student'} mb-0`;

  // Status state — shifts card border/bg + updates status box
  if (data.status === 'Valid') {
    scanResult.classList.add('state-valid');
    resStatusBox.style.background   = '#F0FDF9';
    resStatusBox.style.borderColor  = '#22C55E';
    resStatusIcon.className         = 'bi bi-check-circle-fill text-success';
    resStatusText.innerText         = mode === 'entry'
      ? 'Permit Valid — Ready for Entry'
      : 'Vehicle Parked — Ready for Exit';
    resStatusText.style.color = '#15803D';
  } else {
    scanResult.classList.add('state-invalid');
    resStatusBox.style.background   = '#FEF2F2';
    resStatusBox.style.borderColor  = '#EF4444';
    resStatusIcon.className         = 'bi bi-x-circle-fill text-danger';
    resStatusText.innerText         = 'Permit Expired or Invalid — Access Denied';
    resStatusText.style.color       = '#B91C1C';
  }
}

function approveScan() {
  if (!pendingScan) return;
  // TODO: fetch('api/log_entry_exit.php', { method: 'POST', body: ... })

  showToast('Access Approved', `${pendingScan.plate} — ${detectedMode}.`, 'success');
  addLogToTable(pendingScan, detectedMode, true);
  updateShiftStats(detectedMode);

  let occ   = parseInt(document.getElementById('stat-occupied').innerText);
  let avail = parseInt(document.getElementById('stat-available').innerText);

  if (detectedMode === 'entry') {
    currentlyParkedPlates.add(pendingScan.plate);
    document.getElementById('stat-occupied').innerText  = occ + 1;
    document.getElementById('stat-available').innerText = Math.max(0, avail - 1);
  } else {
    currentlyParkedPlates.delete(pendingScan.plate);
    document.getElementById('stat-occupied').innerText  = Math.max(0, occ - 1);
    document.getElementById('stat-available').innerText = avail + 1;
  }

  updateZoneOccupancy(pendingScan.role, detectedMode === 'entry');
  resetScanner();
}

function denyScan() {
  if (!pendingScan) return;
  showToast('Access Denied', `${pendingScan.plate} denied for ${detectedMode}.`, 'error');
  addLogToTable(pendingScan, detectedMode, false);
  updateShiftStats('denied');
  resetScanner();
}

function resetScanner() {
  pendingScan = null;
  scanResult.classList.remove('show', 'state-valid', 'state-invalid');
  rfidInput.focus();
}

// ── ZONE OCCUPANCY ──────────────────────────────────────────────────────────
function renderZoneCards() {
  const container = document.getElementById('zoneCardsContainer');
  if (!container) return;
  container.innerHTML = '';

  // TODO: fetch('api/get_zone_occupancy.php') to populate DEMO_ZONES

  Object.values(DEMO_ZONES).forEach(zone => {
    let pct = Math.min(Math.round((zone.occupied / zone.capacity) * 100), 100);

    let statusClass = 'normal';
    let iconClass   = 'bi-check-circle-fill';
    let statusColor = 'var(--green)';

    if (pct >= 100) {
      statusClass = 'danger';
      iconClass   = 'bi-x-circle-fill';
      statusColor = 'var(--danger)';
    } else if (pct >= 80) {
      statusClass = 'warning';
      iconClass   = 'bi-exclamation-triangle-fill';
      statusColor = 'var(--amber)';
    }

    // Role chip modifier
    const roleMap = { Faculty: 'faculty', Student: 'student', Visitor: 'visitor' };
    const roleChipMod = roleMap[zone.role] || 'visitor';

    const col = document.createElement('div');
    col.className = 'col-12 col-xl-4';
    col.innerHTML = `
      <div class="zone-card">
        <div class="zone-header">
          <div>
            <h4 class="zone-title">${zone.name}</h4>
            <span class="status-chip ${roleChipMod}">${zone.role} Parking</span>
          </div>
          <i class="bi ${iconClass}" style="color: ${statusColor}; font-size: 1.1rem;"></i>
        </div>
        <div class="zone-stats mt-auto pt-2">
          <span class="zone-count">${zone.occupied} <span class="zone-capacity">/ ${zone.capacity}</span></span>
        </div>
        <div class="zone-progress-bg">
          <div class="zone-progress-fill ${statusClass}" style="width: ${pct}%;"></div>
        </div>
        <div class="zone-footer" style="color: ${statusColor};">
          <span>${pct}% Full</span>
          <span style="color: var(--slate-light); font-size: 0.65rem;">${zone.capacity - zone.occupied} free</span>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

function updateZoneOccupancy(role, isEntry) {
  let targetZone = null;
  if (role === 'Faculty') targetZone = 'Zone A';
  else if (role === 'Student') targetZone = 'Zone B';
  else targetZone = 'Zone C';

  if (DEMO_ZONES[targetZone]) {
    if (isEntry && DEMO_ZONES[targetZone].occupied < DEMO_ZONES[targetZone].capacity) {
      DEMO_ZONES[targetZone].occupied++;
    } else if (!isEntry && DEMO_ZONES[targetZone].occupied > 0) {
      DEMO_ZONES[targetZone].occupied--;
    }
    renderZoneCards();
  }
}

// ── UTILITIES & LOGS ────────────────────────────────────────────────────────
function updateShiftStats(action) {
  if (action === 'entry')  shiftStats.entries++;
  if (action === 'exit')   shiftStats.exits++;
  if (action === 'denied') shiftStats.denied++;

  document.getElementById('sum-entries').innerText = shiftStats.entries;
  document.getElementById('sum-exits').innerText   = shiftStats.exits;
}

// ── Full log store — holds every entry, unbounded ───────────────────────────
const fullLogStore = [];

function addLogToTable(data, action, isSuccess) {
  const tbody      = document.getElementById('log-tbody');
  const emptyState = document.getElementById('log-empty-state');
  if (emptyState) emptyState.remove();

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Push to full store first (newest first)
  fullLogStore.unshift({ data, action, isSuccess, timeStr, index: fullLogStore.length + 1 });

  // Update modal count badge
  const countEl = document.getElementById('modal-log-count');
  if (countEl) countEl.textContent = fullLogStore.length;

  // Build row HTML
  const tr = buildLogRow({ data, action, isSuccess, timeStr, index: fullLogStore.length }, false);
  tbody.insertBefore(tr, tbody.firstChild);

  // Cap visible table at 10 rows
  if (tbody.children.length > 10) tbody.removeChild(tbody.lastChild);
}

function buildLogRow(entry, showIndex) {
  const { data, action, isSuccess, timeStr, index } = entry;
  const tr = document.createElement('tr');
  tr.className = 'log-row-enter';

  const actionHtml = action === 'entry'
    ? `<span class="status-chip entry"><i class="bi bi-arrow-down-right"></i> Entry</span>`
    : `<span class="status-chip exit"><i class="bi bi-arrow-up-right"></i> Exit</span>`;

  const statusHtml = isSuccess
    ? `<i class="bi bi-check-circle-fill text-success" title="Approved"></i>`
    : `<i class="bi bi-x-circle-fill text-danger" title="Denied"></i>`;

  const roleMap = { Faculty: 'faculty', Student: 'student', Visitor: 'visitor', Staff: 'visitor' };
  const roleMod = roleMap[data.role] || 'student';

  // Store filter-friendly data attributes for modal search
  tr.dataset.plate    = data.plate.toLowerCase();
  tr.dataset.name     = data.name.toLowerCase();
  tr.dataset.action   = action;
  tr.dataset.result   = isSuccess ? 'approved' : 'denied';

  const indexCell = showIndex ? `<td style="color: var(--slate-light); font-size: 0.75rem;">${index}</td>` : '';

  tr.innerHTML = `
    ${indexCell}
    <td><span class="log-ts">${timeStr}</span></td>
    <td><span class="plate-badge">${data.plate}</span></td>
    <td>${data.name}</td>
    <td><span class="status-chip ${roleMod}">${data.role}</span></td>
    <td>${actionHtml}</td>
    <td>${statusHtml}</td>
  `;
  return tr;
}

// ── Modal: populate full log on open ────────────────────────────────────────
document.getElementById('allLogsModal').addEventListener('show.bs.modal', () => {
  renderModalLog(fullLogStore);
  document.getElementById('modal-log-search').value        = '';
  document.getElementById('modal-log-filter-action').value = '';
  document.getElementById('modal-log-filter-result').value = '';
});

function renderModalLog(entries) {
  const tbody = document.getElementById('modal-log-tbody');
  tbody.innerHTML = '';

  if (entries.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="7">
          <i class="bi bi-arrow-down-right-circle empty-icon"></i>
          <span class="empty-label">No activity yet this shift</span>
          <span class="empty-hint">Entries and exits will appear here as you scan</span>
        </td>
      </tr>`;
    document.getElementById('modal-log-filtered-count').textContent = '';
    return;
  }

  entries.forEach((entry, i) => {
    const row = buildLogRow({ ...entry, index: i + 1 }, true);
    row.classList.remove('log-row-enter'); // no animation in modal
    tbody.appendChild(row);
  });

  const total = fullLogStore.length;
  const shown = entries.length;
  document.getElementById('modal-log-filtered-count').textContent =
    shown === total ? `${total} entries` : `${shown} of ${total} entries`;
}

// ── Modal: search & filter ───────────────────────────────────────────────────
function filterModalLog() {
  const search = document.getElementById('modal-log-search').value.toLowerCase().trim();
  const action = document.getElementById('modal-log-filter-action').value;
  const result = document.getElementById('modal-log-filter-result').value;

  const filtered = fullLogStore.filter(entry => {
    const matchSearch = !search ||
      entry.data.plate.toLowerCase().includes(search) ||
      entry.data.name.toLowerCase().includes(search);
    const matchAction = !action || entry.action === action;
    const matchResult = !result || (result === 'approved' ? entry.isSuccess : !entry.isSuccess);
    return matchSearch && matchAction && matchResult;
  });

  renderModalLog(filtered);
}

document.getElementById('modal-log-search').addEventListener('input',        filterModalLog);
document.getElementById('modal-log-filter-action').addEventListener('change', filterModalLog);
document.getElementById('modal-log-filter-result').addEventListener('change', filterModalLog);

function showToast(title, message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast     = document.createElement('div');
  toast.className = `psas-toast ${type}`;

  // Consistent fill icons for filled state indicators in toasts
  const icon = type === 'success'
    ? 'bi-check-circle-fill'
    : (type === 'warning' ? 'bi-exclamation-circle-fill' : 'bi-exclamation-triangle-fill');

  toast.innerHTML = `
    <i class="bi ${icon}"></i>
    <div class="psas-toast-content">
      <h6>${title}</h6>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity    = '0';
    toast.style.transform  = 'translateX(8px)';
    toast.style.transition = '0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// Simulated real-time alerts
function simulateRealTimeAlerts() {
  // TODO: Replace with WebSocket or SSE subscription
  setInterval(() => { addNotification('Invalid RFID attempt at Gate 2', 'warning'); }, 60000);
}

function addNotification(msg, type) {
  unreadNotifs++;
  const badge = document.getElementById('notif-count');
  badge.innerText = unreadNotifs;
  badge.classList.remove('d-none');

  showToast('System Alert', msg, type);

  const listContainer = document.getElementById('notif-list-container');
  const emptyMsg      = document.getElementById('no-notifs-msg');
  if (emptyMsg) emptyMsg.remove();

  const notifEl = document.createElement('a');
  notifEl.className = 'dropdown-item py-2 border-bottom';
  notifEl.href = '#';
  notifEl.innerHTML = `
    <div class="d-flex align-items-center gap-2">
      <i class="bi bi-exclamation-triangle-fill text-${type}" style="font-size: 0.9rem;"></i>
      <span style="font-size: 0.78rem; white-space: normal; font-weight: 500;">${msg}</span>
    </div>
    <small style="font-size: 0.63rem; color: var(--slate-light); margin-left: 1.4rem; display: block; margin-top: 2px;">Just now</small>
  `;
  listContainer.insertBefore(notifEl, listContainer.firstChild);
}

document.getElementById('view-all-notifs').addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  unreadNotifs = 0;
  document.getElementById('notif-count').classList.add('d-none');
  document.getElementById('notif-list-container').innerHTML = `
    <div class="text-center py-4 text-muted" id="no-notifs-msg" style="font-size: 0.8rem;">
      <i class="bi bi-bell-slash d-block mb-1" style="font-size: 1.2rem; color: var(--slate-light);"></i>
      No active alerts
    </div>`;
});