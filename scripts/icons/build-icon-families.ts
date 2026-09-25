import { readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Regenerates public/images/iconFamilies.json by listing the SVGs in each icon family folder.
// Families are auto-discovered as any public/images/<name> directory containing SVGs, so new
// families (e.g. from scripts/icons/refresh-icon-family.ts) don't need to be registered here.
const imagesDir = fileURLToPath(new URL("../../public/images", import.meta.url));

function listIcons(family: string): string[] {
  const dir = join(imagesDir, family);
  return readdirSync(dir)
    .filter((file) => extname(file).toLowerCase() === ".svg")
    .map((file) => file.slice(0, -extname(file).length))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

const families = readdirSync(imagesDir).filter((entry) => statSync(join(imagesDir, entry)).isDirectory());

const iconFamilies: Record<string, string[]> = {};
for (const family of families) {
  iconFamilies[family] = listIcons(family);
}

writeFileSync(join(imagesDir, "iconFamilies.json"), JSON.stringify(iconFamilies, null, 2) + "\n", "utf-8");
console.log(`Wrote ${join(imagesDir, "iconFamilies.json")} (families: ${families.join(", ")})`);
