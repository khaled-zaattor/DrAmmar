import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Amy Smith",
    text: "I visited this barbershop for the first time today, and I have to admit I was a bit nervous… hair takes a long time to grow back! However, Ali listened closely to my concerns and was able to deliver exactly what I asked for. On top of the excellent service, the shop had a newly renovated, modern, and welcoming atmosphere. Highly recommend this shop.",
    rating: 5,
  },
  {
    name: "Jaxs Scrivani",
    text: "Ali is the greatest. Easy conversation, relaxing setting, and the best cut/fade I've had in a while. Everyone please stops by and check her out… I promise it'll be worth your money.",
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

const TestimonialsSection = () => {
  const doubled = [...testimonials, ...testimonials];

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
              aria-hidden={i >= testimonials.length || undefined}
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
