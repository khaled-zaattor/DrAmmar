#!/usr/bin/env node
/**
 * Turns the built SPA shell into one real HTML document per route.
 *
 * The problem this solves: the deployed site served a body containing nothing
 * but `<div id="root"></div>`. Every service, price, review, opening hour and
 * FAQ answer reached the page only after JavaScript booted and a cross-origin
 * call to api.alisbarbershop.com succeeded. When that call failed, Google
 * received "Failed to load services: Failed to fetch" and indexed a barber shop
 * that appeared to offer nothing at all.
 *
 * How it works:
 *   1. `vite build` produces dist/index.html — critical CSS already inlined by
 *      the inlineStylesheet() plugin, script tags already pointing at hashed
 *      chunks. That finished file is the template, which is why that plugin
 *      needs no changes: it still runs exactly once, on exactly one HTML file.
 *   2. `vite build --ssr` produces a Node-loadable bundle of src/entry-server.
 *   3. For each route this renders the React tree to a string, substitutes it
 *      into the template along with the route's <head>, and writes
 *      dist/<path>/index.html.
 *
 * Nothing here touches the network. All page content comes from the committed
 * modules in src/data/, so the build succeeds with the API down — which is the
 * entire point.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const SSR_DIR = join(ROOT, ".ssr-build");

const HEAD_MARKER = "<!--@seo-head-->";
const ROOT_DIV = '<div id="root"></div>';

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

function fail(message) {
  console.error(`${RED}prerender: ${message}${RESET}`);
  process.exit(1);
}

const templatePath = join(DIST, "index.html");
if (!existsSync(templatePath)) {
  fail("dist/index.html not found — run `vite build` first.");
}

const template = readFileSync(templatePath, "utf8");

if (!template.includes(HEAD_MARKER)) {
  fail(
    `template is missing ${HEAD_MARKER}. index.html must contain that marker for\n` +
      `            per-route meta to be injected, or every page ships with no title,\n` +
      `            no canonical and no structured data.`
  );
}
if (!template.includes(ROOT_DIV)) {
  fail(
    `template is missing ${ROOT_DIV}. Without it there is nowhere to place the\n` +
      `            prerendered markup and every page would ship empty.`
  );
}

const entryPath = join(SSR_DIR, "entry-server.js");
if (!existsSync(entryPath)) {
  fail(".ssr-build/entry-server.js not found — run the --ssr build first.");
}

const { renderRoute, allRoutes, renderSitemap, renderLlmsTxt } = await import(
  pathToFileURL(entryPath).href
);

/** "/" → dist/index.html; "/services/x/" → dist/services/x/index.html */
function outputPath(routePath) {
  const clean = routePath.replace(/^\/|\/$/g, "");
  return clean ? join(DIST, clean, "index.html") : join(DIST, "index.html");
}

function write(relativePath, contents) {
  const full = join(DIST, relativePath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents, "utf8");
}

const routes = allRoutes();
console.log(`${DIM}Prerendering ${routes.length} route(s)…${RESET}\n`);

let failures = 0;

for (const { path } of routes) {
  try {
    const { head, body } = renderRoute(path);

    const html = template
      .replace(HEAD_MARKER, head)
      .replace(ROOT_DIV, `<div id="root">${body}</div>`);

    const target = outputPath(path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html, "utf8");

    const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
    console.log(
      `  ${GREEN}✓${RESET} ${path.padEnd(42)} ${DIM}${kb.padStart(6)} kB${RESET}`
    );
  } catch (error) {
    failures++;
    console.error(`  ${RED}✗ ${path}${RESET}`);
    console.error(`    ${error.stack ?? error.message}`);
  }
}

if (failures > 0) {
  // Deliberately fatal. A route that throws during prerender would otherwise
  // ship as an empty shell — exactly the bug this script exists to prevent.
  fail(`${failures} route(s) failed to render. Not writing a partial site.`);
}

write("sitemap.xml", renderSitemap());
write("llms.txt", renderLlmsTxt());
console.log(`\n  ${GREEN}✓${RESET} sitemap.xml ${DIM}(${routes.length} urls)${RESET}`);
console.log(`  ${GREEN}✓${RESET} llms.txt`);

rmSync(SSR_DIR, { recursive: true, force: true });

// ─── Acceptance check ────────────────────────────────────────────────────────
// Guards against the failure mode that started all of this: a build that looks
// successful but ships a page with no readable content in it.
const homepage = readFileSync(join(DIST, "index.html"), "utf8");
const mustContain = [
  ["the H1", "Barber Shop in Pinellas Park"],
  ["a service name", "Men's Haircut"],
  ["a price", "$30"],
  ["the address", "4201 62nd North"],
  ["opening hours", "8:30 AM"],
  ["structured data", "application/ld+json"],
  ["a canonical URL", 'rel="canonical"'],
];

const missing = mustContain.filter(([, needle]) => !homepage.includes(needle));
if (missing.length > 0) {
  fail(
    `the prerendered homepage is missing ${missing
      .map(([label]) => label)
      .join(", ")}.\n            The build produced HTML, but not HTML worth serving.`
  );
}

console.log(
  `\n${GREEN}✓${RESET} Prerender complete — homepage contains services, prices, NAP and schema.\n`
);
