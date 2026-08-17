import {
  ADDRESS_LINE,
  HOURS_ROWS,
  MAPS_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  SHOP_NAME,
} from "@/lib/business";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 section-padding bg-secondary">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-12 md:gap-20">
        <div className="min-w-0">
          <h2 className="font-display text-secondary-foreground text-4xl sm:text-5xl md:text-7xl uppercase tracking-tight break-words">
            Barbershop in Pinellas Park
          </h2>
          <p className="font-body text-muted-foreground mt-6 max-w-xl leading-relaxed">
            {SHOP_NAME} is a men&apos;s barbershop at {ADDRESS_LINE}, a few
            minutes from St. Petersburg and Lealman. We specialize in skin
            fades, taper fades, line-ups, beard trims, and hot towel shaves —
            the kind of precise, consistent work you can book every two weeks
            and trust.
          </p>
          <p className="font-body text-muted-foreground mt-4 max-w-xl leading-relaxed">
            Walk in or book online. Our barbers speak English and Arabic — أهلاً
            وسهلاً. Prefer to talk it through first? Call or text{" "}
            <a
              href={PHONE_TEL}
              className="text-secondary-foreground font-medium hover:text-accent transition-colors"
            >
              {PHONE_DISPLAY}
            </a>
            .
          </p>
        </div>

        <div className="md:pt-4 min-w-0">
          <h3 className="font-display text-secondary-foreground text-2xl uppercase tracking-wide">
            Hours
          </h3>
          <ul className="mt-4 space-y-2">
            {HOURS_ROWS.map((row) => (
              <li key={row} className="font-body text-muted-foreground">
                {row}
              </li>
            ))}
          </ul>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-8 font-body text-sm text-secondary-foreground hover:text-accent transition-colors"
          >
            {ADDRESS_LINE}
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
