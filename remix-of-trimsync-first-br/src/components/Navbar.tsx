import { useState, type MouseEvent } from "react";
import { Menu, Phone, X } from "lucide-react";
import { BUSINESS } from "@/data/business";

const phoneHref = BUSINESS.phone.href;
const phoneDisplay = BUSINESS.phone.display;

const navLinks = [
  { label: "Services", href: "/services/" },
  { label: "Gallery", href: "/gallery/" },
  { label: "About Ali", href: "/about-ali/" },
  { label: "FAQ", href: "/faq/" },
  { label: "Contact", href: "/contact/" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  // Every nav item is a real <a href> now. They used to be <button onClick>
  // wrappers around window.location.assign(), which meant the site shipped zero
  // crawlable internal links and zero anchor text — a crawler had nothing to
  // follow and no signal about what any destination was.
  //
  // The handler only intercepts a link to a section of the page you are already
  // on, to keep the smooth scroll. Everything else is a real navigation, left to
  // the browser. "/#booking" therefore works from any page: it scrolls on the
  // homepage and navigates home from a service page.
  const handleClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    setOpen(false);

    const hash = href.startsWith("#")
      ? href
      : href.startsWith("/#") && window.location.pathname === "/"
        ? href.slice(1)
        : null;
    if (!hash) return;

    const target = document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/90 backdrop-blur-sm">
      <div className="section-padding max-w-[1400px] mx-auto flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2">
          <img
            src="/images/nav-logo.png"
            alt={BUSINESS.name}
            width="40"
            height="40"
            className="h-10 w-10 object-contain"
          />
          <span className="hidden sm:inline font-display text-primary-foreground text-2xl tracking-wider uppercase">
            {BUSINESS.name}
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden xl:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className="font-body text-primary-foreground/70 text-sm hover:text-primary-foreground transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <a
            href={phoneHref}
            aria-label={`Call Ali's Barber Shop at ${phoneDisplay}`}
            className="inline-flex items-center gap-2 whitespace-nowrap font-body text-sm font-medium text-primary-foreground hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <Phone size={16} aria-hidden="true" />
            <span>{phoneDisplay}</span>
          </a>
          <a
            href="/#booking"
            onClick={(e) => handleClick(e, "/#booking")}
            className="bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-widest px-5 py-2 hover:opacity-90 transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Book Appointment
          </a>
        </div>

        {/* Mobile actions */}
        <div className="flex xl:hidden items-center gap-2">
          <a
            href={phoneHref}
            aria-label={`Call Ali's Barber Shop at ${phoneDisplay}`}
            className="inline-flex h-11 w-11 items-center justify-center border border-primary-foreground/20 text-primary-foreground hover:border-accent hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <Phone size={20} aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className="inline-flex h-11 w-11 items-center justify-center text-primary-foreground hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-navigation" className="xl:hidden bg-primary border-t border-primary-foreground/10 section-padding py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className="block font-body text-primary-foreground/70 text-sm hover:text-primary-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href={phoneHref}
            aria-label={`Call Ali's Barber Shop at ${phoneDisplay}`}
            className="flex min-h-11 items-center gap-3 border-y border-primary-foreground/10 py-3 font-body text-sm font-medium text-primary-foreground hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Phone size={18} aria-hidden="true" />
            Call {phoneDisplay}
          </a>
          <a
            href="/#booking"
            onClick={(e) => handleClick(e, "/#booking")}
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
