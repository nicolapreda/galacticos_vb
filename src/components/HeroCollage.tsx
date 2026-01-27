"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const COLLAGE_IMAGES = [
  "/assets/DSC08495.webp", // Main group shot
  "/assets/DSC08524.webp", // Intensity
  "/assets/DSC08437.webp", // Action
];

export default function HeroCollage() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      {/* Background Texture/Grime */}
      <div className="absolute inset-0 z-10 opacity-30 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: "url('/assets/pattern-dots.svg')", backgroundSize: "20px" }} />
      
      {/* Dark Overlay Base */}
      <div className="absolute inset-0 z-0 bg-galacticos-dark" />

      {/* Image 1: Main Background (Bleed) */}
      <div 
        className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity scale-110"
        style={{ transform: `translateY(${offsetY * 0.2}px)` }}
      >
        <Image
          src={COLLAGE_IMAGES[0]}
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Image 2: Rotated Overlay Left */}
      <div 
        className="absolute -bottom-20 -left-20 w-[60vw] h-[80vh] z-1 opacity-60 mix-blend-screen rotate-6 opacity-0 animate-fade-in-up md:opacity-60"
        style={{ animationDelay: "0.5s" }}
      >
         <Image
          src={COLLAGE_IMAGES[1]}
          alt="Overlay Left"
          fill
          className="object-cover grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-flyer-blue mix-blend-multiply" />
      </div>

       {/* Image 3: Rotated Overlay Right */}
       <div 
        className="absolute top-0 -right-20 w-[50vw] h-[70vh] z-1 opacity-60 mix-blend-screen -rotate-6 opacity-0 animate-fade-in-up md:opacity-60"
        style={{ animationDelay: "1s" }}
      >
         <Image
          src={COLLAGE_IMAGES[2]}
          alt="Overlay Right"
          fill
          className="object-cover grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-flyer-red mix-blend-multiply" />
      </div>

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 z-5 bg-gradient-to-t from-galacticos-dark via-galacticos-dark/50 to-transparent" />
      <div className="absolute inset-0 z-5 bg-gradient-to-r from-galacticos-dark via-transparent to-galacticos-dark/50" />
    </div>
  );
}
