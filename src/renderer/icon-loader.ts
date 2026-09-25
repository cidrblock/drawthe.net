/**
 * Abstraction over fetching an icon family's SVG source, so the renderer core
 * doesn't need to know whether icons come from a browser `fetch()` or the
 * filesystem (headless/Node rendering).
 */
export interface IconLoader {
  /** Resolves with the root <svg> element parsed from the icon's source file. */
  load(iconFamily: string | undefined, icon: string | undefined, iconUrl?: string): Promise<SVGSVGElement>;
}
