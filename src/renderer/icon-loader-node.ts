import { lookup } from "node:dns/promises";
import { isIP, type LookupFunction } from "node:net";
import { get as httpsGet } from "node:https";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import type { IconLoader } from "./icon-loader";
import { customIconDataUri, customIconSvg, decodeCustomIconDataUrl, MAX_ICON_BYTES } from "./custom-icon";

/** Loads icon SVGs directly off disk, for headless/Node rendering. */
export function createFsIconLoader(imagesDir: string): IconLoader {
  const { DOMParser, XMLSerializer } = new JSDOM().window;
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  return {
    async load(iconFamily, icon, iconUrl) {
      if (iconUrl) {
        const embedded = decodeCustomIconDataUrl(iconUrl) || (await fetchPublicHttpsImage(iconUrl));
        return customIconSvg(customIconDataUri(embedded.contentType, embedded.bytes, parser, serializer), parser);
      }
      if (!iconFamily || !icon) {
        throw new Error("An icon family and icon name are required for family icons");
      }
      const path = join(imagesDir, iconFamily, `${icon}.svg`);
      const text = readFileSync(path, "utf-8");
      const doc = parser.parseFromString(text, "image/svg+xml");
      return doc.documentElement as unknown as SVGSVGElement;
    }
  };
}

async function fetchPublicHttpsImage(source: string): Promise<{ contentType: string; bytes: Uint8Array }> {
  let url = new URL(source);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("Custom icon URLs must use HTTPS or a supported image data URL");
  }

  for (let redirectCount = 0; redirectCount <= 3; redirectCount++) {
    const hostname = url.hostname.replace(/^\[|\]$/g, "");
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
      throw new Error("Custom icon URL host must be publicly routable");
    }
    const addresses = await lookup(hostname, { all: true, verbatim: true });
    if (addresses.length === 0 || addresses.some(({ address }) => !isPublicAddress(address))) {
      throw new Error("Custom icon URL host must resolve only to public IP addresses");
    }
    const pinned = addresses[0];
    const pinnedLookup: LookupFunction = (_host, options, callback) => {
      if (options.all) callback(null, [{ address: pinned.address, family: pinned.family }]);
      else callback(null, pinned.address, pinned.family);
    };
    const result = await requestImage(url, pinnedLookup);
    if (result.statusCode >= 300 && result.statusCode < 400 && result.location) {
      if (redirectCount === 3) throw new Error("Custom icon URL exceeded the redirect limit");
      url = new URL(result.location, url);
      if (url.protocol !== "https:") throw new Error("Custom icon redirects must remain on HTTPS");
      continue;
    }
    if (result.statusCode !== 200) {
      throw new Error(`Failed to load custom icon (HTTP ${result.statusCode})`);
    }
    return { contentType: result.contentType, bytes: result.bytes };
  }
  throw new Error("Failed to load custom icon");
}

function requestImage(
  url: URL,
  pinnedLookup: LookupFunction
): Promise<{ statusCode: number; location?: string; contentType: string; bytes: Uint8Array }> {
  return new Promise((resolve, reject) => {
    const request = httpsGet(
      url,
      {
        lookup: pinnedLookup,
        timeout: 10_000,
        headers: {
          "User-Agent": "drawthe.net/2.0 (https://github.com/cidrblock/drawthe.net; diagram renderer)",
          Accept: "image/avif,image/webp,image/png,image/*;q=0.8,*/*;q=0.5"
        }
      },
      (response) => {
      response.on("error", reject);
      const statusCode = response.statusCode || 0;
      const location = response.headers.location;
      if (statusCode >= 300 && statusCode < 400) {
        response.resume();
        resolve({ statusCode, location, contentType: "", bytes: new Uint8Array() });
        return;
      }
      if (statusCode !== 200) {
        response.resume();
        resolve({ statusCode, contentType: "", bytes: new Uint8Array() });
        return;
      }
      const contentType = response.headers["content-type"] || "";
      const contentLength = Number(response.headers["content-length"]);
      if (contentLength > MAX_ICON_BYTES) {
        response.destroy(new Error(`Custom icon exceeds the ${MAX_ICON_BYTES}-byte size limit`));
        return;
      }
      const chunks: Buffer[] = [];
      let total = 0;
      response.on("data", (chunk: Buffer) => {
        total += chunk.byteLength;
        if (total > MAX_ICON_BYTES) {
          response.destroy(new Error(`Custom icon exceeds the ${MAX_ICON_BYTES}-byte size limit`));
          return;
        }
        chunks.push(chunk);
      });
      response.on("end", () => resolve({ statusCode, contentType, bytes: Buffer.concat(chunks) }));
      }
    );
    request.on("timeout", () => request.destroy(new Error("Custom icon request timed out")));
    request.on("error", reject);
  });
}

function isPublicAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [first, second, third] = address.split(".").map(Number);
    return !(
      first === 0 || first === 10 || first === 127 || first >= 224 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && (second === 0 || second === 168 || (second === 88 && third === 99))) ||
      (first === 198 && (second === 18 || second === 19 || (second === 51 && third === 100))) ||
      (first === 203 && second === 0 && third === 113)
    );
  }
  if (isIP(address) !== 6) return false;
  const normalized = address.toLowerCase();
  if (normalized.startsWith("::ffff:")) {
    const mapped = normalized.slice(7);
    if (mapped.includes(".")) return isPublicAddress(mapped);
    const parts = mapped.split(":").map((part) => parseInt(part, 16));
    if (parts.length === 2 && parts.every(Number.isFinite)) {
      return isPublicAddress(`${parts[0] >> 8}.${parts[0] & 255}.${parts[1] >> 8}.${parts[1] & 255}`);
    }
    return false;
  }
  return !(
    normalized === "::" || normalized === "::1" ||
    /^f[cd]/.test(normalized) || /^fe[89ab]/.test(normalized) ||
    normalized.startsWith("ff") || normalized.startsWith("2001:db8:") ||
    normalized.startsWith("2001:10:")
  );
}
