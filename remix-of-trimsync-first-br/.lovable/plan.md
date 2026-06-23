

# TrimSync — Comprehensive Template Documentation

## Suggested Template Name & Slug
- **Template Name:** TrimSync - Premium Barbershop Booking Template
- **URL Slug:** trimsync

---

## 1. UI/UX Features & Components

### Actually Used Components (10 custom + 2 UI primitives)
| Component | Location | Purpose |
|-----------|----------|---------|
| `Navbar` | Fixed top | Desktop/mobile navigation with hamburger menu |
| `HeroSection` | Full-viewport | Lifestyle hero with price list overlay and CTA |
| `ServicesSection` | Below hero | 6-card service grid with price, duration, description |
| `BookingSection` | Mid-page | Multi-step appointment booking flow |
| `GallerySection` | Below booking | 8-image grid gallery |
| `TestimonialsSection` | Below gallery | Auto-scrolling marquee of review cards |
| `ContactSection` | Near bottom | Address/hours info + embedded Google Map |
| `Footer` | Bottom | Brand, copyright, social links |
| `MobileStickyBar` | Fixed bottom (mobile only) | Persistent "Book Appointment" CTA |
| `Toaster` / `Sonner` | Global | Toast notifications for booking confirmation |

**Unused components:** ~50+ shadcn/ui components exist in `src/components/ui/` but are NOT rendered anywhere (accordion, dialog, drawer, carousel, etc.). Only `toast`/`toaster` and `tooltip` are actively used.

### Interactive Elements
- **Booking calendar:** Custom-built month calendar with prev/next navigation, past-date disabling, day selection
- **Multi-step booking flow:** Service → Barber → Date → Time → Contact details → Confirm (progressive disclosure with `animate-fade-in`)
- **Hamburger menu:** Mobile nav toggle with `Menu`/`X` icons (lucide-react)
- **Smooth scroll:** All nav links and CTAs use `scrollIntoView({ behavior: "smooth" })`
- **Marquee carousel:** CSS-animated infinite horizontal scroll for testimonials, pauses on hover

### Layout Systems
- **Max-width container:** `max-w-[1400px] mx-auto` used consistently
- **CSS Grid:** Services section uses `grid md:grid-cols-2 lg:grid-cols-3`, gallery uses `grid grid-cols-2 md:grid-cols-4`, booking calendar uses `grid grid-cols-7`
- **Flexbox:** Navbar, footer, contact info, price list, testimonial cards
- **Custom padding utility:** `.section-padding` = `px-6 md:px-12 lg:px-20`

### Visual Effects
- **Hero gradient overlays:** Two layered gradients — horizontal (`from-transparent via-primary/30 to-primary/80`) and vertical (`from-primary/60 via-transparent to-primary/30`)
- **Gallery hover zoom:** `hover:scale-105 transition-transform duration-300`
- **Service card hover:** `hover:bg-muted transition-colors duration-200`
- **Button hover:** `hover:opacity-90 transition-opacity duration-200`
- **Nav link hover:** `hover:text-primary-foreground transition-colors duration-200`
- **Fade-in animation:** `animate-fade-in` (translateY 8px → 0, opacity 0 → 1, 0.4s ease-out)
- **Marquee animation:** `animate-marquee` (translateX 0 → -50%, 30s linear infinite, pause on hover)

### Form Elements
- **Booking form inputs:** Full Name, Email Address, Phone Number — styled with transparent bg, border, focus ring
- **Selection buttons:** Service, barber, date, and time slot selectors with active state highlighting (accent color)
- **Form validation:** Email regex validation, required field checking, toast error feedback

---

## 2. Typography & Design System

### Fonts
- **Display:** `Bebas Neue` (Google Fonts) — used for all headings, brand name, prices, barber names
- **Body:** `Inter` (Google Fonts) — weights 300, 400, 500, 600, 700 loaded

### Typography Hierarchy
| Element | Font | Size (mobile → desktop) | Style |
|---------|------|------------------------|-------|
| Hero H1 | Bebas Neue | `text-6xl` → `text-[12rem]` | uppercase, `leading-[0.85]`, `tracking-tight` |
| Section H2 | Bebas Neue | `text-5xl` → `text-7xl` | uppercase, `tracking-tight` |
| Service H3 | Bebas Neue | `text-2xl` | uppercase, `tracking-wide` |
| Calendar month | Bebas Neue | `text-2xl` | uppercase, `tracking-wider` |
| Body text | Inter | `text-sm` | `leading-relaxed` |
| Labels | Inter | `text-xs` | uppercase, `tracking-widest` |
| Buttons | Inter | `text-sm` | `font-semibold`, uppercase, `tracking-widest` |

### Font Loading
CSS `@import` via Google Fonts in `index.css`, exposed as CSS custom properties `--font-display` and `--font-body`, mapped to Tailwind `font-display` and `font-body` utilities.

---

## 3. Color System

### HSL-based CSS Custom Properties

**Light Mode (default):**
| Token | HSL | Approx Hex | Usage |
|-------|-----|-----------|-------|
| `--background` | `60 7% 97%` | `#f7f6f4` | Page background (unused — sections use primary/secondary) |
| `--foreground` | `0 0% 18%` | `#2e2e2e` | Default text |
| `--primary` | `0 0% 10%` | `#1a1a1a` | Dark sections (hero, booking, testimonials, footer) |
| `--primary-foreground` | `60 7% 97%` | `#f7f6f4` | Light text on dark sections |
| `--secondary` | `60 4% 91%` | `#e8e7e4` | Light sections (services, gallery, contact) |
| `--accent` | `40 45% 56%` | `#c4a35a` | Gold/amber — CTAs, prices, stars, icons |
| `--muted-foreground` | `0 0% 45%` | `#737373` | Secondary text, descriptions |
| `--border` | `40 10% 85%` | `#dbd7cf` | Borders |
| `--destructive` | `0 84.2% 60.2%` | `#ef4444` | Error toasts |

**Dark Mode** fully defined with inverted primary/foreground values and adjusted secondary/muted tones.

### Color Usage Pattern
- Alternating section backgrounds: `bg-primary` ↔ `bg-secondary` (no white)
- Accent gold used for: CTA buttons, service prices, star ratings, contact icons, focus rings
- Text opacity modifiers: `/70`, `/60`, `/40`, `/20` for hierarchy

---

## 4. Spacing & Layout System

- **Border radius:** `--radius: 4px` (minimal, sharp aesthetic)
- **Container max-width:** `1400px`
- **Section vertical padding:** `py-24` (6rem)
- **Section horizontal padding:** `px-6 md:px-12 lg:px-20`
- **Grid gaps:** `gap-1` (gallery), `gap-2` (time slots, services grid border trick), `gap-3` (barber cards, contact form), `gap-6` (marquee cards), `gap-px` (services grid with bg color as divider)
- **Card padding:** `p-8` (services, testimonials)
- **Button padding:** `py-3 px-4` (small), `py-4 px-5` (large)
- **No shadow/elevation system** — flat design philosophy throughout

---

## 5. Responsive Design & Mobile

### Breakpoints (Tailwind defaults)
- `sm:` 640px — hero title size step
- `md:` 768px — layout shifts (1-col → 2/3-col grids, mobile menu hidden, sticky bar hidden)
- `lg:` 1024px — services grid 3-col, wider section padding

### Mobile-Specific Features
- **Hamburger navigation:** Slide-down menu with `Menu`/`X` toggle, hidden at `md:`
- **Sticky bottom CTA bar:** Fixed bottom "Book Appointment →" button, visible only below `md:` breakpoint
- **Stacked layouts:** All grids collapse to 1-2 columns on mobile
- **Hero responsive scaling:** Title scales from `text-6xl` → `text-[12rem]` across 4 breakpoints

---

## 6. Performance & Optimization

- **Lazy loading:** Gallery images use `loading="lazy"`, Google Maps iframe uses `loading="lazy"`
- **Image format:** JPG assets (9 total — 1 hero + 8 gallery)
- **No code splitting** beyond Vite's default chunking
- **No virtualization** — all content renders immediately
- **Minimal JS:** No heavy libraries; custom calendar avoids date-picker libraries
- **CSS animations:** Pure CSS marquee and fade-in (no JS animation libraries)

---

## 7. Accessibility

- **Semantic HTML:** `<nav>`, `<section>`, `<footer>`, `<button>`, `<a>` used correctly
- **Alt text:** Hero image and gallery images have descriptive alt attributes
- **iframe title:** Google Maps embed has `title="TrimSync Location"`
- **Keyboard operable:** All interactive elements are `<button>` elements (focusable/activatable)
- **Missing:** No skip links, no ARIA landmarks beyond semantic HTML, no explicit focus management, no reduced-motion media query for marquee

---

## 8. SEO & Discoverability

- **Title:** "Barbershop"
- **Meta description:** "Lovable Generated Project" (placeholder)
- **Open Graph:** `og:title`, `og:description`, `og:type`, `og:image` configured
- **Twitter Cards:** `summary_large_image` with title, description, image
- **robots.txt:** Allows all major crawlers (Googlebot, Bingbot, Twitterbot, facebookexternalhit)
- **Missing:** No structured data/JSON-LD, no sitemap.xml, no canonical URLs

---

## 9. Content Features

### Content Types
Single-page site with 6 content sections. All content is static/hardcoded:
- **6 services** with name, price, duration, description
- **3 staff members** with name and role
- **4 testimonials** with name, text, 5-star rating
- **8 gallery images**
- **Contact info:** address, phone, hours
- **Price list:** 6 items in hero overlay

### Booking System
Multi-step progressive form:
1. Select service (6 options, grid)
2. Select barber (3 options)
3. Select date (custom calendar with month navigation)
4. Select time (15 slots from 9AM–5PM)
5. Enter contact details (name, email, phone)
6. Confirm → toast notification with full appointment summary

No backend — confirmation is client-side toast only.

---

## 10. Theming & Customization

- **Dark mode:** Full dark theme defined in CSS variables, switchable via `.dark` class on root
- **No theme toggle UI** currently implemented
- **next-themes** package installed but not actively used
- **Easy rebranding:** All colors via CSS custom properties, fonts via CSS vars, brand name is a simple string

---

## 11. Integration & Extension Points

- **No backend connected** — no Lovable Cloud, no Supabase, no APIs
- **No analytics** — no tracking scripts
- **No email sending** — booking confirmation is toast-only
- **Google Maps** embedded via iframe
- **Social links:** Instagram, TikTok (href="#" placeholders)
- **React Query** installed and configured but unused (ready for API integration)
- **React Hook Form + Zod** installed but unused (ready for advanced form handling)

---

## 12. Developer Experience

- **TypeScript:** Strict mode, path aliases via `@/`
- **Vite 8** with React plugin
- **ESLint 9** with react-hooks and react-refresh plugins
- **Vitest** configured with jsdom environment
- **Playwright** configured for e2e testing
- **Tailwind CSS 3.4** with `tailwindcss-animate` plugin
- **shadcn/ui** component library scaffolded (50+ components available)
- **Lucide React** for icons

---

## 13. Template Name & Slug

- **Template Name:** TrimSync - Premium Barbershop Booking Template
- **URL Slug:** `trimsync`

