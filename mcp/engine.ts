import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { load } from "js-yaml";
import { draw } from "../src/renderer/draw";
import { createFsIconLoader } from "../src/renderer/icon-loader-node";
import { createNodeRenderTarget } from "../src/renderer/render-target-node";
import type { DiagramDocument } from "../src/renderer/types";

const imagesDir = fileURLToPath(new URL("../public/images", import.meta.url));

export interface RenderOptions {
  width?: number;
  height?: number;
  /** @default "png" */
  format?: "png" | "svg";
}

export interface RenderResult {
  format: "png" | "svg";
  /** SVG markup (always produced) or PNG bytes (when format is "png"). */
  data: string | Buffer;
  /** Non-fatal issues, e.g. an `icon`/`iconFamily` in the YAML that couldn't be found. */
  warnings: string[];
}

/** Renders a drawthe.net YAML document headlessly, returning PNG (default) or SVG. */
export async function renderYaml(yamlText: string, options: RenderOptions = {}): Promise<RenderResult> {
  const doc = (load(yamlText) || {}) as DiagramDocument;
  const width = options.width ?? 1600;
  const height = options.height ?? 1000;
  const format = options.format ?? "png";

  const target = createNodeRenderTarget(width, height);
  const iconLoader = createFsIconLoader(imagesDir);
  const { warnings } = await draw(doc, { target, iconLoader });
  const svg = target.serializeSvg();

  if (format === "svg") {
    return { format, data: svg, warnings };
  }
  const png = new Resvg(svg, { fitTo: { mode: "original" } }).render().asPng();
  return { format, data: png, warnings };
}

export interface IconFamilySummary {
  family: string;
  iconCount: number;
}

/** Lists the available icon families and how many icons each contains. */
export function listIconFamilies(): IconFamilySummary[] {
  const manifest = readIconManifest();
  return Object.entries(manifest)
    .map(([family, icons]) => ({ family, iconCount: icons.length }))
    .sort((a, b) => a.family.localeCompare(b.family));
}

/** Lists icon keys in a family, optionally filtered by a case-insensitive substring match. */
export function listIcons(family: string, query?: string): string[] {
  const manifest = readIconManifest();
  const icons = manifest[family];
  if (!icons) {
    throw new Error(`Unknown icon family "${family}". Known families: ${Object.keys(manifest).join(", ")}`);
  }
  if (!query) {
    return icons;
  }
  const needle = query.toLowerCase();
  return icons.filter((icon) => icon.toLowerCase().includes(needle));
}

/** Returns the raw SVG markup for a single icon, so an agent can inspect it before use. */
export function getIconSvg(family: string, icon: string): string {
  try {
    return readFileSync(join(imagesDir, family, `${icon}.svg`), "utf-8");
  } catch {
    throw new Error(`Icon "${icon}" not found in family "${family}". Use list_icons to see available icons.`);
  }
}

/** Renders a single icon to a PNG thumbnail, so a vision-capable agent can literally see it. */
export function getIconPng(family: string, icon: string, size = 128): Buffer {
  const svg = getIconSvg(family, icon);
  return new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();
}

let iconManifestCache: Record<string, string[]> | undefined;

function readIconManifest(): Record<string, string[]> {
  if (!iconManifestCache) {
    const text = readFileSync(join(imagesDir, "iconFamilies.json"), "utf-8");
    iconManifestCache = JSON.parse(text) as Record<string, string[]>;
  }
  return iconManifestCache;
}
