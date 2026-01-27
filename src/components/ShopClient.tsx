"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/lib/db";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import { clsx } from "clsx";

interface CartItem extends Product {
  quantity: number;
}

export default function ShopClient({ products }: { products: Product[] }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("galacticos-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("galacticos-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    if (product.stock === 0) return;
    
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        // Check stock limit
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty < 1) return item;
          // Check stock
          const product = products.find((p) => p.id === productId);
          if (product && newQty > product.stock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    const text = `Ciao! Vorrei ordinare:\n\n${cart
      .map((i) => `- ${i.name} x${i.quantity} (€${(i.price * i.quantity).toFixed(2)})`)
      .join("\n")}\n\nTotale: €${total.toFixed(2)}`;
    
    const url = `https://wa.me/393331234567?text=${encodeURIComponent(text)}`; // Replace with real number
    window.open(url, "_blank");
  };

  return (
    <div className="bg-galacticos-dark min-h-screen pb-20 text-white">
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
          <h1 className="text-6xl md:text-8xl font-black mb-4 font-anton uppercase drop-shadow-lg">
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
          <span className="font-bold text-sm uppercase tracking-wider">
            {products.length} Prodotti
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
            <div
              key={product.id}
              className="bg-white/5 border border-white/10 group cursor-pointer hover:bg-white/10 transition-all duration-300 rounded-lg overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden bg-white relative p-4 flex items-center justify-center">
                <Image
                  src={product.image || "/assets/shop-teaser.png"}
                  alt={product.name}
                  fill
                  className="object-contain object-center group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Stock Badges */}
                {product.stock === 0 ? (
                   <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-black text-xl uppercase z-10">
                     Sold Out
                   </span>
                ) : product.stock < 5 ? (
                   <span className="absolute top-2 right-2 bg-flyer-red text-white text-xs font-bold px-2 py-1 uppercase z-10">
                     Pochi pezzi
                   </span>
                ) : null}
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-1 line-clamp-1 text-white">{product.name}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-grow">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-lg font-black text-flyer-cyan">
                    € {product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="bg-white text-galacticos-dark p-2 rounded-full hover:bg-flyer-cyan hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Fallback if empty */}
          {products.length === 0 && (
             <div className="col-span-full text-center py-20">
                <h3 className="text-2xl font-bold text-gray-400 mb-4">Nessun prodotto disponibile</h3>
                <p className="text-gray-500">Torna a trovarci presto per i nuovi arrivi!</p>
             </div>
          )}
        </div>
      </main>

      {/* Cart Drawer */}
      <div
        className={clsx(
          "fixed inset-0 z-[100] bg-black/50 transition-opacity duration-300",
          cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setCartOpen(false)}
      >
        <div
          className={clsx(
            "fixed top-0 right-0 h-full w-full md:w-[400px] bg-galacticos-dark shadow-2xl transform transition-transform duration-300 flex flex-col border-l border-white/10",
            cartOpen ? "translate-x-0" : "translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cart Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center text-white">
            <h2 className="text-2xl font-anton uppercase">Il tuo carrello</h2>
            <button onClick={() => setCartOpen(false)}>
              <X className="w-6 h-6 hover:text-flyer-red" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <p className="text-center text-gray-400">Il carrello è vuoto.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 bg-white rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image || "/assets/shop-teaser.png"}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-sm mb-1 text-white">{item.name}</h4>
                    <p className="text-flyer-cyan font-bold text-sm">
                      € {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-white">
                       <div className="flex items-center border border-white/20 rounded">
                          <button 
                             onClick={() => updateQuantity(item.id, -1)}
                             className="p-1 hover:bg-white/10"
                          >
                             <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-2 text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                          <button 
                             onClick={() => updateQuantity(item.id, 1)}
                             className="p-1 hover:bg-white/10"
                          >
                             <Plus className="w-4 h-4" />
                          </button>
                       </div>
                       <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-flyer-red"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-6 border-t border-white/10 bg-black/20 text-white">
            <div className="flex justify-between items-center mb-4 text-xl font-black uppercase">
              <span>Totale</span>
              <span>€ {total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-flyer-cyan text-galacticos-dark font-black uppercase py-4 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Procedi all'ordine
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">
               L'ordine verrà inviato via WhatsApp per la conferma della disponibilità.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
