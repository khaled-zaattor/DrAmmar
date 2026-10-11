import type { ServiceFaq } from "@/data/services";

// Short, direct question-and-answer pairs are the single most retrievable
// content format for AI answer engines — a conversational query like "is there
// an Arabic-speaking barber near St. Petersburg" matches a question heading far
// more cleanly than it matches a paragraph of marketing copy.
//
// Two rules when editing:
//   1. Answers stay 2–4 sentences. Longer answers get summarised badly.
//   2. Whatever is written here is rendered visibly on the page. FAQPage schema
//      that doesn't match the visible text is a structured-data violation, and
//      the generator in src/lib/seo/schema.ts reads from this same array so the
//      two can't drift.

export const SITE_FAQS: ServiceFaq[] = [
  {
    question: "How much is a men's haircut at Ali's Barber Shop?",
    answer:
      "A men's haircut is $30 and takes about 30 minutes, including the consultation, the cut, a line-up and a finish style. A haircut with a beard together is $45, and kids under 12 and clients 65 and over are $25.",
  },
  {
    question: "Do you offer skin fades and taper fades?",
    answer:
      "Yes. Skin fades, taper fades, and low, mid and high fades are all cut as part of a standard $30 men's haircut — they're cutting styles rather than separate services, so there's no upcharge.",
  },
  {
    question: "Do you do hot towel shaves?",
    answer:
      "Yes. A hot towel is a $5 add-on to the $20 Beard Line Up & Shave. The towel softens the skin before the razor, which gives a closer shave with much less irritation.",
  },
  {
    question: "Do you offer threading, waxing or facials?",
    answer:
      "Yes — it's a full grooming shop, not only haircuts. Full face threading is $10, eyebrow threading is $5, face waxing is $10, and a cleansing and hydrating facial is $45 for 30 minutes.",
  },
  {
    question: "Do I need an appointment, or do you take walk-ins?",
    answer:
      "Booking is the reliable way to get the time you want, and you can book online in under a minute. Walk-ins are welcome when there's a gap in the schedule, but during evenings and Saturdays there often isn't one.",
  },
  {
    question: "How long does a haircut take?",
    answer:
      "About 30 minutes for a haircut, 45 for a haircut and beard together, and 20 for a beard trim or a line-up. A detailed skin fade can run a little longer.",
  },
  {
    question: "What are your hours?",
    answer:
      "Tuesday to Friday, 8:30 AM to 5:30 PM, and Saturday from 9:00 AM to 4:00 PM. The shop is closed Sunday and Monday.",
  },
  {
    question: "Where is Ali's Barber Shop located?",
    answer:
      "4201 62nd North Unit 9, Pinellas Park, FL 33781. It's a short drive from Lealman, Kenneth City and north St. Petersburg.",
  },
  {
    question: "Is there parking?",
    answer:
      "Yes — there's free parking on site, right outside the shop. You won't need to circle the block or pay a meter.",
  },
  {
    question: "Do you speak Arabic?",
    answer:
      "Yes. Our barbers speak both English and Arabic, so you can explain exactly what you want in whichever language you're most comfortable in. أهلاً وسهلاً.",
  },
  {
    question: "How far is Ali's Barber Shop from St. Petersburg?",
    answer:
      "The shop is in Pinellas Park, roughly 15 minutes from downtown St. Petersburg and closer still from the north side of the city. Clients regularly come from Lealman, Kenneth City and north St. Pete.",
  },
  {
    question: "Do you cut kids' hair?",
    answer:
      "Yes. Children under 12 are $25, and the cut goes at the child's pace with breaks if they need them. If your child has had a bad haircut experience before, tell the barber when you arrive.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Cash and major cards are both accepted. You pay at the shop after your cut — booking online doesn't require a card.",
  },
  {
    question: "What if I need to cancel or reschedule?",
    answer:
      "Call or text 813-895-9229 as early as you can and we'll move your appointment. Giving notice frees the slot for someone else, which matters a lot on a busy Saturday.",
  },
  {
    question: "I've never been in before. What should I expect?",
    answer:
      "Arrive a couple of minutes early, and come with an idea of what you want — a photo on your phone is the clearest way to communicate it. The barber will talk through length and shape before starting, so nothing happens that you didn't ask for.",
  },
];
