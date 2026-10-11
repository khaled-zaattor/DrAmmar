import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/data/testimonials";

const TestimonialsSection = () => {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section id="testimonials" className="py-24 bg-primary overflow-hidden">
      <div className="section-padding mb-12">
        <h2 className="font-display text-primary-foreground text-5xl md:text-7xl uppercase tracking-tight text-center">
          What They Say
        </h2>
      </div>

      <div className="relative">
        <div className="flex animate-marquee gap-6 w-max">
          {doubled.map((t, i) => (
            <div
              key={i}
              className="w-[340px] shrink-0 bg-primary-foreground/10 border border-primary-foreground/15 p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-accent text-accent" />
                  ))}
                </div>
                <p className="font-body text-primary-foreground text-sm leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>
              <p className="font-display text-primary-foreground/60 text-lg uppercase tracking-wider mt-6">
                {t.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
