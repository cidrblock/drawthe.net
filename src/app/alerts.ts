export type AlertType = "success" | "info" | "warning" | "danger";

/** Minimal replacement for the old ui-bootstrap `<uib-alert>` list. */
export function showAlert(container: HTMLElement, type: AlertType, message: string, timeoutMs = 4000): void {
  const alertEl = document.createElement("div");
  alertEl.className = `alert alert-${type} alert-dismissible`;
  alertEl.innerHTML = `${message}<button type="button" class="btn-close" aria-label="Close"></button>`;
  alertEl.querySelector(".btn-close")?.addEventListener("click", () => alertEl.remove());
  container.appendChild(alertEl);
  if (timeoutMs > 0) {
    setTimeout(() => alertEl.remove(), timeoutMs);
  }
}
