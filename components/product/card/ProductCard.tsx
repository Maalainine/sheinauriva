"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  IconPhoto,
  IconShirt,
  IconMicrophone,
  IconShoppingCart,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useState, useMemo, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import {
  TypographyP,
  TypographyLarge,
} from "@/components/ui/typography";

export type ProductCardProps = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  /**
   * Product images. Canonical schema is string[] (array of URLs),
   * but legacy consumers may provide { url, alt? }[].
   */
  images: string[] | { url: string; alt?: string }[];
  tags: { id: string; name: string }[];
  brand?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  } | null;
  hasVariants?: boolean;
  variantCount?: number;
  /**
   * Optionally, pass variants for stock/price calculation (admin use)
   */
  variants?: Array<{ price: number; stock: number }>;
};

const ProductCard = ({
  id,
  name,
  description,
  price: rawPrice,
  originalPrice,
  stock: rawStock,
  images,
  tags,
  brand,
  hasVariants = false,
  variantCount = 0,
  variants = [],
}: ProductCardProps) => {
  // Normalize images to { url: string, alt?: string }[] for consistent rendering
  const normalizedImages = useMemo(() => {
    if (!images || !Array.isArray(images)) return [];
    return images
      .map((img) => {
        if (typeof img === "string") {
          return { url: img, alt: "" };
        }
        return {
          url: img?.url || "",
          alt: img?.alt || "",
        };
      })
      .filter((img) => img.url); // Filter out any invalid entries
  }, [images]) as { url: string; alt?: string }[];

  // Stock: sum of variant stock if variants exist, else rawStock
  const stock =
    Array.isArray(variants) && variants.length > 0
      ? variants.reduce((sum, v) => sum + (v.stock || 0), 0)
      : rawStock;

  // Price: min variant price if variants exist, else rawPrice
  const price =
    Array.isArray(variants) && variants.length > 0
      ? Math.min(...variants.map((v) => v.price || 0))
      : rawPrice;

  // For legacy/compatibility, always show originalPrice if provided

  if (process.env.NODE_ENV !== "production") {
    console.log(`[ProductCard Debug] ${name}`, {
      id,
      hasVariants,
      variantCount,
      stock,
      images: images?.length || 0,
      tags: tags?.length || 0,
      brand: brand?.name || "none",
    });
  }

  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();
  // Check if product has a single variant (can add to cart directly)
  const hasSingleVariant = hasVariants && variantCount === 1;
  const hasMultipleVariants = hasVariants && variantCount > 1;

  // Check if device is touch-enabled
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device on component mount
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  if (process.env.NODE_ENV !== "production") {
    console.log(`[ProductCard Debug] ${name} - Variant State`, {
      hasSingleVariant,
      hasMultipleVariants,
      shouldShowBadge: hasSingleVariant || hasMultipleVariants,
    });
  }

  // Fallback icon component
  const IconFallback = useMemo(() => {
    const lower = name.toLowerCase();
    if (lower.includes("lip") || lower.includes("makeup"))
      return IconMicrophone;
    if (lower.includes("shirt")) return IconShirt;
    return IconPhoto;
  }, [name]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (stock <= 0) {
      toast.error(`Sorry, ${name} is out of stock`);
      return;
    }

    const mainImage = normalizedImages[0]?.url || "";
    addItem({
      id,
      name,
      price,
      image: mainImage,
      quantity: 1,
    });

    toast.success(`${name} added to cart`);
  };

  // Format price in MAD (assume not in cents)
  const formattedPrice = useMemo(() => {
    const safePrice = Number(price) || 0;
    const safeOriginalPrice = Number(originalPrice) || 0;
    const mainPrice = `${safePrice.toFixed(2)} MAD`;

    if (safeOriginalPrice > 0 && safeOriginalPrice > safePrice) {
      return (
        <span className="flex items-baseline gap-2">
          <span className="text-muted-foreground text-sm line-through">
            {safeOriginalPrice.toFixed(2)} MAD
          </span>
          <span className="text-foreground font-semibold">{mainPrice}</span>
        </span>
      );
    }
    return <span className="text-foreground font-semibold">{mainPrice}</span>;
  }, [price, originalPrice]);

  return (
    <Card className="aspect-6/10 gap-2 h-full flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-md group p-0">
      {/* Product Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {/* Sale badge */}
        {originalPrice && originalPrice > price && (
          <Badge variant="destructive" className="bg-red-500/90 text-white">
            Sale
          </Badge>
        )}
        {/* Variant badges */}
        {hasMultipleVariants ? (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm"
          >
            <span className="text-primary">{variantCount} Options</span>
          </Badge>
        ) : hasSingleVariant ? (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm"
          >
            <span className="text-primary">Single Option</span>
          </Badge>
        ) : null}
      </div>

      {/* Product Image Section */}
      <div className="relative aspect-square bg-muted/20 overflow-hidden">
        {!imgError && normalizedImages[0]?.url ? (
          <Image
            src={normalizedImages[0].url}
            alt={
              "alt" in normalizedImages[0] && normalizedImages[0].alt
                ? normalizedImages[0].alt
                : name
            }
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
            <IconFallback size={48} className="opacity-30" />
          </div>
        )}

        {/* Action Buttons - Always visible on mobile, hover on desktop */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent ${
            isTouchDevice || isHovered
              ? "opacity-100"
              : "opacity-0 md:group-hover:opacity-100"
          } transition-opacity duration-300 flex items-end p-4`}
          onMouseEnter={() => !isTouchDevice && setIsHovered(true)}
          onMouseLeave={() => !isTouchDevice && setIsHovered(false)}
          onClick={(e) => {
            // Prevent click from bubbling up to parent elements
            e.stopPropagation();
            if (isTouchDevice) {
              setIsHovered(!isHovered);
            }
          }}
        >
          <div className="w-full flex gap-2">
            {hasSingleVariant ? (
              // Show both buttons for single variant products
              <>
                <Button
                  variant="default"
                  size="sm"
                  className={`flex-1 transition-all duration-300 ${
                    isTouchDevice || isHovered
                      ? "translate-y-0"
                      : "translate-y-2 md:group-hover:translate-y-0"
                  } gap-2 h-9`}
                  onClick={handleAddToCart}
                  disabled={stock < 1}
                >
                  <IconShoppingCart className="h-4 w-4" />
                  <span className="whitespace-nowrap">
                    {stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </span>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className={`transition-all duration-300 ${
                    isTouchDevice || isHovered
                      ? "translate-y-0"
                      : "translate-y-2 md:group-hover:translate-y-0"
                  } h-9 px-3 flex-shrink-0`}
                >
                  <Link
                    href={`/products/${id}`}
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconInfoCircle className="h-4 w-4" />
                    <span>View Details</span>
                  </Link>
                </Button>
              </>
            ) : (
              // Show only view details button for products without variants or multiple variants
              <Button
                asChild
                variant="secondary"
                size="sm"
                className={`w-full transition-all duration-300 ${
                  isTouchDevice || isHovered
                    ? "translate-y-0"
                    : "translate-y-2 md:group-hover:translate-y-0"
                } h-9 px-3`}
              >
                <Link
                  href={`/products/${id}`}
                  className="flex items-center justify-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconInfoCircle className="h-4 w-4" />
                  <span>View Details</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Product Info Section */}
      <CardHeader className="px-4 flex justify-between">
        {/* Product Name and Brand logo */}
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-2 flex-1 min-w-0">
            <TypographyLarge>{name}</TypographyLarge>
          </CardTitle>
        </div>

        {/* Product Price and Brand name */}
        <div className="flex flex-col gap-1.5 w-full">
          {brand?.logoUrl && (
            <div className="pt-2 flex justify-end">
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
          )}

          <div className="flex justify-end">
            <TypographyP>{formattedPrice}</TypographyP>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col px-4 gap-2 pb-2">
        <CardDescription className="line-clamp-2">
          <TypographyP>
            {description?.split(/[.!?]+/)[0] || ""}
            {description?.match(/[.!?]/) ? "." : ""}
          </TypographyP>
        </CardDescription>

        {/* Spacer to push stock info to bottom */}
        <div className="flex gap-1">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  <TypographyP>{tag.name}</TypographyP>
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline">+{tags.length - 3}</Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Stock Status Footer */}
      <CardFooter className="border-t [.border-t]:p-4 w-full flex items-center justify-between">
        <span className="text-muted-foreground">
          {hasVariants ? "Availability" : "Stock"}
        </span>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              stock === 0 ? "destructive" : stock < 10 ? "default" : "secondary"
            }
            className={
              stock === 0
                ? "text-destructive-foreground"
                : stock < 10
                  ? "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900"
                  : "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900"
            }
          >
            {stock === 0 ? "Out of stock" : `${stock} available`}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
