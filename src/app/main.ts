import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "../styles/app.css";
import "../styles/print.css";
import "../styles/notes.css";
import { load } from "js-yaml";
import { saveSvgAsPng } from "save-svg-as-png";
import { draw } from "../renderer/draw";
import { createBrowserIconLoader } from "../renderer/icon-loader-browser";
import { createBrowserRenderTarget } from "../renderer/render-target-browser";
import type { DiagramDocument } from "../renderer/types";
import { installKeyboardShortcuts } from "./keyboard-shortcuts";
import type { YamlDiagnostic } from "./yaml-editor";

const DB_URL = "https://syg5y0qnyf.execute-api.us-west-2.amazonaws.com/prod/";

const svgContainer = document.getElementById("svg") as HTMLElement;
const editorContainer = document.getElementById("editor") as HTMLElement;
const diagnosticsContainer = document.getElementById("diagnostics") as HTMLElement;
const diagnosticsHeading = document.getElementById("diagnosticsHeading") as HTMLElement;
const diagnosticsContent = document.getElementById("diagnosticsContent") as HTMLElement;
const diagnosticsToggle = document.getElementById("diagnosticsToggle") as HTMLButtonElement;
const leftSide = document.getElementById("leftSide") as HTMLElement;
const rightSide = document.getElementById("rightSide") as HTMLElement;

const target = createBrowserRenderTarget(svgContainer);
const iconLoader = createBrowserIconLoader();
const printSize = { width: 1050, height: 800 };
let languageDiagnostics: YamlDiagnostic[] = [];
let renderDiagnostics: YamlDiagnostic[] = [];

async function initializeEditor(): Promise<void> {
  const { createYamlEditor } = await import("./yaml-editor");
  const editor = createYamlEditor(editorContainer, (diagnostics) => {
    languageDiagnostics = diagnostics;
    updateDiagnostics();
  });
  editor.onDidChangeModelContent(() => {
    if (renderDiagnostics.length > 0) {
      renderDiagnostics = [];
      updateDiagnostics();
    }
  });
  editor.updateOptions({
    guides: {
      indentation: false
    },
  });


  function updateDiagnostics(): void {
    const diagnostics = [...languageDiagnostics, ...renderDiagnostics];
    diagnosticsHeading.textContent = `Diagnostics (${diagnostics.length})`;
    const contents: HTMLElement[] = [];
    if (diagnostics.length === 0) {
      const empty = document.createElement("div");
      empty.className = "diagnostics-empty";
      empty.textContent = "No issues found.";
      contents.push(empty);
    } else {
      const list = document.createElement("ul");
      list.className = "diagnostics-list list-unstyled";
      for (const diagnostic of diagnostics) {
        const item = document.createElement("li");
        item.className = `diagnostic-${diagnostic.severity}`;
        const position = diagnostic.lineNumber
          ? `Line ${diagnostic.lineNumber}${diagnostic.column ? `:${diagnostic.column}` : ""}: `
          : "";
        item.textContent = `${position}${diagnostic.message}`;
        list.appendChild(item);
      }
      contents.push(list);
    }
    diagnosticsContent.replaceChildren(...contents);
  }

  diagnosticsToggle.addEventListener("click", () => {
    const collapsed = diagnosticsContainer.classList.toggle("is-collapsed");
    diagnosticsToggle.setAttribute("aria-expanded", String(!collapsed));
    const action = collapsed ? "Expand" : "Collapse";
    diagnosticsToggle.setAttribute("aria-label", `${action} diagnostics`);
    diagnosticsToggle.title = `${action} diagnostics`;
    diagnosticsToggle.querySelector(".fa")?.classList.toggle("fa-chevron-down", !collapsed);
    diagnosticsToggle.querySelector(".fa")?.classList.toggle("fa-chevron-up", collapsed);
  });

  function reportRenderError(error: unknown): void {
    const mark = (error as { mark?: { line: number; column: number } } | null)?.mark;
    renderDiagnostics = [
      {
        severity: "error",
        message: error instanceof Error ? error.message : String(error),
        lineNumber: mark ? mark.line + 1 : undefined,
        column: mark ? mark.column + 1 : undefined
      }
    ];
    updateDiagnostics();
  }

  function setYamlText(text: string): void {
    editor.setValue(text);
    editor.setPosition({ lineNumber: editor.getModel()?.getLineCount() || 1, column: 1 });
  }

  updateDiagnostics();

  let docId = window.location.hash.substring(2);
  let shown = true;

  async function redraw(renderTarget = target): Promise<void> {
    let design: DiagramDocument;
    try {
      design = (load(editor.getValue()) || {}) as DiagramDocument;
    } catch (error) {
      reportRenderError(error);
      return;
    }
    if (languageDiagnostics.some((diagnostic) => diagnostic.severity === "error")) {
      renderDiagnostics = [{ severity: "info", message: "Rendering is paused until schema errors are fixed." }];
      updateDiagnostics();
      return;
    }
    try {
      const result = await draw(design, { target: renderTarget, iconLoader });
      window.design = design;
      renderDiagnostics = result.warnings.map((message) => ({ severity: "warning", message }));
      updateDiagnostics();
      if (design.title?.text) {
        document.title = `drawthe.net: ${design.title.text}`;
      }
    } catch (error) {
      reportRenderError(error);
    }
  }

  function loadYaml(url: string): Promise<void> {
    return fetch(url)
      .then((response) => response.text())
      .then((text) => {
        setYamlText(text);
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
        setYamlText(text);
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
    let design: DiagramDocument;
    try {
      design = (load(data) || {}) as DiagramDocument;
    } catch (error) {
      reportRenderError(error);
      return;
    }
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
}

void initializeEditor();
