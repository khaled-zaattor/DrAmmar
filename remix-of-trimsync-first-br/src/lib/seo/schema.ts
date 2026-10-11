import { BUSINESS, BUSINESS_HOURS, SITE_URL } from "@/data/business";
import { ABOUT } from "@/data/about";
import { GALLERY } from "@/data/gallery";
import type { ServiceFaq, StaticService } from "@/data/services";
import { SERVICES, ADDONS } from "@/data/services";

// JSON-LD generators. All pure functions over src/data/*, so the structured data
// cannot disagree with what the page actually renders — which is the single most
// common way structured data becomes a liability rather than an asset.
//
// The previous implementation was a hand-maintained block in index.html that
// listed six offers with no prices, two of which ("Skin Fade", "Hot Towel
// Shave") were not services the shop sells as such. These read from the DB-backed
// catalog instead.
//
// Deliberately absent: AggregateRating and Review. Google's structured data
// policy makes reviews a business collects about itself, on its own site,
// ineligible for review rich results, and marking them up risks a manual action.

const ID = {
  business: `${SITE_URL}/#barbershop`,
  website: `${SITE_URL}/#website`,
  person: `${SITE_URL}/about-ali/#ali`,
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const abs = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path}`;

/** "08:30:00" → "08:30" — schema.org wants HH:MM. */
const hhmm = (t: string) => t.slice(0, 5);

/**
 * The central entity. Emitted on every page as a @graph node so that everything
 * else can point at it by @id rather than repeating the NAP.
 */
export function barberShop() {
  return {
    "@type": "BarberShop",
    "@id": ID.business,
    name: BUSINESS.name,
    alternateName: BUSINESS.alternateName,
    url: `${SITE_URL}/`,
    logo: abs("/logo.png"),
    image: [abs("/og-image.webp"), abs("/hero-barber.jpg")],
    description:
      "Barber shop in Pinellas Park, Florida offering men's haircuts, fades, beard line-ups and shaves, kids' and senior haircuts, threading, waxing and facials. English and Arabic spoken.",
    telephone: BUSINESS.phone.e164,
    email: BUSINESS.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: BUSINESS.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.geo.lat,
      longitude: BUSINESS.geo.lng,
    },
    hasMap: BUSINESS.mapsUrl,
    priceRange: BUSINESS.priceRange,
    currenciesAccepted: BUSINESS.currenciesAccepted,
    paymentAccepted: "Cash, Credit Card, Debit Card",
    knownLanguage: BUSINESS.languages.map((name) => ({
      "@type": "Language",
      name,
    })),
    areaServed: BUSINESS.areaServed.map((name) => ({
      "@type": "City",
      name,
    })),
    openingHoursSpecification: BUSINESS_HOURS.filter(
      (h) => !h.is_closed && h.open_time && h.close_time
    ).map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${DAYS[h.day_of_week]}`,
      opens: hhmm(h.open_time!),
      closes: hhmm(h.close_time!),
    })),
    // sameAs is what lets an entity-resolution engine decide that the Instagram
    // account, the Facebook page and this website are one business rather than
    // three. Keep every profile listed here.
    sameAs: [
      BUSINESS.socials.instagram,
      BUSINESS.socials.facebook,
      BUSINESS.socials.tiktok,
    ],
    hasOfferCatalog: serviceCatalog(),
  };
}

export function webSite() {
  return {
    "@type": "WebSite",
    "@id": ID.website,
    url: `${SITE_URL}/`,
    name: BUSINESS.name,
    inLanguage: "en-US",
    publisher: { "@id": ID.business },
  };
}

const offerFor = (s: StaticService) => ({
  "@type": "Offer",
  name: s.name,
  description: s.shortDescription,
  price: s.price.toFixed(2),
  priceCurrency: "USD",
  availability: "https://schema.org/InStock",
  ...(s.hasOwnPage ? { url: `${SITE_URL}/services/${s.slug}/` } : {}),
});

/** Real offers with real prices, unlike the price-less list this replaces. */
export function serviceCatalog() {
  return {
    "@type": "OfferCatalog",
    name: `Services at ${BUSINESS.name}`,
    itemListElement: [...SERVICES, ...ADDONS].map(offerFor),
  };
}

export function service(s: StaticService) {
  return {
    "@type": "Service",
    "@id": `${SITE_URL}/services/${s.slug}/#service`,
    name: s.name,
    description: s.shortDescription,
    serviceType: s.category,
    provider: { "@id": ID.business },
    areaServed: BUSINESS.areaServed.map((name) => ({
      "@type": "City",
      name,
    })),
    offers: offerFor(s),
  };
}

/**
 * FAQPage. The answers passed here MUST be the ones rendered visibly on the
 * page — both callers read from the same array the component renders, so they
 * cannot drift.
 */
export function faqPage(faqs: ServiceFaq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumb(trail: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.url),
    })),
  };
}

export function imageGallery() {
  return {
    "@type": "ImageGallery",
    name: `Our work — ${BUSINESS.name}`,
    about: { "@id": ID.business },
    associatedMedia: GALLERY.map((img) => ({
      "@type": "ImageObject",
      contentUrl: abs(img.src),
      caption: img.caption,
      description: img.alt,
      width: img.width,
      height: img.height,
    })),
  };
}

/**
 * Person → worksFor → LocalBusiness. This is the link that lets an answer engine
 * treat "Ali" as a barber at a specific shop in a specific city, rather than an
 * unresolvable first name. Fields the owner hasn't confirmed are omitted rather
 * than guessed.
 */
export function person() {
  return {
    "@type": "Person",
    "@id": ID.person,
    name: ABOUT.fullName ?? ABOUT.name,
    ...(ABOUT.fullName ? { alternateName: ABOUT.name } : {}),
    jobTitle: ABOUT.jobTitle,
    gender: "Male",
    worksFor: { "@id": ID.business },
    knowsLanguage: ABOUT.languages,
    knowsAbout: ABOUT.specialties,
    ...(ABOUT.photo ? { image: abs(ABOUT.photo.src) } : {}),
  };
}

/** Wraps page nodes into a single @graph with the shared @context. */
export function graph(nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
