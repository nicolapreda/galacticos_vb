"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "@/lib/db";

export interface CartItem extends Product {
  quantity: number;
  size?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (productId: number, size?: string) => void;
  updateQuantity: (productId: number, delta: number, size?: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem("galacticos-cart", JSON.stringify(cart));
  }, [cart, isInitialized]);

  const addToCart = (product: Product, size?: string) => {
    if ((product.stock || 0) === 0) return;
    
    setCart((prev) => {
      // Find item with same ID AND same size
      const existing = prev.find((item) => item.id === product.id && item.size === size);
      
      if (existing) {
        // Check stock limit
        if (existing.quantity >= (product.stock || 0)) return prev;
        return prev.map((item) =>
          (item.id === product.id && item.size === size) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, size: size }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (productId: number, size?: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === productId && item.size === size)));
  };

  const updateQuantity = (productId: number, delta: number, size?: string) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === productId && item.size === size) {
          const newQty = item.quantity + delta;
          if (newQty < 1) return item;
          // Check stock limit if available
          if (item.stock && newQty > item.stock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
