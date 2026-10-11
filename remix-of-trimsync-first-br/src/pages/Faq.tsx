import SiteLayout from "@/components/SiteLayout";
import FaqSection from "@/components/FaqSection";
import { SITE_FAQS } from "@/data/faqs";
import { BUSINESS } from "@/data/business";

const Faq = () => (
  <SiteLayout
    title="Frequently Asked Questions"
    intro={
      <p>
        Prices, hours, parking, walk-ins and everything else people ask before
        their first visit. If your question isn't here, call or text{" "}
        <a href={BUSINESS.phone.href} className="text-accent hover:underline">
          {BUSINESS.phone.display}
        </a>
        .
      </p>
    }
    trail={[
      { name: "Home", url: "/" },
      { name: "FAQ", url: "/faq/" },
    ]}
  >
    <FaqSection heading="Questions & Answers" className="bg-background" />

    <section className="py-20 section-padding bg-secondary border-t border-border">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="font-display text-secondary-foreground text-3xl md:text-4xl uppercase tracking-tight">
          Still deciding?
        </h2>
        <div className="mt-8 flex flex-wrap gap-6 font-body text-sm">
          <a href="/services/" className="text-accent hover:underline">
            See all services and prices →
          </a>
          <a href="/gallery/" className="text-accent hover:underline">
            Look at our work →
          </a>
          <a href="/contact/" className="text-accent hover:underline">
            Find the shop →
          </a>
          <a href="/#booking" className="text-accent hover:underline">
            Book an appointment →
          </a>
        </div>
      </div>
    </section>
  </SiteLayout>
);

export default Faq;
