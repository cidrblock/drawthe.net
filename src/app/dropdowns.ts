/**
 * Minimal Bootstrap-3-compatible dropdown toggle (no jQuery): toggles `.open`
 * on the nearest `.dropdown`/`.btn-group`, and closes others on outside click.
 */
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const toggle = target.closest(".dropdown-toggle");
  const openDropdowns = document.querySelectorAll(".dropdown.open, .btn-group.open");

  if (toggle) {
    const dropdown = toggle.closest(".dropdown, .btn-group");
    openDropdowns.forEach((el) => {
      if (el !== dropdown) {
        el.classList.remove("open");
      }
    });
    dropdown?.classList.toggle("open");
    return;
  }

  if (!target.closest(".dropdown-menu")) {
    openDropdowns.forEach((el) => el.classList.remove("open"));
  }
});
