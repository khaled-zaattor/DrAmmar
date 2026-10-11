import SiteLayout from "@/components/SiteLayout";
import ServicesSection from "@/components/ServicesSection";
import FaqSection from "@/components/FaqSection";
import { SITE_FAQS } from "@/data/faqs";
import { BUSINESS } from "@/data/business";

const Services = () => (
  <SiteLayout
    title="Barber Services & Prices in Pinellas Park, FL"
    intro={
      <>
        <p>
          Haircuts, fades, beard work, threading, waxing and facials — every
          service we offer with what it costs and how long it takes. Prices are
          the same whichever barber you book.
        </p>
        <p className="mt-4">
          Booking online takes under a minute. Walk-ins are welcome when there's
          a gap in the schedule, or call{" "}
          <a href={BUSINESS.phone.href} className="text-accent hover:underline">
            {BUSINESS.phone.display}
          </a>
          .
        </p>
      </>
    }
    trail={[
      { name: "Home", url: "/" },
      { name: "Services", url: "/services/" },
    ]}
  >
    <ServicesSection />
    <FaqSection
      faqs={SITE_FAQS.slice(0, 6)}
      heading="Common Questions"
      className="bg-secondary"
    />
  </SiteLayout>
);

export default Services;
