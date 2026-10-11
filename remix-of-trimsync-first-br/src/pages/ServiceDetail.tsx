import SiteLayout from "@/components/SiteLayout";
import ServiceCard from "@/components/ServiceCard";
import FaqSection from "@/components/FaqSection";
import { BUSINESS } from "@/data/business";
import { relatedServices, type StaticService } from "@/data/services";
import { Check } from "lucide-react";

/**
 * One service page. Every number on it — price, duration — comes from
 * src/data/services.ts, which `npm run check:services` verifies against the live
 * DB, so a page can't advertise a price the shop doesn't charge.
 */
const ServiceDetail = ({ service }: { service: StaticService }) => {
  const related = relatedServices(service.slug, 3);

  return (
    <SiteLayout
      title={service.name}
      intro={
        <>
          <p className="text-primary-foreground text-xl">
            <span className="font-display text-accent text-3xl">
              ${service.price}
            </span>
            <span className="mx-3 text-primary-foreground/40">·</span>
            {service.durationMinutes} minutes
          </p>
          <p className="mt-4">{service.shortDescription}</p>
          <a
            href="/#booking"
            className="inline-block mt-6 bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-widest px-6 py-3 hover:opacity-90 transition-opacity"
          >
            Book this service →
          </a>
        </>
      }
      trail={[
        { name: "Home", url: "/" },
        { name: "Services", url: "/services/" },
        { name: service.name, url: `/services/${service.slug}/` },
      ]}
    >
      <section className="py-20 section-padding bg-background">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-16 items-start">
          <div>
            {service.longDescription.map((paragraph, i) => (
              <p
                key={i}
                className="font-body text-muted-foreground leading-relaxed mb-5 text-[1.05rem]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <aside>
            {service.image && (
              <img
                src={service.image.src}
                alt={service.image.alt}
                width={service.image.width}
                height={service.image.height}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover mb-8"
              />
            )}

            <h2 className="font-display text-foreground text-2xl uppercase tracking-wide">
              What's included
            </h2>
            <ul className="mt-4 space-y-3 list-none p-0">
              {service.includes.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check
                    size={18}
                    className="text-accent mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="font-body text-muted-foreground text-sm leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-border pt-6">
              <p className="font-body text-muted-foreground text-sm">
                {BUSINESS.name}
                <br />
                {BUSINESS.address.street}, {BUSINESS.address.city},{" "}
                {BUSINESS.address.region} {BUSINESS.address.postalCode}
                <br />
                <a
                  href={BUSINESS.phone.href}
                  className="text-accent hover:underline"
                >
                  {BUSINESS.phone.display}
                </a>
              </p>
            </div>
          </aside>
        </div>
      </section>

      {service.faqs.length > 0 && (
        <FaqSection
          faqs={service.faqs}
          heading={`${service.name} — Questions`}
          className="bg-secondary"
        />
      )}

      <section className="py-20 section-padding bg-background border-t border-border">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-display text-foreground text-3xl md:text-4xl uppercase tracking-tight">
            Other services
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {related.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-6 font-body text-sm">
            <a href="/services/" className="text-accent hover:underline">
              All services and prices →
            </a>
            <a href="/faq/" className="text-accent hover:underline">
              Frequently asked questions →
            </a>
            <a href="/contact/" className="text-accent hover:underline">
              Find the shop →
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ServiceDetail;
