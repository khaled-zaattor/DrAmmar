import logo from "@/assets/footer-logo.webp";
import {
  ADDRESS_LINE,
  EMAIL,
  MAPS_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  SHOP_NAME,
  SOCIAL,
} from "@/lib/business";

const Footer = () => {
  return (
    <footer className="bg-primary section-padding pt-12 pb-28 md:py-12">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt={SHOP_NAME}
            width={128}
            height={128}
            loading="lazy"
            decoding="async"
            className="h-32 w-32 object-contain"
          />
          <span className="font-display text-primary-foreground text-xl tracking-wider uppercase">
            {SHOP_NAME}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-primary-foreground/50 text-sm hover:text-primary-foreground transition-colors"
          >
            {ADDRESS_LINE}
          </a>
          <a href={PHONE_TEL} className="font-body text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors">
            {PHONE_DISPLAY}
          </a>
          <a href={`mailto:${EMAIL}`} className="font-body text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors">
            {EMAIL}
          </a>
          <p className="font-body text-primary-foreground/40 text-sm mt-1">
            © {new Date().getFullYear()} {SHOP_NAME}. All rights reserved.
          </p>
        </div>
        <div className="flex gap-6">
          <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="font-body text-primary-foreground/40 text-sm hover:text-primary-foreground transition-colors">
            Instagram
          </a>
          <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" className="font-body text-primary-foreground/40 text-sm hover:text-primary-foreground transition-colors">
            Facebook
          </a>
          <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" className="font-body text-primary-foreground/40 text-sm hover:text-primary-foreground transition-colors">
            TikTok
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
