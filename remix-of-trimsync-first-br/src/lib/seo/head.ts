import { SITE_URL } from "@/data/business";
import { graph } from "@/lib/seo/schema";

export interface PreloadLink {
  rel: string;
  as?: string;
  href: string;
  type?: string;
  fetchpriority?: string;
}

export interface RouteMeta {
  title: string;
  description: string;
  /** Path with a leading and trailing slash, e.g. "/services/". */
  path: string;
  ogType?: "website" | "article" | "profile";
  /** Absolute URL or a path under /public. Defaults to the site OG image. */
  image?: string;
  /** JSON-LD nodes, combined into one @graph. */
  schema: object[];
  preload?: PreloadLink[];
  /** Hand-edited when the page's content changes — NOT the build date. */
  lastmod: string;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  /** Excluded from the sitemap and marked noindex. */
  noindex?: boolean;
  /**
   * Images that appear on this page, listed in the sitemap's image extension so
   * Google Images associates each photo with the page it's shown on.
   */
  images?: { src: string; caption?: string }[];
}

const DEFAULT_IMAGE = "/og-image.webp";

const esc = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const abs = (path: string): string =>
  path.startsWith("http") ? path : `${SITE_URL}${path}`;

const tag = (name: string, attrs: Record<string, string | undefined>): string => {
  const rendered = Object.entries(attrs)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}="${esc(String(v))}"`)
    .join(" ");
  return `<${name} ${rendered} />`;
};

/**
 * Serializes JSON-LD for embedding in a <script> element.
 *
 * Escaping "<" is not cosmetic: an unescaped "</" anywhere in the JSON — inside
 * a description, a review, an apostrophe-heavy sentence — terminates the script
 * element early and breaks the page.
 */
const jsonLd = (nodes: object[]): string => {
  if (nodes.length === 0) return "";
  const payload = JSON.stringify(graph(nodes)).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${payload}</script>`;
};

/**
 * Renders the full per-route <head> content, substituted into the
 * <!--@seo-head--> marker in index.html at prerender time.
 *
 * The head is baked at build time and never mutates at runtime, which is why
 * this site needs no head-management library: with full page loads between
 * pages, there is no navigation during which the head would have to change.
 */
export function renderHead(meta: RouteMeta): string {
  const canonical = `${SITE_URL}${meta.path}`;
  const image = abs(meta.image ?? DEFAULT_IMAGE);
  const lines: string[] = [];

  lines.push(`<title>${esc(meta.title)}</title>`);
  lines.push(tag("meta", { name: "description", content: meta.description }));
  lines.push(tag("meta", { name: "author", content: "Ali's Barber Shop" }));
  lines.push(`<link rel="canonical" href="${esc(canonical)}" />`);

  if (meta.noindex) {
    lines.push(tag("meta", { name: "robots", content: "noindex, follow" }));
  }

  lines.push(tag("meta", { property: "og:type", content: meta.ogType ?? "website" }));
  lines.push(tag("meta", { property: "og:site_name", content: "Ali's Barber Shop" }));
  lines.push(tag("meta", { property: "og:locale", content: "en_US" }));
  lines.push(tag("meta", { property: "og:url", content: canonical }));
  lines.push(tag("meta", { property: "og:title", content: meta.title }));
  lines.push(tag("meta", { property: "og:description", content: meta.description }));
  lines.push(tag("meta", { property: "og:image", content: image }));
  lines.push(tag("meta", { property: "og:image:alt", content: meta.title }));

  lines.push(tag("meta", { name: "twitter:card", content: "summary_large_image" }));
  lines.push(tag("meta", { name: "twitter:site", content: "@AlisBarberShop" }));
  lines.push(tag("meta", { name: "twitter:title", content: meta.title }));
  lines.push(tag("meta", { name: "twitter:description", content: meta.description }));
  lines.push(tag("meta", { name: "twitter:image", content: image }));

  for (const link of meta.preload ?? []) {
    lines.push(tag("link", { ...link }));
  }

  lines.push(jsonLd(meta.schema));

  return lines.filter(Boolean).join("\n    ");
}
