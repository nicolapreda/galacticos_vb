"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/db";
import { ShoppingBag, CheckCircle } from "lucide-react"; // Added CheckCircle
import { useCart } from "@/context/CartContext";

export default function ShopClient({ products, success }: { products: Product[], success?: boolean }) {
  const { cart, setCartOpen, addToCart, clearCart } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
      if (success) {
          clearCart();
          setShowSuccess(true);
          // Remove query params from URL without refresh to avoid re-triggering (optional but nice)
          window.history.replaceState({}, '', '/shop');
      }
  }, [success, clearCart]);

  return (
    <div className="bg-galacticos-dark min-h-screen pb-20 text-white relative">
      
      {/* SUCCESS MODAL */}
      {showSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-galacticos-dark border border-flyer-cyan/50 p-8 rounded-lg max-w-md w-full text-center shadow-2xl shadow-flyer-cyan/20 transform scale-100 animate-scale-in relative">
                  <div className="mx-auto w-20 h-20 bg-flyer-cyan/20 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-10 h-10 text-flyer-cyan" />
                  </div>
                  <h2 className="text-3xl font-black font-anton uppercase text-white mb-2">
                      Ordine Confermato!
                  </h2>
                  <p className="text-gray-300 mb-8">
                      Grazie per il tuo acquisto. Abbiamo ricevuto il tuo ordine e ti invieremo presto una conferma via email (se disponibile).
                  </p>
                  <button 
                      onClick={() => setShowSuccess(false)}
                      className="w-full bg-flyer-cyan text-white font-bold uppercase py-3 rounded hover:bg-white hover:text-flyer-cyan transition-colors"
                  >
                      Torna allo Shop
                  </button>
              </div>
          </div>
      )}

      {/* Header */}
      <header className="relative bg-galacticos-dark text-white pt-32 pb-12 px-6 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
             <Image
                src="/assets/DSC08524.webp" 
                alt="Shop Background"
                fill
                className="object-cover opacity-40 mix-blend-overlay"
                priority
             />
             <div className="absolute inset-0 bg-gradient-to-t from-galacticos-dark via-galacticos-dark/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-7xl md:text-9xl font-black mb-4 font-anton uppercase drop-shadow-lg leading-none tracking-wide">
            Official Shop
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl drop-shadow-md border-l-4 border-flyer-cyan pl-4">
            Indossa i colori della tua squadra. Merchandising ufficiale stagione 2025/2026.
          </p>
        </div>
      </header>

      {/* Filter Bar & Cart Trigger */}
      <div className="bg-galacticos-dark border-b border-white/10 sticky top-[80px] md:top-[89px] z-40 shadow-sm text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-flyer-cyan animate-pulse"></span>
             Latest Drops
          </span>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 font-bold uppercase hover:text-flyer-cyan relative transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden md:inline">Carrello</span>
              {cart.length > 0 && (
                <span className="bg-flyer-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center absolute -top-2 -right-2 font-bold">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link
              href={`/shop/${product.id}`}
              key={product.id}
              className="bg-[#0f141a] group cursor-pointer hover:bg-[#1a202c] transition-all duration-300 rounded-sm overflow-hidden flex flex-col shadow-lg block"
            >
              {/* Image - Studio Style (Uniform Background) */}
              <div className="aspect-[4/5] overflow-hidden bg-gray-200 relative p-0 flex items-center justify-center">
                
                {/* Simulated Studio Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-300" />

                <Image
                  src={product.image || "/assets/shop-teaser.png"}
                  alt={product.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
                />
                
                {/* Stock Badges */}
                {product.stock === 0 ? (
                   <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-black text-xl uppercase z-10 font-anton tracking-wider">
                     Sold Out
                   </span>
                ) : product.stock < 5 ? (
                   <span className="absolute top-2 right-2 bg-flyer-red text-white text-xs font-bold px-2 py-1 uppercase z-10 font-anton tracking-wider">
                     Pochi pezzi
                   </span>
                ) : null}
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow relative">
                <div className="flex justify-between items-start mb-2">
                     <h3 className="text-2xl font-black font-anton uppercase text-white leading-none pr-4">{product.name}</h3>
                     <span className="text-lg font-bold text-flyer-cyan shrink-0">
                        €{product.price.toFixed(2)}
                     </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-6 font-medium line-clamp-2 uppercase tracking-wide">
                  {product.description}
                </p>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  disabled={product.stock === 0}
                  className="w-full bg-white text-black font-black uppercase py-3 text-sm hover:bg-flyer-cyan hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto"
                >
                  <ShoppingBag className="w-4 h-4" /> Aggiungi
                </button>
                </div>
            </Link>
          ))}

          {/* Fallback if empty */}
          {products.length === 0 && (
             <div className="col-span-full text-center py-20">
                <h3 className="text-2xl font-bold text-gray-400 mb-4">Nessun prodotto disponibile</h3>
                <p className="text-gray-500">I nuovi drop arriveranno presto, o vai nel pannello admin per aggiungerli!</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
