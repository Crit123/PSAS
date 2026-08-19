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

// ── LIVE PARKING SLOTS (per-slot, FRONTEND-SIMULATED ONLY) ──────────────────
// No physical sensors, ESP32, database, or API are connected here — this is
// purely a frontend mock (mockParkingData equivalent) so the UI and workflow
// can be designed against realistic-looking data ahead of real hardware.
// When actual sensor hardware is integrated later, this object is the one
// thing that needs to be swapped for real data (e.g. from
// fetch('api/get_parking_slots.php')); renderSlotGrid(), the filters, and the
// entry/exit slot-assignment logic below don't need to change.
const DEMO_SLOTS = {
  'Zone A': [
    { id: 'A01', status: 'occupied' }, { id: 'A02', status: 'available' },
    { id: 'A03', status: 'available' }, { id: 'A04', status: 'reserved' },
    { id: 'A05', status: 'occupied' }, { id: 'A06', status: 'available' }
  ],
  'Zone B': [
    { id: 'B01', status: 'occupied' }, { id: 'B02', status: 'occupied' },
    { id: 'B03', status: 'available' }, { id: 'B04', status: 'reserved' },
    { id: 'B05', status: 'occupied' }, { id: 'B06', status: 'available' }
  ],
  'Zone C': [
    { id: 'C01', status: 'available' }, { id: 'C02', status: 'occupied' },
    { id: 'C03', status: 'available' }, { id: 'C04', status: 'available' }
  ]
};

// Tracks which physical slot a currently-parked plate occupies, so exit can
// release the correct one. TODO: this belongs in the backend parking record.
const plateToSlot = new Map();

// State Variables
let detectedMode = 'entry';
let pendingScan = null;
let unreadNotifs = 0;
let shiftStats = { entries: 385, exits: 243, denied: 0 };
const currentlyParkedPlates = new Set(['ABC-1234', 'NFC-111']);

// ── HARDWARE / SYSTEM STATUS ────────────────────────────────────────────────
// TODO: Replace with fetch('api/hardware_status.php') polled on an interval.
let hardwareStatus = {
  'RFID Reader': 'online',
  'QR Scanner':  'online',
  'Sensors':     'online',
  'Gate':        'online',
  'Network':     'online'
};

function renderSystemStatus() {
  const btn   = document.getElementById('sysStatusBtn');
  const list  = document.getElementById('sysStatusList');
  const labelLg = document.getElementById('sysStatusLabel');
  const labelSm = document.getElementById('sysStatusLabelSm');

  const entries = Object.entries(hardwareStatus);
  const onlineCount = entries.filter(([, v]) => v === 'online').length;
  const total = entries.length;
  const scannerDown = hardwareStatus['RFID Reader'] !== 'online' && hardwareStatus['QR Scanner'] !== 'online';

  btn.classList.remove('warning', 'critical');
  if (onlineCount === total) {
    labelLg.textContent = 'All Systems Operational';
  } else if (scannerDown || hardwareStatus['Gate'] !== 'online') {
    btn.classList.add('critical');
    labelLg.textContent = `${onlineCount}/${total} Systems Online`;
  } else {
    btn.classList.add('warning');
    labelLg.textContent = `${onlineCount}/${total} Systems Online`;
  }
  labelSm.textContent = `${onlineCount}/${total}`;

  list.innerHTML = entries.map(([name, state]) => `
    <div class="sys-status-row">
      <span>${name}</span>
      <span class="sys-badge ${state}">${state}</span>
    </div>
  `).join('');

  // Gate the scanner UI when both scan input methods are down
  const banner = document.getElementById('scannerOfflineBanner');
  const liveChip = document.getElementById('scannerLiveChip');
  if (scannerDown) {
    banner.classList.add('show');
    rfidInput.disabled = true;
    rfidInput.placeholder = 'Scanner offline — use manual entry';
    liveChip.innerHTML = '<i class="bi bi-slash-circle"></i> Offline';
    liveChip.className = 'status-chip disabled';
  } else {
    banner.classList.remove('show');
    rfidInput.disabled = false;
    rfidInput.placeholder = 'Tap RFID card or scan QR code…';
    liveChip.innerHTML = '<i class="bi bi-broadcast-pin"></i> Active';
    liveChip.className = 'status-chip live';
  }

  // Compact "RFID Reader" line inside the scanner card
  const rfidStatusEl = document.getElementById('rfidReaderStatus');
  const rfidStatusText = document.getElementById('rfidReaderStatusText');
  if (rfidStatusEl && rfidStatusText) {
    rfidStatusEl.classList.toggle('offline', scannerDown);
    rfidStatusText.textContent = scannerDown ? 'Offline' : 'Ready';
  }

  // Sensors offline → the per-slot grid can no longer trust its data
  if (typeof renderSlotGrid === 'function') renderSlotGrid();
}

// Demo-only: occasionally flip a component offline to show the state working.
// TODO: remove once hardware_status.php polling is wired in.
function simulateHardwareFlaps() {
  setInterval(() => {
    const keys = Object.keys(hardwareStatus);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const wasOffline = hardwareStatus[key] === 'offline';
    hardwareStatus[key] = wasOffline ? 'online' : (Math.random() < 0.15 ? 'offline' : hardwareStatus[key]);
    if (wasOffline || hardwareStatus[key] === 'offline') {
      renderSystemStatus();
      if (hardwareStatus[key] === 'offline') {
        addNotification('Hardware Alert', `${key} went offline.`, 'hardware');
        // ONE Hardware Failure audit record per failure — a component going
        // offline is a single operational event, not a per-effect one.
        addAuditLog({
          type: 'hardware_failure',
          component: key,
          description: `${key} stopped responding and is currently offline.`
        });
      } else {
        addNotification('Hardware Restored', `${key} connection restored.`, 'hardware');
      }
    }
  }, 20000);
}

// Demo-only: occasionally a single parking sensor (rather than the whole
// Sensors subsystem) goes offline, flipping just that one slot to UNKNOWN.
// TODO: remove once per-slot sensor telemetry is wired to real hardware.
function simulateSlotSensorFailure() {
  setInterval(() => {
    if (hardwareStatus['Sensors'] !== 'online') return; // subsystem already down — don't double-report

    // Recovery pass: bring back any individually-failed sensor first
    const failing = Object.values(DEMO_SLOTS).flat().filter(s => s.sensorState === 'offline');
    if (failing.length > 0 && Math.random() < 0.5) {
      const slot = failing[Math.floor(Math.random() * failing.length)];
      delete slot.sensorState;
      renderSlotGrid();
      addNotification('Sensor Restored', `Parking Sensor ${slot.id} connection restored.`, 'hardware');
      return;
    }

    const assignedIds = new Set([...plateToSlot.values()].map(v => v.slotId));
    const candidates = Object.entries(DEMO_SLOTS).flatMap(([zoneName, slots]) =>
      slots.filter(s => s.sensorState !== 'offline' && !assignedIds.has(s.id)).map(s => ({ ...s, zoneName }))
    );
    if (candidates.length === 0 || Math.random() > 0.2) return;

    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const slot = DEMO_SLOTS[target.zoneName].find(s => s.id === target.id);
    slot.sensorState = 'offline';
    renderSlotGrid();
    addAuditLog({
      type: 'hardware_failure',
      component: `Parking Sensor ${target.id}`,
      parkingSlot: target.id,
      description: `Parking Sensor ${target.id} stopped responding.`
    });
    addNotification('Sensor Offline', `Parking Sensor ${target.id} stopped responding.`, 'hardware');
  }, 45000);
}

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

// ── REAL-TIME CLOCK ──────────────────────────────────────────────────────────
// Single interval, updates in place — no external API, browser local time.
function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById('navClockTime');
  const dateEl = document.getElementById('navClockDate');
  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
  }
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
  }
}

// ── INITIALIZATION ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderZoneCards();
  renderSystemStatus();
  renderSlotGrid();
  simulateHardwareFlaps();
  simulateSlotFlaps();
  simulateSlotSensorFailure();
  seedNotifications();
  updateClock();
  setInterval(updateClock, 1000);
  rfidInput.focus();
  simulateRealTimeAlerts();
});

// Keep focus on scanner for hardware RFID input
// (Skip entirely while a Bootstrap modal is open — otherwise this steals
//  focus from controls inside the modal, like the log filter <select>s,
//  and Bootstrap's modal focus trap yanks focus back to the close button.)
document.addEventListener('click', (e) => {
  if (document.body.classList.contains('modal-open')) return;
  if (!e.target.closest('input') && !e.target.closest('select') && !e.target.closest('button') && !e.target.closest('.dropdown-menu')) {
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
  if (rfidInput.disabled) return; // scanner hardware offline — ignore stray input
  const data = DEMO_VEHICLES[code];

  if (data) {
    pendingScan = data;
    detectedMode = currentlyParkedPlates.has(data.plate) ? 'exit' : 'entry';
    runWorkflowStepper(data, detectedMode);
  } else {
    showToast('Scan Error', 'RFID/QR not found in database.', 'error');
    updateShiftStats('denied');
    resetScanner();
  }
}

// ── WORKFLOW STEPPER ─────────────────────────────────────────────────────────
// Visually walks staff through what the hardware is doing before the
// approve/deny card appears, so the UI reads as "the system is handling this"
// rather than a manual data-entry form. TODO: once hardware is wired in, these
// stages should reflect real events (RFID read, sensor confirm, gate ack)
// rather than fixed timeouts.
let pendingSlot = null; // { zoneName, slotId } chosen for this pending entry

function runWorkflowStepper(data, mode) {
  const stepper = document.getElementById('workflowStepper');
  const stepperText = document.getElementById('workflowStepperText');
  scanResult.classList.remove('show');
  stepper.classList.add('show');

  const setStep = (text) => { stepperText.textContent = text; };

  if (mode === 'entry') {
    pendingSlot = data.status === 'Valid' ? findAvailableSlot(data.role) : null;
    const steps = [
      'RFID detected…',
      'Vehicle verified…',
      'Checking available spaces…',
      pendingSlot ? `Space ${pendingSlot.slotId} assigned…` : 'No confirmed space available…',
      'Gate opening…'
    ];
    playSteps(steps, () => {
      stepper.classList.remove('show');
      showResultCard(data, mode);
    });
  } else {
    const record = plateToSlot.get(data.plate);
    const steps = [
      'RFID detected…',
      'Vehicle verified…',
      'Locating parking record…',
      record ? `Exit authorized from ${record.slotId}…` : 'Exit authorized…',
      'Gate opening…'
    ];
    playSteps(steps, () => {
      stepper.classList.remove('show');
      showResultCard(data, mode);
    });
  }

  function playSteps(steps, onDone) {
    let i = 0;
    setStep(steps[i]);
    const interval = setInterval(() => {
      i++;
      if (i >= steps.length) {
        clearInterval(interval);
        onDone();
        return;
      }
      setStep(steps[i]);
    }, 450);
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

  // Assigned / current slot line
  const slotLine  = document.getElementById('res-slot-line');
  const slotLabel = document.getElementById('res-slot-label');
  const slotValue = document.getElementById('res-slot-value');
  if (data.status === 'Valid' && mode === 'entry' && pendingSlot) {
    slotLabel.textContent = 'Assigned Slot';
    slotValue.textContent = pendingSlot.slotId;
    slotLine.classList.add('show');
  } else if (data.status === 'Valid' && mode === 'exit' && plateToSlot.has(data.plate)) {
    slotLabel.textContent = 'Current Slot';
    slotValue.textContent = plateToSlot.get(data.plate).slotId;
    slotLine.classList.add('show');
  } else {
    slotLine.classList.remove('show');
  }

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

  // ── ENTRY: no available space anywhere in the vehicle's zone → PARKING FULL ──
  // Guard the whole flow: no allocation, no status change, no Vehicle Entry audit.
  if (detectedMode === 'entry' && !pendingSlot) {
    showToast('Parking Full', `No available spaces for ${pendingScan.plate} right now.`, 'error');
    updateShiftStats('denied');
    resetScanner();
    return;
  }

  let occ   = parseInt(document.getElementById('stat-occupied').innerText);
  let avail = parseInt(document.getElementById('stat-available').innerText);

  if (detectedMode === 'entry') {
    currentlyParkedPlates.add(pendingScan.plate);
    document.getElementById('stat-occupied').innerText  = occ + 1;
    document.getElementById('stat-available').innerText = Math.max(0, avail - 1);
    occupySlot(pendingSlot.zoneName, pendingSlot.slotId, pendingScan.plate);

    showToast('Access Approved', `${pendingScan.plate} — entry, assigned ${pendingSlot.slotId}.`, 'success');
    addAuditLog({
      type: 'entry',
      vehicle: pendingScan,
      parkingSlot: pendingSlot.slotId,
      description: `${pendingScan.plate} entered the parking area and was assigned ${pendingSlot.slotId}.`
    });
    setLatestAssignment(pendingScan, pendingSlot);
  } else {
    // ── EXIT: release the exact slot recorded for this plate, never a random one ──
    const record = plateToSlot.get(pendingScan.plate);
    currentlyParkedPlates.delete(pendingScan.plate);
    document.getElementById('stat-occupied').innerText  = Math.max(0, occ - 1);
    document.getElementById('stat-available').innerText = avail + 1;
    freeSlot(pendingScan.plate);

    showToast('Access Approved', `${pendingScan.plate} — exit${record ? `, released ${record.slotId}` : ''}.`, 'success');
    addAuditLog({
      type: 'exit',
      vehicle: pendingScan,
      parkingSlot: record ? record.slotId : null,
      description: record
        ? `${pendingScan.plate} exited the parking area and released ${record.slotId}.`
        : `${pendingScan.plate} exited the parking area.`
    });
    clearLatestAssignmentIfMatches(pendingScan.plate);
  }

  updateShiftStats(detectedMode);
  updateZoneOccupancy(pendingScan.role, detectedMode === 'entry');
  resetScanner();
}

function denyScan() {
  if (!pendingScan) return;
  // Access denials are not part of the operational audit trail (only Vehicle
  // Entry, Vehicle Exit, and Hardware Failure are) — surface via toast + stat only.
  showToast('Access Denied', `${pendingScan.plate} denied for ${detectedMode}.`, 'error');
  updateShiftStats('denied');
  resetScanner();
}

// ── LATEST PARKING ASSIGNMENT ────────────────────────────────────────────────
// Persists after resetScanner() clears the transient scan-result card, so
// staff always have the most recent "guide the driver to ___" instruction
// visible without needing to keep the scan card open.
let latestAssignment = null; // { plate, slotId, zoneName }

function setLatestAssignment(vehicle, slot) {
  latestAssignment = { plate: vehicle.plate, slotId: slot.slotId, zoneName: slot.zoneName };
  renderLatestAssignment();
}

function clearLatestAssignmentIfMatches(plate) {
  if (latestAssignment && latestAssignment.plate === plate) {
    latestAssignment = { ...latestAssignment, released: true };
    renderLatestAssignment();
  }
}

function renderLatestAssignment() {
  const panel = document.getElementById('latestAssignmentPanel');
  if (!panel) return;

  if (!latestAssignment) {
    panel.classList.remove('show');
    return;
  }

  panel.classList.add('show');
  panel.classList.toggle('released', !!latestAssignment.released);
  document.getElementById('latestAssignPlate').textContent = latestAssignment.plate;
  document.getElementById('latestAssignSlot').textContent  = latestAssignment.slotId;
  document.getElementById('latestAssignZone').textContent  = latestAssignment.zoneName;
  document.getElementById('latestAssignGuide').textContent = latestAssignment.released
    ? `${latestAssignment.plate} has exited — ${latestAssignment.slotId} is now available.`
    : `Guide the driver to ${latestAssignment.slotId}.`;
}

function resetScanner() {
  pendingScan = null;
  pendingSlot = null;
  document.getElementById('workflowStepper').classList.remove('show');
  scanResult.classList.remove('show', 'state-valid', 'state-invalid');
  rfidInput.focus();
}

// ── LOGOUT ───────────────────────────────────────────────────────────────────
// Frontend-only: shows a confirmation modal, then redirects to login.php.
// TODO (backend): replace the redirect below with a call to a logout endpoint
// that destroys the PHP session, then redirect to login.php on success —
// e.g. fetch('api/logout.php', { method: 'POST' }).then(() => location.href = 'login.php');
const logoutModalEl = document.getElementById('logoutModal');
const logoutModal = logoutModalEl ? new bootstrap.Modal(logoutModalEl) : null;

document.getElementById('btn-logout').addEventListener('click', (e) => {
  e.preventDefault();
  if (logoutModal) logoutModal.show();
});

document.getElementById('btn-confirm-logout').addEventListener('click', () => {
  window.location.href = 'login.php';
});

// ── LIVE PARKING SLOTS (per-slot, frontend-simulated) ───────────────────────
// This entire section is a frontend simulation only — no sensor hardware,
// ESP32, database, or API is actually connected. mockParkingData below is the
// single source of truth; when real hardware is wired in later, replace it
// with data fetched from the backend (e.g. realParkingData) and keep the
// render/filter functions as-is — they don't care where the data came from.
let slotFilter = 'all';

const EMPTY_STATE_COPY = {
  all:       { title: 'No Parking Spaces', body: 'No spaces are configured for this view.' },
  available: { title: 'No Available Spaces', body: 'All monitored spaces are currently occupied or reserved.' },
  occupied:  { title: 'No Occupied Spaces', body: 'No vehicles are currently detected in a monitored space.' },
  reserved:  { title: 'No Reserved Spaces', body: 'There are currently no reserved parking spaces.' },
  unknown:   { title: 'No Unknown Spaces', body: 'All parking sensors are currently reporting normally.' }
};

function getEffectiveSlots() {
  const sensorsDown = hardwareStatus['Sensors'] !== 'online';
  const all = [];
  Object.entries(DEMO_SLOTS).forEach(([zoneName, slots]) => {
    slots.forEach(slot => all.push({
      ...slot,
      zoneName,
      effectiveStatus: (sensorsDown || slot.sensorState === 'offline') ? 'unknown' : slot.status
    }));
  });
  return all;
}

function updateFilterCounts(allSlots) {
  const counts = { all: allSlots.length, available: 0, occupied: 0, reserved: 0, unknown: 0 };
  allSlots.forEach(s => counts[s.effectiveStatus]++);
  document.querySelectorAll('.parking-filter-count').forEach(el => {
    const key = el.dataset.count;
    el.textContent = counts[key] ?? 0;
  });
  const totalLabel = document.getElementById('slotTotalLabel');
  if (totalLabel) totalLabel.textContent = `${counts.all} spaces monitored · ${counts.available} available now`;
}

function renderSlotGrid() {
  const container = document.getElementById('slotZonesContainer');
  if (!container) return;

  const allSlots = getEffectiveSlots();
  updateFilterCounts(allSlots);

  const visible = allSlots.filter(s => slotFilter === 'all' || s.effectiveStatus === slotFilter);

  if (visible.length === 0) {
    const copy = EMPTY_STATE_COPY[slotFilter] || EMPTY_STATE_COPY.all;
    container.innerHTML = `
      <div class="slot-zone-empty">
        <i class="bi bi-grid-3x3-gap"></i>
        <strong>${copy.title}</strong>
        <span>${copy.body}</span>
      </div>`;
    return;
  }

  // Group the (already-filtered) visible slots back by zone for display
  const byZone = {};
  visible.forEach(s => { (byZone[s.zoneName] = byZone[s.zoneName] || []).push(s); });

  container.innerHTML = Object.entries(byZone).map(([zoneName, slots]) => {
    const cellsHtml = slots.map(slot => {
      const label = slot.effectiveStatus === 'unknown'
        ? `${slot.id} — Unknown (Sensor Offline)`
        : `${slot.id} — ${slot.effectiveStatus.charAt(0).toUpperCase() + slot.effectiveStatus.slice(1)}`;
      const icon = slot.effectiveStatus === 'unknown' ? '<i class="bi bi-question-lg"></i>' : '';
      return `<div class="p-stall ${slot.effectiveStatus}" title="${label}" aria-label="${label}">${slot.id}${icon}</div>`;
    }).join('');

    return `
      <div class="slot-zone-block">
        <div class="slot-zone-title">${zoneName}</div>
        <div class="dashboard-grid">${cellsHtml}</div>
      </div>`;
  }).join('');
}

document.getElementById('slotFilterBar').addEventListener('click', (e) => {
  const btn = e.target.closest('.parking-filter-option');
  if (!btn) return;
  document.querySelectorAll('.parking-filter-option').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  slotFilter = btn.dataset.filter;
  renderSlotGrid();
});

// Subtle simulated "live" occupancy changes — infrequent and low-key, just
// enough that the dashboard feels like it's receiving real sensor updates.
// Skipped while sensors are marked offline (no real hardware would be
// reporting changes in that state either) and never touches a slot a staff
// member currently has assigned via plateToSlot.
function simulateSlotFlaps() {
  setInterval(() => {
    if (hardwareStatus['Sensors'] !== 'online') return;

    const assignedIds = new Set([...plateToSlot.values()].map(v => v.slotId));
    const allSlots = Object.values(DEMO_SLOTS).flat().filter(s => !assignedIds.has(s.id));
    if (allSlots.length === 0) return;

    const slot = allSlots[Math.floor(Math.random() * allSlots.length)];
    if (slot.status === 'available') slot.status = 'occupied';
    else if (slot.status === 'occupied') slot.status = 'available';
    // reserved slots are left alone by the simulation — that's a staff/admin action
    renderSlotGrid();
  }, 35000);
}


// Zone name → role mapping shared with the aggregate zone cards
const ZONE_BY_ROLE = { Faculty: 'Zone A', Student: 'Zone B', Visitor: 'Zone C', Staff: 'Zone C' };

function findAvailableSlot(role) {
  const zoneName = ZONE_BY_ROLE[role] || 'Zone C';
  const sensorsDown = hardwareStatus['Sensors'] !== 'online';
  if (sensorsDown) return null; // can't safely auto-assign without sensor confirmation
  const zoneSlots = DEMO_SLOTS[zoneName] || [];
  const free = zoneSlots.find(s => s.status === 'available' && s.sensorState !== 'offline');
  return free ? { zoneName, slotId: free.id } : null;
}

function occupySlot(zoneName, slotId, plate) {
  const slot = (DEMO_SLOTS[zoneName] || []).find(s => s.id === slotId);
  if (slot) slot.status = 'occupied';
  plateToSlot.set(plate, { zoneName, slotId });
  renderSlotGrid();
}

function freeSlot(plate) {
  const record = plateToSlot.get(plate);
  if (!record) return;
  const slot = (DEMO_SLOTS[record.zoneName] || []).find(s => s.id === record.slotId);
  if (slot) slot.status = 'available';
  plateToSlot.delete(plate);
  renderSlotGrid();
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

// ── OPERATIONAL AUDIT TRAIL ──────────────────────────────────────────────────
// Single source of truth for the audit log. Only THREE event types ever land
// here: 'entry', 'exit', 'hardware_failure'. Normal UI interactions (opening
// dropdowns/modals, filtering, viewing notifications, etc.) never create a
// record. TODO: replace fullLogStore + addAuditLog with fetch('api/log_event.php')
// and a paginated api/get_activity_log.php read, once a backend exists.
const fullLogStore = [];
let auditIdSeq = 1;

const AUDIT_TYPE_META = {
  entry:            { label: 'Vehicle Entry',   chipClass: 'entry',  icon: 'bi-arrow-down-right' },
  exit:              { label: 'Vehicle Exit',    chipClass: 'exit',   icon: 'bi-arrow-up-right' },
  hardware_failure:  { label: 'Hardware Failure', chipClass: 'hardware', icon: 'bi-exclamation-triangle-fill' }
};

/**
 * addAuditLog — the ONLY entry point that should ever write to the audit
 * trail. Accepts a plain event object and normalizes it into the shared
 * record shape: { type, vehicle, parkingSlot, component, description, timestamp }.
 */
function addAuditLog(evt) {
  const record = {
    id: auditIdSeq++,
    type: evt.type,                          // 'entry' | 'exit' | 'hardware_failure'
    vehicle: evt.vehicle || null,             // { plate, name, role } for entry/exit
    parkingSlot: evt.parkingSlot || null,     // slot id, when relevant
    component: evt.component || null,         // hardware component, for hardware_failure
    description: evt.description,
    timestamp: Date.now(),
    timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };

  fullLogStore.unshift(record);

  const countEl = document.getElementById('modal-log-count');
  if (countEl) countEl.textContent = fullLogStore.length;

  // Recent Activity (main dashboard table) — capped at latest 10, newest first
  const tbody      = document.getElementById('log-tbody');
  const emptyState = document.getElementById('log-empty-state');
  if (emptyState) emptyState.remove();
  const tr = buildLogRow(record, false);
  tbody.insertBefore(tr, tbody.firstChild);
  if (tbody.children.length > 10) tbody.removeChild(tbody.lastChild);

  // Keep the "View all" modal in sync if it's currently open
  if (document.getElementById('allLogsModal').classList.contains('show')) {
    modalLogPage = 1;
    filterModalLog();
  }

  return record;
}

function buildLogRow(record, showIndex) {
  const meta = AUDIT_TYPE_META[record.type];
  const tr = document.createElement('tr');
  tr.className = 'log-row-enter';

  const typeHtml = `<span class="status-chip ${meta.chipClass}"><i class="bi ${meta.icon}"></i> ${meta.label}</span>`;
  const slotHtml = record.parkingSlot
    ? `<span class="plate-badge" style="font-size: 0.72rem;">${record.parkingSlot}</span>`
    : `<span style="color: var(--slate-light);">—</span>`;
  const subjectPlate = record.vehicle ? record.vehicle.plate : (record.component || '—');
  const subjectName  = record.vehicle ? record.vehicle.name  : (record.component ? 'Hardware Component' : '—');

  // Filter-friendly data attributes for search + action filter
  tr.dataset.type   = record.type;
  tr.dataset.search = [
    record.vehicle ? record.vehicle.plate : '',
    record.vehicle ? record.vehicle.name  : '',
    record.component || '',
    record.parkingSlot || ''
  ].join(' ').toLowerCase();

  const indexCell = showIndex ? `<td style="color: var(--slate-light); font-size: 0.75rem;">${record.id}</td>` : '';

  tr.innerHTML = `
    ${indexCell}
    <td><span class="log-ts">${record.timeStr}</span></td>
    <td>${record.vehicle ? `<span class="plate-badge">${subjectPlate}</span>` : `<span style="font-weight:600; color: var(--text-main);">${subjectPlate}</span>`}</td>
    <td>${subjectName}</td>
    <td>${slotHtml}</td>
    <td>${typeHtml}</td>
    <td style="color: var(--slate); font-size: 0.8rem; max-width: 260px;">${record.description}</td>
  `;
  return tr;
}

// ── Modal: pagination state ─────────────────────────────────────────────────
const MODAL_LOG_PAGE_SIZE = 10;
let modalLogPage = 1;
let modalLogLastFiltered = [];

document.getElementById('allLogsModal').addEventListener('show.bs.modal', () => {
  document.getElementById('modal-log-search').value        = '';
  document.getElementById('modal-log-filter-action').value = '';
  modalLogPage = 1;
  filterModalLog();
});

function renderModalLog(entries) {
  const tbody = document.getElementById('modal-log-tbody');
  tbody.innerHTML = '';

  if (entries.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="6">
          <i class="bi bi-arrow-down-right-circle empty-icon"></i>
          <span class="empty-label">No activity yet this shift</span>
          <span class="empty-hint">Entries, exits, and hardware events will appear here</span>
        </td>
      </tr>`;
    document.getElementById('modal-log-filtered-count').textContent = '';
    renderModalPagination(0, 0, 0);
    return;
  }

  const totalFiltered = entries.length;
  const totalPages     = Math.max(1, Math.ceil(totalFiltered / MODAL_LOG_PAGE_SIZE));
  if (modalLogPage > totalPages) modalLogPage = totalPages;
  if (modalLogPage < 1) modalLogPage = 1;

  const startIdx = (modalLogPage - 1) * MODAL_LOG_PAGE_SIZE;
  const pageEntries = entries.slice(startIdx, startIdx + MODAL_LOG_PAGE_SIZE);

  pageEntries.forEach(record => {
    const row = buildLogRow(record, true);
    row.classList.remove('log-row-enter'); // no animation in modal
    tbody.appendChild(row);
  });

  const total = fullLogStore.length;
  document.getElementById('modal-log-filtered-count').textContent =
    totalFiltered === total ? `${total} entries` : `${totalFiltered} of ${total} entries`;

  renderModalPagination(totalFiltered, startIdx, startIdx + pageEntries.length);
}

function renderModalPagination(totalFiltered, rangeStart, rangeEnd) {
  const container = document.getElementById('modal-log-pagination');
  if (!container) return;

  if (totalFiltered === 0) {
    container.innerHTML = '';
    return;
  }

  const totalPages = Math.max(1, Math.ceil(totalFiltered / MODAL_LOG_PAGE_SIZE));

  // Compact page-number list: current ±1, plus first/last, with ellipses
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - modalLogPage) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  const pageBtns = pages.map(p => p === '…'
    ? `<span class="pagination-ellipsis">…</span>`
    : `<button type="button" class="pagination-page ${p === modalLogPage ? 'active' : ''}" data-page="${p}" aria-current="${p === modalLogPage ? 'page' : 'false'}">${p}</button>`
  ).join('');

  container.innerHTML = `
    <div class="pagination-range">Showing ${rangeStart + 1}–${rangeEnd} of ${totalFiltered}</div>
    <div class="pagination-controls">
      <button type="button" class="pagination-nav" id="modal-log-prev" ${modalLogPage === 1 ? 'disabled' : ''}>
        <i class="bi bi-chevron-left"></i> Previous
      </button>
      <div class="pagination-pages">${pageBtns}</div>
      <button type="button" class="pagination-nav" id="modal-log-next" ${modalLogPage === totalPages ? 'disabled' : ''}>
        Next <i class="bi bi-chevron-right"></i>
      </button>
    </div>`;
}

// Pagination clicks (delegated — buttons are rebuilt on every render)
document.getElementById('modal-log-pagination')?.addEventListener('click', (e) => {
  const pageBtn = e.target.closest('.pagination-page');
  const prevBtn = e.target.closest('#modal-log-prev');
  const nextBtn = e.target.closest('#modal-log-next');
  if (pageBtn) modalLogPage = parseInt(pageBtn.dataset.page, 10);
  else if (prevBtn && !prevBtn.disabled) modalLogPage--;
  else if (nextBtn && !nextBtn.disabled) modalLogPage++;
  else return;
  renderModalLog(modalLogLastFiltered);
});

// ── Modal: search & filter ───────────────────────────────────────────────────
function filterModalLog() {
  const search = document.getElementById('modal-log-search').value.toLowerCase().trim();
  const action = document.getElementById('modal-log-filter-action').value; // '', 'entry', 'exit', 'hardware_failure'

  const results = fullLogStore.filter(record => {
    const haystack = [
      record.vehicle ? record.vehicle.plate : '',
      record.vehicle ? record.vehicle.name  : '',
      record.component || '',
      record.parkingSlot || ''
    ].join(' ').toLowerCase();
    const matchSearch = !search || haystack.includes(search);
    const matchAction = !action || record.type === action;
    return matchSearch && matchAction;
  });

  modalLogPage = 1;
  modalLogLastFiltered = results;
  renderModalLog(results);
}

document.getElementById('modal-log-search').addEventListener('input',        filterModalLog);
document.getElementById('modal-log-filter-action').addEventListener('change', filterModalLog);

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

// ── NOTIFICATIONS ────────────────────────────────────────────────────────────
// TODO: Replace mock seed data + interval with a WebSocket/SSE subscription
// backed by api/notifications.php.
const NOTIF_ICONS = {
  parking:    'bi-p-circle-fill',
  'entry-exit': 'bi-car-front-fill',
  hardware:   'bi-cpu-fill',
  security:   'bi-shield-exclamation',
  system:     'bi-gear-fill'
};
const NOTIF_LABELS = {
  parking: 'Parking', 'entry-exit': 'Entry/Exit', hardware: 'Hardware',
  security: 'Security', system: 'System'
};

let notifications = [];
let notifIdSeq = 1;

function addNotification(title, message, category = 'system', silent = false) {
  const notif = {
    id: notifIdSeq++,
    title, message, category,
    timestamp: Date.now(),
    read: false
  };
  notifications.unshift(notif);
  if (!silent) {
    showToast(title, message, category === 'security' ? 'error' : (category === 'hardware' ? 'warning' : 'success'));
  }
  renderNotifDropdown();
  renderNotifModal();
  updateNotifBadge();
}

function updateNotifBadge() {
  unreadNotifs = notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notif-count');
  badge.innerText = unreadNotifs > 9 ? '9+' : unreadNotifs;
  badge.classList.toggle('d-none', unreadNotifs === 0);
}

function timeAgo(ts) {
  const diffMin = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (diffMin < 1) return 'Just now';
  if (diffMin === 1) return '1 minute ago';
  if (diffMin < 60) return `${diffMin} minutes ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr === 1) return '1 hour ago';
  if (diffHr < 24) return `${diffHr} hours ago`;
  return `${Math.floor(diffHr / 24)} day(s) ago`;
}

function notifItemHTML(n) {
  return `
    <a href="#" class="notification-item ${n.read ? 'read' : 'unread'}" data-notif-id="${n.id}">
      <div class="notification-icon ${n.category}"><i class="bi ${NOTIF_ICONS[n.category]}"></i></div>
      <div class="notification-body">
        <p class="notification-title">${!n.read ? '<span class="unread-dot"></span>' : ''}${n.title}</p>
        <p class="notification-message">${n.message}</p>
        <div class="notification-meta">
          <span class="notification-category ${n.category}">${NOTIF_LABELS[n.category]}</span>
          <span class="notification-time">${timeAgo(n.timestamp)}</span>
        </div>
      </div>
    </a>`;
}

function renderNotifDropdown() {
  const listContainer = document.getElementById('notif-list-container');
  if (notifications.length === 0) {
    listContainer.innerHTML = `
      <div class="text-center py-4 text-muted" id="no-notifs-msg" style="font-size: 0.83rem;">
        <i class="bi bi-bell-slash d-block mb-1" style="font-size: 1.2rem; color: var(--slate-light);"></i>
        No active alerts
      </div>`;
    return;
  }
  listContainer.innerHTML = notifications.slice(0, 5).map(notifItemHTML).join('');
}

let notifModalFilter = 'all';

function renderNotifModal() {
  const list = document.getElementById('modal-notif-list');
  document.getElementById('modal-notif-count').textContent = notifications.length;
  document.getElementById('modal-notif-unread-count').textContent = notifications.filter(n => !n.read).length;

  let filtered = notifications;
  if (notifModalFilter === 'unread') {
    filtered = notifications.filter(n => !n.read);
  } else if (notifModalFilter !== 'all') {
    filtered = notifications.filter(n => n.category === notifModalFilter);
  }

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="notification-empty">
        <i class="bi bi-bell-slash"></i>
        <strong>No notifications</strong>
        <span>You're all caught up.</span>
      </div>`;
    return;
  }
  list.innerHTML = filtered.map(notifItemHTML).join('');
}

// Click a notification (dropdown or modal) → mark it read
document.addEventListener('click', (e) => {
  const item = e.target.closest('.notification-item');
  if (!item) return;
  e.preventDefault();
  const id = parseInt(item.dataset.notifId, 10);
  const n = notifications.find(n => n.id === id);
  if (n && !n.read) {
    n.read = true;
    updateNotifBadge();
    renderNotifDropdown();
    renderNotifModal();
  }
});

// Category filter tabs inside the modal
document.getElementById('notif-filter-bar').addEventListener('click', (e) => {
  const tab = e.target.closest('.notif-filter-tab');
  if (!tab) return;
  document.querySelectorAll('.notif-filter-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  notifModalFilter = tab.dataset.filter;
  renderNotifModal();
});

// Mark all as read
document.getElementById('btn-mark-all-read').addEventListener('click', () => {
  notifications.forEach(n => n.read = true);
  updateNotifBadge();
  renderNotifDropdown();
  renderNotifModal();
});

// Refresh "time ago" labels + re-render modal filters each time it opens
document.getElementById('notificationsModal').addEventListener('show.bs.modal', () => {
  renderNotifModal();
});

// Simulated real-time alerts
function simulateRealTimeAlerts() {
  // TODO: Replace with WebSocket or SSE subscription
  setInterval(() => {
    addNotification('Invalid RFID Attempt', 'Unrecognized card presented at Gate 2.', 'security');
  }, 60000);
}

// Seed a few realistic starting notifications (demo only)
function seedNotifications() {
  addNotification('Parking Area Near Full', 'Zone A is currently 85% occupied.', 'parking', true);
  addNotification('Vehicle Entry', 'ABC-1234 entered through Gate 1.', 'entry-exit', true);
  addNotification('RFID Reader', 'RFID reader connection restored.', 'hardware', true);
  notifications.forEach((n, i) => { n.timestamp = Date.now() - (i + 1) * 5 * 60000; n.read = i > 0; });
  updateNotifBadge();
  renderNotifDropdown();
  renderNotifModal();
}