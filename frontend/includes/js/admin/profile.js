/**
 * includes/js/admin-profile.js
 * ============================================================================
 * PSAS ADMIN — Profile / Account page logic
 * Reads/writes the "current admin" record — PSAS.select.currentAdmin(),
 * which resolves PSAS.state.currentAdminId against PSAS.state.accounts
 * (admin-state.js), the SAME store User & Account Management manages.
 * Editing your own profile here updates the same record you'd see listed
 * there. Like admin-config.js, this page does NOT fully re-render the form
 * on every PSAS.subscribe tick — only the hero/read-only bits refresh live,
 * so in-progress edits are never clobbered. Shared helpers come from
 * window.PSASUI — see admin-global.js.
 * ============================================================================
 */
(function () {
  "use strict";

  const { escapeHtml, relativeTime } = PSASUI;

  const FIELDS = ["name", "email", "department"];

  function initials(name) {
    return (name || "").split(" ").filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join("");
  }

  // ── Hero card (read-only, safe to re-render on every state change) ──────
  function renderHero() {
    const acc = PSAS.select.currentAdmin();
    if (!acc) return;

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const avatarEl = document.getElementById("profileAvatar");
    if (avatarEl) avatarEl.textContent = initials(acc.name);
    setText("profileHeroName", acc.name);
    setText("profileHeroEmail", acc.email);

    const roleEl = document.getElementById("profileHeroRole");
    if (roleEl) { roleEl.textContent = acc.role; roleEl.className = "role-badge " + acc.role; }

    const statusEl = document.getElementById("profileHeroStatus");
    if (statusEl) { statusEl.textContent = acc.status; statusEl.className = "status-chip " + acc.status; }

    setText("profileHeroDept", acc.department);
    setText("profileHeroLastLogin", acc.lastLogin ? relativeTime(acc.lastLogin) : "Never");
    setText("profileHeroId", acc.id);
  }

  // ── Edit Profile form ─────────────────────────────────────────────────────
  function getFieldEl(name) { return document.getElementById("prof-" + name); }

  function populateForm() {
    const acc = PSAS.select.currentAdmin();
    if (!acc) return;
    getFieldEl("name").value = acc.name;
    getFieldEl("email").value = acc.email;
    getFieldEl("department").value = acc.department;
    markClean();
  }

  let dirty = false;
  function markDirty() {
    if (dirty) return;
    dirty = true;
    const badge = document.getElementById("profDirtyBadge");
    if (badge) badge.classList.remove("d-none");
  }
  function markClean() {
    dirty = false;
    const badge = document.getElementById("profDirtyBadge");
    if (badge) badge.classList.add("d-none");
  }

  function initFieldWatchers() {
    FIELDS.forEach(name => {
      const el = getFieldEl(name);
      if (el) el.addEventListener("input", markDirty);
    });
  }

  function initSaveProfile() {
    const saveBtn = document.getElementById("btnSaveProfile");
    if (!saveBtn) return;
    saveBtn.addEventListener("click", () => {
      const acc = PSAS.select.currentAdmin();
      if (!acc) return;
      const name = getFieldEl("name").value.trim();
      const email = getFieldEl("email").value.trim();
      const department = getFieldEl("department").value.trim();

      if (!name || !email) {
        PSASUI.showSimFeedback("Name and email are required.", true);
        return;
      }
      const res = PSAS.actions.updateAccount(acc.id, { name, email, department });
      if (res.ok) { markClean(); PSASUI.showSimFeedback("Profile updated.", false); }
    });
  }

  // ── Change Password (mock — no real auth backing it) ─────────────────────
  function initChangePassword() {
    const btn = document.getElementById("btnChangePassword");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const current = document.getElementById("prof-currentPassword");
      const next = document.getElementById("prof-newPassword");
      const confirm = document.getElementById("prof-confirmPassword");

      if (!current.value) { PSASUI.showSimFeedback("Enter your current password.", true); return; }
      if (next.value.length < 8) { PSASUI.showSimFeedback("New password must be at least 8 characters.", true); return; }
      if (next.value !== confirm.value) { PSASUI.showSimFeedback("New password and confirmation don't match.", true); return; }

      current.value = ""; next.value = ""; confirm.value = "";
      PSASUI.showSimFeedback("Password updated. (Frontend preview only — not persisted.)", false);
    });
  }

  // ── Master render + subscription ─────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    renderHero();
    populateForm();
    initFieldWatchers();
    initSaveProfile();
    initChangePassword();
    PSASUI.initSimPanel();

    if (window.PSAS && PSAS.subscribe) {
      PSAS.subscribe(() => {
        renderHero();
        PSASUI.refreshSimSelectors();
      });
    }
  });
})();