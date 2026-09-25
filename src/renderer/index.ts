import { draw } from "./draw";
import type { IconLoader } from "./icon-loader";
import type { RenderTarget } from "./render-target";
import type { DiagramDocument } from "./types";

export type { IconLoader } from "./icon-loader";
export { createBrowserIconLoader } from "./icon-loader-browser";
export { createBrowserRenderTarget } from "./render-target-browser";
export type { RenderTarget } from "./render-target";
export type { DiagramDocument } from "./types";

export interface RenderDiagramOptions {
  target: RenderTarget;
  iconLoader: IconLoader;
}

/**
 * Public entry point for the YAML -> SVG renderer. This is the seam future
 * MCP/agent tooling calls into: give it a parsed diagram document, a render
 * target (browser element or headless), and an icon loader, and it draws
 * the diagram's <svg> into the target's container.
 */
export function renderDiagram(doc: DiagramDocument, options: RenderDiagramOptions): void {
  draw(doc, options);
}
