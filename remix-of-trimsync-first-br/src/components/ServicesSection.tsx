import { useQuery } from "@tanstack/react-query";
import { Scissors } from "lucide-react";
import { api, type TopService } from "@/lib/api";

interface ServicesSectionProps {
  onBookService?: (serviceId: number) => void;
}

const ServicesSection = ({ onBookService }: ServicesSectionProps) => {
  const { data: services = [], isLoading, error } = useQuery<TopService[]>({
    queryKey: ["top-booked-services"],
    queryFn: () => api.getTopBookedServices(6),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBook = (serviceId: number) => {
    onBookService?.(serviceId);
    scrollToBooking();
  };

  return (
    <section id="services" className="py-24 section-padding bg-primary">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h2 className="font-display text-primary-foreground text-5xl md:text-7xl uppercase tracking-tight">
            Our Services
          </h2>
          <p className="font-body text-primary-foreground/50 mt-4 max-w-lg">
            Every service is delivered with precision and care by our expert team.
          </p>
          {error && (
            <p className="font-body text-primary-foreground/40 text-sm mt-3">
              Unable to load services at this time.
            </p>
          )}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden bg-black shadow-2xl flex flex-col animate-pulse"
                >
                  <div className="h-64 bg-white/5" />
                  <div className="flex flex-col flex-1 p-6 border border-primary-foreground/10 border-t-0 gap-3">
                    <div className="h-6 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/4" />
                    <div className="h-16 bg-white/5 rounded" />
                    <div className="h-10 bg-white/5 rounded mt-auto" />
                  </div>
                </div>
              ))
            : services.map((service) => (
                <div
                  key={service.id}
                  className="group relative overflow-hidden bg-black shadow-2xl flex flex-col"
                >
                  {/* Image with zoom on hover */}
                  <div className="relative h-64 overflow-hidden">
                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={service.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-foreground/5 flex items-center justify-center">
                        <Scissors size={32} className="text-primary-foreground/20" />
                      </div>
                    )}
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {/* Price badge */}
                    <span className="absolute top-4 right-4 font-display text-accent text-xl tracking-wide">
                      ${service.price}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col flex-1 p-6 border border-primary-foreground/10 border-t-0">
                    <h3 className="font-display text-primary-foreground text-2xl uppercase tracking-wide mb-2">
                      {service.name}
                    </h3>
                    <p className="font-body text-primary-foreground/50 text-xs uppercase tracking-widest mb-3">
                      {service.duration_minutes} min
                    </p>
                    <p className="font-body text-primary-foreground/60 text-sm leading-relaxed flex-1 mb-6">
                      {service.description}
                    </p>
                    <button
                      onClick={() => handleBook(service.id)}
                      className="w-full bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-widest py-3 hover:opacity-90 transition-opacity duration-200"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
