/**
 * Minimal Bootstrap-compatible dropdown toggle (no Bootstrap JavaScript): toggles `.show`
 * on the nearest `.dropdown`/`.btn-group`, and closes others on outside click.
 */
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const toggle = target.closest(".dropdown-toggle");
  const openDropdowns = document.querySelectorAll(".dropdown.show, .btn-group.show");

  if (toggle) {
    const dropdown = toggle.closest(".dropdown, .btn-group");
    openDropdowns.forEach((el) => {
      if (el !== dropdown) {
        el.classList.remove("show");
        el.querySelector(".dropdown-menu")?.classList.remove("show");
        el.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
      }
    });
    const isOpen = dropdown?.classList.toggle("show") ?? false;
    dropdown?.querySelector(".dropdown-menu")?.classList.toggle("show", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    return;
  }

  if (!target.closest(".dropdown-menu")) {
    openDropdowns.forEach((el) => {
      el.classList.remove("show");
      el.querySelector(".dropdown-menu")?.classList.remove("show");
      el.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
    });
  }
});
