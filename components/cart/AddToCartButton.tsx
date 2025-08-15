"use client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
};

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  disabled?: boolean;
}

export default function AddToCartButton({ product, className, disabled }: AddToCartButtonProps) {
  const { addItem, cart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    console.log('[AddToCartButton] Clicked', product);
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image,
      quantity: 1,
    });
    // Log cart from context after addItem
    setTimeout(() => {
      console.log('[AddToCartButton] Cart from context after addItem:', cart);
      // Log cart from localStorage for debugging
      const stored = localStorage.getItem('cart');
      try {
        const parsed = stored ? JSON.parse(stored) : [];
        console.log('[AddToCartButton] Cart after addItem (localStorage):', parsed);
      } catch (e) {
        console.log('[AddToCartButton] Failed to parse cart:', e);
      }
    }, 200);
    toast.success(`${product.name} added to cart!`);
    setAdding(false);
  };

  return (
    <Button
      variant="default"
      size="lg"
      className={`w-full ${adding ? 'opacity-75' : ''} ${className || ''}`}
      onClick={handleAddToCart}
      disabled={disabled || !product.stock || adding}
    >
      {product.stock === 0 ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
