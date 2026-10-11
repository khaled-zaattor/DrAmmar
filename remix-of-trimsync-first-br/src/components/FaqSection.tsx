import type { ServiceFaq } from "@/data/services";
import { SITE_FAQS } from "@/data/faqs";

/**
 * Native <details>/<summary> rather than the Radix accordion, on purpose:
 *
 *  - The answer text is in the HTML whether or not the item is open, so it is
 *    fully indexable and readable by AI answer engines.
 *  - It needs no JavaScript at all, so it works in the prerendered page before
 *    hydration and in a browser where the bundle failed.
 *  - Radix relies on useId and useLayoutEffect, which are avoidable SSR risk for
 *    a control that the browser already implements.
 *
 * The same array feeds the FAQPage JSON-LD, so the markup cannot drift from the
 * visible text — which would be a structured data violation.
 */
const FaqSection = ({
  faqs = SITE_FAQS,
  heading = "Frequently Asked Questions",
  className = "bg-secondary",
}: {
  faqs?: ServiceFaq[];
  heading?: string;
  className?: string;
}) => {
  return (
    <section id="faq" className={`py-24 section-padding ${className}`}>
      <div className="max-w-[1400px] mx-auto">
        <h2 className="font-display text-secondary-foreground text-5xl md:text-7xl uppercase tracking-tight">
          {heading}
        </h2>

        <div className="mt-12 max-w-3xl border-t border-border">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group border-b border-border py-5"
            >
              <summary className="flex cursor-pointer items-start justify-between gap-6 font-display text-secondary-foreground text-xl uppercase tracking-wide marker:content-['']">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="text-accent text-2xl leading-none shrink-0 transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="font-body text-muted-foreground leading-relaxed mt-4 pr-10">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
