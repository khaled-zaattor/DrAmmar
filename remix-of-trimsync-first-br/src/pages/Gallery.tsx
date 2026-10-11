import SiteLayout from "@/components/SiteLayout";
import { GALLERY } from "@/data/gallery";
import { BUSINESS } from "@/data/business";

const Gallery = () => (
  <SiteLayout
    title="Our Work"
    intro={
      <p>
        Real cuts from the chair at {BUSINESS.name} in {BUSINESS.address.city} —
        skin fades, taper fades, beard shaping and line-ups. Every photo is work
        done in this shop.
      </p>
    }
    trail={[
      { name: "Home", url: "/" },
      { name: "Gallery", url: "/gallery/" },
    ]}
  >
    <section className="py-20 section-padding bg-background">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY.map((img) => (
            <figure key={img.src} className="m-0">
              <img
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                loading="lazy"
                className="w-full aspect-square object-cover"
              />
              <figcaption className="font-body text-muted-foreground text-sm mt-3">
                {img.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap gap-6 font-body text-sm">
          <a href="/services/" className="text-accent hover:underline">
            See services and prices →
          </a>
          <a href="/#booking" className="text-accent hover:underline">
            Book an appointment →
          </a>
        </div>
      </div>
    </section>
  </SiteLayout>
);

export default Gallery;
