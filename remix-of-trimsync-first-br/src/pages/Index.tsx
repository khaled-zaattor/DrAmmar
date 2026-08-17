import { useState, useRef, lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MobileStickyBar from "@/components/MobileStickyBar";
import DeferredSection from "@/components/DeferredSection";
import { type BookingSectionHandle } from "@/components/BookingSection";

const BookingSection     = lazy(() => import("@/components/BookingSection"));
const GallerySection     = lazy(() => import("@/components/GallerySection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const ContactSection     = lazy(() => import("@/components/ContactSection"));
const Footer             = lazy(() => import("@/components/Footer"));

const Index = () => {
  const [servicesCount, setServicesCount] = useState(0);
  const [hasBarber, setHasBarber] = useState(false);
  const bookingRef = useRef<BookingSectionHandle>(null);

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <Suspense fallback={null}>
        <BookingSection
          ref={bookingRef}
          onServicesChange={setServicesCount}
          onBarberSelected={setHasBarber}
        />
      </Suspense>
      {/* BookingSection stays eager above — it is the conversion path and the
          sticky bar scrolls to it. Everything below only loads on approach. */}
      <DeferredSection minHeight={700}>
        <Suspense fallback={null}>
          <GallerySection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={500}>
        <Suspense fallback={null}>
          <TestimonialsSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={700}>
        <Suspense fallback={null}>
          <ContactSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection minHeight={300}>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </DeferredSection>
      <MobileStickyBar
        hasServices={servicesCount > 0}
        hasBarber={hasBarber}
        onNext={() => bookingRef.current?.goToNextStep()}
      />
    </div>
  );
};

export default Index;
