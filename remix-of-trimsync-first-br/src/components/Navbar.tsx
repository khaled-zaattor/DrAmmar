import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/nav-logo.png";

const navLinks = [
  { label: "Location", href: "/location" },
  { label: "Gallery", href: "#gallery" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = (href: string) => {
    setOpen(false);
    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    if (href.startsWith("/")) {
      navigate(href);
      return;
    }
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/90 backdrop-blur-sm">
      <div className="section-padding max-w-[1400px] mx-auto flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2">
          <img src={logo} alt="Ali's Barber Shop" className="h-10 w-10 object-contain" />
          <span className="font-display text-primary-foreground text-2xl tracking-wider uppercase">
            Ali's Barber Shop
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleClick(link.href)}
              className="font-body text-primary-foreground/70 text-sm hover:text-primary-foreground transition-colors duration-200"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleClick("#booking")}
            className="bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-widest px-5 py-2 hover:opacity-90 transition-opacity duration-200"
          >
            Book Appointment
          </button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-primary-foreground">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-primary border-t border-primary-foreground/10 section-padding py-6 space-y-4">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleClick(link.href)}
              className="block font-body text-primary-foreground/70 text-sm hover:text-primary-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
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
