import { useState, useRef, lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import MobileStickyBar from "@/components/MobileStickyBar";
import DeferredSection from "@/components/DeferredSection";
import { type BookingSectionHandle } from "@/components/BookingSection";

const BookingSection      = lazy(() => import("@/components/BookingSection"));
const GallerySection      = lazy(() => import("@/components/GallerySection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const ContactSection      = lazy(() => import("@/components/ContactSection"));
const Footer              = lazy(() => import("@/components/Footer"));

const Index = () => {
  const [servicesCount, setServicesCount] = useState(0);
  const [hasBarber, setHasBarber] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<number | null>(null);
  const bookingRef = useRef<BookingSectionHandle>(null);

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <Suspense fallback={null}>
        <BookingSection
          ref={bookingRef}
          preselectedServiceId={preselectedServiceId}
          onServicesChange={setServicesCount}
          onBarberSelected={setHasBarber}
        />
      </Suspense>
      <AboutSection />
      <ServicesSection
        onBookService={(id) => {
          setPreselectedServiceId(id);
          document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
      {/* Gallery is image-heavy and below the fold. Contact, testimonials, and
          the footer stay in the first render so crawlers see NAP and reviews
          without waiting for an IntersectionObserver. */}
      <DeferredSection minHeight={700}>
        <Suspense fallback={null}>
          <GallerySection />
        </Suspense>
      </DeferredSection>
      <Suspense fallback={null}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={null}>
        <ContactSection />
      </Suspense>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <MobileStickyBar
        hasServices={servicesCount > 0}
        hasBarber={hasBarber}
        onNext={() => bookingRef.current?.goToNextStep()}
      />
    </div>
  );
};

export default Index;
