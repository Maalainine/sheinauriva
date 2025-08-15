"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import { toast } from "sonner";
import Image from "next/image";

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const validCart = (cart || []).filter(item => typeof item.price === "number" && !isNaN(item.price) && typeof item.name === "string");

  // Loading state
  if (cart === undefined) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Skeleton className="h-10 w-1/3 mb-6 rounded" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <TypographyH1 className="mb-6 text-2xl">Your Cart</TypographyH1>
      {validCart.length > 0 && (
        <Button
          variant="destructive"
          className="mb-6"
          onClick={() => {
            if (window.confirm("Clear all items from cart?")) {
              clearCart();
              toast.success("Cart cleared.");
            }
          }}
        >
          Clear Cart
        </Button>
      )}
      {validCart.length === 0 ? (
        <EmptyState message="Your cart is empty." />
      ) : (
        <div className="space-y-6">
          {validCart.map(item => {
            const price = item.price;
            const quantity = typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1;
            return (
              <Card key={item.id} className="flex flex-row items-center gap-4 border-b pb-4 rounded-xl">
                <div className="w-16 h-16 flex items-center justify-center">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="object-cover rounded"
                      style={{ background: "var(--muted)" }}
                    />
                  ) : (
                    <Skeleton className="w-16 h-16 rounded" />
                  )}
                </div>
                <CardContent className="flex-1 p-0">
                  <div className="font-semibold text-lg truncate">{item.name}</div>
                  <div className="text-muted-foreground">${price.toFixed(2)}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <label htmlFor={`qty-${item.id}`} className="text-sm">Qty:</label>
                    <input
                      id={`qty-${item.id}`}
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={e => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="w-16 border rounded px-2 py-1 bg-background"
                      aria-label={`Quantity for ${item.name}`}
                    />
                  </div>
                </CardContent>
                <Button
                  variant="outline"
                  className="text-destructive ml-4"
                  onClick={() => {
                    removeItem(item.id);
                    toast.success("Item removed from cart.");
                  }}
                  aria-label={`Remove ${item.name}`}
                >
                  Remove
                </Button>
              </Card>
            );
          })}
          <div className="flex justify-between items-center mt-6">
            <div className="font-bold text-lg">
              Total: ${validCart.reduce((sum, item) => sum + item.price * (typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1), 0).toFixed(2)}
            </div>
            <Button asChild className="px-6 py-2">
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

