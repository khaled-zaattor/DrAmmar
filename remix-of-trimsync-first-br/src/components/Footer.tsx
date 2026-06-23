import logo from "@/assets/footer-logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary section-padding pt-12 pb-28 md:py-12">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Ali's Barber Shop" className="h-32 w-32 object-contain" />
          <span className="font-display text-primary-foreground text-xl tracking-wider uppercase">
            Ali's Barber Shop
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <a
            href="https://www.google.com/maps/place/Ali's+Barbershop/@27.8288039,-82.7676914,13z/data=!4m10!1m2!2m1!1sAli's+Barbershop,+4201+62nd+North+Unit+9,+Pinellas+Park,+FL+33781!3m6!1s0x88c2e5e61c59b849:0xd1899ae87c607955!8m2!3d27.8288039!4d-82.6914737!15sCkFBbGkncyBCYXJiZXJzaG9wLCA0MjAxIDYybmQgTm9ydGggVW5pdCA5LCBQaW5lbGxhcyBQYXJrLCBGTCAzMzc4MVpAIj5hbGkncyBiYXJiZXJzaG9wIDQyMDEgNjJuZCBub3J0aCB1bml0IDkgcGluZWxsYXMgcGFyayBmbCAzMzc4MZIBCmhhaXJfc2Fsb26aAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMnQzTVZwSFduRlNlazVUVlZaV05sUjZhRTFOYkd4eVRqSnJlVlJzUlJBQuABAPoBBAgAEDE!16s%2Fg%2F11xkrdhb2h?hl=en-US&entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-primary-foreground/50 text-sm hover:text-primary-foreground transition-colors"
          >
            Ali's Barbershop, 4201 62nd North Unit 9, Pinellas Park, FL 33781
          </a>
          <a href="tel:8138959229" className="font-body text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors">
            813-895-9229
          </a>
          <a href="mailto:alisbarbershop2026@gmail.com" className="font-body text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors">
            alisbarbershop2026@gmail.com
          </a>
          <p className="font-body text-primary-foreground/40 text-sm mt-1">
            © {new Date().getFullYear()} Ali's Barber Shop. All rights reserved.
          </p>
        </div>
        <div className="flex gap-6">
          <a href="https://www.instagram.com/alisbarbershop2026" target="_blank" rel="noopener noreferrer" className="font-body text-primary-foreground/40 text-sm hover:text-primary-foreground transition-colors">
            Instagram
          </a>
          <a href="https://www.facebook.com/profile.php?id=61574278858877" target="_blank" rel="noopener noreferrer" className="font-body text-primary-foreground/40 text-sm hover:text-primary-foreground transition-colors">
            Facebook
          </a>
          <a href="https://www.tiktok.com/@alis.barber.shop" target="_blank" rel="noopener noreferrer" className="font-body text-primary-foreground/40 text-sm hover:text-primary-foreground transition-colors">
            TikTok
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
