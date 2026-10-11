import { renderToString } from "react-dom/server";
import { AppProviders, createQueryClient } from "@/app-root";
import { routes, findRoute } from "@/routes";
import { renderHead } from "@/lib/seo/head";
import { SITE_URL } from "@/data/business";
import { BUSINESS, BUSINESS_HOURS } from "@/data/business";
import { SERVICES, ADDONS } from "@/data/services";
import { SITE_FAQS } from "@/data/faqs";

// Imported only by scripts/prerender.mjs, never by the browser. This module must
// stay free of browser globals at import time — see src/hooks/use-pwa-install.ts
// for the one place that used to break that rule.

export interface RenderedRoute {
  path: string;
  head: string;
  body: string;
  meta: (typeof routes)[number]["meta"];
}

export function renderRoute(path: string): RenderedRoute {
  const route = findRoute(path);
  if (!route) throw new Error(`No route registered for "${path}"`);

  // A fresh client per route — the prerender renders every page in one Node
  // process, and a shared cache would leak state between them.
  const client = createQueryClient();

  const body = renderToString(
    <AppProviders client={client}>{route.element}</AppProviders>
  );

  return {
    path: route.path,
    head: renderHead(route.meta),
    body,
    meta: route.meta,
  };
}

export const allRoutes = () => routes.map((r) => ({ path: r.path, meta: r.meta }));

const xmlEsc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * sitemap.xml for Google Search Console and Bing Webmaster Tools.
 *
 * Generated from the route manifest, so it can't list a page that doesn't exist
 * or miss one that does. Each page also lists the images shown on it (Google's
 * image sitemap extension), which ties Ali's photo, the gallery and the service
 * photos to the right page for Google Images.
 */
export function renderSitemap(): string {
  const urls = routes
    .filter((r) => !r.meta.noindex)
    .map((r) => {
      const images = (r.meta.images ?? [])
        .map(
          (img) => `
    <image:image>
      <image:loc>${xmlEsc(img.src.startsWith("http") ? img.src : SITE_URL + img.src)}</image:loc>
    </image:image>`
        )
        .join("");
      return `  <url>
    <loc>${xmlEsc(SITE_URL + r.path)}</loc>
    <lastmod>${r.meta.lastmod}</lastmod>
    <changefreq>${r.meta.changefreq}</changefreq>
    <priority>${r.meta.priority.toFixed(1)}</priority>${images}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

/**
 * llms.txt, generated rather than hand-written. The previous file was maintained
 * by hand and had already drifted from the site — and it declined to list prices,
 * which is the single most useful thing an answer engine could quote.
 */
export function renderLlmsTxt(): string {
  const open = BUSINESS_HOURS.filter((h) => !h.is_closed);
  const closed = BUSINESS_HOURS.filter((h) => h.is_closed);

  const hours = [
    ...open.map(
      (h) =>
        `- ${DAY_NAMES[h.day_of_week]}: ${fmtTime(h.open_time!)} – ${fmtTime(h.close_time!)}`
    ),
    `- ${closed.map((h) => DAY_NAMES[h.day_of_week]).join(" and ")}: Closed`,
  ].join("\n");

  const services = SERVICES.map(
    (s) =>
      `- ${s.name} — $${s.price}, ${s.durationMinutes} min${
        s.hasOwnPage ? ` (${SITE_URL}/services/${s.slug}/)` : ""
      }: ${s.shortDescription}`
  ).join("\n");

  const addons = ADDONS.map(
    (s) => `- ${s.name} — $${s.price}: ${s.shortDescription}`
  ).join("\n");

  const faqs = SITE_FAQS.map((f) => `### ${f.question}\n${f.answer}`).join("\n\n");

  const pages = routes
    .filter((r) => !r.meta.noindex)
    .map((r) => `- [${r.meta.title}](${SITE_URL}${r.path})`)
    .join("\n");

  return `# ${BUSINESS.name}

> Barber shop in Pinellas Park, Florida. Men's haircuts and fades, beard
> line-ups and shaves, kids' and senior haircuts, threading, waxing and facials.
> English and Arabic spoken.

## Location and contact

- Address: ${BUSINESS.address.street}, ${BUSINESS.address.city}, ${BUSINESS.address.region} ${BUSINESS.address.postalCode}, USA
- Phone: ${BUSINESS.phone.display}
- Email: ${BUSINESS.email}
- Website: ${SITE_URL}/
- Languages spoken: ${BUSINESS.languages.join(", ")}
- Areas served: ${BUSINESS.areaServed.join("; ")}

## Hours

${hours}

## Services and prices

${services}

### Add-ons

${addons}

## Pages

${pages}

## Frequently asked questions

${faqs}
`;
}
