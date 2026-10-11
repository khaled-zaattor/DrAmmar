/**
 * The Arabic-speaking angle used to be one clause buried at the bottom of the
 * contact block. It is the shop's clearest differentiator and a genuinely
 * distinct search intent — "Arabic barber near St. Petersburg" has almost no
 * local competition — so it gets a section of its own.
 */
const ArabicBarberSection = () => {
  return (
    <section
      id="arabic-barber"
      className="py-24 section-padding bg-background border-y border-border"
    >
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-[1.2fr_1fr] gap-12 items-start">
        <div>
          <h2 className="font-display text-foreground text-4xl md:text-6xl uppercase tracking-tight">
            Arabic-Speaking Barber in Pinellas Park
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed mt-6">
            Ali's Barbershop welcomes English- and Arabic-speaking clients from
            Pinellas Park, Lealman, Kenneth City, St. Petersburg and the
            surrounding areas. Our barbers speak both languages fluently.
          </p>
          <p className="font-body text-muted-foreground leading-relaxed mt-4">
            It sounds like a small thing until you've tried to explain a
            particular fade, or how short you want the top, in a language you're
            still working on. Most people give up and accept whatever they get.
            Here you can just say it — and be understood the first time.
          </p>
          <p className="font-body text-muted-foreground leading-relaxed mt-4">
            That goes for the whole visit: booking, the consultation before the
            cut, and the part at the end where you say what you'd like different
            next time.
          </p>
        </div>

        <div
          dir="rtl"
          lang="ar"
          className="border-r-2 border-accent pr-6 md:mt-4"
        >
          <p className="font-body text-foreground text-2xl leading-relaxed">
            أهلاً وسهلاً
          </p>
          <p className="font-body text-muted-foreground leading-relaxed mt-4">
            حلاقون يتحدثون العربية في بينيلاس بارك، فلوريدا. نرحّب بالزبائن من
            بينيلاس بارك وليلمان وسانت بطرسبرغ والمناطق المجاورة.
          </p>
          <p className="font-body text-muted-foreground leading-relaxed mt-4">
            اشرح لنا ما تريده بالعربية — قصّة شعر، تحديد لحية، أو حلاقة كاملة —
            وسنفهمك من أول مرة.
          </p>
          <p className="font-body text-muted-foreground text-sm mt-6" dir="ltr">
            <a href="/#booking" className="text-accent hover:underline">
              احجز موعدك →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ArabicBarberSection;
