import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { optimize } from "svgo";

/**
 * Normalizes a downloaded vendor icon pack into a public/images/<family> folder:
 * dedupes by normalized key (vendor packs often repeat the same icon across
 * category folders), strips vendor ID/size-suffix cruft from filenames, and
 * runs everything through svgo. Source packs are NOT committed to the repo -
 * download them fresh from the vendor and point --source at the extracted dir.
 *
 * Usage: tsx scripts/icons/refresh-icon-family.ts <family> --source <dir>
 */
interface FamilyConfig {
  /** Only files for which this returns true are included. */
  matchPath?: (path: string) => boolean;
  /** Normalizes a filename (without extension) into the `icon:` key used in YAML. */
  toKey: (filenameNoExt: string) => string;
  /** Set for vendor packs shipped as EPS - converted to SVG via Inkscape before normalizing. */
  sourceExt?: "eps";
}

const FAMILIES: Record<string, FamilyConfig> = {
  azure2026: {
    // e.g. "10073-icon-service-Front-Door-and-CDN-Profiles" -> "front_door_and_cdn_profiles"
    // (a handful of vendor filenames have stray whitespace around the numeric ID, hence the separate passes)
    toKey: (name) =>
      name
        .replace(/^\d+/, "")
        .replace(/icon-service-/i, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
  },
  aws2026: {
    // AWS ships each icon at 16/32/48/64px plus @5x PNG-only variants; keep just the 48px SVGs.
    matchPath: (path) => path.includes("Architecture-Service-Icons") && path.includes(`${sep}48${sep}`),
    // e.g. "Arch_AWS-License-Manager_48" -> "aws_license_manager"
    toKey: (name) =>
      name
        .replace(/^Arch_/i, "")
        .replace(/_(16|32|48|64)(@\dx)?$/i, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
  },
  cisco2026: {
    // Cisco's network topology icons ship as EPS only (no vendor SVG option).
    sourceExt: "eps",
    // e.g. "Nexus 7000" -> "nexus_7000"
    toKey: (name) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
  }
};

function walk(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

/** Converts every .eps file under sourceDir to .svg (via Inkscape) into a fresh temp directory. */
function convertEpsToSvg(sourceDir: string): string {
  const outDir = mkdtempSync(join(tmpdir(), "drawthe-net-eps2svg-"));
  const epsFiles = walk(sourceDir).filter(
    (path) => extname(path).toLowerCase() === ".eps" && !basename(path).startsWith("._")
  );
  console.log(`Converting ${epsFiles.length} EPS files to SVG via Inkscape...`);
  for (const path of epsFiles) {
    const outPath = join(outDir, `${basename(path, extname(path))}.svg`);
    execFileSync("inkscape", [path, "-o", outPath], { stdio: ["ignore", "ignore", "ignore"] });
  }
  return outDir;
}

function main(): void {
  const [family, ...rest] = process.argv.slice(2);
  const sourceFlagIndex = rest.indexOf("--source");
  const sourceDir = sourceFlagIndex >= 0 ? rest[sourceFlagIndex + 1] : undefined;

  const config = family ? FAMILIES[family] : undefined;
  if (!family || !config || !sourceDir) {
    console.error(`Usage: tsx scripts/icons/refresh-icon-family.ts <${Object.keys(FAMILIES).join("|")}> --source <extracted-dir>`);
    process.exit(1);
  }
  if (!existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  const outDir = fileURLToPath(new URL(`../../public/images/${family}`, import.meta.url));
  mkdirSync(outDir, { recursive: true });

  const svgSourceDir = config.sourceExt === "eps" ? convertEpsToSvg(sourceDir) : sourceDir;

  const candidates = walk(svgSourceDir).filter((path) => {
    if (extname(path).toLowerCase() !== ".svg") return false;
    if (basename(path).startsWith("._")) return false; // macOS AppleDouble junk from zip
    if (config.matchPath && !config.matchPath(path)) return false;
    return true;
  });

  const seen = new Set<string>();
  let written = 0;
  let skippedDuplicates = 0;

  for (const path of candidates) {
    const key = config.toKey(basename(path, ".svg"));
    if (seen.has(key)) {
      skippedDuplicates++;
      continue;
    }
    seen.add(key);
    const raw = readFileSync(path, "utf-8");
    const result = optimize(raw, { path, multipass: true });
    writeFileSync(join(outDir, `${key}.svg`), "data" in result ? result.data : raw, "utf-8");
    written++;
  }

  console.log(`${family}: wrote ${written} icons to ${outDir} (skipped ${skippedDuplicates} duplicate keys)`);
}

main();
