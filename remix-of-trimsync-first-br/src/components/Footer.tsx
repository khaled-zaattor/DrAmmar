import { BUSINESS, addressLine } from "@/data/business";
import { SERVICE_PAGES } from "@/data/services";

// __BUILD_YEAR__ is injected by vite.config.ts. Calling new Date().getFullYear()
// in the render body baked the build year into the prerendered HTML, so a client
// hydrating after New Year would compute a different value and React would warn
// and patch the DOM.
declare const __BUILD_YEAR__: number;

const Footer = () => {
  return (
    <footer className="bg-primary section-padding pt-12 pb-28 md:py-12">
      {/* A real sitemap in the footer. Previously the footer contained no
          internal links at all, so every page was a dead end for a crawler. */}
      <nav
        aria-label="Footer"
        className="max-w-[1400px] mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-10 border-b border-primary-foreground/10 pb-10 mb-10"
      >
        <div>
          <h2 className="font-display text-primary-foreground text-sm uppercase tracking-[0.2em]">
            Services
          </h2>
          <ul className="mt-4 space-y-2 list-none p-0">
            {SERVICE_PAGES.map((s) => (
              <li key={s.slug}>
                <a
                  href={`/services/${s.slug}/`}
                  className="font-body text-primary-foreground/50 text-sm hover:text-primary-foreground transition-colors"
                >
                  {s.name} — ${s.price}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-primary-foreground text-sm uppercase tracking-[0.2em]">
            The Shop
          </h2>
          <ul className="mt-4 space-y-2 list-none p-0">
            {[
              { label: "All services & prices", href: "/services/" },
              { label: "Meet Ali", href: "/about-ali/" },
              { label: "Our work", href: "/gallery/" },
              { label: "Frequently asked questions", href: "/faq/" },
              { label: "Contact & directions", href: "/contact/" },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-body text-primary-foreground/50 text-sm hover:text-primary-foreground transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-primary-foreground text-sm uppercase tracking-[0.2em]">
            Hours
          </h2>
          <ul className="mt-4 space-y-2 list-none p-0 font-body text-primary-foreground/50 text-sm">
            <li>Tue–Fri: 8:30 AM – 5:30 PM</li>
            <li>Sat: 9:00 AM – 4:00 PM</li>
            <li>Sun &amp; Mon: Closed</li>
          </ul>
          <a
            href="/#booking"
            className="inline-block mt-6 bg-accent text-accent-foreground font-body font-semibold text-xs uppercase tracking-widest px-5 py-3 hover:opacity-90 transition-opacity"
          >
            Book an appointment →
          </a>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <img
            src="/images/footer-logo.png"
            alt={BUSINESS.name}
            width={343}
            height={476}
            className="h-32 w-32 object-contain"
          />
          <span className="font-display text-primary-foreground text-xl tracking-wider uppercase">
            {BUSINESS.name}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <a
            href={BUSINESS.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-primary-foreground/50 text-sm hover:text-primary-foreground transition-colors"
          >
            {BUSINESS.name}, {addressLine()}
          </a>
          <a
            href={BUSINESS.phone.href}
            className="font-body text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors"
          >
            {BUSINESS.phone.display}
          </a>
          <a
            href={`mailto:${BUSINESS.email}`}
            className="font-body text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors"
          >
            {BUSINESS.email}
          </a>
          <p className="font-body text-primary-foreground/40 text-sm mt-1">
            © {__BUILD_YEAR__} {BUSINESS.name}. All rights reserved.
          </p>
        </div>
        <div className="flex gap-6">
          <a
            href={BUSINESS.socials.instagram}
            target="_blank"
            rel="me noopener noreferrer"
            className="font-body text-primary-foreground/40 text-sm hover:text-primary-foreground transition-colors"
          >
            Instagram
          </a>
          <a
            href={BUSINESS.socials.facebook}
            target="_blank"
            rel="me noopener noreferrer"
            className="font-body text-primary-foreground/40 text-sm hover:text-primary-foreground transition-colors"
          >
            Facebook
          </a>
          <a
            href={BUSINESS.socials.tiktok}
            target="_blank"
            rel="me noopener noreferrer"
            className="font-body text-primary-foreground/40 text-sm hover:text-primary-foreground transition-colors"
          >
            TikTok
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
