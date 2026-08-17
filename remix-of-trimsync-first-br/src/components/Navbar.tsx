import { useState, type MouseEvent } from "react";
import { Menu, Phone, X } from "lucide-react";
import logo from "@/assets/nav-logo.webp";
import { MAPS_URL, PHONE_DISPLAY, PHONE_TEL, SHOP_NAME } from "@/lib/business";

const navLinks = [
  { label: "Location", href: MAPS_URL, external: true },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

const linkCls =
  "font-body text-primary-foreground/70 text-sm hover:text-primary-foreground transition-colors duration-200";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const handleHashClick = (
    e: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    setOpen(false);
    if (!href.startsWith("#")) return;
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/90 backdrop-blur-sm">
      <div className="section-padding max-w-[1400px] mx-auto flex items-center justify-between h-16 gap-3">
        <a href="/" className="flex items-center gap-2 min-w-0 shrink">
          <img
            src={logo}
            alt={SHOP_NAME}
            width={40}
            height={40}
            className="h-10 w-10 object-contain shrink-0"
          />
          <span className="hidden xl:inline font-display text-primary-foreground text-2xl tracking-wider uppercase shrink-0">
            {SHOP_NAME}
          </span>
        </a>

        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <a
            href={PHONE_TEL}
            className="flex items-center gap-2 text-accent hover:text-primary-foreground transition-colors min-h-[44px] shrink-0"
            aria-label={`Call ${SHOP_NAME} at ${PHONE_DISPLAY}`}
          >
            <Phone size={16} className="shrink-0" aria-hidden="true" />
            <span className="font-body text-sm font-medium tracking-wide whitespace-nowrap">
              {PHONE_DISPLAY}
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : { onClick: (e) => handleHashClick(e, link.href) })}
                className={linkCls}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#booking"
              onClick={(e) => handleHashClick(e, "#booking")}
              className="bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-widest px-5 py-2 hover:opacity-90 transition-opacity duration-200"
            >
              Book Appointment
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="md:hidden text-primary-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="md:hidden bg-primary border-t border-primary-foreground/10 section-padding py-6 space-y-4"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : { onClick: (e) => handleHashClick(e, link.href) })}
              className="block font-body text-primary-foreground/70 text-sm hover:text-primary-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#booking"
            onClick={(e) => handleHashClick(e, "#booking")}
            className="block w-full bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-widest px-5 py-3 hover:opacity-90 transition-opacity duration-200 text-center"
          >
            Book Appointment
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
