import { BUSINESS } from "@/data/business";

const steps = [
  {
    step: "Book or walk in",
    body: "Booking online takes under a minute and guarantees the slot — no account and no card needed. Walk-ins are welcome whenever there's a gap, though on Saturdays there often isn't.",
  },
  {
    step: "Parking",
    body: "There's free parking on site, directly outside the shop. No meters, no garage, no circling the block.",
  },
  {
    step: "Arrive a couple of minutes early",
    body: "Just enough time to sit down and think about what you want. If you're running late, call or text — we'd rather move you than lose you.",
  },
  {
    step: "Bring a photo if you have one",
    body: "A picture on your phone communicates a haircut far better than words do. If you don't have one, the barber will talk you through length and shape before starting.",
  },
  {
    step: "Say something before you leave",
    body: "If the length isn't right or a line is off, say so while you're still in the chair. It takes two minutes to fix then and two weeks to fix later.",
  },
  {
    step: "Paying",
    body: "Cash and major cards, at the shop after your cut.",
  },
];

const FirstVisitSection = () => {
  return (
    <section id="first-visit" className="py-24 section-padding bg-background">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="font-display text-foreground text-5xl md:text-7xl uppercase tracking-tight">
          First Time at Ali's?
        </h2>
        <p className="font-body text-muted-foreground mt-4 max-w-2xl">
          Nothing here is complicated, but knowing it in advance makes the first
          visit easier.
        </p>

        <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 list-none p-0">
          {steps.map(({ step, body }, i) => (
            <li key={step}>
              <span className="font-display text-accent text-sm tracking-[0.3em]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-foreground text-xl uppercase tracking-wide mt-2">
                {step}
              </h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed mt-2">
                {body}
              </p>
            </li>
          ))}
        </ol>

        <p className="font-body text-muted-foreground text-sm mt-12">
          Questions before you come in? Call or text{" "}
          <a href={BUSINESS.phone.href} className="text-accent hover:underline">
            {BUSINESS.phone.display}
          </a>
          .
        </p>
      </div>
    </section>
  );
};

export default FirstVisitSection;
