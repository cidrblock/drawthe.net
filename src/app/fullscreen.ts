import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/app.css";
import "../styles/notes.css";
import { draw } from "../renderer/draw";
import { createBrowserIconLoader } from "../renderer/icon-loader-browser";
import { createBrowserRenderTarget } from "../renderer/render-target-browser";
import type { DiagramDocument } from "../renderer/types";
import { installKeyboardShortcuts } from "./keyboard-shortcuts";

const svgContainer = document.getElementById("svg") as HTMLElement;
const target = createBrowserRenderTarget(svgContainer);
const iconLoader = createBrowserIconLoader();

function redraw(): void {
  const design = window.opener?.design as DiagramDocument | undefined;
  if (!design) {
    return;
  }
  // deep-clone so redraws don't accumulate mutations onto the opener's copy
  const doc = JSON.parse(JSON.stringify(design)) as DiagramDocument;
  draw(doc, { target, iconLoader });
  if (doc.title?.text) {
    document.title = `dld4e: ${doc.title.text}`;
  }
}

redraw();
window.addEventListener("resize", redraw);
installKeyboardShortcuts(redraw);
