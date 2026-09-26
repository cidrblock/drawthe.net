#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const tsxCli = fileURLToPath(import.meta.resolve("tsx/cli"));
const renderCli = fileURLToPath(new URL("../src/cli/render.ts", import.meta.url));
const result = spawnSync(process.execPath, [tsxCli, renderCli, ...process.argv.slice(2)], {
  stdio: "inherit"
});

if (result.error) {
  throw result.error;
}

process.exitCode = result.status ?? 1;
