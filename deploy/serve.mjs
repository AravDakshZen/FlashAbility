#!/usr/bin/env node
/**
 * Tiny zero-dependency production static server for the FlashAbility static export.
 *
 * Serves the contents of `out/` (created by `next build` with `output: "export"`)
 * over HTTP. Maps Next.js clean URLs ("/decks/animals") to their generated
 * ".html" / ".txt" / "index.html" files, serves pre-gzipped ".gz" variants when
 * the client accepts gzip, sets correct MIME types and caching headers, and guards
 * against path traversal.
 *
 * Run:        node deploy/serve.mjs [PORT] [ROOT]
 * Defaults:   PORT=8080, ROOT=out
 */

import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = process.env.PORT ? Number(process.env.PORT) : (Number(process.argv[2]) || 8080);
const ROOT = resolve(process.argv[3] || fileURLToPath(new URL("../out/", import.meta.url)));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json; charset=utf-8",
};

// Next static export emits a file per path (e.g. "/decks/animals" -> animals.html,
// "/decks/animals/learn" -> animals/learn.html, "/" -> index.html). Resolve a URL
// path to one of those files, refusing anything that escapes ROOT.
function resolveFile(urlPath) {
  if (urlPath === "/") return join(ROOT, "index.html");

  // Reject query strings / fragments / trailing-slash cleanly.
  const path = decodeURIComponent(urlPath.split("?")[0].split("#")[0]).replace(/\/+$/, "");
  const parts = path.split("/").filter(Boolean);

  const candidates = [];
  const rel = parts.join(sep);

  // "/foo/bar" could be "/foo/bar.html" or literally "/foo/bar" (a file) or a dir index.
  if (rel) {
    candidates.push(join(ROOT, `${rel}.html`));
    candidates.push(join(ROOT, `${rel}.txt`));
    candidates.push(join(ROOT, rel));
    candidates.push(join(ROOT, rel, "index.html"));
  } else {
    candidates.push(join(ROOT, "index.html"));
  }

  for (const file of candidates) {
    if (!file.startsWith(ROOT + sep) && file !== ROOT) continue;
    if (existsSync(file)) {
      const st = statSync(file);
      if (st.isFile()) return file;
    }
  }
  return null;
}

function mimeFor(file) {
  return MIME[extname(file).toLowerCase()] || "application/octet-stream";
}

const server = http.createServer((req, res) => {
  const url = (req.url || "/").split("?")[0];
  const file = resolveFile(url);

  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
    return;
  }

  const acceptsGzip = /\bgzip\b/.test(req.headers["accept-encoding"] || "");
  const gzFile = acceptsGzip ? `${file}.gz` : null;
  const useGz = gzFile && existsSync(gzFile);

  const mime = mimeFor(file);
  const isAsset = file.includes(`${sep}_next${sep}`) || /\.(woff2?|ico)$/.test(file);

  const headers = {
    "Content-Type": mime,
    "Cache-Control": isAsset ? "public, max-age=31536000, immutable" : "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
  if (useGz) headers["Content-Encoding"] = "gzip";

  const stream = createReadStream(useGz ? gzFile : file);
  res.writeHead(200, headers);
  stream.pipe(res);
  stream.on("error", () => {
    res.destroy();
  });
});

server.listen(PORT, () => {
  const addr = server.address();
  console.log(`FlashAbility serving "${ROOT}"`);
  console.log(`  -> http://localhost:${typeof addr === "object" && addr ? addr.port : PORT}/`);
});
