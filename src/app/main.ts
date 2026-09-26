import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "../styles/app.css";
import "../styles/print.css";
import "../styles/notes.css";
import ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-yaml";
import { load } from "js-yaml";
import { saveSvgAsPng } from "save-svg-as-png";
import { draw } from "../renderer/draw";
import { createBrowserIconLoader } from "../renderer/icon-loader-browser";
import { createBrowserRenderTarget } from "../renderer/render-target-browser";
import type { DiagramDocument } from "../renderer/types";
import { installKeyboardShortcuts } from "./keyboard-shortcuts";

ace.config.set("useWorker", false);

const DB_URL = "https://syg5y0qnyf.execute-api.us-west-2.amazonaws.com/prod/";

const svgContainer = document.getElementById("svg") as HTMLElement;
const editorContainer = document.getElementById("editor") as HTMLElement;
const leftSide = document.getElementById("leftSide") as HTMLElement;
const rightSide = document.getElementById("rightSide") as HTMLElement;

const target = createBrowserRenderTarget(svgContainer);
const iconLoader = createBrowserIconLoader();
const printSize = { width: 1050, height: 800 };

const editor = ace.edit(editorContainer);
editor.getSession().setMode("ace/mode/yaml");
editor.setOption("tabSize", 2);

let docId = window.location.hash.substring(2);
let shown = true;

async function redraw(renderTarget = target): Promise<void> {
  const design = (load(editor.getValue()) || {}) as DiagramDocument;
  window.design = design;
  await draw(design, { target: renderTarget, iconLoader });
  if (design.title?.text) {
    document.title = `drawthe.net: ${design.title.text}`;
  }
}

function loadYaml(url: string): Promise<void> {
  return fetch(url)
    .then((response) => response.text())
    .then((text) => {
      editor.setValue(text, -1);
      redraw();
    });
}

// --- initial load: existing saved doc (via hash), or the default example ---
if (docId) {
  shown = false;
  leftSide.classList.add("hidden");
  rightSide.classList.add("col-sm-12");
  rightSide.classList.remove("col-sm-6");
  document.getElementById("fullScreenMode")!.textContent = " Show editor";
  fetch(DB_URL + docId)
    .then((response) => response.text())
    .then((text) => {
      editor.setValue(text, -1);
      redraw();
    });
} else {
  void loadYaml("examples/NTP.yaml");
}

// --- draw / keyboard shortcuts ---
document.getElementById("draw")?.addEventListener("click", () => void redraw());
installKeyboardShortcuts(redraw);
window.addEventListener("resize", () => void redraw());

// --- examples dropdown ---
document.querySelectorAll<HTMLElement>("[data-example]").forEach((item) => {
  item.addEventListener("click", () => {
    const file = item.dataset.example!;
    window.location.hash = "";
    docId = "";
    void loadYaml(`examples/${file}`);
    closeDropdown(item);
  });
});

// --- icon family browser ---
document.querySelectorAll<HTMLElement>("[data-icon-family]").forEach((item) => {
  item.addEventListener("click", () => {
    void drawIconFamily(item.dataset.iconFamily!);
    closeDropdown(item);
  });
});

function closeDropdown(item: HTMLElement): void {
  const dropdown = item.closest(".dropdown, .btn-group");
  dropdown?.classList.remove("show");
  dropdown?.querySelector(".dropdown-menu")?.classList.remove("show");
  dropdown?.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
}

async function drawIconFamily(iconFamily: string): Promise<void> {
  const popup = window.open("about:blank", "_blank");
  const [iconFamilies, templateText] = await Promise.all([
    fetch("/images/iconFamilies.json").then((r) => r.json()),
    fetch(`templates/${iconFamily}.yaml`).then((r) => r.text())
  ]);
  const familyName = iconFamily.split("-")[0];
  const icons: string[] = iconFamilies[familyName];
  const size = icons.length;
  const doc = load(templateText) as DiagramDocument;
  const diagram = doc.diagram as Record<string, unknown>;
  const [h, w] = (diagram.aspectRatio as string).split(":").map(Number);
  diagram.rows = Math.ceil(Math.sqrt((size * w) / h));
  diagram.columns = Math.ceil(size / (diagram.rows as number));

  let x = 0;
  let y = (diagram.rows as number) - 1;
  doc.icons = {};
  for (const icon of icons) {
    doc.icons[icon] = Object.assign({ x, y, icon }, doc.icon as object);
    x += 1;
    if (x === diagram.columns) {
      x = 0;
      y -= 1;
    }
  }
  window.design = doc;
  if (popup) {
    popup.location.href = "fullscreen.html";
  }
}

// --- fullscreen toggle ---
document.getElementById("fullScreen")?.addEventListener("click", () => {
  shown = !shown;
  document.getElementById("fullScreenMode")!.textContent = shown ? " Hide editor" : " Show editor";
  leftSide.classList.toggle("d-none", !shown);
  rightSide.classList.toggle("col-sm-12", !shown);
  rightSide.classList.toggle("col-sm-6", shown);
  redraw();
});

// --- download the current YAML source ---
document.getElementById("download")?.addEventListener("click", () => {
  const data = editor.getValue();
  const design = (load(data) || {}) as DiagramDocument;
  const title = design.title as Record<string, unknown> | undefined;
  const fileName = `${(title?.text as string) || "dld4e"}-v${(title?.version as string) || "1.01"}.yaml`;
  const blob = new Blob([data], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

// --- export the rendered diagram as a PNG ---
document.getElementById("saveimage")?.addEventListener("click", () => {
  const svg = document.querySelector<SVGSVGElement>("svg");
  if (!svg) {
    return;
  }
  const title = (window.design?.title as Record<string, unknown> | undefined)?.text as string | undefined;
  saveSvgAsPng(svg, `${title || "diagram"}.png`, { scale: 4, backgroundColor: "white" });
});

document.getElementById("print")?.addEventListener("click", () => {
  const printTarget = { ...target, getBoundingBox: () => printSize };
  void redraw(printTarget)
    .then(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))
    .then(() => window.print());
});
window.addEventListener("afterprint", () => void redraw());
