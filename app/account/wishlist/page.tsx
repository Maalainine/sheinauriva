"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconHeart,
  IconHeartFilled,
  IconShoppingCart,
  IconX,
  IconLoader2,
  IconRefresh,
} from "@tabler/icons-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface WishlistProduct {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  images: string | null;
  category: {
    name: string;
  };
  brand?: {
    name: string;
  };
  status: boolean;
  onSale: boolean;
}

export default function WishlistPage() {
  const { t } = useTranslations();
  const { addToCart } = useCart();
  const { wishlist, removeFromWishlist } = useWishlist();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [addingToCartIds, setAddingToCartIds] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        const response = await fetch("/api/account/wishlist");
        if (!response.ok) {
          throw new Error("Failed to fetch wishlist");
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistProducts();
  }, []);

  const handleRemoveFromWishlist = async (productId: number) => {
    setRemovingIds((prev) => new Set(prev).add(productId));

    try {
      await removeFromWishlist(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    } finally {
      setRemovingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (product: WishlistProduct) => {
    setAddingToCartIds((prev) => new Set(prev).add(product.id));

    try {
      await addToCart({
        productId: product.id,
        productName: product.name,
        price: product.basePrice,
        quantity: 1,
        image: product.images?.split(",")[0] || "/images/placeholder.png",
      });

      // Optionally remove from wishlist after adding to cart
      // await handleRemoveFromWishlist(product.id);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCartIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <IconX className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t("common.error")}</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          <IconRefresh className="h-4 w-4 mr-2" />
          {t("common.tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t("account.wishlist.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("account.wishlist.subtitle", { count: products.length })}
        </p>
      </div>

      {/* Wishlist Products */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <IconHeart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {t("account.wishlist.empty")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("account.wishlist.emptyDesc")}
            </p>
            <Button asChild>
              <Link href="/products">{t("common.startShopping")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <Image
                    src={
                      product.images?.split(",")[0] || "/images/placeholder.png"
                    }
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Remove from wishlist button */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white"
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    disabled={removingIds.has(product.id)}
                  >
                    {removingIds.has(product.id) ? (
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <IconHeartFilled className="h-4 w-4 text-red-500" />
                    )}
                  </Button>

                  {/* Sale badge */}
                  {product.onSale && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {t("common.sale")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {product.brand?.name} • {product.category.name}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-primary">
                      {formatCurrency(product.basePrice)}
                    </div>
                    {!product.status && (
                      <span className="text-sm text-red-500 font-medium">
                        {t("common.outOfStock")}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleAddToCart(product)}
                      disabled={
                        !product.status || addingToCartIds.has(product.id)
                      }
                    >
                      {addingToCartIds.has(product.id) ? (
                        <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <IconShoppingCart className="h-4 w-4 mr-2" />
                      )}
                      {addingToCartIds.has(product.id)
                        ? t("common.adding")
                        : t("common.addToCart")}
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/products/${product.id}`}>
                        <IconX className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Wishlist Actions */}
      {products.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {t("account.wishlist.actions")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("account.wishlist.actionsDesc")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    products.forEach((product) => {
                      if (product.status) {
                        handleAddToCart(product);
                      }
                    });
                  }}
                >
                  {t("account.wishlist.addAllToCart")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm(t("account.wishlist.clearConfirm"))) {
                      products.forEach((product) => {
                        handleRemoveFromWishlist(product.id);
                      });
                    }
                  }}
                >
                  {t("account.wishlist.clearAll")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
