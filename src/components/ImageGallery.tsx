"use client";
import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import img1 from "../../public/img1.jpg";
import img2 from "../../public/img2.jpg";
import img3 from "../../public/img3.jpg";
import img4 from "../../public/img4.jpg";
import img5 from "../../public/img5.jpg";
import img6 from "../../public/img6.jpg";
import img7 from "../../public/img7.jpg";
import img8 from "../../public/img8.jpg";
import img9 from "../../public/img9.jpg";
import img10 from "../../public/img10.jpg";
import img11 from "../../public/img11.jpg"

const images: { src: StaticImageData; alt: string }[] = [
  { src: img1, alt: "Gallery image 1" },
  { src: img2, alt: "Gallery image 2" },
  { src: img3, alt: "Gallery image 3" },
  { src: img4, alt: "Gallery image 4" },
  { src: img5, alt: "Gallery image 5" },
  { src: img6, alt: "Gallery image 6" },
  { src: img7, alt: "Gallery image 7" },
  { src: img8, alt: "Gallery image 8" },
  { src: img9, alt: "Gallery image 9" },
  { src: img10, alt: "Gallery image 10" },
  { src: img11, alt: "Gallery image 11" },
];

const slides = images.map(({ src }) => ({
  src: src.src, 
  width: src.width,
  height: src.height,
  alt: "Photo",
}));

export default function ImageGallery() {
  const [index, setIndex] = useState(-1);

  const sizes =
    "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw";

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        {images.map(({ src, alt }, i) => (
          <button
            key={src.src}
            onClick={() => setIndex(i)}
            className="mb-4 break-inside-avoid cursor-pointer group
                       overflow-hidden rounded-lg shadow-md hover:shadow-xl 
                       transition-all duration-300 ease-in-out"
            aria-label={`Open image ${i + 1}`}
          >
            <Image
              src={src}
              alt={alt}
              // Next has exact width/height from static import; prevents CLS
              // Serve smaller files per column via `sizes`
              sizes={sizes}
              // Make top-of-page tiles eager/priority (tweak the count to taste)
              priority={i < 4}
              fetchPriority={i < 4 ? "high" : "auto"}
              // Nice LQ placeholder from the static import
              placeholder="blur"
              // Speed over pristine: 60–70 is usually plenty
              quality={70}
              // Non-priority images decode off the main path
              decoding={i < 4 ? "auto" : "async"}
              className="w-full h-auto transform 
                         group-hover:scale-105 transition-transform 
                         duration-300 ease-in-out"
            />
          </button>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        // 🚫 Don’t preload neighbors on mobile (saves bandwidth & memory)
        carousel={{ preload: 0 }}
        // Optional: disable zoom wheel to avoid accidental huge downloads
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  );
}
