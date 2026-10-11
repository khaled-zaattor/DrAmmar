// Lifted out of GallerySection.tsx so the gallery page, the homepage and the
// ImageObject schema all render from one array.
//
// The alt text here was already well written — descriptive, specific, and
// naturally mentioning the service and the city without keyword stuffing. Two
// things were added: real intrinsic dimensions (the grid is aspect-square with
// object-cover, but width/height still helps the browser reserve space), and a
// visible caption, which gives Google Images and AI answer engines far more
// context than an alt attribute alone.

export interface GalleryImage {
  src: string;
  alt: string;
  /** Rendered visibly under the image on /gallery/. */
  caption: string;
  width: number;
  height: number;
}

export const GALLERY: GalleryImage[] = [
  {
    src: "/images/gallery-1.jpg",
    alt: "Men's skin fade haircut at Ali's Barber Shop in Pinellas Park, FL",
    caption: "Skin fade — Men's Haircut, $30",
    width: 275,
    height: 183,
  },
  {
    src: "/images/gallery-2.jpg",
    alt: "Precision beard trim and line-up at Ali's Barber Shop",
    caption: "Beard line-up with razor finish — Beard Line Up & Shave, $20",
    width: 800,
    height: 533,
  },
  {
    src: "/images/gallery-3.jpg",
    alt: "Classic taper fade — Ali's Barber Shop Pinellas Park",
    caption: "Classic taper fade — Men's Haircut, $30",
    width: 800,
    height: 1200,
  },
  {
    src: "/images/gallery-4.jpg",
    alt: "Fresh haircut and beard shape at Ali's Barber Shop",
    caption: "Fade blended into the beard — Haircut & Beard, $45",
    width: 480,
    height: 480,
  },
  {
    src: "/images/gallery-5.jpg",
    alt: "Low fade haircut St. Petersburg FL — Ali's Barber Shop",
    caption: "Low fade — Men's Haircut, $30",
    width: 2560,
    height: 1707,
  },
  {
    src: "/images/gallery-6.jpg",
    alt: "Men's grooming and hair styling Pinellas Park barbershop",
    caption: "Scissor work and finish styling — Men's Haircut, $30",
    width: 800,
    height: 533,
  },
  {
    src: "/images/gallery-7.jpg",
    alt: "Sharp line-up and edge-up at Ali's Barber Shop",
    caption: "Perimeter edge-up — Full Edge, $20",
    width: 1000,
    height: 667,
  },
  {
    src: "/images/gallery-8.jpg",
    alt: "Skin fade and beard trim — Ali's Barber Shop Pinellas Park",
    caption: "Skin fade with beard shaped to match — Haircut & Beard, $45",
    width: 800,
    height: 1200,
  },
];
