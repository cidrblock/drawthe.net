import { JSDOM } from "jsdom";
import type { RenderTarget } from "./render-target";

export interface NodeRenderTarget extends RenderTarget {
  dom: JSDOM;
  /** Serializes the rendered <svg> element to a standalone SVG document string. */
  serializeSvg(): string;
}

/**
 * Headless render target backed by jsdom. jsdom has no layout engine, so the
 * diagram's pixel dimensions must be supplied explicitly rather than measured,
 * and text-measurement APIs (used for auto-sizing icon labels and nudging
 * connection-label offsets) are approximated - see `polyfillTextMeasurement`.
 */
export function createNodeRenderTarget(width: number, height: number): NodeRenderTarget {
  const dom = new JSDOM('<!DOCTYPE html><body><div id="svg"></div></body>');
  polyfillTextMeasurement(dom.window);
  const container = dom.window.document.getElementById("svg");
  if (!container) {
    throw new Error("Failed to create headless render container");
  }
  container.setAttribute("data-render-target", "node");
  return {
    container,
    dom,
    getBoundingBox() {
      return { width, height };
    },
    serializeSvg() {
      const svg = container.querySelector("svg");
      if (!svg) {
        throw new Error("No <svg> has been rendered yet");
      }
      // Serializing just this element loses the ambient SVG namespace context of its
      // parent HTML document, so it must be declared explicitly for the result to be
      // a valid standalone SVG document (required by strict parsers like resvg).
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
      return `<?xml version="1.0" encoding="UTF-8"?>\n${svg.outerHTML}`;
    }
  };
}

/**
 * jsdom implements no text layout, so `SVGTextContentElement.getComputedTextLength()`
 * is missing. Approximate it from character count and font size; this is close
 * enough for icon-label auto-sizing and connection-label offsets, but callers
 * should treat headless output as a preview, not a pixel-exact match to the browser.
 */
function polyfillTextMeasurement(window: JSDOM["window"]): void {
  const proto = window.SVGElement.prototype as unknown as { getComputedTextLength?: () => number };
  if (typeof proto.getComputedTextLength === "function") {
    return;
  }
  proto.getComputedTextLength = function (this: Element): number {
    const fontSize = parseFloat(window.getComputedStyle(this).fontSize) || 16;
    return (this.textContent || "").length * fontSize * 0.55;
  };
}
