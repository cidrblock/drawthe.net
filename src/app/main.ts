import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "../styles/app.css";
import "../styles/notes.css";
import ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-yaml";
import { load } from "js-yaml";
import { saveSvgAsPng } from "save-svg-as-png";
import { draw } from "../renderer/draw";
import { createBrowserIconLoader } from "../renderer/icon-loader-browser";
import { createBrowserRenderTarget } from "../renderer/render-target-browser";
import type { DiagramDocument } from "../renderer/types";
import { showAlert } from "./alerts";
import { copyToClipboard } from "./clipboard";
import { installKeyboardShortcuts } from "./keyboard-shortcuts";

ace.config.set("useWorker", false);

const DB_URL = "https://syg5y0qnyf.execute-api.us-west-2.amazonaws.com/prod/";

const svgContainer = document.getElementById("svg") as HTMLElement;
const alertsContainer = document.getElementById("alerts") as HTMLElement;
const editorContainer = document.getElementById("editor") as HTMLElement;
const leftSide = document.getElementById("leftSide") as HTMLElement;
const rightSide = document.getElementById("rightSide") as HTMLElement;

const target = createBrowserRenderTarget(svgContainer);
const iconLoader = createBrowserIconLoader();

const editor = ace.edit(editorContainer);
editor.getSession().setMode("ace/mode/yaml");
editor.setOption("tabSize", 2);

let state: "Save" | "Update" = "Save";
let docId = window.location.hash.substring(2);
let shown = true;

function setSaveIcon(iconClass: string): void {
  document.getElementById("saveIcon")!.className = iconClass;
}

function setState(next: "Save" | "Update"): void {
  state = next;
  document.getElementById("saveState")!.textContent = state;
}

function redraw(): void {
  const design = (load(editor.getValue()) || {}) as DiagramDocument;
  window.design = design;
  draw(design, { target, iconLoader });
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
  setState("Update");
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
document.getElementById("draw")?.addEventListener("click", redraw);
installKeyboardShortcuts(redraw);
window.addEventListener("resize", redraw);

// --- examples dropdown ---
document.querySelectorAll<HTMLElement>("[data-example]").forEach((item) => {
  item.addEventListener("click", () => {
    const file = item.dataset.example!;
    window.location.hash = "";
    docId = "";
    setState("Save");
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

// --- save / update to the shared backend ---
document.getElementById("save")?.addEventListener("click", () => {
  setSaveIcon("fa fa-hourglass-o");
  const data = editor.getValue();
  const request =
    state === "Save"
      ? fetch(DB_URL, { method: "POST", headers: { "Content-Type": "text/x-yaml" }, body: data })
      : fetch(DB_URL + docId, { method: "PUT", headers: { "Content-Type": "text/x-yaml" }, body: data });

  request
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then((body) => {
      docId = body.docId ?? docId;
      window.location.hash = docId;
      setSaveIcon("fa fa-check-circle");
      setTimeout(() => {
        setSaveIcon("fa fa-floppy-o");
        setState("Update");
      }, 200);
    })
    .catch((error) => {
      setSaveIcon("fa fa-exclamation-triangle");
      showAlert(alertsContainer, "danger", `Save failed: ${error.message}`);
    });
});

document.getElementById("fork")?.addEventListener("click", () => {
  setState("Save");
  document.getElementById("save")?.dispatchEvent(new MouseEvent("click"));
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

// --- copy the shareable link ---
document.getElementById("link")?.addEventListener("click", () => {
  const linkTextEl = document.getElementById("linkText")!;
  void copyToClipboard(window.location.href).then(() => {
    linkTextEl.textContent = " Copied to clipboard";
    setTimeout(() => {
      linkTextEl.textContent = "Link";
    }, 200);
  });
});

// --- load a YAML doc from a GitHub gist URL ---
document.getElementById("gistForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const gistUrlInput = document.getElementById("gistURL") as HTMLInputElement;
  const parts = gistUrlInput.value.split("/");
  const githubUser = parts[3];
  const githubGist = parts[4];
  fetch(`//gist.githubusercontent.com/${githubUser}/${githubGist}/raw`)
    .then((response) => response.text())
    .then((text) => {
      editor.setValue(text, -1);
      redraw();
    });
  gistUrlInput.value = "";
  window.location.hash = "";
  setState("Save");
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
