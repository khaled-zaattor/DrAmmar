import g1 from "@/assets/gallery-1.webp";
import g2 from "@/assets/gallery-2.webp";
import g3 from "@/assets/gallery-3.webp";
import g4 from "@/assets/gallery-4.webp";
import g5 from "@/assets/gallery-5.webp";
import g6 from "@/assets/gallery-6.webp";
// gallery-7 stays JPEG: the source is small and low-resolution, and WebP came
// out larger at every quality. See scripts/optimize-images.mjs.
import g7 from "@/assets/gallery-7.jpg";
import g8 from "@/assets/gallery-8.webp";

const images = [
  { src: g1, alt: "Men's skin fade haircut at Ali's Barber Shop in Pinellas Park, FL" },
  { src: g2, alt: "Precision beard trim and line-up at Ali's Barber Shop" },
  { src: g3, alt: "Classic taper fade — Ali's Barber Shop Pinellas Park" },
  { src: g4, alt: "Fresh haircut and beard shape at Ali's Barber Shop" },
  { src: g5, alt: "Low fade haircut St. Petersburg FL — Ali's Barber Shop" },
  { src: g6, alt: "Men's grooming and hair styling Pinellas Park barbershop" },
  { src: g7, alt: "Sharp line-up and edge-up at Ali's Barber Shop" },
  { src: g8, alt: "Skin fade and beard trim — Ali's Barber Shop Pinellas Park" },
];

const GallerySection = () => {
  return (
    <section id="gallery" className="py-24 section-padding bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="font-display text-secondary-foreground text-5xl md:text-7xl uppercase tracking-tight">
          Our Work
        </h2>
        <p className="font-body text-muted-foreground mt-4">
          A glimpse into the Ali's Barber Shop experience.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mt-12">
          {images.map(({ src, alt }, i) => (
            <div key={i} className="aspect-square overflow-hidden">
              <img
                src={src}
                alt={alt}
                width={800}
                height={800}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
