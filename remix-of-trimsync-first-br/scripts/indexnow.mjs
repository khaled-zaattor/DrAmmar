#!/usr/bin/env node
/**
 * Pings IndexNow with every published URL.
 *
 * Run this MANUALLY, after the new files are uploaded and live:
 *
 *     npm run seo:ping
 *
 * Not part of the build, on purpose. IndexNow tells search engines "go and
 * fetch these URLs now" — pinging before the upload just sends crawlers to the
 * old content, or to a 404.
 *
 * What it is and isn't worth:
 *   · Bing, Yandex, DuckDuckGo (via Bing), Naver and Seznam consume IndexNow.
 *   · Google does NOT participate. For Google, submit the sitemap in Search
 *     Console and use URL Inspection → Request Indexing on the new pages.
 *   · Bing's index is what ChatGPT search leans on, so this genuinely matters
 *     for AI visibility even though it does nothing for Google.
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "alisbarbershop.com";
const SITEMAP = join(ROOT, "dist", "sitemap.xml");

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

// The key lives in public/<key>.txt, whose entire contents are the key itself —
// that file is how the search engine verifies you own the domain.
const keyFile = readdirSync(join(ROOT, "public")).find((f) =>
  /^[0-9a-f]{32}\.txt$/.test(f)
);
if (!keyFile) {
  console.error(
    `${RED}No IndexNow key file found in public/.${RESET}\n` +
      `Generate one with:\n` +
      `  node -e "const k=require('crypto').randomBytes(16).toString('hex');` +
      `require('fs').writeFileSync('public/'+k+'.txt',k);console.log(k)"`
  );
  process.exit(1);
}
const key = keyFile.replace(/\.txt$/, "");

// Read the URLs from the generated sitemap rather than re-deriving them, so the
// ping and the sitemap can never disagree.
let urlList;
try {
  const xml = readFileSync(SITEMAP, "utf8");
  urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
} catch {
  console.error(
    `${RED}dist/sitemap.xml not found — run \`npm run build\` first.${RESET}`
  );
  process.exit(1);
}

if (urlList.length === 0) {
  console.error(`${RED}No URLs in the sitemap.${RESET}`);
  process.exit(1);
}

console.log(`${DIM}Submitting ${urlList.length} URLs for ${HOST}…${RESET}`);
for (const u of urlList) console.log(`  ${DIM}${u}${RESET}`);

const res = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList,
  }),
});

if (res.status === 200 || res.status === 202) {
  console.log(`\n${GREEN}✓${RESET} Accepted (HTTP ${res.status}).`);
  console.log(
    `${DIM}Google ignores IndexNow — submit the sitemap in Search Console separately.${RESET}`
  );
} else {
  const body = await res.text().catch(() => "");
  console.error(`\n${RED}✗ HTTP ${res.status}${RESET} ${body.slice(0, 300)}`);
  if (res.status === 403) {
    console.error(
      `${DIM}403 usually means https://${HOST}/${key}.txt isn't reachable yet — ` +
        `upload the new files before pinging.${RESET}`
    );
  }
  process.exit(1);
}
