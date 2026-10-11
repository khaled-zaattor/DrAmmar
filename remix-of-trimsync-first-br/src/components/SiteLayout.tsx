import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs, { type Crumb } from "@/components/Breadcrumbs";

/**
 * Chrome for every page except the homepage: the shared nav, a page header, and
 * the footer. Keeping it in one component is the reason the site can have a
 * dozen URLs without the navbar and NAP being copy-pasted a dozen times.
 */
const SiteLayout = ({
  title,
  intro,
  trail,
  children,
}: {
  title: string;
  intro?: ReactNode;
  trail: Crumb[];
  children: ReactNode;
}) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />

    <header className="bg-primary section-padding pt-28 pb-16">
      <div className="max-w-[1400px] mx-auto">
        <Breadcrumbs trail={trail} />
        <h1 className="font-display text-primary-foreground text-4xl sm:text-5xl md:text-7xl uppercase tracking-tight mt-6">
          {title}
        </h1>
        {intro && (
          <div className="font-body text-primary-foreground/70 leading-relaxed mt-6 max-w-3xl">
            {intro}
          </div>
        )}
      </div>
    </header>

    <main className="flex-1">{children}</main>

    <Footer />
  </div>
);

export default SiteLayout;
