"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/db";
import { ShoppingBag, ArrowLeft, Plus, Minus, X, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { useCart } from "@/context/CartContext";

interface CartItem extends Product {
  quantity: number;
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { cart, setCartOpen, addToCart } = useCart();
  
  // We'll simulate a gallery by checking if it's the hoodie and we have the back image
  const images = [product.image];
  if (product.name.includes("Hoodie")) {
      images.push("/assets/drop1/hoodie_back.jpg");
  }

  const [mainImage, setMainImage] = useState(images[0]);
  const [selectedSize, setSelectedSize] = useState("M");

  return (
    <div className="bg-galacticos-dark min-h-screen text-white pt-32 pb-20">
      
      {/* Navigation */}
      <div className="container mx-auto px-6 mb-8 flex justify-between items-center">
          <Link href="/shop" className="text-gray-400 hover:text-white flex items-center gap-2 font-bold uppercase text-sm tracking-wider transition-colors">
              <ArrowLeft className="w-5 h-5" /> Back to Shop
          </Link>

          <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 font-bold uppercase hover:text-flyer-cyan relative transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              <span className="hidden md:inline">Carrello</span>
              {cart.length > 0 && (
                <span className="bg-flyer-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center absolute -top-2 -right-2 font-bold">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
      </div>

      <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              
              {/* Product Gallery */}
              <div className="space-y-4">
                  <div className="aspect-[4/5] relative bg-gray-200 overflow-hidden rounded-sm shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-300" />
                    <Image 
                        src={mainImage || "/assets/placeholder.webp"} 
                        alt={product.name}
                        fill
                        className="object-cover mix-blend-multiply"
                    />
                  </div>
                  {images.length > 1 && (
                      <div className="flex gap-4">
                          {images.map((img, idx) => (
                              <button 
                                key={idx} 
                                onClick={() => setMainImage(img || "")}
                                className={clsx(
                                    "w-24 h-24 relative border-2 transition-colors rounded-sm overflow-hidden bg-white",
                                    mainImage === img ? "border-flyer-cyan" : "border-transparent opacity-50 hover:opacity-100"
                                )}
                              >
                                  <Image src={img || ""} alt="" fill className="object-cover mix-blend-multiply" />
                              </button>
                          ))}
                      </div>
                  )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-center animate-fade-in-up">
                  <h1 className="text-5xl md:text-7xl font-black font-anton uppercase leading-[0.85] mb-4">
                      {product.name}
                  </h1>
                  <p className="text-3xl text-flyer-cyan font-bold mb-8">
                      € {product.price.toFixed(2)}
                  </p>

                  <div className="prose prose-invert prose-lg mb-10 text-gray-300 leading-relaxed font-light">
                      {product.description.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className={clsx(
                            "mb-4",
                            paragraph.startsWith("N.B.") && "text-flyer-red font-bold bg-flyer-red/10 p-4 border-l-4 border-flyer-red rounded-r",
                            paragraph.includes("scadenza") && "text-flyer-cyan font-bold"
                        )}>
                            {paragraph}
                        </p>
                      ))}
                      
                      <p className="mt-4 text-sm text-gray-500 uppercase tracking-widest font-bold">
                        Taglie disponibili: S - M - L - XL
                      </p>
                  </div>

                  <div className="flex gap-4 mb-8">
                      {/* Size Selector */}
                      <select 
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="bg-transparent border border-white/20 text-white px-6 py-4 font-bold uppercase focus:border-flyer-cyan focus:outline-none cursor-pointer"
                      >
                          <option className="bg-galacticos-dark" value="S">Taglia S</option>
                          <option className="bg-galacticos-dark" value="M">Taglia M</option>
                          <option className="bg-galacticos-dark" value="L">Taglia L</option>
                          <option className="bg-galacticos-dark" value="XL">Taglia XL</option>
                      </select>
                  </div>

                  <button
                    onClick={() => addToCart(product, selectedSize)}
                    disabled={(product.stock || 0) === 0}
                    className="w-full md:w-auto bg-white text-black font-black uppercase px-12 py-5 text-lg hover:bg-flyer-cyan hover:text-white transition-all skew-x-[-10deg] shadow-xl hover:shadow-flyer-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                     <ShoppingBag className="w-6 h-6 " />
                     <span className="skew-x-[10deg] inline-block">
                         {(product.stock || 0) === 0 ? "Sold Out" : "Aggiungi al Carrello"}
                     </span>
                  </button>

                  <p className="mt-6 text-xs text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Disponibilità Immediata
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
}
