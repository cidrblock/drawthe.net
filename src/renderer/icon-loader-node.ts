import { readFileSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import type { IconLoader } from "./icon-loader";

/** Loads icon SVGs directly off disk, for headless/Node rendering. */
export function createFsIconLoader(imagesDir: string): IconLoader {
  const { DOMParser } = new JSDOM().window;
  const parser = new DOMParser();
  return {
    async load(iconFamily, icon) {
      const path = join(imagesDir, iconFamily, `${icon}.svg`);
      const text = readFileSync(path, "utf-8");
      const doc = parser.parseFromString(text, "image/svg+xml");
      return doc.documentElement as unknown as SVGSVGElement;
    }
  };
}
