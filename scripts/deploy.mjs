#!/usr/bin/env node
/**
 * Build + deploy-prepare for FlashAbility static export targeting a Raspberry Pi.
 *
 *   node scripts/deploy.mjs --build / --gzip / --all / --clean
 *
 *   --build   Run `next build` (static export into out/).
 *   --gzip    Create a `.gz` (+ `.br`) for every compressible file in out/,
 *             served by deploy/serve.mjs when the client accepts it.
 *   --all     Default: build, then gzip.
 *   --clean   Remove all previously generated `.gz` / `.br` files from out/.
 *
 * The Pi itself only needs Node.js (>=18) + this repo's out/ folder. The server
 * (deploy/serve.mjs) is zero-dependency so no `npm install` is required on-device.
 */

import { spawnSync } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { readdirSync, statSync, rmSync } from "node:fs";
import { join, extname } from "node:path";
import { createBrotliCompress, createGzip } from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../out/", import.meta.url));
const args = new Set(process.argv.slice(2));
const COMPRESSIBLE = new Set([".html", ".txt", ".js", ".mjs", ".css", ".json", ".svg"]);

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function build() {
  const r = spawnSync("npx", ["next", "build"], { stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) {
    console.error("next build failed");
    process.exit(r.status ?? 1);
  }
}

function compress(file) {
  const jobs = [];
  const gzOut = `${file}.gz`;
  const brOut = `${file}.br`;
  const gz = createGzip({ level: 9 });
  const br = createBrotliCompress({ params: { [5]: 11 } });
  let gzSize = 0;
  let brSize = 0;

  gz.on("data", (c) => (gzSize += c.length));
  br.on("data", (c) => (brSize += c.length));

  const gzDone = new Promise((resolve) => {
    const stream = createWriteStream(gzOut);
    gz.pipe(stream);
    stream.on("close", resolve);
    stream.on("error", (e) => writeError(gzOut, e));
  });
  const brDone = new Promise((resolve) => {
    const stream = createWriteStream(brOut);
    br.pipe(stream);
    stream.on("close", resolve);
    stream.on("error", (e) => writeError(brOut, e));
  });

  const reader = createReadStream(file);
  reader.pipe(gz);
  reader.pipe(br);
  return Promise.all([gzDone, brDone]).then(() => ({ gzSize, brSize }));
}

function writeError(out, e) {
  console.error("compression error", out, e.message);
  process.exitCode = 1;
}

async function compressAll() {
  const files = walk(ROOT).filter((f) => COMPRESSIBLE.has(extname(f).toLowerCase()));
  const before = files.reduce((s, f) => s + statSync(f).size, 0);
  let gzTotal = 0;
  let brTotal = 0;

  for (const file of files) {
    const { gzSize, brSize } = await compress(file);
    gzTotal += gzSize;
    brTotal += brSize;
  }

  const gzPct = (100 - (gzTotal / Math.max(1, before)) * 100).toFixed(0);
  const brPct = (100 - (brTotal / Math.max(1, before)) * 100).toFixed(0);
  console.log(
    `compressed ${files.length} files: ${(before / 1024).toFixed(0)} KB -> ` +
      `gzip ${(gzTotal / 1024).toFixed(0)} KB (-${gzPct}%) | ` +
      `brotli ${(brTotal / 1024).toFixed(0)} KB (-${brPct}%)`
  );
}

function clean() {
  const files = walk(ROOT).filter((f) => f.endsWith(".gz") || f.endsWith(".br"));
  for (const f of files) rmSync(f);
  console.log(`removed ${files.length} compressed files`);
}

const wantBuild = args.has("--build") || args.has("--all") || args.size === 0 || (args.has("--clean") && args.size === 1);
const wantGzip = args.has("--gzip") || args.has("--all") || args.size === 0;

if (wantBuild && !args.has("--clean")) build();
if (wantGzip && !args.has("--clean")) compressAll();
if (args.has("--clean")) clean();
