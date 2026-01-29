"use client";

import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
