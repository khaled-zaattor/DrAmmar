import type { ReactElement } from "react";
import Index from "@/pages/Index";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import About from "@/pages/About";
import Faq from "@/pages/Faq";
import Gallery from "@/pages/Gallery";
import Contact from "@/pages/Contact";
import type { RouteMeta } from "@/lib/seo/head";
import { SITE_FAQS } from "@/data/faqs";
import { SERVICE_PAGES } from "@/data/services";
import { ABOUT } from "@/data/about";
import { GALLERY } from "@/data/gallery";
import * as schema from "@/lib/seo/schema";

/**
 * The single route manifest. It drives three things that used to disagree with
 * each other: which pages get prerendered, what each one's <head> contains, and
 * what goes in sitemap.xml.
 *
 * There is no client-side router. Navigation between pages is a full page load,
 * which is why the head can be baked at build time and never has to mutate —
 * the reason this site needs no head-management library at all.
 */
export interface RouteDef {
  /** Leading and trailing slash. "/" for the homepage. */
  path: string;
  element: ReactElement;
  meta: RouteMeta;
}

// lastmod is edited by hand when a page's content changes. It deliberately is
// NOT the build date: a lastmod that changes on every build with no content
// change is a documented negative signal, and Google starts ignoring the field.
const LASTMOD = "2026-09-20";
// Pages whose content changed on 2026-09-21 (Ali's photo and bio; a corrected
// review, which shows on the homepage and the About page).
const LASTMOD_ABOUT_UPDATE = "2026-09-21";

const galleryImages = GALLERY.map((g) => ({ src: g.src, caption: g.caption }));

const HOME_CRUMB = { name: "Home", url: "/" };

/** One route per service that has hasOwnPage set in src/data/services.ts. */
const serviceRoutes: RouteDef[] = SERVICE_PAGES.map((s) => {
  const path = `/services/${s.slug}/`;
  return {
    path,
    element: <ServiceDetail service={s} />,
    meta: {
      path,
      title:
        s.meta?.title ??
        `${s.name} in Pinellas Park, FL — $${s.price} | Ali's Barber Shop`,
      description: s.meta?.description ?? s.shortDescription,
      image: s.image?.src,
      images: s.image ? [{ src: s.image.src, caption: s.image.alt }] : [],
      schema: [
        schema.barberShop(),
        schema.service(s),
        ...(s.faqs.length >= 2 ? [schema.faqPage(s.faqs)] : []),
        schema.breadcrumb([
          HOME_CRUMB,
          { name: "Services", url: "/services/" },
          { name: s.name, url: path },
        ]),
      ],
      lastmod: s.lastmod,
      priority: s.featured ? 0.8 : 0.6,
      changefreq: "monthly",
    },
  };
});

export const routes: RouteDef[] = [
  {
    path: "/",
    element: <Index />,
    meta: {
      path: "/",
      title:
        "Ali's Barber Shop | Barber in Pinellas Park, FL — Fades, Beards & Kids' Cuts",
      description:
        "Barber shop in Pinellas Park, FL. Men's haircuts $30, haircut & beard $45, beard line-up $20, kids and seniors $25. Threading and facials too. English and Arabic spoken — book online.",
      schema: [
        schema.barberShop(),
        schema.webSite(),
        schema.faqPage(SITE_FAQS),
      ],
      preload: [
        {
          rel: "preload",
          as: "image",
          href: "/hero-barber.jpg",
          fetchpriority: "high",
        },
      ],
      images: [
        { src: "/hero-barber.jpg", caption: "Barber giving a precision fade at Ali's Barber Shop in Pinellas Park, FL" },
        ...galleryImages,
      ],
      lastmod: LASTMOD_ABOUT_UPDATE,
      priority: 1.0,
      changefreq: "weekly",
    },
  },

  {
    path: "/services/",
    element: <Services />,
    meta: {
      path: "/services/",
      title: "Barber Services & Prices in Pinellas Park, FL | Ali's Barber Shop",
      description:
        "Full price list for Ali's Barber Shop in Pinellas Park, FL. Haircuts $30, haircut & beard $45, beard line-up $20, kids and seniors $25, threading from $5, facial $45.",
      schema: [
        schema.barberShop(),
        schema.breadcrumb([HOME_CRUMB, { name: "Services", url: "/services/" }]),
      ],
      lastmod: LASTMOD,
      priority: 0.9,
      changefreq: "monthly",
    },
  },

  ...serviceRoutes,

  {
    path: "/about-ali/",
    element: <About />,
    meta: {
      path: "/about-ali/",
      title: `Meet ${ABOUT.name} — Barber in Pinellas Park, FL | Ali's Barber Shop`,
      description:
        "Meet Ali, the barber at Ali's Barber Shop in Pinellas Park, FL. Eight years of experience — fades, beard work and scissor cuts, in English or Arabic.",
      ogType: "profile",
      image: ABOUT.photo?.src,
      images: ABOUT.photo ? [{ src: ABOUT.photo.src, caption: ABOUT.photo.alt }] : [],
      schema: [
        schema.barberShop(),
        schema.person(),
        schema.breadcrumb([
          HOME_CRUMB,
          { name: `About ${ABOUT.name}`, url: "/about-ali/" },
        ]),
      ],
      lastmod: LASTMOD_ABOUT_UPDATE,
      priority: 0.7,
      changefreq: "monthly",
    },
  },

  {
    path: "/faq/",
    element: <Faq />,
    meta: {
      path: "/faq/",
      title: "FAQ — Prices, Hours, Parking & Walk-Ins | Ali's Barber Shop",
      description:
        "Answers about Ali's Barber Shop in Pinellas Park, FL: haircut prices, opening hours, parking, walk-ins, kids' cuts, hot towel shaves and Arabic-speaking barbers.",
      schema: [
        schema.barberShop(),
        schema.faqPage(SITE_FAQS),
        schema.breadcrumb([HOME_CRUMB, { name: "FAQ", url: "/faq/" }]),
      ],
      lastmod: LASTMOD,
      priority: 0.8,
      changefreq: "monthly",
    },
  },

  {
    path: "/gallery/",
    element: <Gallery />,
    meta: {
      path: "/gallery/",
      title: "Haircut Gallery — Fades & Beard Work | Ali's Barber Shop",
      description:
        "Photos of real haircuts from Ali's Barber Shop in Pinellas Park, FL — skin fades, taper fades, low fades, beard shaping and line-ups.",
      schema: [
        schema.barberShop(),
        schema.imageGallery(),
        schema.breadcrumb([HOME_CRUMB, { name: "Gallery", url: "/gallery/" }]),
      ],
      images: galleryImages,
      lastmod: LASTMOD,
      priority: 0.6,
      changefreq: "monthly",
    },
  },

  {
    path: "/contact/",
    element: <Contact />,
    meta: {
      path: "/contact/",
      title: "Contact & Directions — Pinellas Park, FL | Ali's Barber Shop",
      description:
        "Ali's Barber Shop, 4201 62nd North Unit 9, Pinellas Park, FL 33781. Free parking, Tue–Fri 8:30–5:30, Sat 9–4. Call or text 813-895-9229.",
      schema: [
        schema.barberShop(),
        schema.breadcrumb([HOME_CRUMB, { name: "Contact", url: "/contact/" }]),
      ],
      lastmod: LASTMOD,
      priority: 0.8,
      changefreq: "monthly",
    },
  },
];

export const findRoute = (path: string): RouteDef | undefined => {
  const normalized = path.endsWith("/") ? path : `${path}/`;
  return routes.find((r) => r.path === normalized);
};
