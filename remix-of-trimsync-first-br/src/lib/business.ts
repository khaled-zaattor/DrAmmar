/** Single source of truth for NAP, hours, and contact — keep in sync with
 *  index.html JSON-LD, llms.txt, and the business_hours migration. */

export const SHOP_NAME = "Ali's Barber Shop";

export const PHONE_DISPLAY = "813-895-9229";
export const PHONE_TEL = "tel:8138959229";
export const PHONE_E164 = "+1-813-895-9229";

export const EMAIL = "alisbarbershop2026@gmail.com";

export const ADDRESS_STREET = "4201 62nd Ave N, Unit 9";
export const ADDRESS_CITY = "Pinellas Park";
export const ADDRESS_REGION = "FL";
export const ADDRESS_ZIP = "33781";
export const ADDRESS_LINE = `${ADDRESS_STREET}, ${ADDRESS_CITY}, ${ADDRESS_REGION} ${ADDRESS_ZIP}`;

export const MAPS_URL =
  "https://www.google.com/maps?cid=15098769549046085973&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAMYASAF&hl=en&gl=US&source=embed";

export const HOURS_ROWS = [
  "Sun: 9:00 AM – 3:00 PM",
  "Mon–Fri: 9:00 AM – 9:00 PM",
  "Sat: 9:00 AM – 7:00 PM",
] as const;

export const SOCIAL = {
  instagram: "https://www.instagram.com/alisbarbershop2026",
  facebook: "https://www.facebook.com/profile.php?id=61574278858877",
  tiktok: "https://www.tiktok.com/@alis.barber.shop",
} as const;
