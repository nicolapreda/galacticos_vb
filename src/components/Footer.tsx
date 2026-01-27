import Link from "next/link";
import Image from "next/image";
import { Instagram, MapPin, MessageCircle, Link as LinkIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 bg-black border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 items-center">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="relative w-16 h-16 mb-4">
              <Image
                src="/assets/logo.webp"
                alt="Galacticos Vele Blu Logo"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-1">
              Galacticos Vele Blu
            </h3>
            <p className="text-xs text-gray-400">ESTABLISHED AUGUST 2023</p>
          </div>

          {/* Socials */}
          <div className="text-center">
            <h4 className="font-bold mb-4 uppercase tracking-wider text-white border-b border-flyer-cyan pb-2 inline-block">
              Social
            </h4>
            <div className="flex space-x-4 justify-center flex-wrap gap-y-4">
              <a
                href="https://www.instagram.com/galacticos_veleblu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-galacticos-accent hover:text-galacticos-dark transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@galacticos_veleblu?lang=it-it"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-galacticos-accent hover:text-galacticos-dark transition-all"
                aria-label="TikTok"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-5 h-5"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
              <a
                href="https://chat.whatsapp.com/IguzRwQnQY7L33NiulbTVQ?fbclid=PAZXh0bgNhZW0CMTEAAaapel6qj2l9fgg-OzmUgGuclPxlB8Zmt4DB-ZN7ekXpN9yO5nwq4egRZvQ_aem_OUHqHbHpXJ7k-1w8eKaxjA"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://tr.ee/kc_DU4kBBR"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-galacticos-accent hover:text-galacticos-dark transition-all"
                aria-label="Linktree"
              >
                <LinkIcon className="w-5 h-5" />
              </a>
               <a
                href="https://www.google.it/maps/place/Caravella+Santa+Maria+Arena/@45.6568545,9.6119418,647m/data=!3m1!1e3!4m14!1m7!3m6!1s0x4781534beaf30603:0x8c7a2834d2b17537!2sCaravella+Santa+Maria+Arena!8m2!3d45.6568545!4d9.6119418!16s%2Fg%2F11vdnkj9_9!3m5!1s0x4781534beaf30603:0x8c7a2834d2b17537!8m2!3d45.6568545!4d9.6119418!16s%2Fg%2F11vdnkj9_9?entry=ttu&g_ep=EgoyMDI1MDMxMi4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                aria-label="Posizione"
              >
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="text-center md:text-right">
            <h4 className="font-bold mb-4 uppercase tracking-wider text-white border-b border-flyer-cyan pb-2 inline-block">
              Links
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/news" className="hover:text-white transition">
                  News
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/roster" className="hover:text-white transition">
                  Squadra
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 text-center text-xs text-gray-500 uppercase tracking-widest space-y-2">
          <p>©2026 Galacticos Vele Blu. All rights reserved.</p>
          <p className="text-gray-600">
            Developed with love ❤️ by{" "}
            <a 
              href="https://predanicola.it" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-flyer-cyan hover:text-white transition-colors underline"
            >
              Nicola Preda
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
