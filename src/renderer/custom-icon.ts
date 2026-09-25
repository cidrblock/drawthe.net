export const MAX_ICON_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/svg+xml", "image/png", "image/jpeg", "image/gif", "image/webp"]);
const SVG_ELEMENTS = new Set([
  "svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon",
  "defs", "linearGradient", "radialGradient", "stop", "clipPath", "mask", "use"
]);
const SVG_ATTRIBUTES = new Set([
  "xmlns", "xmlns:xlink", "viewBox", "width", "height", "x", "y", "cx", "cy", "r", "rx", "ry",
  "d", "points", "fill", "fill-rule", "fill-opacity", "stroke", "stroke-width", "stroke-linecap",
  "stroke-linejoin", "stroke-dasharray", "stroke-dashoffset", "stroke-opacity", "opacity", "transform",
  "offset", "stop-color", "stop-opacity", "clip-path", "mask", "href", "xlink:href", "id",
  "gradientUnits", "gradientTransform", "spreadMethod", "preserveAspectRatio"
]);

export function customIconDataUri(
  contentType: string,
  bytes: Uint8Array,
  parser: DOMParser,
  serializer: XMLSerializer
): string {
  const mimeType = contentType.split(";")[0].trim().toLowerCase();
  if (!IMAGE_TYPES.has(mimeType)) {
    throw new Error(`Unsupported custom icon type "${mimeType}"`);
  }
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_ICON_BYTES) {
    throw new Error(`Custom icon must be between 1 byte and ${MAX_ICON_BYTES} bytes`);
  }

  const safeBytes = mimeType === "image/svg+xml" ? sanitizeSvg(bytes, parser, serializer) : bytes;
  return `data:${mimeType};base64,${encodeBase64(safeBytes)}`;
}

export function customIconSvg(dataUri: string, parser: DOMParser): SVGSVGElement {
  const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><image x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet" href="${dataUri}"/></svg>`;
  const document = parser.parseFromString(source, "image/svg+xml");
  return document.documentElement as unknown as SVGSVGElement;
}

export function decodeCustomIconDataUrl(url: string): { contentType: string; bytes: Uint8Array } | undefined {
  const match = /^data:(image\/[\w.+-]+);base64,([a-z\d+/]*={0,2})$/i.exec(url);
  if (!match || match[2].length > Math.ceil((MAX_ICON_BYTES * 4) / 3)) {
    return undefined;
  }
  const binary = atob(match[2]);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return { contentType: match[1], bytes };
}

function sanitizeSvg(bytes: Uint8Array, parser: DOMParser, serializer: XMLSerializer): Uint8Array {
  const document = parser.parseFromString(new TextDecoder().decode(bytes), "image/svg+xml");
  const root = document.documentElement;
  if (root.localName !== "svg" || document.querySelector("parsererror")) {
    throw new Error("Custom SVG is invalid");
  }
  sanitizeElement(root);
  root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return new TextEncoder().encode(serializer.serializeToString(root));
}

function sanitizeElement(element: Element): void {
  for (const child of Array.from(element.children)) {
    if (!SVG_ELEMENTS.has(child.localName)) {
      child.remove();
    } else {
      sanitizeElement(child);
    }
  }
  for (const attribute of Array.from(element.attributes)) {
    const value = attribute.value.trim();
    const localReference = /^url\(\s*['"]?#[-\w.:]+['"]?\s*\)$/.test(value);
    const fragmentReference = /^#[\w.:+-]+$/.test(value);
    const nameAllowed = SVG_ATTRIBUTES.has(attribute.name);
    const referenceAllowed =
      !value.toLowerCase().includes("url(") || localReference;
    const hrefAllowed =
      !["href", "xlink:href"].includes(attribute.name) ||
      (element.localName === "use" && fragmentReference);
    if (!nameAllowed || !referenceAllowed || !hrefAllowed) {
      element.removeAttribute(attribute.name);
    }
  }
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}