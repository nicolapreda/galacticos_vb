"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, ShoppingBag, FileText, Menu, X } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import Image from "next/image";

export default function AdminNavbar({ signOutAction }: { signOutAction: () => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin/matches", label: "Match Comments", icon: FileText },
    { href: "/admin/shop", label: "Shop Drops", icon: ShoppingBag },
    { href: "/admin/orders", label: "Orders", icon: FileText },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-galacticos-dark border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo / Brand */}
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <Image 
                src="/assets/logo.webp" 
                alt="Logo" 
                fill 
                className="object-contain group-hover:scale-110 transition-transform" 
              />
            </div>
            <span className="font-black font-anton uppercase text-xl text-flyer-cyan tracking-wider">
              Admin Panel
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "flex items-center gap-2 font-bold uppercase tracking-wider text-sm transition-colors py-2 border-b-2 border-transparent",
                    isActive ? "text-flyer-cyan border-flyer-cyan" : "text-gray-400 hover:text-white hover:border-white/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User / Logout (Desktop) */}
          <div className="hidden md:flex items-center">
             <form action={signOutAction}>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300 rounded transition-colors font-bold uppercase tracking-wider text-sm">
                    <LogOut className="w-4 h-4" /> Esci
                </button>
             </form>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none p-2 hover:text-flyer-cyan transition-colors"
            >
              {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-black/95 border-b border-white/10 absolute top-20 left-0 right-0 p-4 flex flex-col space-y-4 shadow-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded font-bold uppercase tracking-wider text-sm transition-colors",
                  isActive ? "bg-flyer-cyan text-galacticos-dark" : "text-gray-300 hover:bg-white/10"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
          
          <div className="pt-4 border-t border-white/10">
              <form action={signOutAction}>
                <button className="flex items-center gap-3 w-full px-4 py-3 rounded bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors font-bold uppercase tracking-wider text-sm">
                    <LogOut className="w-5 h-5" /> Esci
                </button>
             </form>
          </div>
        </div>
      )}
    </nav>
  );
}
