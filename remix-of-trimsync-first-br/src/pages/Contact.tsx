import SiteLayout from "@/components/SiteLayout";
import ContactSection from "@/components/ContactSection";
import ServiceAreaSection from "@/components/ServiceAreaSection";
import FirstVisitSection from "@/components/FirstVisitSection";
import { BUSINESS } from "@/data/business";

const Contact = () => (
  <SiteLayout
    title="Find Ali's Barber Shop"
    intro={
      <p>
        {BUSINESS.address.street}, {BUSINESS.address.city},{" "}
        {BUSINESS.address.region} {BUSINESS.address.postalCode}. Free parking
        outside. Call or text{" "}
        <a href={BUSINESS.phone.href} className="text-accent hover:underline">
          {BUSINESS.phone.display}
        </a>
        .
      </p>
    }
    trail={[
      { name: "Home", url: "/" },
      { name: "Contact", url: "/contact/" },
    ]}
  >
    <ContactSection />
    <ServiceAreaSection />
    <FirstVisitSection />
  </SiteLayout>
);

export default Contact;
