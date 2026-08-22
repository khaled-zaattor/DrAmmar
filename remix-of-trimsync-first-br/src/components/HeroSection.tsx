import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { api } from "@/lib/api";

const googleReviewsUrl =
  "https://www.google.com/maps/place/Ali's+Barbershop/@27.8288039,-82.7676914,13z/data=!4m10!1m2!2m1!1sAli's+Barbershop,+4201+62nd+North+Unit+9,+Pinellas+Park,+FL+33781!3m6!1s0x88c2e5e61c59b849:0xd1899ae87c607955!8m2!3d27.8288039!4d-82.6914737!15sCkFBbGkncyBCYXJiZXJzaG9wLCA0MjAxIDYybmQgTm9ydGggVW5pdCA5LCBQaW5lbGxhcyBQYXJrLCBGTCAzMzc4MVpAIj5hbGkncyBiYXJiZXJzaG9wIDQyMDEgNjJuZCBub3J0aCB1bml0IDkgcGluZWxsYXMgcGFyayBmbCAzMzc4MZIBCmhhaXJfc2Fsb26aAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMnQzTVZwSFduRlNlazVUVlZaV05sUjZhRTFOYkd4eVRqSnJlVlJzUlJBQuABAPoBBAgAEDE!16s%2Fg%2F11xkrdhb2h?hl=en-US&entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D";

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
          width="1920"
          height="1080"
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
            <a
              href={googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Rated 5.0 on Google. Read our reviews"
              className="mb-5 ml-auto flex w-fit items-center gap-3 border border-primary-foreground/20 bg-primary/75 px-4 py-3 text-left shadow-lg backdrop-blur-sm transition-colors duration-200 hover:border-accent/70 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              <span className="font-display text-2xl leading-none text-primary-foreground">5.0</span>
              <span className="flex flex-col gap-1">
                <span className="flex items-center gap-0.5 text-accent" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={14} fill="currentColor" strokeWidth={1.5} />
                  ))}
                </span>
                <span className="font-body text-xs leading-none text-primary-foreground/80">
                  on Google <span className="text-primary-foreground">· Read our reviews</span>
                </span>
              </span>
            </a>

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
