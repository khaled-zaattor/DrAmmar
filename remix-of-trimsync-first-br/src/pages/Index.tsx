import { useState, useRef, lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MobileStickyBar from "@/components/MobileStickyBar";
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
      <Suspense fallback={null}>
        <GallerySection />
      </Suspense>
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
        onChooseBarber={() => bookingRef.current?.chooseBarber()}
      />
    </div>
  );
};

export default Index;
