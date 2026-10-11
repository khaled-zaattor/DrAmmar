import { GALLERY } from "@/data/gallery";

const GallerySection = () => {
  return (
    <section id="gallery" className="py-24 section-padding bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="font-display text-secondary-foreground text-5xl md:text-7xl uppercase tracking-tight">
          Our Work
        </h2>
        <p className="font-body text-muted-foreground mt-4">
          Real cuts from the chair at Ali's Barber Shop in Pinellas Park — fades,
          beard work and line-ups.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mt-12">
          {GALLERY.map(({ src, alt, caption, width, height }) => (
            <figure key={src} className="m-0">
              <div className="aspect-square overflow-hidden">
                <img
                  src={src}
                  alt={alt}
                  width={width}
                  height={height}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <figcaption className="font-body text-muted-foreground text-xs mt-2 px-1">
                {caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
