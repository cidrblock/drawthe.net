import type { IconLoader } from "./icon-loader";
import { customIconDataUri, customIconSvg, decodeCustomIconDataUrl, MAX_ICON_BYTES } from "./custom-icon";

/** Loads icon SVGs via `fetch`, from the app's static `/images/<family>/<icon>.svg` assets. */
export function createBrowserIconLoader(basePath = "/images"): IconLoader {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  return {
    async load(iconFamily, icon, iconUrl) {
      if (iconUrl) {
        const dataUrl = decodeCustomIconDataUrl(iconUrl);
        if (dataUrl) {
          return customIconSvg(customIconDataUri(dataUrl.contentType, dataUrl.bytes, parser, serializer), parser);
        }
        const url = new URL(iconUrl, document.baseURI);
        if (url.protocol !== "https:" || url.username || url.password) {
          throw new Error("Custom icon URLs must use HTTPS or a supported image data URL");
        }
        const response = await fetch(url, { credentials: "omit", mode: "cors" });
        if (!response.ok) {
          throw new Error(`Failed to load custom icon (${response.status})`);
        }
        if (new URL(response.url).protocol !== "https:") {
          throw new Error("Custom icon redirects must remain on HTTPS");
        }
        const contentType = response.headers.get("content-type") || "";
        const bytes = await readLimited(response);
        return customIconSvg(customIconDataUri(contentType, bytes, parser, serializer), parser);
      }
      if (!iconFamily || !icon) {
        throw new Error("An icon family and icon name are required for family icons");
      }
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

async function readLimited(response: Response): Promise<Uint8Array> {
  const declaredLength = Number(response.headers.get("content-length"));
  if (declaredLength > MAX_ICON_BYTES) {
    throw new Error(`Custom icon exceeds the ${MAX_ICON_BYTES}-byte size limit`);
  }
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Custom icon response has no body");
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  let complete = false;
  while (!complete) {
    const result = await reader.read();
    if (result.done) {
      complete = true;
      continue;
    }
    const value = result.value;
    total += value.byteLength;
    if (total > MAX_ICON_BYTES) {
      await reader.cancel();
      throw new Error(`Custom icon exceeds the ${MAX_ICON_BYTES}-byte size limit`);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
