/**
 * includes/js/admin-state.js
 * ============================================================================
 * PSAS ADMIN — Central Frontend Mock State
 * ============================================================================
 * FRONTEND MOCK DATA
 * FUTURE: Replace the seed data + action bodies below with real backend/API
 * calls (REST or WebSocket). The public shape of PSAS.state and PSAS.actions
 * is designed to stay stable across that change — UI code should only ever
 * read via PSAS.state / PSAS.select() and act via PSAS.actions.*, never poke
 * the seed arrays directly.
 *
 * Every other Admin script (admin-header.js, admin-dashboard.js) subscribes
 * to this store instead of inventing its own numbers, so Parking, Vehicles,
 * Hardware, Notifications, Activity, and Alerts all stay interconnected:
 *
 *   hardware change → system status → alerts → notifications → activity
 *   vehicle entry/exit → parking → stats → activity
 * ============================================================================
 */
(function (global) {
  "use strict";

  // ---- Seed data ---------------------------------------------------------
  // A manageable sample set (not the full 220-space lot) so the dashboard's
  // interactive "Occupied / Available" drill-downs stay readable. Totals
  // shown on the stat cards are derived from this array's actual contents,
  // not hardcoded, so every number on screen is always internally consistent.
  const ZONES = ["Zone A", "Zone B", "Zone C"];
  const SEED_PLATES = [
    "ABC-1234", "XYZ-7788", "DEF-4521", "GHI-9903", "JKL-3350",
    "MNO-6172", "PQR-8814", "STU-2290", "VWX-5567", "YZA-1198",
    "BCD-7743", "EFG-3382", "HIJ-9021", "KLM-4456", "NOP-1789",
    "QRS-6630", "TUV-2245", "WXY-8871", "ZAB-3319", "CDE-5502",
    "FGH-1177", "IJK-9944", "LMN-6603", "OPQ-2258", "RST-7791",
    "UVW-4423", "XYZ-8856", "ABC-2201", "DEF-9977", "GHI-3345",
    "JKL-5588", "MNO-1102", "PQR-7734", "STU-4467", "VWX-8890",
  ];

  function buildInitialParking() {
    const spaces = [];
    let plateIdx = 0;
    // 60 sample spaces distributed across 3 zones: ~35 occupied, ~20
    // available, ~4 reserved, ~1 unknown (sensor offline).
    for (let i = 1; i <= 60; i++) {
      const zone = ZONES[Math.floor((i - 1) / 20)];
      const localIdx = ((i - 1) % 20) + 1;
      const id = `${zone.slice(-1)}-${String(localIdx).padStart(3, "0")}`;
      let status;
      if (i === 14) status = "unknown";        // matches Sensor A-014 narrative
      else if (i <= 39) status = "occupied";    // 35 occupied (skips #14 handled above)
      else if (i <= 43) status = "reserved";    // 4 reserved
      else status = "available";                // remainder available

      const space = { id, zone, status, plate: null, entryTime: null };
      if (status === "occupied") {
        const plate = SEED_PLATES[plateIdx++ % SEED_PLATES.length];
        space.plate = plate;
        space.entryTime = randomEarlierTimestamp();
      }
      spaces.push(space);
    }
    return spaces;
  }

  function randomEarlierTimestamp() {
    const now = new Date();
    const minsAgo = 15 + Math.floor(Math.random() * 240);
    return new Date(now.getTime() - minsAgo * 60000).toISOString();
  }

  function buildInitialVehicles(parkingSpaces) {
    const vehicles = {};
    parkingSpaces.forEach(s => {
      if (s.status === "occupied" && s.plate) {
        vehicles[s.plate] = { plate: s.plate, slot: s.id, entryTime: s.entryTime, status: "inside" };
      }
    });
    return vehicles;
  }

  const initialParking = buildInitialParking();
  const initialVehicles = buildInitialVehicles(initialParking);

  let idCounter = 1;
  function nextId(prefix) { return `${prefix}-${idCounter++}`; }

  const state = {
    parkingSpaces: initialParking,
    vehicles: initialVehicles,
    hardware: [
      { id: "rfid-gate1", group: "RFID Readers", name: "RFID Reader — Gate 1", status: "online" },
      { id: "rfid-gate2", group: "RFID Readers", name: "RFID Reader — Gate 2", status: "online" },
      { id: "sensor-a014", group: "Parking Sensors", name: "Parking Sensor A-014", status: "offline", linkedSpace: "A-014" },
      { id: "sensor-b022", group: "Parking Sensors", name: "Parking Sensor B-022", status: "warning", linkedSpace: "B-022" },
      { id: "gate1-ctrl", group: "Gate Controllers", name: "Gate 1 Controller", status: "online" },
      { id: "gate2-ctrl", group: "Gate Controllers", name: "Gate 2 Controller", status: "online" },
    ],
    // Operational Activity Log — ONLY Vehicle Entry, Vehicle Exit, Hardware Failure.
    activity: [
      { id: nextId("act"), type: "entry", vehicle: "ABC-1234", slot: "A-014", description: "Vehicle entered via Gate 1 RFID scan", timestamp: minutesAgoIso(58) },
      { id: nextId("act"), type: "exit", vehicle: "XYZ-7788", slot: "B-006", description: "Vehicle exited via Gate 2", timestamp: minutesAgoIso(61) },
      { id: nextId("act"), type: "hardware_failure", vehicle: null, slot: "A-014", description: "Parking sensor stopped reporting — status set to Unknown", timestamp: minutesAgoIso(95) },
      { id: nextId("act"), type: "entry", vehicle: "DEF-4521", slot: "C-002", description: "Vehicle entered via Gate 1 RFID scan", timestamp: minutesAgoIso(99) },
      { id: nextId("act"), type: "exit", vehicle: "GHI-9903", slot: "A-009", description: "Vehicle exited via Gate 1", timestamp: minutesAgoIso(112) },
    ],
    notifications: [
      { id: nextId("notif"), level: "critical", category: "hardware", title: "Parking Sensor A-014 is offline", meta: "Hardware Alert", timestamp: minutesAgoIso(95), read: false, sourceHardwareId: "sensor-a014" },
      { id: nextId("notif"), level: "warning", category: "parking", title: "Zone B is nearing capacity (92% occupied)", meta: "Parking Alert", timestamp: minutesAgoIso(120), read: false },
      { id: nextId("notif"), level: "warning", category: "hardware", title: "Sensor B-022 reporting intermittent signal", meta: "Hardware Alert", timestamp: minutesAgoIso(138), read: true, sourceHardwareId: "sensor-b022" },
    ],
    todayStats: { entries: 385, exits: 243 },
    // FRONTEND MOCK DATA
    // FUTURE: Replace with backend/API response — GET /api/admin/accounts
    accounts: [
      { id: "acc-1", name: "Admin Santos", email: "santos.admin@psas.local", role: "admin", department: "IT Operations", status: "active", lastLogin: minutesAgoIso(12) },
      { id: "acc-2", name: "Maria Dela Cruz", email: "m.delacruz@psas.local", role: "staff", department: "Front Gate", status: "active", lastLogin: minutesAgoIso(40) },
      { id: "acc-3", name: "Jonathan Reyes", email: "j.reyes@psas.local", role: "staff", department: "Front Gate", status: "active", lastLogin: minutesAgoIso(95) },
      { id: "acc-4", name: "Angela Fernandez", email: "a.fernandez@psas.local", role: "staff", department: "Zone B Patrol", status: "inactive", lastLogin: minutesAgoIso(2880) },
      { id: "acc-5", name: "Ramon Villanueva", email: "r.villanueva@psas.local", role: "staff", department: "Zone A Patrol", status: "suspended", lastLogin: minutesAgoIso(10080) },
      { id: "acc-6", name: "Katrina Bautista", email: "k.bautista@psas.local", role: "admin", department: "IT Operations", status: "active", lastLogin: minutesAgoIso(200) },
      { id: "acc-7", name: "Michael Torres", email: "m.torres@psas.local", role: "staff", department: "Front Gate", status: "pending", lastLogin: null },
      { id: "acc-8", name: "Sophia Ramos", email: "s.ramos@psas.local", role: "staff", department: "Zone C Patrol", status: "active", lastLogin: minutesAgoIso(65) },
    ],
    // FRONTEND MOCK DATA
    // FUTURE: Replace with backend/API response — GET /api/admin/reports/weekly-trend
    // Used by Reports & Analytics for the entries-vs-exits trend chart.
    weeklyTrend: [
      { day: "Mon", entries: 312, exits: 298 },
      { day: "Tue", entries: 340, exits: 325 },
      { day: "Wed", entries: 298, exits: 301 },
      { day: "Thu", entries: 355, exits: 340 },
      { day: "Fri", entries: 401, exits: 372 },
      { day: "Sat", entries: 289, exits: 275 },
      { day: "Sun", entries: 385, exits: 243 },
    ],
  };

  function minutesAgoIso(mins) { return new Date(Date.now() - mins * 60000).toISOString(); }

  // ---- Pub/sub ------------------------------------------------------------
  const subscribers = new Set();
  function subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); }
  function emit() { subscribers.forEach(fn => { try { fn(state); } catch (e) { console.error(e); } }); }

  // ---- Derived selectors ---------------------------------------------------
  function getParkingSummary() {
    const total = state.parkingSpaces.length;
    const available = state.parkingSpaces.filter(s => s.status === "available").length;
    const occupied = state.parkingSpaces.filter(s => s.status === "occupied").length;
    const reserved = state.parkingSpaces.filter(s => s.status === "reserved").length;
    const unknown = state.parkingSpaces.filter(s => s.status === "unknown").length;
    return { total, available, occupied, reserved, unknown };
  }

  function getCurrentVehicleCount() {
    return Object.values(state.vehicles).filter(v => v.status === "inside").length;
  }

  function getHardwareSummary() {
    const offline = state.hardware.filter(h => h.status === "offline").length;
    const warning = state.hardware.filter(h => h.status === "warning").length;
    const attention = offline + warning;
    let overall = "operational";
    if (offline > 0) overall = "critical";
    else if (warning > 0) overall = "warning";
    return { offline, warning, attention, overall };
  }

  // Zone-by-zone occupancy — used by Reports & Analytics' zone chart.
  function getZoneBreakdown() {
    const zones = {};
    state.parkingSpaces.forEach(s => {
      if (!zones[s.zone]) zones[s.zone] = { zone: s.zone, total: 0, occupied: 0 };
      zones[s.zone].total += 1;
      if (s.status === "occupied") zones[s.zone].occupied += 1;
    });
    return Object.values(zones).sort((a, b) => a.zone.localeCompare(b.zone));
  }

  function getWeeklyTrend() {
    return state.weeklyTrend;
  }

  function getUnreadNotificationCount() {
    return state.notifications.filter(n => !n.read).length;
  }

  function getAccountsSummary() {
    const total = state.accounts.length;
    const active = state.accounts.filter(a => a.status === "active").length;
    const inactive = state.accounts.filter(a => a.status === "inactive").length;
    const suspended = state.accounts.filter(a => a.status === "suspended").length;
    const pending = state.accounts.filter(a => a.status === "pending").length;
    return { total, active, inactive, suspended, pending };
  }

  // Vehicle Records reads the same PSAS.state.vehicles the dashboard/entry-
  // exit simulation writes to — "inside" and "out" vehicles both included,
  // newest activity first, so the page always matches Recent Activity.
  function getVehicleRecords() {
    return Object.values(state.vehicles)
      .slice()
      .sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));
  }

  function getAlerts() {
    // Alerts on the dashboard mirror unread + critical/warning notifications,
    // newest first — a single source of truth instead of a separate list.
    return state.notifications
      .filter(n => !n.read)
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  function search(query) {
    const q = (query || "").trim().toUpperCase();
    if (!q) return { vehicle: null, space: null, hardware: null, activity: [] };

    const vehicle = state.vehicles[q] || null;
    const space = state.parkingSpaces.find(s => s.id.toUpperCase() === q) || null;
    const hardware = state.hardware.find(h =>
      h.name.toUpperCase().includes(q) || h.id.toUpperCase() === q
    ) || null;
    const activity = state.activity.filter(a =>
      (a.vehicle && a.vehicle.toUpperCase().includes(q)) ||
      (a.slot && a.slot.toUpperCase().includes(q)) ||
      a.description.toUpperCase().includes(q)
    ).slice(0, 5);

    return { vehicle, space, hardware, activity };
  }

  // ---- Actions (simulated) -------------------------------------------------
  // FRONTEND MOCK DATA
  // FUTURE: Replace with backend/API response — POST /api/admin/vehicles/entry
  function simulateEntry(plateRaw) {
    const plate = (plateRaw || "").trim().toUpperCase();
    if (!plate) return { ok: false, error: "Plate number is required." };
    if (state.vehicles[plate] && state.vehicles[plate].status === "inside") {
      return { ok: false, error: `${plate} is already recorded as inside the parking area.` };
    }

    const freeSpace = state.parkingSpaces.find(s => s.status === "available");
    if (!freeSpace) return { ok: false, error: "No available parking space to allocate." };

    const now = new Date().toISOString();
    freeSpace.status = "occupied";
    freeSpace.plate = plate;
    freeSpace.entryTime = now;

    state.vehicles[plate] = { plate, slot: freeSpace.id, entryTime: now, status: "inside" };
    state.todayStats.entries += 1;

    state.activity.unshift({
      id: nextId("act"), type: "entry", vehicle: plate, slot: freeSpace.id,
      description: `Vehicle entered via Gate 1 RFID scan`, timestamp: now,
    });

    emit();
    return { ok: true, slot: freeSpace.id };
  }

  // FUTURE: Replace with backend/API response — POST /api/admin/vehicles/exit
  function simulateExit(plateRaw) {
    const plate = (plateRaw || "").trim().toUpperCase();
    if (!plate) return { ok: false, error: "Plate number is required." };
    const vehicle = state.vehicles[plate];
    if (!vehicle || vehicle.status !== "inside") {
      return { ok: false, error: `${plate} is not currently recorded inside the parking area.` };
    }

    const space = state.parkingSpaces.find(s => s.id === vehicle.slot);
    if (space) { space.status = "available"; space.plate = null; space.entryTime = null; }

    vehicle.status = "out";
    const now = new Date().toISOString();
    state.todayStats.exits += 1;

    state.activity.unshift({
      id: nextId("act"), type: "exit", vehicle: plate, slot: vehicle.slot,
      description: `Vehicle exited via Gate 1`, timestamp: now,
    });

    emit();
    return { ok: true, slot: vehicle.slot };
  }

  // FUTURE: Replace with backend/API response — hardware telemetry push
  function triggerHardwareFailure(hardwareId) {
    const hw = state.hardware.find(h => h.id === hardwareId);
    if (!hw) return { ok: false, error: "Unknown hardware component." };
    hw.status = "offline";

    const now = new Date().toISOString();
    if (hw.linkedSpace) {
      const space = state.parkingSpaces.find(s => s.id === hw.linkedSpace);
      if (space && space.status !== "occupied") space.status = "unknown";
    }

    state.activity.unshift({
      id: nextId("act"), type: "hardware_failure", vehicle: null, slot: hw.linkedSpace || null,
      description: `${hw.name} stopped reporting`, timestamp: now,
    });

    state.notifications.unshift({
      id: nextId("notif"), level: "critical", category: "hardware",
      title: `${hw.name} is offline`, meta: "Hardware Alert",
      timestamp: now, read: false, sourceHardwareId: hw.id,
    });

    emit();
    return { ok: true };
  }

  function resolveHardware(hardwareId) {
    const hw = state.hardware.find(h => h.id === hardwareId);
    if (!hw) return { ok: false, error: "Unknown hardware component." };
    hw.status = "online";

    if (hw.linkedSpace) {
      const space = state.parkingSpaces.find(s => s.id === hw.linkedSpace);
      if (space && space.status === "unknown") space.status = "available";
    }

    // Resolving hardware marks its related unread notification(s) as read
    // rather than deleting history — keeps the notification trail honest.
    state.notifications
      .filter(n => n.sourceHardwareId === hw.id && !n.read)
      .forEach(n => { n.read = true; });

    const now = new Date().toISOString();
    state.notifications.unshift({
      id: nextId("notif"), level: "warning", category: "hardware",
      title: `${hw.name} is back online`, meta: "Hardware Resolved",
      timestamp: now, read: false, sourceHardwareId: hw.id,
    });

    emit();
    return { ok: true };
  }

  function markNotificationRead(notifId) {
    const n = state.notifications.find(n => n.id === notifId);
    if (n && !n.read) { n.read = true; emit(); }
  }

  // FUTURE: Replace with backend/API response — PATCH /api/admin/accounts/:id
  function setAccountStatus(accountId, status) {
    const acc = state.accounts.find(a => a.id === accountId);
    if (!acc) return { ok: false, error: "Unknown account." };
    acc.status = status;
    emit();
    return { ok: true };
  }

  function markAllNotificationsRead() {
    let changed = false;
    state.notifications.forEach(n => { if (!n.read) { n.read = true; changed = true; } });
    if (changed) emit();
  }

  function resetSimulation() {
    const fresh = buildInitialParking();
    state.parkingSpaces = fresh;
    state.vehicles = buildInitialVehicles(fresh);
    state.hardware.forEach(h => { h.status = h.id === "sensor-a014" ? "offline" : h.id === "sensor-b022" ? "warning" : "online"; });
    state.todayStats = { entries: 385, exits: 243 };
    state.activity = state.activity.slice(-5);
    state.notifications = state.notifications.slice(-3).map(n => ({ ...n }));
    emit();
  }

  global.PSAS = global.PSAS || {};
  global.PSAS.state = state;
  global.PSAS.subscribe = subscribe;
  global.PSAS.select = {
    parkingSummary: getParkingSummary,
    currentVehicleCount: getCurrentVehicleCount,
    hardwareSummary: getHardwareSummary,
    unreadNotificationCount: getUnreadNotificationCount,
    alerts: getAlerts,
    search,
    accountsSummary: getAccountsSummary,
    vehicleRecords: getVehicleRecords,
    zoneBreakdown: getZoneBreakdown,
    weeklyTrend: getWeeklyTrend,
  };
  global.PSAS.actions = {
    simulateEntry,
    simulateExit,
    triggerHardwareFailure,
    resolveHardware,
    markNotificationRead,
    markAllNotificationsRead,
    resetSimulation,
    setAccountStatus,
  };
})(window);