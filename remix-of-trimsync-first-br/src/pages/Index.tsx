import { useState, useRef, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MobileStickyBar from "@/components/MobileStickyBar";
import SectionBoundary from "@/components/SectionBoundary";
import ClientOnly from "@/components/ClientOnly";
import { lazyWithRetry } from "@/lib/lazy-retry";
import { type BookingSectionHandle } from "@/components/BookingSection";

// Static imports, deliberately. These used to be lazy-loaded, which meant their
// content — the entire services list, every review, the address and the hours —
// existed only in a separate chunk that a crawler had to execute JavaScript to
// reach. They are pure-render components; lazy-loading them bought nothing and
// cost the site all of its indexable content.
import ServicesSection from "@/components/ServicesSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import ArabicBarberSection from "@/components/ArabicBarberSection";
import ServiceAreaSection from "@/components/ServiceAreaSection";
import FirstVisitSection from "@/components/FirstVisitSection";
import FaqSection from "@/components/FaqSection";
import GallerySection from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

// The booking widget stays lazy — it is by far the largest component, it is
// purely interactive, and none of its content needs to be indexed. ClientOnly
// keeps it out of the prerender entirely.
const BookingSection = lazyWithRetry(() => import("@/components/BookingSection"));

const Index = () => {
  const [servicesCount, setServicesCount] = useState(0);
  const [hasBarber, setHasBarber] = useState(false);
  const bookingRef = useRef<BookingSectionHandle>(null);

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <SectionBoundary name="booking">
        <ClientOnly>
          <Suspense fallback={null}>
            <BookingSection
              ref={bookingRef}
              onServicesChange={setServicesCount}
              onBarberSelected={setHasBarber}
            />
          </Suspense>
        </ClientOnly>
      </SectionBoundary>
      <ServicesSection />
      <WhyChooseSection />
      <GallerySection />
      <ArabicBarberSection />
      <TestimonialsSection />
      <ServiceAreaSection />
      <FirstVisitSection />
      <FaqSection />
      <ContactSection />
      <Footer />
      <MobileStickyBar
        hasServices={servicesCount > 0}
        hasBarber={hasBarber}
        onChooseBarber={() => bookingRef.current?.chooseBarber()}
      />
    </div>
  );
};

export default Index;
