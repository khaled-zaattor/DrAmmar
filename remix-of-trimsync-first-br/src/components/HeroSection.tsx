import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const HeroSection = () => {
  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const { data: services = [] } = useQuery({
    queryKey: ["top-booked-services"],
    queryFn: () => api.getTopBookedServices(6),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="relative min-h-screen flex flex-col bg-primary overflow-hidden">
      {/* Background Image — subject anchored bottom-left */}
      <div className="absolute inset-0">
        <img
          src="/hero-barber.jpg"
          alt="Barber giving a precision fade at Ali's Barber Shop in Pinellas Park, FL"
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

      {/* Price list — right-aligned in lower portion */}
      <div className="relative z-10 mt-auto section-padding pb-16 md:pb-24">
        <div className="max-w-[1400px] mx-auto flex justify-end">
          <div className="w-full max-w-md">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex justify-between items-center py-3 border-b border-primary-foreground/20"
              >
                <span className="font-display text-primary-foreground text-xl md:text-2xl uppercase tracking-wide">
                  {service.name}
                </span>
                <span className="font-display text-primary-foreground text-xl md:text-2xl">
                  ${service.price} & Up
                </span>
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
