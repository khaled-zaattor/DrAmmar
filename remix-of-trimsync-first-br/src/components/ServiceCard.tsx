import type { StaticService } from "@/data/services";

/**
 * One service rendered as static HTML — name, price, duration and description
 * all present before any JavaScript runs.
 *
 * This is the content that used to exist only inside the booking widget, behind
 * a cross-origin fetch. When that fetch failed, a crawler saw "Failed to load
 * services" and nothing else.
 */
const ServiceCard = ({
  service,
  headingLevel = "h3",
}: {
  service: StaticService;
  headingLevel?: "h2" | "h3";
}) => {
  const Heading = headingLevel;
  const href = service.hasOwnPage ? `/services/${service.slug}/` : undefined;

  return (
    <article className="flex flex-col border border-border bg-background p-6 transition-colors hover:border-accent">
      <div className="flex items-baseline justify-between gap-4">
        <Heading className="font-display text-foreground text-2xl uppercase tracking-wide">
          {href ? (
            <a href={href} className="hover:text-accent transition-colors">
              {service.name}
            </a>
          ) : (
            service.name
          )}
        </Heading>
        <span className="font-display text-accent text-2xl whitespace-nowrap">
          ${service.price}
        </span>
      </div>

      <p className="font-body text-muted-foreground text-xs uppercase tracking-widest mt-2">
        {service.isAddon
          ? "Add-on · no extra time"
          : `${service.durationMinutes} min`}
      </p>

      <p className="font-body text-muted-foreground text-sm leading-relaxed mt-4 flex-1">
        {service.shortDescription}
      </p>

      <div className="mt-6 flex items-center gap-4">
        <a
          href="/#booking"
          className="font-body text-sm font-semibold uppercase tracking-widest text-accent hover:underline"
        >
          Book →
        </a>
        {href && (
          <a
            href={href}
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Details
          </a>
        )}
      </div>
    </article>
  );
};

export default ServiceCard;
