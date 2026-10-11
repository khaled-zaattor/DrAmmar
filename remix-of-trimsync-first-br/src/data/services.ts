import type { TopService } from "@/lib/api";

// The static, crawlable service catalog.
//
// Why this file exists: every service name, price and duration used to reach the
// page only after JS booted AND a cross-origin call to the API succeeded. When
// that call failed, Google received "Failed to load services: Failed to fetch"
// and indexed a barber shop that appeared to offer nothing. This module puts the
// catalog in the HTML at build time, so the content survives an API outage.
//
// SOURCE OF TRUTH: the `services` table in the Laravel DB, read from the live
// API on 2026-09-20. `apiServiceName` must match a row's `name` exactly —
// `npm run check:services` verifies names, prices and durations against the live
// API and exits non-zero on drift. Do not invent services here; if the shop
// starts offering something, add the row in the admin panel first.
//
// The booking widget never reads this file. It stays 100% live API, so a price
// edited in the admin panel is always the price a customer is charged; the worst
// drift can do is show a stale number for the few hundred ms before the fetch
// resolves.

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface StaticService {
  /** URL slug. Page lives at /services/<slug>/ when hasOwnPage. */
  slug: string;
  /** Display name used as the H1 and card title. */
  name: string;
  /** EXACT `name` of the row in GET /api/services this page books. */
  apiServiceName: string;
  /** Whole USD, from the DB. */
  price: number;
  /** Minutes reserved in the calendar. Add-ons are 0 — they reserve no time. */
  durationMinutes: number;
  /** Category name as it exists in the DB. */
  category: "Haircuts" | "Beard & Shave" | "Face & Grooming" | "Add-Ons";
  /** Add-ons attach to another service rather than being booked alone. */
  isAddon: boolean;
  /** One sentence — cards, meta description, and the schema Offer description. */
  shortDescription: string;
  /** Body copy for the service page. Empty for add-ons, which have no page. */
  longDescription: string[];
  includes: string[];
  faqs: ServiceFaq[];
  image?: { src: string; alt: string; width: number; height: number };
  meta?: { title?: string; description?: string };
  /** Generates /services/<slug>/. */
  hasOwnPage: boolean;
  /** Appears in the hero price list and the homepage grid. */
  featured: boolean;
  order: number;
  lastmod: string;
}

const LASTMOD = "2026-09-20";

export const SERVICES: StaticService[] = [
  // ─── Haircuts ──────────────────────────────────────────────────────────────
  {
    slug: "mens-haircut-pinellas-park",
    name: "Men's Haircut",
    apiServiceName: "Mens Hair Cut",
    price: 30,
    durationMinutes: 30,
    category: "Haircuts",
    isAddon: false,
    shortDescription:
      "A professional men's haircut with clean lines, balanced shape and a polished finish — classic cuts, modern styles and fades.",
    longDescription: [
      "Every men's haircut at Ali's starts with a short conversation. How you wear it, how often you get cut, what grew out badly last time, whether you style it in the morning or walk out the door wet. A barber who skips that step is guessing, and guessing is how you end up with a cut that looked right in the chair and wrong by Wednesday.",
      "From there it's clipper and scissor work to match: skin fades, taper fades, low, mid and high fades, scissor cuts, crops, and straightforward classic cuts that don't need a name. The sides get blended properly rather than stepped, the neckline is squared or tapered to suit your hairline, and the top is cut to the length that actually holds the shape you asked for.",
      "The cut finishes with a line-up around the edges and a light style so you can see how it sits. If something isn't right, say so before you leave — it's easier to fix in the chair than a week later. Add a hot towel for $5 if you want the classic finish.",
    ],
    includes: [
      "Consultation on length, shape and how you style it",
      "Clipper and scissor work — fades, tapers, crops and classic cuts",
      "Neckline and around-the-ears line-up",
      "Finish styling so you leave seeing the shape",
    ],
    faqs: [
      {
        question: "How much is a men's haircut at Ali's Barber Shop?",
        answer:
          "A men's haircut is $30 and takes about 30 minutes. That includes the consultation, the cut, the line-up around the edges, and a finish style.",
      },
      {
        question: "Do you do skin fades and taper fades?",
        answer:
          "Yes. Skin fades, taper fades, and low, mid and high fades are all part of a standard men's haircut at $30 — they're cutting styles, not separate services, so there's no upcharge for asking for one.",
      },
      {
        question: "How long does a haircut take?",
        answer:
          "About 30 minutes. A detailed skin fade can run slightly longer. Booking a time means you're not waiting on the chair.",
      },
      {
        question: "Can I add a beard trim to my haircut?",
        answer:
          "Yes, and it's cheaper as a package. A haircut and beard together is $45 for 45 minutes, rather than $30 and $20 booked separately.",
      },
    ],
    image: {
      src: "/images/gallery-1.jpg",
      alt: "Men's skin fade haircut at Ali's Barber Shop in Pinellas Park, FL",
      width: 275,
      height: 183,
    },
    meta: {
      title: "Men's Haircut in Pinellas Park, FL — $30 | Ali's Barber Shop",
      description:
        "Men's haircuts in Pinellas Park, FL for $30. Skin fades, taper fades, scissor cuts and classic cuts, finished with a line-up. Book online or call 813-895-9229.",
    },
    hasOwnPage: true,
    featured: true,
    order: 1,
    lastmod: LASTMOD,
  },

  {
    slug: "haircut-and-beard-pinellas-park",
    name: "Haircut & Beard",
    apiServiceName: "Hair Cut & Beard",
    price: 45,
    durationMinutes: 45,
    category: "Haircuts",
    isAddon: false,
    shortDescription:
      "A full grooming service combining a sharp haircut with detailed beard shaping, in one 45-minute visit.",
    longDescription: [
      "This is the appointment most regulars book. A haircut and a beard shaped in the same sitting, cut to work together rather than as two jobs that happen to land on the same face.",
      "That matters more than it sounds. The taper on the sides of your head has to meet the beard somewhere, and where that connection lands changes how the whole thing reads. Cut separately, you get a hard edge or a gap. Cut together, the fade runs down into the beard and the line reads as one shape.",
      "You get the full haircut — consultation, fade or scissor work, neckline, line-up — plus the beard trimmed to length, the cheek and neck lines set, and the edges finished with a razor. Forty-five minutes, $45, and it's $5 less than booking the two separately.",
    ],
    includes: [
      "Full men's haircut with consultation and styling",
      "Beard trimmed and shaped to length",
      "Cheek line and neck line set with a razor",
      "Fade blended into the beard so the two read as one shape",
      "$5 less than booking the haircut and beard separately",
    ],
    faqs: [
      {
        question: "How much is a haircut and beard at Ali's Barber Shop?",
        answer:
          "$45 for 45 minutes. That's the full haircut plus the beard shaped, lined up and razor-finished — $5 less than booking a $30 haircut and a $20 beard service separately.",
      },
      {
        question: "Why book them together instead of separately?",
        answer:
          "Beyond the price, the fade on your sides has to connect to your beard. Cutting both in one sitting lets the barber blend that transition instead of leaving a hard edge where the two meet.",
      },
      {
        question: "How long should I let my beard grow before coming in?",
        answer:
          "Enough length to shape is enough. If you're growing a beard out and want it tidied without losing length, say so at the start — the barber will clean the lines and leave the body alone.",
      },
    ],
    image: {
      src: "/images/gallery-4.jpg",
      alt: "Fresh haircut and beard shape at Ali's Barber Shop in Pinellas Park, FL",
      width: 480,
      height: 480,
    },
    meta: {
      title: "Haircut & Beard in Pinellas Park, FL — $45 | Ali's Barber Shop",
      description:
        "Haircut and beard trim together for $45 in Pinellas Park, FL. Fade blended into the beard, lines set with a razor, 45 minutes. Book online or call 813-895-9229.",
    },
    hasOwnPage: true,
    featured: true,
    order: 2,
    lastmod: LASTMOD,
  },

  {
    slug: "kids-haircut-pinellas-park",
    name: "Kids' Haircut (Under 12)",
    apiServiceName: "Kids Hair Cut (Under 12)",
    price: 25,
    durationMinutes: 25,
    category: "Haircuts",
    isAddon: false,
    shortDescription:
      "Fun, clean, stylish haircuts for children under 12, cut at the child's pace by patient barbers.",
    longDescription: [
      "Kids' haircuts run on the kid's clock, not the barber's. Some children sit perfectly still the first time. Others need to watch someone else get cut first, or sit on a parent's lap, or take a break halfway through. All of that is fine.",
      "The barber will talk your child through what's happening before the clippers come near them, which solves most of the fear before it starts. If your child has had a bad haircut experience somewhere else, mention it when you arrive — it changes how the barber approaches the first few minutes.",
      "Twenty-five dollars for children under 12, about 25 minutes. Parents are welcome to stay right next to the chair.",
    ],
    includes: [
      "Consultation with the parent and the child",
      "Cut at the child's pace, with breaks if needed",
      "Clean neckline and around-the-ears finish",
      "Parents welcome beside the chair",
    ],
    faqs: [
      {
        question: "How much is a kids' haircut at Ali's Barber Shop?",
        answer:
          "$25 for children under 12, about 25 minutes. Children 12 and over are priced as a standard $30 men's haircut.",
      },
      {
        question: "My child is nervous about haircuts. Can you handle that?",
        answer:
          "Yes, and it's common. Tell the barber when you arrive — especially if there's been a bad experience before. The cut goes at your child's pace, with breaks if they need them, and you're welcome to sit right beside the chair.",
      },
      {
        question: "Should I book or just walk in with my child?",
        answer:
          "Book if you can. A booked slot means your child isn't sitting in a waiting room getting anxious, which is usually the hardest part of the whole visit.",
      },
    ],
    image: {
      src: "/images/gallery-6.jpg",
      alt: "Men's grooming and hair styling at Ali's Barber Shop, a Pinellas Park barbershop",
      width: 800,
      height: 533,
    },
    meta: {
      title: "Kids' Haircut in Pinellas Park, FL — $25 | Ali's Barber Shop",
      description:
        "Kids' haircuts for children under 12, $25 in Pinellas Park, FL. Patient barbers, no rushing, parents welcome beside the chair. Book online or call 813-895-9229.",
    },
    hasOwnPage: true,
    featured: true,
    order: 3,
    lastmod: LASTMOD,
  },

  {
    slug: "senior-haircut-pinellas-park",
    name: "Senior Haircut (65+)",
    apiServiceName: "Senior Citizens (65+)",
    price: 25,
    durationMinutes: 30,
    category: "Haircuts",
    isAddon: false,
    shortDescription:
      "A clean, classic haircut for clients 65 and over, tailored for comfort and easy maintenance — $25.",
    longDescription: [
      "Clients aged 65 and over pay $25 instead of $30. Nothing else changes: it's the same half-hour appointment, the same consultation, the same cut and finish.",
      "Plenty of our senior clients have been getting the same haircut for forty years and want it done properly rather than reinterpreted. That's a perfectly good brief, and the barber will follow it. Bring a photo if it's easier than describing it. If you'd rather a cut that's simple to keep tidy between visits, say so and the barber will cut with that in mind.",
      "No card or proof needed — just mention it when you book or when you sit down.",
    ],
    includes: [
      "Full 30-minute appointment, same as a standard haircut",
      "Consultation, cut, neckline and finish styling",
      "$5 off the standard price for clients 65 and over",
      "No proof of age required",
    ],
    faqs: [
      {
        question: "Do you offer a senior discount?",
        answer:
          "Yes. Clients aged 65 and over pay $25 instead of $30 for a haircut. It's the same 30-minute service — just mention it when you book or when you sit down.",
      },
      {
        question: "Do I need to prove my age?",
        answer: "No. Just tell the barber when you arrive.",
      },
    ],
    image: {
      src: "/images/gallery-3.jpg",
      alt: "Classic taper fade haircut at Ali's Barber Shop in Pinellas Park, FL",
      width: 800,
      height: 1200,
    },
    meta: {
      title: "Senior Haircut (65+) in Pinellas Park, FL — $25 | Ali's Barber Shop",
      description:
        "Senior haircuts for clients 65 and over, $25 in Pinellas Park, FL. Same 30-minute service, $5 off. Book online or call 813-895-9229.",
    },
    hasOwnPage: true,
    featured: true,
    order: 4,
    lastmod: LASTMOD,
  },

  // ─── Beard & Shave ─────────────────────────────────────────────────────────
  {
    slug: "beard-trim-pinellas-park",
    name: "Beard Line Up & Shave",
    apiServiceName: "Beard Line Up & Shave",
    price: 20,
    durationMinutes: 30,
    category: "Beard & Shave",
    isAddon: false,
    shortDescription:
      "A precise beard line-up and smooth shave for a neat, defined, finished look — 30 minutes, $20.",
    longDescription: [
      "A beard looks deliberate or it looks neglected, and the difference is almost entirely in the lines. Where the cheek line sits, where the neck line stops, and whether either of them is straight.",
      "This service sets both. The beard is trimmed to the length you want, the cheek line is shaped to follow your jaw rather than cut across it, and the neck line is set roughly a finger above the Adam's apple — high enough to look intentional, low enough that you don't look like you're wearing a chinstrap. The edges are finished with a straight razor, which is what gives you the hard line that clippers alone can't.",
      "Thirty minutes, $20. Add a hot towel for $5 and it becomes the classic barbershop shave — the towel softens the skin before the razor, which makes for a closer finish and a lot less irritation. Worth booking on a cycle between haircuts; most beards need the lines reset about twice as often as the hair needs cutting.",
    ],
    includes: [
      "Beard trimmed and shaped to your preferred length",
      "Cheek line shaped to follow the jaw",
      "Neck line set at the right height",
      "Straight razor finish on the edges",
      "Hot towel available as a $5 add-on",
    ],
    faqs: [
      {
        question: "How much is a beard trim at Ali's Barber Shop?",
        answer:
          "$20 for about 30 minutes. That covers the beard trimmed to length, the cheek and neck lines shaped, and a razor finish on the edges.",
      },
      {
        question: "Do you do hot towel shaves?",
        answer:
          "Yes. A hot towel is a $5 add-on to the Beard Line Up & Shave. The towel softens the skin before the razor, which gives a closer shave and much less irritation.",
      },
      {
        question: "Will you cut my beard shorter than I want?",
        answer:
          "Not without asking. Tell the barber at the start whether you want length taken off or only the lines cleaned up — plenty of clients come in purely for the lines and keep the length.",
      },
      {
        question: "How often should I get my beard lined up?",
        answer:
          "Most people need the lines reset every two to three weeks — roughly twice as often as a haircut, since the cheek and neck lines blur faster than the hair on your head grows out.",
      },
    ],
    image: {
      src: "/images/gallery-2.jpg",
      alt: "Precision beard trim and line-up at Ali's Barber Shop in Pinellas Park, FL",
      width: 800,
      height: 533,
    },
    meta: {
      title: "Beard Trim & Line-Up in Pinellas Park, FL — $20 | Ali's Barber Shop",
      description:
        "Beard line-up and shave for $20 in Pinellas Park, FL. Cheek and neck lines set, straight razor finish, hot towel add-on. Book online or call 813-895-9229.",
    },
    hasOwnPage: true,
    featured: true,
    order: 5,
    lastmod: LASTMOD,
  },

  {
    slug: "line-up-edge-up-pinellas-park",
    name: "Full Edge",
    apiServiceName: "Full Edge",
    price: 20,
    durationMinutes: 20,
    category: "Beard & Shave",
    isAddon: false,
    shortDescription:
      "A detailed edge-up for the hairline, beard line and facial outline — keeps a cut crisp between full appointments.",
    longDescription: [
      "A haircut goes soft at the edges long before it goes out of shape. The hairline creeps, the temples round off, the beard line blurs — the cut is still fine, it just stops looking fresh.",
      "A Full Edge fixes exactly that and nothing else. The front hairline is squared or followed depending on how yours grows, the temples and around the ears are cleaned up, the neckline is reset, and the beard line and facial outline are sharpened. Twenty minutes, $20, and you walk out looking like you got cut yesterday.",
      "It's the right booking about a week or two after a haircut, before a photo, an interview, a wedding, or any time you need to look sharp without losing the length you've been growing.",
    ],
    includes: [
      "Front hairline squared or followed to suit your growth",
      "Temples and around the ears cleaned up",
      "Neckline reset",
      "Beard line and facial outline sharpened",
      "No length removed from the top or sides",
    ],
    faqs: [
      {
        question: "What is a Full Edge?",
        answer:
          "It's a detailed edge-up of the hairline, beard line and facial outline, without cutting any length. $20, about 20 minutes. It's how you sharpen an existing cut rather than replace it.",
      },
      {
        question: "Is a line-up included in a regular haircut?",
        answer:
          "Yes. Every $30 men's haircut finishes with a line-up. The Full Edge is for the weeks in between, when the cut is still good but the edges have gone soft.",
      },
      {
        question: "Will this make my hair shorter?",
        answer:
          "No. A Full Edge only touches the perimeter. If you're growing your hair out, this keeps you looking sharp without giving up any length.",
      },
    ],
    image: {
      src: "/images/gallery-7.jpg",
      alt: "Sharp line-up and edge-up at Ali's Barber Shop in Pinellas Park, FL",
      width: 1000,
      height: 667,
    },
    meta: {
      title: "Line-Up & Edge-Up in Pinellas Park, FL — $20 | Ali's Barber Shop",
      description:
        "Full Edge line-up for $20 in Pinellas Park, FL. Hairline, beard line and facial outline sharpened without losing length. Book online or call 813-895-9229.",
    },
    hasOwnPage: true,
    featured: true,
    order: 6,
    lastmod: LASTMOD,
  },

  // ─── Face & Grooming ───────────────────────────────────────────────────────
  // This whole category existed in the DB but had never appeared on the website.
  // Threading and facials are low-competition local searches and a genuine
  // differentiator against barbershops that only cut hair.
  {
    slug: "face-threading-pinellas-park",
    name: "Full Face Threading",
    apiServiceName: "Full Face Threading",
    price: 10,
    durationMinutes: 20,
    category: "Face & Grooming",
    isAddon: false,
    shortDescription:
      "Precise facial hair removal by threading — cheeks, upper lip, chin and forehead — for $10.",
    longDescription: [
      "Threading removes hair by rolling a twisted cotton thread across the skin, catching hairs at the root. No wax, no heat, no chemicals touching your face.",
      "That matters if your skin reacts badly to waxing. Threading pulls the hair without pulling at the skin itself, so it tends to leave much less redness, and it gives a cleaner line than waxing can — which is why it's the standard method for shaping brows.",
      "Full face threading covers the cheeks, upper lip, chin and forehead in about twenty minutes for $10. If you only want your brows shaped, eyebrow threading is a $5 add-on to any appointment.",
    ],
    includes: [
      "Cheeks, upper lip, chin and forehead",
      "No wax, no heat, no chemicals",
      "Less irritation than waxing for sensitive skin",
      "Eyebrow-only threading available as a $5 add-on",
    ],
    faqs: [
      {
        question: "Do you offer face threading in Pinellas Park?",
        answer:
          "Yes. Full face threading is $10 and takes about 20 minutes, covering the cheeks, upper lip, chin and forehead. Eyebrow threading on its own is a $5 add-on.",
      },
      {
        question: "Is threading better than waxing?",
        answer:
          "For sensitive skin, usually yes. Threading catches the hair without pulling at the skin, so there's typically less redness, and it gives a more precise line — which is why it's the usual method for shaping eyebrows. Face waxing is also available for $10 if you prefer it.",
      },
      {
        question: "Does threading hurt?",
        answer:
          "It stings briefly, less than waxing for most people, and the sensation stops as soon as the pass is done. The upper lip is the most sensitive area.",
      },
    ],
    meta: {
      title: "Face & Eyebrow Threading in Pinellas Park, FL — $10 | Ali's Barber Shop",
      description:
        "Full face threading for $10 in Pinellas Park, FL. Cheeks, upper lip, chin and forehead — no wax, less irritation. Eyebrow threading $5. Call 813-895-9229.",
    },
    hasOwnPage: true,
    featured: false,
    order: 7,
    lastmod: LASTMOD,
  },

  {
    slug: "mens-facial-pinellas-park",
    name: "Special Facial",
    apiServiceName: "Special Facial",
    price: 45,
    durationMinutes: 30,
    category: "Face & Grooming",
    isAddon: false,
    shortDescription:
      "A cleansing, hydrating facial treatment for healthier-looking skin — 30 minutes, $45.",
    longDescription: [
      "Most men have never had a facial, and most men who work outdoors in Florida would benefit from one. Sun, sweat and daily shaving are a rough combination for skin, and the damage is cumulative.",
      "The treatment cleanses, hydrates and revitalises — clearing out congested pores, and putting moisture back into skin that's been stripped by sun and razors. Thirty minutes, $45. It pairs well with a shave, since the skin is already softened.",
      "If you've been getting razor burn or persistent ingrown hairs, this is usually more effective than changing your razor.",
    ],
    includes: [
      "Deep cleanse",
      "Hydrating treatment",
      "30 minutes in the chair",
      "Pairs well with a shave or beard service",
    ],
    faqs: [
      {
        question: "Do you offer facials for men?",
        answer:
          "Yes. The Special Facial is $45 for 30 minutes — a cleansing and hydrating treatment aimed at skin that takes a beating from sun and daily shaving.",
      },
      {
        question: "Can I book a facial with a haircut?",
        answer:
          "Yes. Book both in the same appointment and they run back to back. Many clients pair the facial with a shave, since the skin is already softened.",
      },
      {
        question: "Will a facial help with razor burn?",
        answer:
          "It often does. Razor burn and ingrown hairs usually come from congested, dried-out skin rather than the blade itself, and a cleanse-and-hydrate treatment addresses the cause.",
      },
    ],
    meta: {
      title: "Men's Facial in Pinellas Park, FL — $45 | Ali's Barber Shop",
      description:
        "Men's facial treatment for $45 in Pinellas Park, FL. Cleanse and hydrate skin worn down by Florida sun and daily shaving. Book online or call 813-895-9229.",
    },
    hasOwnPage: true,
    featured: false,
    order: 8,
    lastmod: LASTMOD,
  },
];

/**
 * Add-ons attach to another booking and reserve no calendar time (the DB stores
 * them with duration_minutes = 0 and is_addon = true). They get no page of their
 * own — they're listed on /services/ and mentioned on the pages they pair with.
 */
export const ADDONS: StaticService[] = [
  {
    slug: "hot-towel",
    name: "Hot Towel",
    apiServiceName: "Hot Towel",
    price: 5,
    durationMinutes: 0,
    category: "Beard & Shave",
    isAddon: true,
    shortDescription:
      "A hot towel that softens the skin before the razor, for a closer shave and far less irritation.",
    longDescription: [],
    includes: [],
    faqs: [],
    hasOwnPage: false,
    featured: false,
    order: 20,
    lastmod: LASTMOD,
  },
  {
    slug: "eyebrow-threading",
    name: "Eyebrow Threading",
    apiServiceName: "Eyebrow Threading",
    price: 5,
    durationMinutes: 0,
    category: "Face & Grooming",
    isAddon: true,
    shortDescription:
      "Brows shaped and defined with a cotton thread — precise, and gentler on the skin than wax.",
    longDescription: [],
    includes: [],
    faqs: [],
    hasOwnPage: false,
    featured: false,
    order: 21,
    lastmod: LASTMOD,
  },
  {
    slug: "face-wax",
    name: "Face Wax",
    apiServiceName: "Face Wax",
    price: 10,
    durationMinutes: 0,
    category: "Face & Grooming",
    isAddon: true,
    shortDescription:
      "Quick, clean removal of unwanted facial hair, with longer-lasting results than shaving.",
    longDescription: [],
    includes: [],
    faqs: [],
    hasOwnPage: false,
    featured: false,
    order: 22,
    lastmod: LASTMOD,
  },
  {
    slug: "shampoo",
    name: "Shampoo",
    apiServiceName: "Shampoo",
    price: 5,
    durationMinutes: 0,
    category: "Add-Ons",
    isAddon: true,
    shortDescription:
      "A wash that cleans the hair and refreshes the scalp before or after your cut.",
    longDescription: [],
    includes: [],
    faqs: [],
    hasOwnPage: false,
    featured: false,
    order: 23,
    lastmod: LASTMOD,
  },
];

/** Everything in the catalog, bookable services and add-ons alike. */
export const ALL_SERVICES = [...SERVICES, ...ADDONS];

export const SERVICE_PAGES = SERVICES.filter((s) => s.hasOwnPage).sort(
  (a, b) => a.order - b.order
);

export const FEATURED_SERVICES = SERVICES.filter((s) => s.featured).sort(
  (a, b) => a.order - b.order
);

export const CATEGORY_ORDER = [
  "Haircuts",
  "Beard & Shave",
  "Face & Grooming",
] as const;

/** Bookable services grouped by category, for the /services/ hub. */
export const SERVICES_BY_CATEGORY = CATEGORY_ORDER.map((category) => ({
  category,
  services: SERVICES.filter((s) => s.category === category).sort(
    (a, b) => a.order - b.order
  ),
})).filter((group) => group.services.length > 0);

export const getService = (slug: string): StaticService | undefined =>
  SERVICES.find((s) => s.slug === slug);

/** Sibling services for internal linking off a service page. */
export const relatedServices = (slug: string, count = 3): StaticService[] => {
  const current = getService(slug);
  const others = SERVICE_PAGES.filter((s) => s.slug !== slug);
  // Same category first — those are the most useful onward links.
  const sameCategory = others.filter((s) => s.category === current?.category);
  const rest = others.filter((s) => s.category !== current?.category);
  return [...sameCategory, ...rest].slice(0, count);
};

/**
 * Shape-compatible with api.getTopBookedServices(), so it can seed that query as
 * `initialData`. Ids are negative sentinels — they never collide with a real DB
 * id, and nothing books against them because the booking widget uses live data.
 */
export const FEATURED_AS_TOP_SERVICES: TopService[] = FEATURED_SERVICES.map(
  (s, i) => ({
    id: -1 - i,
    name: s.name,
    description: s.shortDescription,
    price: s.price,
    duration_minutes: s.durationMinutes,
    booking_count: 0,
    is_active: true,
  })
);
