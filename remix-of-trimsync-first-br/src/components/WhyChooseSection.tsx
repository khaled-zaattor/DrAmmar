import { Scissors, Languages, CalendarCheck, Sparkles } from "lucide-react";

const reasons = [
  {
    icon: Scissors,
    title: "The cut you asked for",
    body: "Every appointment starts with a conversation about length, shape and how you actually style it in the morning. It's the step that decides whether a haircut still looks right on day six.",
  },
  {
    icon: Languages,
    title: "English and Arabic spoken",
    body: "Describing a fade is hard enough in your first language. Our barbers speak both, so you can explain exactly what you want instead of settling for close enough.",
  },
  {
    icon: CalendarCheck,
    title: "Book in under a minute",
    body: "Pick a service, a barber and a time online — no account, no card, no phone tag. Walk-ins are welcome too when there's a gap in the schedule.",
  },
  {
    icon: Sparkles,
    title: "More than haircuts",
    body: "Beard work with a straight razor and hot towel, threading, waxing and facials. Most barbershops stop at hair; this one doesn't.",
  },
];

const WhyChooseSection = () => {
  return (
    <section id="why-choose" className="py-24 section-padding bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="font-display text-secondary-foreground text-5xl md:text-7xl uppercase tracking-tight">
          Why Choose Ali's
        </h2>

        <div className="grid sm:grid-cols-2 gap-10 mt-12">
          {reasons.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <Icon size={24} className="text-accent mt-1 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="font-display text-secondary-foreground text-2xl uppercase tracking-wide">
                  {title}
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed mt-2">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
