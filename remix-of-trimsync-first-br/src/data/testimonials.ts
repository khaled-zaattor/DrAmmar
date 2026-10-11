// Lifted out of TestimonialsSection.tsx so the homepage, /about-ali/ and
// /contact/ all render from one array.
//
// These are real Google reviews, reproduced verbatim apart from one pronoun
// correction noted inline. Don't otherwise edit the text — the specific language
// people use ("best cut/fade", "sharp fades", "attention to detail", "clean
// shop") is doing genuine SEO work as it stands.
//
// Deliberately NOT marked up as Review/AggregateRating JSON-LD: Google's
// structured data policy makes reviews a business collects about itself, on its
// own site, ineligible for review rich results, and marking them up invites a
// manual action. They stay as visible content, which is where their value is.

export interface Testimonial {
  name: string;
  text: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Amy Smith",
    text: "I visited this barbershop for the first time today, and I have to admit I was a bit nervous… hair takes a long time to grow back! However, Ali listened closely to my concerns and was able to deliver exactly what I asked for. On top of the excellent service, the shop had a newly renovated, modern, and welcoming atmosphere. Highly recommend this shop.",
    rating: 5,
  },
  {
    name: "Jaxs Scrivani",
    // Corrected at the owner's request: the original Google review reads
    // "check her out", which misgenders Ali. Everything else is verbatim.
    text: "Ali is the greatest. Easy conversation, relaxing setting, and the best cut/fade I've had in a while. Everyone please stops by and check him out… I promise it'll be worth your money.",
    rating: 5,
  },
  {
    name: "Aj Dali",
    text: "Ali Barber Shop is hands down one of the best barber shops in town. Great atmosphere, clean shop, and attention to detail every time. Ali takes his time and makes sure the cut comes out exactly how you want it. Professional service, sharp fades, and excellent customer care. Highly recommend to anyone looking for a reliable barber.",
    rating: 5,
  },
  {
    name: "Paola Mendoza",
    text: "Great barbershop!- Ali is an amazing barber! Very nice! Love the atmosphere💯💯",
    rating: 5,
  },
  {
    name: "Andres Rutland",
    text: "Ali is a great barber—very professional, friendly, and consistent. Always leaves my hair looking fresh and exactly how I want it. Highly recommend.",
    rating: 5,
  },
  {
    name: "Chris Nadeau",
    text: "Best haircut I've had in a long time, Ali was great! The place is clean and beautiful. I found my new go-to!!",
    rating: 5,
  },
];
