/**
 * includes/js/admin-sidebar.js
 * Global Admin sidebar behavior — shared by every Admin page.
 * Keep this file focused ONLY on sidebar interactivity (mobile open/close).
 * Page-specific logic belongs in that page's own script.
 */

function initAdminSidebar() {
  const toggleBtn = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("adminSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (!toggleBtn || !sidebar || !backdrop) return;

  const close = () => { sidebar.classList.remove("open"); backdrop.classList.remove("show"); };
  const open = () => { sidebar.classList.add("open"); backdrop.classList.add("show"); };

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.contains("open") ? close() : open();
  });
  backdrop.addEventListener("click", close);

  // Close the mobile sidebar automatically on navigation link clicks
  sidebar.querySelectorAll(".sidebar-link").forEach(link => {
    link.addEventListener("click", close);
  });

  // Close on resize back up to desktop to avoid a stuck-open backdrop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 991.98) close();
  });
}

document.addEventListener("DOMContentLoaded", initAdminSidebar);