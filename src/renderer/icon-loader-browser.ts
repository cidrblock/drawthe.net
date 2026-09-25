import type { IconLoader } from "./icon-loader";

/** Loads icon SVGs via `fetch`, from the app's static `/images/<family>/<icon>.svg` assets. */
export function createBrowserIconLoader(basePath = "/images"): IconLoader {
  const parser = new DOMParser();
  return {
    async load(iconFamily, icon) {
      const url = `${basePath}/${iconFamily}/${icon}.svg`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load icon "${icon}" from family "${iconFamily}" (${response.status})`);
      }
      const text = await response.text();
      const doc = parser.parseFromString(text, "image/svg+xml");
      return doc.documentElement as unknown as SVGSVGElement;
    }
  };
}
