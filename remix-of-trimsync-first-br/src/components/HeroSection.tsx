import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const TOP_SERVICE_LIMIT = 6;

// Shared by the skeleton rows and the real rows so the two can never drift.
// Both cells are fixed-geometry: the name flexes and truncates, the price has a
// fixed width and is right-aligned. That keeps every box identical before and
// after the data arrives — otherwise swapping a placeholder bar for real text
// moves the cell edges sideways, which counts as layout shift just as much as
// vertical movement does.
const ROW_CLS =
  "flex justify-between items-center py-3 border-b border-primary-foreground/20";
const NAME_CLS =
  "font-display text-primary-foreground text-xl md:text-2xl uppercase tracking-wide flex-1 min-w-0 truncate";
const PRICE_CLS =
  "font-display text-primary-foreground text-xl md:text-2xl w-28 md:w-32 shrink-0 text-right";

const HeroSection = () => {
  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["top-booked-services"],
    queryFn: () => api.getTopBookedServices(TOP_SERVICE_LIMIT),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="relative min-h-screen flex flex-col bg-primary overflow-hidden">
      {/* Background Image — subject anchored bottom-left */}
      <div className="absolute inset-0">
        {/* Responsive WebP so phones stop downloading the full 1920px original.
            srcSet/sizes live on the <img> itself rather than a <picture>
            <source>: the preload in index.html only reliably matches an <img>
            with identical srcset+sizes. With <picture> the browser fetched the
            hero twice — once for the preload, once for the element.
            Keep this list byte-identical to the imagesrcset in index.html. */}
        <img
          src="/hero-barber-1280.webp"
          srcSet={[
            "/hero-barber-640.webp 640w",
            "/hero-barber-960.webp 960w",
            "/hero-barber-1280.webp 1280w",
            "/hero-barber-1920.webp 1920w",
          ].join(", ")}
          sizes="100vw"
          alt="Barber giving a precision fade at Ali's Barber Shop in Pinellas Park, FL"
          width={1920}
          height={1080}
          className="w-full h-full object-cover opacity-60"
          style={{ objectPosition: "left bottom" }}
          {...({ fetchpriority: "high" } as React.ImgHTMLAttributes<HTMLImageElement>)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-primary/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-primary/30" />
      </div>

      {/* Title — spanning full width, right-aligned */}
      <div className="relative z-10 section-padding pt-32 md:pt-40">
        <div className="max-w-[1400px] mx-auto">
          <p className="font-body text-accent text-sm uppercase tracking-widest text-right mb-4">
            Premier Barbershop in Pinellas Park &amp; St. Petersburg, FL
          </p>
          <h1 className="font-display text-primary-foreground text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] leading-[0.85] tracking-tight uppercase text-right">
            The Art<br />of the<br />Cut
          </h1>
        </div>
      </div>

      {/* Price list — right-aligned in lower portion.
          This block is mt-auto inside a min-h-screen flex column, so it is
          anchored to the bottom: any change in its height moves its top edge
          and shifts everything visible. The prices arrive from the API after
          first paint, so the height is reserved up front — min-h holds the box
          open, and the skeleton rows reuse the real rows' typography classes so
          they occupy exactly the same space at every breakpoint.
          Height = 6 rows (py-3 + line-height + 1px border) + the button block. */}
      <div className="relative z-10 mt-auto section-padding pb-16 md:pb-24">
        <div className="max-w-[1400px] mx-auto flex justify-end">
          <div className="w-full max-w-md min-h-[402px] md:min-h-[426px]">
            {isLoading
              ? Array.from({ length: TOP_SERVICE_LIMIT }).map((_, i) => (
                  // Key must not collide with the real rows' service ids.
                  // With plain `i`, keys 1-5 match service ids 1-5, so React
                  // reuses those DOM nodes and slides each one up a slot when
                  // the data lands — the browser sees five real 53px moves and
                  // records a layout shift, even though the boxes are identical.
                  <div key={`skeleton-${i}`} aria-hidden="true" className={ROW_CLS}>
                    {/* The pulsing bars are nested inside the real cells, so
                        they are purely decorative and cannot affect geometry. */}
                    <span className={NAME_CLS}>
                      <span className="block w-40 max-w-full rounded bg-primary-foreground/10 animate-pulse">
                        &nbsp;
                      </span>
                    </span>
                    <span className={PRICE_CLS}>
                      <span className="block w-full rounded bg-primary-foreground/10 animate-pulse">
                        &nbsp;
                      </span>
                    </span>
                  </div>
                ))
              : services.map((service) => (
                  <div key={service.id} className={ROW_CLS}>
                    <span className={NAME_CLS}>{service.name}</span>
                    <span className={PRICE_CLS}>${service.price} & Up</span>
                  </div>
                ))}

            <button
              onClick={scrollToBooking}
              className="mt-8 w-full bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-widest py-4 hover:opacity-90 transition-opacity duration-200"
            >
              Book Now →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
