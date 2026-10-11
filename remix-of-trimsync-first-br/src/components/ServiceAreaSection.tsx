import { BUSINESS } from "@/data/business";

// Pinellas Park is the primary location relationship — the shop is physically
// there, and distance is one of the three factors Google names for local
// ranking. The others are genuine nearby service areas described honestly as
// places clients travel from, not as separate locations. No doorway pages.
const areas = [
  {
    name: "Pinellas Park",
    body: "Where the shop is. 4201 62nd North, Unit 9 — free parking right outside, no meters.",
  },
  {
    name: "Lealman",
    body: "Immediately east of the shop. For most of Lealman this is the closest barbershop of its kind.",
  },
  {
    name: "Kenneth City",
    body: "A few minutes south down 62nd. Easy to fit around a lunch break.",
  },
  {
    name: "St. Petersburg",
    body: "About 15 minutes from downtown St. Pete and closer from the north side. A regular run for clients who'd rather not pay downtown prices.",
  },
];

const ServiceAreaSection = () => {
  return (
    <section id="service-area" className="py-24 section-padding bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="font-display text-secondary-foreground text-5xl md:text-7xl uppercase tracking-tight">
          Serving Pinellas Park &amp; Nearby
        </h2>
        <p className="font-body text-muted-foreground mt-4 max-w-2xl">
          The shop is in Pinellas Park, Florida. These are the areas clients
          regularly travel from.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {areas.map(({ name, body }) => (
            <div key={name} className="border-t border-accent pt-4">
              <h3 className="font-display text-secondary-foreground text-xl uppercase tracking-wide">
                {name}
              </h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed mt-2">
                {body}
              </p>
            </div>
          ))}
        </div>

        <p className="font-body text-muted-foreground text-sm mt-12">
          <a
            href={BUSINESS.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Get directions on Google Maps →
          </a>
        </p>
      </div>
    </section>
  );
};

export default ServiceAreaSection;
