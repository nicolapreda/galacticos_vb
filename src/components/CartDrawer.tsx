"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, Trash2, CreditCard, MessageCircle, AlertTriangle, ShoppingBag } from "lucide-react";
import { clsx } from "clsx";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, total } = useCart();
  const [paymentStep, setPaymentStep] = useState<"cart" | "method">("cart");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWhatsAppCheckout = () => {
    const text = `Ciao! Vorrei ordinare:\n\n${cart
      .map((i) => `- ${i.name} ${i.size ? `(${i.size}) ` : ""}x${i.quantity} (€${(i.price * i.quantity).toFixed(2)})`)
      .join("\n")}\n\nTotale: €${total.toFixed(2)}`;
    
    // Replace with real number
    const url = `https://wa.me/message/NCECJOBKRIRDO1`; 
    window.open(url, "_blank");
    setCartOpen(false); // Optionally clear cart or keep it
  };

  const handleStripeCheckout = async () => {
      setLoading(true);
      setError(null);
      try {
          const response = await fetch("/api/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: cart }),
          });

          const { url, error: apiError } = await response.json();

          if (apiError) throw new Error(apiError);
          if (url) {
              window.location.href = url;
          } else {
              throw new Error("No checkout URL returned");
          }
      } catch (err: any) {
          console.error("Stripe Checkout Error:", err);
          setError(err.message || "Qualcosa è andato storto. Riprova o usa i contanti.");
          setLoading(false);
      }
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 z-[100] bg-black/50 transition-opacity duration-300",
        cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      onClick={() => setCartOpen(false)}
    >
      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-full md:w-[450px] bg-galacticos-dark shadow-2xl transform transition-transform duration-300 flex flex-col border-l border-white/10",
          cartOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center text-white bg-black/20">
          <h2 className="text-2xl font-anton uppercase">
            {paymentStep === "cart" ? "Il tuo carrello" : "Metodo di pagamento"}
          </h2>
          <button onClick={() => setCartOpen(false)}>
            <X className="w-6 h-6 hover:text-flyer-red transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 relative">
          
          {/* Payment Selection Step */}
          {paymentStep === "method" && (
              <div className="space-y-4 animate-fade-in">
                  <button 
                    onClick={() => setPaymentStep("cart")}
                    className="text-gray-400 hover:text-white mb-4 text-sm font-bold uppercase flex items-center gap-2"
                  >
                      ← Torna al carrello
                  </button>

                  <p className="text-gray-300 font-medium mb-6">Scegli come preferisci completare l'ordine:</p>
                  
                  {error && (
                      <div className="bg-red-500/10 border border-red-500/50 p-4 rounded text-red-500 text-sm mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          {error}
                      </div>
                  )}

                  <button 
                    onClick={handleWhatsAppCheckout}
                    className="w-full bg-[#25D366] hover:bg-[#1dbf57] text-white p-6 rounded-lg shadow-lg group transition-all transform hover:scale-[1.02] flex items-center justify-between"
                  >
                      <div className="flex items-center gap-4">
                          <MessageCircle className="w-8 h-8" />
                          <div className="text-left">
                              <span className="block font-black uppercase text-xl font-anton">Contanti / WhatsApp</span>
                              <span className="text-xs opacity-90 font-medium tracking-wide">Paga in contanti alla consegna</span>
                          </div>
                      </div>
                      <span className="text-2xl">→</span>
                  </button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-galacticos-dark text-sm text-gray-500 uppercase font-black tracking-widest">Oppure</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleStripeCheckout}
                    disabled={loading}
                    className="w-full bg-[#635BFF] hover:bg-[#534be0] text-white p-6 rounded-lg shadow-lg group transition-all transform hover:scale-[1.02] flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <div className="flex items-center gap-4">
                          <CreditCard className="w-8 h-8" />
                          <div className="text-left">
                              <span className="block font-black uppercase text-xl font-anton">Carta Online</span>
                              <span className="text-xs opacity-90 font-medium tracking-wide">Pagamento sicuro con Stripe</span>
                          </div>
                      </div>
                      {loading ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                          <span className="text-2xl">→</span>
                      )}
                  </button>
                  
                  <p className="text-center text-xs text-gray-500 mt-6">
                      Transazioni sicure e criptate. Nessun dato della carta viene salvato sui nostri server.
                  </p>
              </div>
          )}

          {/* Cart Items Step */}
          {paymentStep === "cart" && (
            <div className="space-y-6">
                {cart.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                    <ShoppingBag className="w-16 h-16 text-gray-600 mb-4 opacity-50" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest">Il carrello è vuoto</p>
                    <button 
                        onClick={() => setCartOpen(false)}
                        className="mt-6 text-flyer-cyan hover:underline uppercase text-sm font-bold"
                    >
                        Continua lo shopping
                    </button>
                </div>
                ) : (
                cart.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-4 group">
                    <div className="relative w-24 h-28 bg-gray-200 rounded-sm overflow-hidden flex-shrink-0 border border-white/5">
                        <Image
                        src={item.image || "/assets/shop-teaser.png"}
                        alt={item.name}
                        fill
                        className="object-cover mix-blend-multiply"
                        />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1">
                        <div>
                            <h4 className="font-black font-anton text-xl uppercase leading-none mb-1 text-white">{item.name}</h4>
                            {item.size && (
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                    Taglia: <span className="text-white">{item.size}</span>
                                </span>
                            )}
                            <p className="text-flyer-cyan font-bold text-base">
                            € {(item.price * item.quantity).toFixed(2)}
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-white/20 rounded bg-white/5">
                                <button 
                                    onClick={() => updateQuantity(item.id, -1, item.size)}
                                    className="p-2 hover:bg-white/10 transition-colors text-white"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-3 text-base font-bold min-w-[30px] text-center font-mono text-white">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.id, 1, item.size)}
                                    className="p-2 hover:bg-white/10 transition-colors text-white"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <button 
                                onClick={() => removeFromCart(item.id, item.size)}
                                className="text-gray-500 hover:text-flyer-red transition-colors p-1"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    </div>
                ))
                )}
            </div>
           )}
        </div>

        {/* Footer */}
        {cart.length > 0 && paymentStep === "cart" && (
          <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-md text-white">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-sm">Totale Ordine</span>
              <span className="text-3xl font-black font-anton text-flyer-cyan">€ {total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setPaymentStep("method")}
              className="w-full bg-white text-black font-black uppercase py-4 text-lg rounded hover:bg-flyer-cyan hover:text-white transition-all shadow-lg hover:shadow-flyer-cyan/20 flex items-center justify-center gap-2 group"
            >
              Procedi al Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
