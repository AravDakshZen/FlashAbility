#!/usr/bin/env node
/**
 * Build + deploy-prepare for FlashAbility static export targeting a Raspberry Pi.
 *
 *   node scripts/deploy.mjs --build / --gzip / --all / --clean
 *
 *   --build   Run `next build` (static export into out/).
 *   --gzip    Create a `.gz` for every compressible file in out/ (next to the
 *             original, served by deploy/serve.mjs when the client accepts it).
 *   --all     Default: build, then gzip.
 *   --clean   Remove all previously generated `.gz` files from out/.
 *
 * The Pi itself only needs Node.js (>=18) + this repo's out/ folder. The server
 * (deploy/serve.mjs) is zero-dependency so no `npm install` is required on-device.
 */

import { spawnSync } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { readdirSync, statSync, rmSync } from "node:fs";
import { join, extname } from "node:path";
import { createGzip } from "node:zlib";
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

function gzipAll() {
  const files = walk(ROOT).filter((f) => COMPRESSIBLE.has(extname(f).toLowerCase()));
  let count = 0;
  const before = files.reduce((s, f) => s + statSync(f).size, 0);

  for (const file of files) {
    const out = `${file}.gz`;
    const gz = createGzip({ level: 9 });
    const stream = createWriteStream(out);
    gz.pipe(stream);
    createReadStream(file).pipe(gz);
    stream.on("close", () => {
      count++;
      if (count === files.length) {
        const after = walk(ROOT)
          .filter((f) => f.endsWith(".gz"))
          .reduce((s, f) => s + statSync(f).size, 0);
        console.log(`gzipped ${count} files: ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB of .gz (`.concat(
          `${(100 - (after / Math.max(1, before)) * 100).toFixed(0)}% smaller)`
        ));
      }
    });
    stream.on("error", (e) => {
      console.error("gzip error", out, e.message);
      process.exitCode = 1;
    });
  }
}

function clean() {
  const files = walk(ROOT).filter((f) => f.endsWith(".gz"));
  for (const f of files) rmSync(f);
  console.log(`removed ${files.length} .gz files`);
}

const wantBuild = args.has("--build") || args.has("--all") || args.size === 0 || (args.has("--clean") && args.size === 1);
const wantGzip = args.has("--gzip") || args.has("--all") || args.size === 0;

if (wantBuild && !args.has("--clean")) build();
if (wantGzip && !args.has("--clean")) gzipAll();
if (args.has("--clean")) clean();
