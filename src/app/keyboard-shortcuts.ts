/**
 * Global keyboard shortcuts shared across the editor shell and the fullscreen
 * popup: Ctrl+Enter or Escape re-draws, Ctrl+] toggles the editor pane.
 */
export function installKeyboardShortcuts(onRedraw: () => void): void {
  document.addEventListener("keyup", (event) => {
    if ((event.ctrlKey && event.key === "Enter") || event.key === "Escape") {
      event.preventDefault();
      onRedraw();
    } else if (event.ctrlKey && event.key === "]") {
      event.preventDefault();
      document.getElementById("fullScreen")?.dispatchEvent(new MouseEvent("click"));
    }
  });
}
