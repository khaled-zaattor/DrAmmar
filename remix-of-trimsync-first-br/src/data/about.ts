// Content for /about-ali/ and the Person schema node.
//
// Why this page matters: the reviews talk about Ali constantly, but the site
// never built "Ali" into an entity a search engine could resolve. GEO/AI
// visibility rewards clear, connected facts — Person → worksFor → LocalBusiness
// → location → services — far more than it rewards adjectives.
//
// Every fact here is confirmed by the owner. Anything still unconfirmed stays
// null and the page omits it rather than shipping a guess.

export interface AboutData {
  /** Display name used in headings and the Person schema. */
  name: string;
  /** Full professional name, for entity disambiguation. Owner must confirm. */
  fullName: string | null;
  jobTitle: string;
  /** Years working as a barber before opening the shop in Pinellas Park. */
  yearsExperienceAbroad: number | null;
  photo: { src: string; alt: string; width: number; height: number } | null;
  bio: string[];
  specialties: string[];
  languages: string[];
}

export const ABOUT: AboutData = {
  name: "Ali",
  fullName: null, // TODO(owner): confirm. Listings currently show "Ali Zaatour",
  // "ALIS BARBERSHOP LLC" and "Ali's Barbershop" interchangeably — see
  // SEO-OFFSITE-CHECKLIST.md. Pick one and use it everywhere.
  jobTitle: "Barber",
  // Confirmed by the owner: eight years in barbershops outside the US. Worded
  // on the page as experience abroad — not as total years — so it stays true.
  yearsExperienceAbroad: 8,
  photo: {
    src: "/images/ali-barber.webp",
    alt: "Ali, barber at Ali's Barber Shop in Pinellas Park, FL",
    width: 768,
    height: 512,
  },

  bio: [
    "Ali's Barber Shop is a neighbourhood barbershop on 62nd North in Pinellas Park, a short drive from Lealman, Kenneth City and north St. Petersburg. It's a small shop, recently renovated, and Ali works one client at a time.",
    "Ali spent eight years working as a barber in shops outside the United States before bringing that experience to Pinellas Park. That's eight years of fades, beard work and scissor cuts on every kind of hair — and it shows in the details clients keep mentioning in their reviews.",
    "His approach is straightforward: ask what you want before touching your hair, take the time the cut actually needs, and check the result with you before you get out of the chair. That sounds obvious. Judging by how often clients mention it, it isn't.",
    "The other thing that sets the shop apart is language. Ali speaks both English and Arabic, which means clients who'd otherwise be describing a fade through a translation app can simply explain what they want. For a lot of families in the Pinellas Park and St. Petersburg area, that's the difference between a haircut they settled for and the one they asked for.",
  ],

  specialties: [
    "Skin fades, taper fades, and low, mid and high fades",
    "Scissor work and classic cuts",
    "Beard shaping with a straight-razor finish",
    "Line-ups and perimeter edge-ups",
    "Kids' haircuts, including nervous first-timers",
  ],

  languages: ["English", "Arabic"],
};
