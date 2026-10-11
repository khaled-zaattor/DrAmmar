import SiteLayout from "@/components/SiteLayout";
import TestimonialsSection from "@/components/TestimonialsSection";
import ArabicBarberSection from "@/components/ArabicBarberSection";
import { ABOUT } from "@/data/about";
import { BUSINESS } from "@/data/business";

const About = () => (
  <SiteLayout
    title={`Meet ${ABOUT.name}`}
    intro={
      <p>
        {ABOUT.jobTitle} at {BUSINESS.name} in {BUSINESS.address.city},{" "}
        {BUSINESS.address.region}. Eight years behind the chair, fades, beard
        work and scissor cuts — in English or Arabic.
      </p>
    }
    trail={[
      { name: "Home", url: "/" },
      { name: `About ${ABOUT.name}`, url: "/about-ali/" },
    ]}
  >
    <section className="py-20 section-padding bg-background">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-16 items-start">
        <div>
          {ABOUT.photo && (
            // Landscape source with the subject on the right, so it's shown at
            // its native 3:2 and anchored right rather than cropped to portrait.
            <img
              src={ABOUT.photo.src}
              alt={ABOUT.photo.alt}
              width={ABOUT.photo.width}
              height={ABOUT.photo.height}
              className="w-full aspect-[3/2] object-cover object-right mb-10"
              {...({ fetchpriority: "high" } as React.ImgHTMLAttributes<HTMLImageElement>)}
            />
          )}
          {ABOUT.bio.map((paragraph, i) => (
            <p
              key={i}
              className="font-body text-muted-foreground leading-relaxed mb-5 text-[1.05rem]"
            >
              {paragraph}
            </p>
          ))}

          <a
            href="/#booking"
            className="inline-block mt-4 bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-widest px-6 py-3 hover:opacity-90 transition-opacity"
          >
            Book with {ABOUT.name} →
          </a>
        </div>

        <aside>
          {ABOUT.yearsExperienceAbroad !== null && (
            <div className="border-l-2 border-accent pl-4 mb-10">
              <p className="font-display text-accent text-5xl leading-none">
                {ABOUT.yearsExperienceAbroad}
              </p>
              <p className="font-body text-muted-foreground text-sm mt-2">
                years as a barber before Pinellas Park
              </p>
            </div>
          )}

          <h2 className="font-display text-foreground text-2xl uppercase tracking-wide">
            Specialties
          </h2>
          <ul className="mt-4 space-y-2 list-none p-0">
            {ABOUT.specialties.map((item) => (
              <li
                key={item}
                className="font-body text-muted-foreground text-sm leading-relaxed border-l-2 border-accent pl-4"
              >
                {item}
              </li>
            ))}
          </ul>

          <h2 className="font-display text-foreground text-2xl uppercase tracking-wide mt-10">
            Languages
          </h2>
          <p className="font-body text-muted-foreground text-sm mt-3">
            {ABOUT.languages.join(" · ")}
          </p>

          <h2 className="font-display text-foreground text-2xl uppercase tracking-wide mt-10">
            Where to find us
          </h2>
          <p className="font-body text-muted-foreground text-sm mt-3 leading-relaxed">
            {BUSINESS.address.street}
            <br />
            {BUSINESS.address.city}, {BUSINESS.address.region}{" "}
            {BUSINESS.address.postalCode}
            <br />
            <a href={BUSINESS.phone.href} className="text-accent hover:underline">
              {BUSINESS.phone.display}
            </a>
          </p>
        </aside>
      </div>
    </section>

    <ArabicBarberSection />
    <TestimonialsSection />
  </SiteLayout>
);

export default About;
