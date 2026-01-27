"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const navLinks = [
    { href: "/news", label: "NEWS" },
    { href: "/roster", label: "SQUADRA" },
    { href: "/", label: "HOME", primary: true },
    { href: "/matches", label: "CALENDARIO" },
    { href: "/shop", label: "SHOP" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-galacticos-dark text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col items-center">
            {/* Top Row: Logo & Socials */}
            <div className="w-full flex justify-between items-center mb-4 relative h-20">
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsOpen(true)}
                  className="text-white focus:outline-none p-2"
                >
                  <Menu className="w-8 h-8" />
                </button>
              </div>

              {/* Logo (Absolute Center) */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <Link href="/" className="group">
                  <div className="relative w-20 h-20">
                    <Image
                      src="/assets/logo.webp"
                      alt="Galacticos Vele Blu Logo"
                      fill
                      className="object-contain group-hover:scale-110 transition-transform"
                      priority
                    />
                  </div>
                </Link>
              </div>

              {/* Social Icons (Right) - REMOVED as per request */}
              <div className="hidden md:flex space-x-3 items-center w-20">
                 {/* Placeholder to balance the logo if needed, or just empty */}
              </div>
              
              {/* Cart Icon for Mobile (Right aligned) */}
              <div className="md:hidden">
                  <Link href="/shop" className="text-white p-2">
                    <ShoppingBag className="w-6 h-6" />
                  </Link>
              </div>
            </div>

            {/* Bottom Row: Navigation Links (Desktop) */}
            <div className="hidden md:flex space-x-8 items-center justify-center w-full border-t border-gray-100 pt-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={clsx(
                    "font-anton text-lg uppercase tracking-wider transition-colors",
                    link.primary
                      ? "text-flyer-cyan hover:text-white"
                      : "hover:text-flyer-cyan",
                     pathname === link.href && !link.primary && "text-flyer-cyan"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* FULL SCREEN MOBILE OVERLAY */}
      <div
        className={clsx(
          "fixed inset-0 bg-gradient-to-br from-galacticos-dark via-[#001E45] to-galacticos-dark z-[9999] transition-all duration-500 flex flex-col items-center justify-center",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-white focus:outline-none hover:text-flyer-cyan transition-colors z-50"
        >
          <X className="w-10 h-10" />
        </button>

        {/* Menu Links - Centered and Large */}
        <div className="flex flex-col items-center justify-center space-y-8 px-6 w-full">
          <Link
            href="/news"
            className="text-white hover:text-flyer-cyan font-black font-anton uppercase tracking-widest text-4xl transition-all hover:scale-110 transform"
            onClick={() => setIsOpen(false)}
          >
            News
          </Link>
          <Link
            href="/roster"
            className="text-white hover:text-flyer-cyan font-black font-anton uppercase tracking-widest text-4xl transition-all hover:scale-110 transform"
            onClick={() => setIsOpen(false)}
          >
            Squadra
          </Link>
          <Link
            href="/"
            className="text-flyer-cyan hover:text-white font-black font-anton uppercase tracking-widest text-5xl transition-all hover:scale-110 transform"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/matches"
            className="text-white hover:text-flyer-cyan font-black font-anton uppercase tracking-widest text-4xl transition-all hover:scale-110 transform"
            onClick={() => setIsOpen(false)}
          >
            Calendario
          </Link>
          <Link
            href="/shop"
            className="text-white hover:text-flyer-cyan font-black font-anton uppercase tracking-widest text-4xl transition-all hover:scale-110 transform"
            onClick={() => setIsOpen(false)}
          >
            Shop
          </Link>
        </div>
      </div>
      
      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-[148px] md:h-[160px]"></div>
    </>
  );
}
