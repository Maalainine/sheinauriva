"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  sku?: string;
  variantId?: string;
};

type CartContextType = {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    try {
      let parsed = stored ? JSON.parse(stored) : [];
      // Clean up legacy and malformed items
      parsed = Array.isArray(parsed)
        ? parsed
            .map((item: Partial<CartItem> & { productId?: string }) => {
              // Migrate legacy
              if (item.productId && !item.id) {
                item.id = item.productId;
              }
              // Coerce price to number if possible
              if (
                typeof item.price === "string" &&
                !isNaN(Number(item.price))
              ) {
                item.price = Number(item.price);
              }
              return item;
            })
            .filter(
              (item: Partial<CartItem>) =>
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                typeof item.price === "number" &&
                !isNaN(item.price),
            )
        : [];
      setCart(parsed);
    } catch {
      setCart([]);
    }
  }, []);

  // Persist to localStorage and dispatch custom event
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("[CartContext] cart state updated:", cart);

    // Dispatch a custom event when cart changes
    const event = new CustomEvent("cart-updated", {
      detail: { count: cart.reduce((sum, item) => sum + item.quantity, 0) },
    });
    window.dispatchEvent(event);
  }, [cart]);

  // Debug: log on every render
  useEffect(() => {
    console.log("[CartProvider] render, cart:", cart);
  });

  const addItem = (item: CartItem) => {
    setCart((prev) => {
      // Create a unique key based on both product ID and variant ID (if it exists)
      const existing = prev.find(
        (i) =>
          i.id === item.id &&
          (i.variantId === item.variantId || (!i.variantId && !item.variantId)),
      );

      if (existing) {
        // If the exact same product with the same variant exists, increase quantity
        return prev.map((i) =>
          i.id === item.id &&
          (i.variantId === item.variantId || (!i.variantId && !item.variantId))
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      // Otherwise, add as a new item
      return [...prev, item];
    });
  };

  const updateQuantity = (id: string, quantity: number, variantId?: string) => {
    setCart((prev) =>
      prev.map((i) =>
        i.id === id &&
        (i.variantId === variantId || (!i.variantId && !variantId))
          ? { ...i, quantity }
          : i,
      ),
    );
  };

  const removeItem = (id: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter(
        (i) =>
          !(
            i.id === id &&
            (i.variantId === variantId || (!i.variantId && !variantId))
          ),
      ),
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addItem, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
