import { SERVICES_BY_CATEGORY, ADDONS } from "@/data/services";
import ServiceCard from "@/components/ServiceCard";

/**
 * The services block. Previously this component fetched from the API and was
 * then never rendered anywhere — it sat in the codebase as dead code while the
 * live site had no crawlable services content at all.
 *
 * It now renders the static catalog from src/data/services.ts, grouped by the
 * categories the DB actually uses, so the full price list is in the HTML.
 */
const ServicesSection = () => {
  return (
    <section id="services" className="py-24 section-padding bg-background">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="font-display text-foreground text-5xl md:text-7xl uppercase tracking-tight">
          Services &amp; Prices
        </h2>
        <p className="font-body text-muted-foreground mt-4 max-w-2xl">
          Everything we offer, with what it costs and how long it takes. Prices
          are the same whichever barber you book, and there's no upcharge for a
          skin fade.
        </p>

        {SERVICES_BY_CATEGORY.map(({ category, services }) => (
          <div key={category} className="mt-16">
            <h3 className="font-display text-accent text-2xl uppercase tracking-[0.2em]">
              {category}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {services.map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          </div>
        ))}

        <div className="mt-16">
          <h3 className="font-display text-accent text-2xl uppercase tracking-[0.2em]">
            Add-Ons
          </h3>
          <p className="font-body text-muted-foreground text-sm mt-2 max-w-2xl">
            Added to any appointment. None of these reserve extra time in the
            calendar — just ask when you sit down.
          </p>
          <ul className="mt-6 border-t border-border">
            {ADDONS.map((addon) => (
              <li
                key={addon.slug}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-4"
              >
                <span className="font-display text-foreground text-xl uppercase tracking-wide">
                  {addon.name}
                </span>
                <span className="font-body text-muted-foreground text-sm flex-1 min-w-[16rem]">
                  {addon.shortDescription}
                </span>
                <span className="font-display text-accent text-xl">
                  ${addon.price}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <a
          href="/services/"
          className="inline-block mt-12 font-body text-sm font-semibold uppercase tracking-widest text-accent hover:underline"
        >
          See all services in detail →
        </a>
      </div>
    </section>
  );
};

export default ServicesSection;
