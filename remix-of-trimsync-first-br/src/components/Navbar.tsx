import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import logo from "@/assets/nav-logo.png";

const phoneHref = "tel:+1-813-895-9229";
const phoneDisplay = "813-895-9229";

const navLinks = [
  { label: "Location", href: "/location" },
  { label: "Gallery", href: "#gallery" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const handleClick = (href: string) => {
    setOpen(false);
    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    if (href.startsWith("/")) {
      window.location.assign(href);
      return;
    }
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/90 backdrop-blur-sm">
      <div className="section-padding max-w-[1400px] mx-auto flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Ali's Barber Shop"
            width="40"
            height="40"
            className="h-10 w-10 object-contain"
          />
          <span className="hidden sm:inline font-display text-primary-foreground text-2xl tracking-wider uppercase">
            Ali's Barber Shop
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden xl:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleClick(link.href)}
              className="font-body text-primary-foreground/70 text-sm hover:text-primary-foreground transition-colors duration-200"
            >
              {link.label}
            </button>
          ))}
          <a
            href={phoneHref}
            aria-label={`Call Ali's Barber Shop at ${phoneDisplay}`}
            className="inline-flex items-center gap-2 whitespace-nowrap font-body text-sm font-medium text-primary-foreground hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <Phone size={16} aria-hidden="true" />
            <span>{phoneDisplay}</span>
          </a>
          <button
            onClick={() => handleClick("#booking")}
            className="bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-widest px-5 py-2 hover:opacity-90 transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Book Appointment
          </button>
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
            <button
              key={link.label}
              onClick={() => handleClick(link.href)}
              className="block font-body text-primary-foreground/70 text-sm hover:text-primary-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
          <a
            href={phoneHref}
            aria-label={`Call Ali's Barber Shop at ${phoneDisplay}`}
            className="flex min-h-11 items-center gap-3 border-y border-primary-foreground/10 py-3 font-body text-sm font-medium text-primary-foreground hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Phone size={18} aria-hidden="true" />
            Call {phoneDisplay}
          </a>
          <button
            onClick={() => handleClick("#booking")}
            className="block w-full bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-widest px-5 py-3 hover:opacity-90 transition-opacity duration-200 text-center"
          >
            Book Appointment
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
