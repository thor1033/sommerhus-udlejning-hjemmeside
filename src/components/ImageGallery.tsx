"use client";
import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const images = [
  { src: "/1.jpg", width: 1280, height: 1920 }, // Portrait
  { src: "/2.jpg", width: 1920, height: 1280 }, // Landscape
  { src: "/3.jpg", width: 1920, height: 1080 }, // Landscape 16:9
  { src: "/4.jpg", width: 1080, height: 1350 }, // Portrait 4:5
  { src: "/5.jpg", width: 1920, height: 1280 }, // Landscape
  { src: "/6.jpg", width: 1200, height: 1200 }, // Square
  { src: "/7.jpg", width: 1280, height: 1920 }, // Portrait
  { src: "/8.jpg", width: 1920, height: 1080 }, // Landscape 16:9
  { src: "/9.jpg", width: 1080, height: 1350 }, // Portrait 4:5
  { src: "/10.jpg", width: 1920, height: 1280 }, // Landscape
  { src: "/11.jpg", width: 1206, height: 1280 }, // Landscape
];

const slides = images.map(({ src, width, height }) => ({
  src,
  width,
  height,
}));

export default function ImageGallery() {
  const [index, setIndex] = useState(-1);

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        {images.map(({ src, width, height }, i) => (
          // --- UPDATED CONTAINER DIV ---
          // 1. We move the shadows and rounding to this parent div.
          // 2. We add 'overflow-hidden' to clip the zooming image.
          // 3. We add a 'group' class for a more advanced hover effect.
          <div
            key={src}
            onClick={() => setIndex(i)}
            className="mb-4 break-inside-avoid cursor-pointer group
                       overflow-hidden rounded-lg shadow-md hover:shadow-xl 
                       transition-all duration-300 ease-in-out"
          >
            {/* --- UPDATED IMAGE COMPONENT --- */}
            {/* 1. We apply the scale transform on hover using 'group-hover:scale-105'.
                2. We remove the shadow and rounding from the image itself. */}
            <Image
              src={src}
              alt={`Gallery image ${i + 1}`}
              width={width}
              height={height}
              className="w-full h-auto transform 
                         group-hover:scale-105 transition-transform 
                         duration-300 ease-in-out"
            />
          </div>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
      />
    </>
  );
}
