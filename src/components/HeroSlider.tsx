"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const HERO_IMAGES = [
  "/assets/DSC08495.webp", // High res group/action
  "/assets/DSC08524.webp", // High res
  "/assets/DSC08451.webp", // High res
  "/assets/DSC08466.webp", // High res
];

export default function HeroSlider() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      {HERO_IMAGES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt={`Galacticos Hero ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-flyer-blue/90 via-flyer-blue/50 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-galacticos-dark via-transparent to-transparent opacity-90" />
        </div>
      ))}
    </div>
  );
}
