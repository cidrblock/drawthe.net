/**
 * Abstraction over "where the diagram gets drawn" so the renderer core has no
 * hard dependency on `window`/`document` and can run identically in a browser
 * tab or headlessly in Node (see render-target-node.ts).
 */
export interface RenderTarget {
  /** Element the diagram's <svg> is appended into; existing children are cleared each render. */
  container: Element;
  /** Content box available for the diagram, in CSS pixels. */
  getBoundingBox(): { width: number; height: number };
  /** Optional: apply a page-level background so the diagram fill matches its surroundings. */
  setBackground?(color: string): void;
}
