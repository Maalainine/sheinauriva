"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getClothingColorHex } from "@/lib/clothingColors";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import {
  IconShoppingCart,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconStar,
  IconHeart,
  IconTruck,
  IconShield,
  IconRotate,
  IconZoomIn,
  IconX,
  IconAlertCircle,
  IconChevronDown,
  IconMinus as IconMinusCircle,
  IconPlus as IconPlusCircle,
  IconEye,
  IconUsers,
  IconClock,
  IconAward,
} from "@tabler/icons-react";

// Utility function to normalize image input to a consistent format
const normalizeImage = (
  image: string | { id?: string; url: string; alt?: string }
): { id: string; url: string; alt?: string } => {
  if (typeof image === "string") {
    return {
      id: `img-${Math.random().toString(36).substr(2, 9)}`,
      url: image,
      alt: "",
    };
  }
  return {
    id: image.id || `img-${Math.random().toString(36).substr(2, 9)}`,
    url: image.url,
    alt: image.alt || "",
  };
};

// Utility function to validate image URLs
const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url || typeof url !== "string" || url.trim() === "") return false;

  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];
  if (!imageExtensions.some((ext) => url.toLowerCase().endsWith(ext)))
    return false;

  try {
    const parsedUrl = new URL(url, window.location.origin);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return url.startsWith("/") || url.startsWith("./") || url.startsWith("../");
  }
};

type ProductImage = { id: string; url: string; alt?: string };
type Tag = { id: string; name: string };
type Category = { id: string; name: string };
type Brand = { id: string; name: string };

type VariantValue = {
  id: string;
  value: string;
  displayName?: string | null;
  variantType: { id: string; name: string };
};

type ProductVariant = {
  id: string;
  sku?: string | null;
  price: number;
  stock: number;
  values?: VariantValue[];
  selections?: Array<{
    option: {
      id: string;
      value: string;
      variantType: {
        id: string;
        name: string;
      };
    };
  }>;
};

type VariantType = {
  id: string;
  name: string;
  values: Array<{ id: string; value: string; displayName?: string | null }>;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  images: ProductImage[];
  tags: Tag[];
  category?: Category;
  brand?: Brand | null;
  variants: ProductVariant[];
  variantTypes: VariantType[];
  weight?: string;
  dimensions?: string;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
};

type RelatedProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  slug: string;
};

// Full screen image modal
const ImageZoomModal = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
}: {
  isOpen: boolean;
  onClose: () => void;
  images: ProductImage[];
  currentIndex: number;
  onNavigate: (direction: "prev" | "next") => void;
}) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  useEffect(() => {
    setImageLoadError(false);
  }, [currentIndex]);

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex];
  const hasValidImage =
    currentImage?.url && isValidImageUrl(currentImage.url) && !imageLoadError;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative max-w-7xl max-h-[95vh] w-full">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 h-12 w-12"
          onClick={onClose}
          aria-label="Close zoom"
        >
          <IconX className="h-6 w-6" />
        </Button>

        <div className="relative w-full h-[90vh] bg-black/50 flex items-center justify-center rounded-xl overflow-hidden">
          {hasValidImage ? (
            <Image
              src={currentImage.url}
              alt={currentImage.alt || "Product image"}
              fill
              className="object-contain"
              priority
              onError={() => setImageLoadError(true)}
              unoptimized={process.env.NODE_ENV === "development"}
            />
          ) : (
            <div className="text-center p-8 text-white">
              <IconAlertCircle className="h-16 w-16 mx-auto mb-4 text-white/50" />
              <p className="text-lg">Image unavailable</p>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate("prev");
              }}
              aria-label="Previous image"
            >
              <IconChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate("next");
              }}
              aria-label="Next image"
            >
              <IconChevronRight className="h-8 w-8" />
            </Button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Stock Status Component
const StockStatus = ({
  stock,
  variant,
}: {
  stock: number;
  variant: ProductVariant | null;
}) => {
  const currentStock = variant?.stock || stock;

  if (currentStock === 0)
    return (
      <div className="flex items-center gap-2 text-destructive">
        <IconAlertCircle className="h-4 w-4" />
        <span className="font-medium">Out of Stock</span>
      </div>
    );

  if (currentStock < 10)
    return (
      <div className="flex items-center gap-2 text-orange-600">
        <IconClock className="h-4 w-4" />
        <span className="font-medium">Only {currentStock} left</span>
      </div>
    );

  return (
    <div className="flex items-center gap-2 text-green-600">
      <IconCheck className="h-4 w-4" />
      <span className="font-medium">In Stock ({currentStock} available)</span>
    </div>
  );
};

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(
    new Set()
  );
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const normalizedImages = useMemo(() => {
    if (!Array.isArray(product.images)) return [];
    return product.images
      .map((img) => normalizeImage(img))
      .filter((img) => img.url);
  }, [product.images]);

  const hasValidVariantValues = (variant: ProductVariant) =>
    Array.isArray(variant.values) && variant.values.length > 0;

  const isOptionAvailable = useCallback(
    (variantTypeId: string, optionId: string) => {
      if (!Array.isArray(product.variants) || product.variants.length === 0) {
        return true;
      }
      if (selectedOptions[variantTypeId] === optionId) {
        return true;
      }

      const hypotheticalOptions = {
        ...selectedOptions,
        [variantTypeId]: optionId,
      };

      if (Object.keys(hypotheticalOptions).length === 1) {
        return product.variants.some((variant) => {
          if (variant.stock <= 0 || !hasValidVariantValues(variant))
            return false;
          return variant.values!.some(
            (v) => v.variantType.id === variantTypeId && v.id === optionId
          );
        });
      }

      const available = product.variants.some((variant) => {
        if (variant.stock <= 0 || !hasValidVariantValues(variant)) return false;

        const variantMatches = Object.entries(hypotheticalOptions).every(
          ([typeId, valueId]) => {
            return variant.values!.some(
              (v) => v.variantType.id === typeId && v.id === valueId
            );
          }
        );

        return variantMatches;
      });

      return available;
    },
    [selectedOptions, product.variants]
  );

  // Initialize default variant and options
  useEffect(() => {
    if (!Array.isArray(product.variants) || product.variants.length === 0) {
      setSelectedVariant(null);
      setSelectedOptions({});
      return;
    }

    setSelectedVariant(null);
    setSelectedOptions({});
  }, [product.variants, product.id, product.variantTypes]);

  useEffect(() => {
    if (!product.tags?.length) return;
    fetch(
      `/api/public/products/related?tags=${product.tags.map((t) => t.id).join(",")}&exclude=${product.id}&limit=6`
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRelatedProducts(data))
      .catch(console.error);
  }, [product.id, product.tags]);

  const handleOptionChange = (typeId: string, optionId: string) => {
    if (selectedOptions[typeId] === optionId) {
      const newOptions = { ...selectedOptions };
      delete newOptions[typeId];
      setSelectedOptions(newOptions);
      setSelectedVariant(null);
      return;
    }

    const newOptions = { ...selectedOptions, [typeId]: optionId };
    setSelectedOptions(newOptions);

    const totalVariantTypes = product.variantTypes?.length || 0;
    const selectedCount = Object.keys(newOptions).length;

    if (selectedCount === totalVariantTypes) {
      const matchingVariant = product.variants.find((variant) => {
        if (variant.stock <= 0 || !hasValidVariantValues(variant)) return false;

        const variantOptionMap = variant.values!.reduce(
          (acc, v) => {
            acc[v.variantType.id] = v.id;
            return acc;
          },
          {} as Record<string, string>
        );

        const isExactMatch =
          Object.entries(newOptions).every(
            ([vTypeId, vOptionId]) => variantOptionMap[vTypeId] === vOptionId
          ) &&
          Object.keys(variantOptionMap).length ===
            Object.keys(newOptions).length;

        return isExactMatch;
      });

      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
        if (quantity > matchingVariant.stock) {
          setQuantity(Math.max(1, matchingVariant.stock));
        }
      } else {
        setSelectedVariant(null);
      }
    } else {
      setSelectedVariant(null);
    }
  };

  const handleQuantityChange = (val: number) => {
    const maxStock = selectedVariant?.stock || product.stock;
    if (val < 1 || val > maxStock) return;
    setQuantity(val);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.stock < 1) return;

    setIsAddingToCart(true);
    try {
      const variantDescription = getVariantName();

      const itemName = variantDescription
        ? `${product.name} (${variantDescription})`
        : product.name;

      await addItem({
        id: selectedVariant.id,
        name: itemName,
        price: selectedVariant.price,
        quantity,
        image: product.images[0]?.url || "",
        sku: selectedVariant.sku || product.sku,
        variantId: selectedVariant.id,
      });

      toast.success(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const navigateImage = useCallback(
    (dir: "prev" | "next") => {
      if (normalizedImages.length <= 1) return;
      setCurrentImageIndex((i) =>
        dir === "prev"
          ? i === 0
            ? normalizedImages.length - 1
            : i - 1
          : i === normalizedImages.length - 1
            ? 0
            : i + 1
      );
    },
    [normalizedImages]
  );

  const handleImageError = (id: string) =>
    setImageLoadErrors((s) => new Set(s).add(id));
  const getCurrentPrice = () => selectedVariant?.price ?? product.price;
  const getVariantName = () => {
    if (
      !selectedVariant ||
      !selectedVariant.values ||
      !Array.isArray(selectedVariant.values)
    )
      return "";

    return (
      selectedVariant.values
        .map((v) => v?.displayName || v?.value)
        .filter(Boolean)
        .join(" / ") || ""
    );
  };
  const isOnSale =
    product.originalPrice && product.originalPrice > getCurrentPrice();

  const hasOriginalPrice =
    product.originalPrice && product.originalPrice > getCurrentPrice();
  const originalPrice = product.originalPrice || 0;
  const currentStock = selectedVariant?.stock || product.stock;
  const canAddToCart =
    currentStock > 0 &&
    (!product.variants || product.variants.length === 0 || selectedVariant);
  const currentImage =
    normalizedImages[currentImageIndex] || normalizedImages[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link
              href="/"
              className="hover:text-primary transition-colors font-medium"
            >
              Home
            </Link>
            <IconChevronRight className="h-4 w-4" />
            {product.category && (
              <>
                <Link
                  href={`/categories/${product.category.id}`}
                  className="hover:text-primary transition-colors font-medium"
                >
                  {product.category.name}
                </Link>
                <IconChevronRight className="h-4 w-4" />
              </>
            )}
            <span className="text-foreground font-semibold truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Product Section - Improved Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Image Gallery - Left Side */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="space-y-4">
              {/* Main Image Display - Adaptive Aspect Ratio */}
              <div className="relative">
                <Card className="overflow-hidden border-0 shadow-lg bg-white">
                  <div className="relative min-h-[400px] md:min-h-[500px] lg:min-h-[600px] xl:min-h-[700px] group">
                    {currentImage ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={currentImage.url}
                          alt={
                            currentImage.alt || product.name || "Product image"
                          }
                          fill
                          className={cn(
                            "object-contain bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-500 group-hover:scale-[1.02]",
                            imageLoadErrors.has(currentImage.id) && "hidden"
                          )}
                          priority
                          onError={() => handleImageError(currentImage.id)}
                          unoptimized={process.env.NODE_ENV === "development"}
                        />

                        {/* Floating Action Buttons */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                            onClick={() => setIsImageZoomed(true)}
                          >
                            <IconZoomIn className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                            onClick={() => setIsWishlisted(!isWishlisted)}
                          >
                            <IconHeart
                              className={cn(
                                "h-4 w-4",
                                isWishlisted && "fill-red-500 text-red-500"
                              )}
                            />
                          </Button>
                        </div>

                        {/* Navigation Arrows */}
                        {normalizedImages.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                              onClick={() => navigateImage("prev")}
                            >
                              <IconChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                              onClick={() => navigateImage("next")}
                            >
                              <IconChevronRight className="h-5 w-5" />
                            </Button>
                          </>
                        )}

                        {imageLoadErrors.has(currentImage.id) && (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <div className="text-center">
                              <IconAlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">
                                Image not available
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <div className="text-center">
                          <IconAlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No image available
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Thumbnail Gallery - Horizontal Scroll */}
              {normalizedImages.length > 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">
                      {currentImageIndex + 1} of {normalizedImages.length}{" "}
                      images
                    </span>
                    <div className="flex gap-1">
                      {normalizedImages.slice(0, 5).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all duration-200",
                            currentImageIndex === index
                              ? "bg-primary scale-125"
                              : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                          )}
                        />
                      ))}
                      {normalizedImages.length > 5 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          +{normalizedImages.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {normalizedImages.map((image, index) => (
                      <Button
                        key={image.id}
                        variant="ghost"
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "relative flex-shrink-0 w-20 h-20 p-0 rounded-lg overflow-hidden transition-all duration-200",
                          currentImageIndex === index
                            ? "ring-2 ring-primary shadow-md scale-105"
                            : "ring-1 ring-border/30 hover:ring-primary/50 hover:scale-105",
                          imageLoadErrors.has(image.id) && "opacity-50"
                        )}
                      >
                        <Image
                          src={image.url}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          onError={() => handleImageError(image.id)}
                        />
                        {currentImageIndex === index && (
                          <div className="absolute inset-0 bg-primary/10 rounded-lg" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Information - Right Side */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="sticky top-8 space-y-6">
              {/* Product Header */}
              <div className="space-y-4">
                {/* Brand & Category - Compact */}
                {(product.brand || product.category) && (
                  <div className="flex items-center gap-2 text-sm">
                    {product.brand && (
                      <Badge variant="outline" className="text-xs font-medium">
                        {product.brand.name}
                      </Badge>
                    )}
                    {product.category && (
                      <span className="text-muted-foreground">•</span>
                    )}
                    {product.category && (
                      <Link
                        href={`/categories/${product.category.id}`}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                      >
                        {product.category.name}
                      </Link>
                    )}
                  </div>
                )}

                {/* Title & Variant */}
                <div>
                  <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
                    {product.name}
                  </h1>
                  {selectedVariant && getVariantName() && (
                    <p className="text-lg text-muted-foreground mt-2">
                      {getVariantName()}
                    </p>
                  )}
                </div>

                {/* Rating & Reviews - Inline */}
                {product.rating !== undefined &&
                  product.reviewCount !== undefined && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <IconStar
                            key={star}
                            className={cn(
                              "h-4 w-4",
                              star <= Math.round(product.rating || 0)
                                ? "text-yellow-500 fill-current"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {product.rating?.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewCount} reviews)
                      </span>
                    </div>
                  )}

                {/* Price - Prominent */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl lg:text-4xl font-bold text-primary">
                      {formatCurrency(getCurrentPrice())}
                    </span>
                    {isOnSale && (
                      <>
                        <span className="text-xl text-muted-foreground line-through">
                          {formatCurrency(product.originalPrice!)}
                        </span>
                        <Badge
                          variant="destructive"
                          className="text-sm font-semibold"
                        >
                          {Math.round(
                            ((product.originalPrice! - getCurrentPrice()) /
                              product.originalPrice!) *
                              100
                          )}
                          % OFF
                        </Badge>
                      </>
                    )}
                  </div>

                  <StockStatus
                    stock={product.stock}
                    variant={selectedVariant}
                  />

                  {/* Stock Progress Bar */}
                  {currentStock > 0 && currentStock <= 20 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Stock Level
                        </span>
                        <span className="font-medium">
                          {currentStock} remaining
                        </span>
                      </div>
                      <Progress
                        value={(currentStock / 20) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Variant Selection - Compact */}
              {Array.isArray(product.variantTypes) &&
                product.variantTypes.length > 0 && (
                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Select Options</h3>
                    <div className="space-y-4">
                      {product.variantTypes.map((variantType) => (
                        <div key={variantType.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                              {variantType.name}
                            </label>
                            {selectedOptions[variantType.id] && (
                              <Badge variant="secondary" className="text-xs">
                                {variantType.values.find(
                                  (v) =>
                                    v.id === selectedOptions[variantType.id]
                                )?.displayName ||
                                  variantType.values.find(
                                    (v) =>
                                      v.id === selectedOptions[variantType.id]
                                  )?.value}
                              </Badge>
                            )}
                          </div>

                          {variantType.name.toLowerCase().includes("color") ? (
                            <div className="flex flex-wrap gap-2">
                              {variantType.values.map((value) => {
                                const isSelected =
                                  selectedOptions[variantType.id] === value.id;
                                const isAvailable = isOptionAvailable(
                                  variantType.id,
                                  value.id
                                );

                                return (
                                  <Button
                                    key={value.id}
                                    variant="outline"
                                    size="icon"
                                    className={cn(
                                      "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 relative p-0",
                                      isSelected
                                        ? "border-primary shadow-md ring-2 ring-primary/20 scale-105"
                                        : "border-border hover:border-primary/60",
                                      !isAvailable &&
                                        "opacity-40 cursor-not-allowed hover:scale-100"
                                    )}
                                    style={{
                                      backgroundColor: getClothingColorHex(
                                        value.value
                                      ),
                                    }}
                                    onClick={() =>
                                      handleOptionChange(
                                        variantType.id,
                                        value.id
                                      )
                                    }
                                    title={`${value.displayName || value.value}${!isAvailable ? " (Unavailable)" : ""}`}
                                  >
                                    {isSelected && (
                                      <IconCheck className="h-3 w-3 text-white drop-shadow" />
                                    )}
                                    {!isAvailable && (
                                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                                        <div className="w-3 h-0.5 bg-destructive rotate-45 absolute"></div>
                                      </div>
                                    )}
                                  </Button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {variantType.values.map((value) => {
                                const isSelected =
                                  selectedOptions[variantType.id] === value.id;
                                const isAvailable = isOptionAvailable(
                                  variantType.id,
                                  value.id
                                );

                                return (
                                  <Button
                                    key={value.id}
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    className={cn(
                                      "h-9 transition-all relative text-xs font-medium justify-center",
                                      !isSelected &&
                                        isAvailable &&
                                        "hover:shadow-sm hover:scale-[1.02]",
                                      isSelected && "shadow-sm scale-[1.02]",
                                      !isAvailable &&
                                        "opacity-40 cursor-not-allowed hover:scale-100"
                                    )}
                                    onClick={() =>
                                      handleOptionChange(
                                        variantType.id,
                                        value.id
                                      )
                                    }
                                    title={`${value.displayName || value.value}${!isAvailable ? " (Unavailable)" : ""}`}
                                  >
                                    <span className="flex items-center gap-1">
                                      {value.displayName || value.value}
                                      {isSelected && (
                                        <IconCheck className="h-3 w-3" />
                                      )}
                                    </span>
                                    {!isAvailable && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded">
                                        <div className="w-full h-0.5 bg-destructive/80 rotate-12"></div>
                                      </div>
                                    )}
                                  </Button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* Purchase Section - Streamlined */}
              <Card className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border shadow-sm">
                <div className="space-y-4">
                  {/* Quantity & Add to Cart */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-background border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="h-10 w-10 rounded-r-none hover:bg-muted"
                      >
                        <IconMinusCircle className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={currentStock}
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(Number(e.target.value))
                        }
                        className="w-14 text-center border-0 rounded-none h-10 font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= currentStock}
                        className="h-10 w-10 rounded-l-none hover:bg-muted"
                      >
                        <IconPlusCircle className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      size="lg"
                      className="flex-1 h-12 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={handleAddToCart}
                      disabled={
                        !canAddToCart ||
                        isAddingToCart ||
                        Object.keys(selectedOptions).length !==
                          (product.variantTypes?.length || 0)
                      }
                    >
                      <IconShoppingCart className="mr-2 h-4 w-4" />
                      {isAddingToCart
                        ? "Adding..."
                        : Object.keys(selectedOptions).length !==
                            (product.variantTypes?.length || 0)
                          ? `Select ${(product.variantTypes?.length || 0) - Object.keys(selectedOptions).length} more`
                          : !canAddToCart
                            ? "Unavailable"
                            : currentStock < 1
                              ? "Out of Stock"
                              : `Add • ${formatCurrency(getCurrentPrice() * quantity)}`}
                    </Button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-10">
                      <IconHeart className="mr-2 h-4 w-4" />
                      Wishlist
                    </Button>
                    <Button variant="outline" className="flex-1 h-10">
                      <IconEye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                  </div>

                  {/* Trust Signals - Compact */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs">
                      <IconShield className="h-3 w-3 text-green-600" />
                      <span className="font-medium">Authentic</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <IconTruck className="h-3 w-3 text-blue-600" />
                      <span className="font-medium">Free Ship</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <IconRotate className="h-3 w-3 text-purple-600" />
                      <span className="font-medium">Returns</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <IconAward className="h-3 w-3 text-orange-600" />
                      <span className="font-medium">Warranty</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Product Description - Collapsible */}
              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Description</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                      className="text-primary h-auto p-1"
                    >
                      {showFullDescription ? "Less" : "More"}
                      <IconChevronDown
                        className={cn(
                          "ml-1 h-4 w-4 transition-transform",
                          showFullDescription && "rotate-180"
                        )}
                      />
                    </Button>
                  </div>
                  <div
                    className={cn(
                      "prose prose-sm max-w-none text-muted-foreground leading-relaxed transition-all duration-300",
                      !showFullDescription && "line-clamp-3"
                    )}
                    dangerouslySetInnerHTML={{
                      __html:
                        product.description || "No description available.",
                    }}
                  />
                </div>
              </Card>

              {/* Product Tags - Compact */}
              {Array.isArray(product.tags) && product.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 6).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="hover:bg-primary/10 transition-colors cursor-pointer text-xs px-2 py-1"
                      >
                        #{tag.name}
                      </Badge>
                    ))}
                    {product.tags.length > 6 && (
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        +{product.tags.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Purchase Bar - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Price</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(getCurrentPrice())}
                </span>
                {hasOriginalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-background border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="h-9 w-9 rounded-r-none"
                >
                  <IconMinusCircle className="h-4 w-4" />
                </Button>
                <span className="px-3 py-2 text-sm font-medium min-w-[2rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= currentStock}
                  className="h-9 w-9 rounded-l-none"
                >
                  <IconPlusCircle className="h-4 w-4" />
                </Button>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!canAddToCart || isAddingToCart}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-all duration-200 px-6"
              >
                {isAddingToCart ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    Adding...
                  </>
                ) : (
                  <>
                    <IconShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {Array.isArray(relatedProducts) && relatedProducts.length > 0 && (
        <div className="border-t bg-muted/30 mt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">You might also like</h2>
                <p className="text-muted-foreground">
                  Discover similar products
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <Card
                    key={relatedProduct.id}
                    className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm"
                  >
                    <Link
                      href={`/products/${relatedProduct.slug || relatedProduct.id}`}
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted/50">
                        {isValidImageUrl(relatedProduct.image) ? (
                          <Image
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            unoptimized={!relatedProduct.image?.startsWith("/")}
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <IconAlertCircle className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}

                        {relatedProduct.originalPrice &&
                          relatedProduct.originalPrice >
                            relatedProduct.price && (
                            <Badge
                              variant="destructive"
                              className="absolute top-2 left-2 text-xs"
                            >
                              {Math.round(
                                ((relatedProduct.originalPrice -
                                  relatedProduct.price) /
                                  relatedProduct.originalPrice) *
                                  100
                              )}
                              % OFF
                            </Badge>
                          )}

                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/90 hover:bg-white"
                        >
                          <IconHeart className="h-3 w-3" />
                        </Button>
                      </div>

                      <CardContent className="p-3 space-y-2">
                        <h3 className="font-medium line-clamp-2 leading-tight text-sm group-hover:text-primary transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">
                              {formatCurrency(relatedProduct.price)}
                            </span>
                            {relatedProduct.originalPrice &&
                              relatedProduct.originalPrice >
                                relatedProduct.price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatCurrency(relatedProduct.originalPrice)}
                                </span>
                              )}
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Modal */}
      <ImageZoomModal
        isOpen={isImageZoomed}
        onClose={() => setIsImageZoomed(false)}
        images={normalizedImages}
        currentIndex={currentImageIndex}
        onNavigate={navigateImage}
      />

      {/* Add bottom padding for mobile purchase bar */}
      <div className="h-20 lg:h-0" />
    </div>
  );
}
