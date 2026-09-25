#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";
import { draw } from "../renderer/draw";
import { createFsIconLoader } from "../renderer/icon-loader-node";
import { createNodeRenderTarget } from "../renderer/render-target-node";
import type { DiagramDocument } from "../renderer/types";

function printUsageAndExit(): never {
  console.error("Usage: render <input.yaml> <output.svg> [--width=1600] [--height=1000]");
  process.exit(1);
}

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith("--"));
const [inputPath, outputPath] = positional;
if (!inputPath || !outputPath) {
  printUsageAndExit();
}

const flags = Object.fromEntries(
  args
    .filter((arg) => arg.startsWith("--"))
    .map((arg) => arg.slice(2).split("="))
) as Record<string, string>;

const width = Number(flags.width ?? 1600);
const height = Number(flags.height ?? 1000);

const yamlText = readFileSync(inputPath, "utf-8");
const doc = (load(yamlText) || {}) as DiagramDocument;

const imagesDir = fileURLToPath(new URL("../../public/images", import.meta.url));
const target = createNodeRenderTarget(width, height);
const iconLoader = createFsIconLoader(imagesDir);

draw(doc, { target, iconLoader });

// Icon SVGs are attached asynchronously (icon-loader.load() is a Promise); give
// pending loads a turn to complete before serializing the final markup.
setImmediate(() => {
  writeFileSync(outputPath, target.serializeSvg(), "utf-8");
  console.log(`Wrote ${outputPath}`);
});
