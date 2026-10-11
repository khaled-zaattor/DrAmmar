#!/usr/bin/env node
/**
 * Drift guard between src/data/services.ts and the live services table.
 *
 * The static catalog exists so service names and prices are in the HTML even
 * when the API is down. The cost of that is a second copy of the data, and a
 * second copy drifts — someone edits a price in the admin panel and the website
 * quietly advertises the old one.
 *
 * This is deliberately NOT part of `npm run build`. The build must succeed with
 * the API unreachable, which is the whole point of the static catalog. Run it
 * before a deploy instead:
 *
 *     npm run check:services
 *
 * Exits 1 on any mismatch, so it also works as a CI or cron check later.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const API_BASE =
  process.env.VITE_API_BASE_URL ?? "https://api.alisbarbershop.com";

// Parsing the TS source with a regex rather than compiling it keeps this script
// dependency-free. The fields are simple literals; if that ever stops being
// true, switch to `npx tsx` and a real import.
function readStaticServices() {
  const src = readFileSync(resolve(ROOT, "src/data/services.ts"), "utf8");
  const services = [];
  const blocks = src.split(/\n  \{\n/).slice(1);

  for (const block of blocks) {
    const get = (key, pattern) => block.match(pattern)?.[1];
    const apiServiceName = get("apiServiceName", /apiServiceName:\s*"([^"]+)"/);
    if (!apiServiceName) continue;
    services.push({
      slug: get("slug", /slug:\s*"([^"]+)"/),
      apiServiceName,
      price: Number(get("price", /\n\s*price:\s*([\d.]+)/)),
      durationMinutes: Number(
        get("durationMinutes", /durationMinutes:\s*(\d+)/)
      ),
    });
  }
  return services;
}

function extractArray(body) {
  if (Array.isArray(body)) return body;
  const inner = body?.data;
  if (Array.isArray(inner)) return inner;
  if (Array.isArray(inner?.data)) return inner.data;
  return [];
}

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

async function main() {
  const staticServices = readStaticServices();
  if (staticServices.length === 0) {
    console.error(`${RED}Could not parse any services from src/data/services.ts${RESET}`);
    process.exit(1);
  }

  const url = `${API_BASE}/api/services`;
  console.log(`${DIM}Checking ${staticServices.length} static services against ${url}${RESET}\n`);

  let live;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    live = extractArray(await res.json());
  } catch (error) {
    console.error(`${RED}Could not reach the API:${RESET} ${error.message}`);
    console.error(
      `${DIM}The site still builds and renders without it — this check just can't run.${RESET}`
    );
    process.exit(1);
  }

  const byName = new Map(live.map((s) => [s.name, s]));
  const problems = [];

  for (const s of staticServices) {
    const row = byName.get(s.apiServiceName);

    if (!row) {
      problems.push(
        `${RED}MISSING${RESET}  ${s.slug}\n` +
          `          no live service named "${s.apiServiceName}".\n` +
          `          Either the row was renamed or deleted, or this page advertises\n` +
          `          something the shop does not offer. Fix before deploying.`
      );
      continue;
    }

    const livePrice = Number(row.price);
    const liveDuration = Number(row.duration_minutes);

    if (livePrice !== s.price) {
      problems.push(
        `${RED}PRICE${RESET}    ${s.slug} — static $${s.price}, live $${livePrice}`
      );
    }
    if (liveDuration !== s.durationMinutes) {
      problems.push(
        `${YELLOW}DURATION${RESET} ${s.slug} — static ${s.durationMinutes} min, live ${liveDuration} min`
      );
    }
  }

  const covered = new Set(staticServices.map((s) => s.apiServiceName));
  const uncovered = live.filter((s) => !covered.has(s.name) && !s.is_addon);
  if (uncovered.length > 0) {
    console.log(
      `${YELLOW}Live services with no page${RESET} ${DIM}(not an error — just unsold)${RESET}`
    );
    for (const s of uncovered) console.log(`  · ${s.name} — $${s.price}`);
    console.log();
  }

  if (problems.length > 0) {
    console.error(`${RED}${problems.length} mismatch(es):${RESET}\n`);
    for (const p of problems) console.error(`  ${p}`);
    console.error(
      `\n${DIM}Update src/data/services.ts to match the live data, then rebuild.${RESET}`
    );
    process.exit(1);
  }

  console.log(
    `${GREEN}✓${RESET} All ${staticServices.length} static services match the live API.`
  );
}

main();
