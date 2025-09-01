"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getClothingColorHex } from "@/lib/clothingColors";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "@/hooks/useTranslations";

// Tabler Icons
import {
  IconChevronRight,
  IconChevronLeft,
  IconChevronDown,
  IconX,
  IconCheck,
  IconPlus,
  IconMinus,
  IconZoomIn,
  IconShare2,
  IconAlertCircle,
  IconLoader2,
  IconTruck,
  IconClock,
  IconAward,
  IconShield,
  IconShoppingCart,
  IconRefresh,
} from "@tabler/icons-react";

// shadcn/ui Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import WishlistButton from "@/components/wishlist/WishlistButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types
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
  price?: number; // Optional since we're using basePrice
  basePrice: string | number; // API returns this as string
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

// Utility functions
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
  const hasValidImage = currentImage?.url && isValidImageUrl(currentImage.url) && !imageLoadError;

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

        <div className="relative w-full max-h-[60vh] sm:max-h-[50vh] md:max-h-[70vh] bg-black/50 flex items-center justify-center rounded-xl overflow-hidden">
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
  t,
}: {
  stock: number;
  variant: ProductVariant | null;
  t: (key: string, params?: Record<string, string | number>) => string;
}) => {
  const currentStock = variant?.stock ?? stock;

  if (currentStock === 0)
    return (
      <div className="flex items-center gap-2 text-destructive">
        <IconAlertCircle className="h-4 w-4" />
        <span className="font-medium">{t('product.detail.stockStatus.outOfStock')}</span>
      </div>
    );

  if (currentStock < 10)
    return (
      <div className="flex items-center gap-2 text-orange-600">
        <IconClock className="h-4 w-4" />
        <span className="font-medium">{t('product.detail.stockStatus.lowStock', { count: currentStock })}</span>
      </div>
    );

  return (
    <div className="flex items-center gap-2 text-green-600">
      <IconCheck className="h-4 w-4" />
      <span className="font-medium">{t('product.detail.stockStatus.inStock', { count: currentStock })}</span>
    </div>
  );
};

export function ProductDetail({ product: propProduct }: { product: Product }) {
  // Log the product data we receive
  useEffect(() => {
    console.log('Product Detail - Received product data:', {
      price: propProduct.price,
      priceType: typeof propProduct.price,
      fullProduct: propProduct
    });
  }, [propProduct]);
  
  // Make a copy of the product to work with
  const product = useMemo(() => propProduct, [propProduct]);
  const { addItem } = useCart();
  const { t } = useTranslations();
  
  // State management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);

  // Normalize and filter product images
  const normalizedImages = useMemo(() => {
    if (!Array.isArray(product.images)) return [];
    return product.images
      .map((img) => normalizeImage(img))
      .filter((img) => img && img.url);
  }, [product.images]);

  // Current image based on index
  const currentImage = useMemo(() => {
    return normalizedImages[currentImageIndex] || null;
  }, [normalizedImages, currentImageIndex]);

  // Filter out variants with 0 stock and get available variants
  const availableVariants = useMemo(() => {
    return product.variants?.filter(variant => variant.stock > 0) || [];
  }, [product.variants]);

  // Check if product has variants
  const hasVariants = useMemo(() => 
    availableVariants.length > 0 && 
    product.variantTypes && 
    product.variantTypes.length > 0, 
    [availableVariants, product.variantTypes]
  );

  // Get available variant types with only values that have stock
  const availableVariantTypes = useMemo(() => {
    if (!hasVariants) return [];
    
    return product.variantTypes.map(variantType => {
      const availableValueIds = new Set<string>();
      
      availableVariants.forEach(variant => {
        if (variant.values) {
          variant.values.forEach(value => {
            if (value.variantType.id === variantType.id) {
              availableValueIds.add(value.id);
            }
          });
        }
      });

      const availableValues = variantType.values.filter(value => 
        availableValueIds.has(value.id)
      );

      return {
        ...variantType,
        values: availableValues
      };
    }).filter(variantType => variantType.values.length > 0);
  }, [hasVariants, product.variantTypes, availableVariants]);

  // Check if an option is available given current selections
  const isOptionAvailable = useCallback(
    (variantTypeId: string, optionId: string) => {
      if (!hasVariants) return true;
      
      if (selectedOptions[variantTypeId] === optionId) {
        return true;
      }

      const hypotheticalOptions = {
        ...selectedOptions,
        [variantTypeId]: optionId,
      };

      return availableVariants.some(variant => {
        if (!variant.values || variant.stock <= 0) return false;

        const variantOptionMap = variant.values.reduce(
          (acc, v) => {
            acc[v.variantType.id] = v.id;
            return acc;
          },
          {} as Record<string, string>
        );

        return Object.entries(hypotheticalOptions).every(
          ([typeId, valueId]) => variantOptionMap[typeId] === valueId
        );
      });
    },
    [selectedOptions, availableVariants, hasVariants]
  );

  // Initialize variant state
  useEffect(() => {
    if (!hasVariants) {
      setSelectedVariant(null);
      setSelectedOptions({});
      return;
    }
    setSelectedVariant(null);
    setSelectedOptions({});
  }, [product.variants, product.id, product.variantTypes, hasVariants]);

  // Load related products
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

    const compatibleOptions: Record<string, string> = {};
    compatibleOptions[typeId] = optionId;
    
    Object.entries(newOptions).forEach(([otherTypeId, otherOptionId]) => {
      if (otherTypeId === typeId) return;
      
      const testOptions = { ...compatibleOptions, [otherTypeId]: otherOptionId };
      
      const isCompatible = availableVariants.some(variant => {
        if (!variant.values || variant.stock <= 0) return false;
        
        const variantOptionMap = variant.values.reduce(
          (acc, v) => {
            acc[v.variantType.id] = v.id;
            return acc;
          },
          {} as Record<string, string>
        );
        
        return Object.entries(testOptions).every(
          ([testTypeId, testValueId]) => variantOptionMap[testTypeId] === testValueId
        );
      });
      
      if (isCompatible) {
        compatibleOptions[otherTypeId] = otherOptionId;
      }
    });

    setSelectedOptions(compatibleOptions);

    // Check if we have a complete selection
    if (Object.keys(compatibleOptions).length === availableVariantTypes.length) {
      const matchingVariant = availableVariants.find(variant => {
        if (!variant.values || variant.stock <= 0) return false;

        const variantOptionMap = variant.values.reduce(
          (acc, v) => {
            acc[v.variantType.id] = v.id;
            return acc;
          },
          {} as Record<string, string>
        );

        return Object.entries(compatibleOptions).every(
          ([vTypeId, vOptionId]) => variantOptionMap[vTypeId] === vOptionId
        ) && Object.keys(variantOptionMap).length === Object.keys(compatibleOptions).length;
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
    const maxStock = selectedVariant?.stock ?? product.stock;
    if (val < 1 || val > maxStock) return;
    setQuantity(val);
  };

  const handleAddToCartClick = () => {
    if (hasVariants) {
      setShowVariantModal(true);
    } else {
      handleAddToCart();
    }
  };

  const handleVariantConfirm = () => {
    if (hasVariants && !selectedVariant) return;
    setShowVariantModal(false);
    handleAddToCart();
  };

  const handleAddToCart = async () => {
    if (!canAddToCart) return;

    try {
      setIsAddingToCart(true);

      // Get variant details if available
      const variantDescription = getVariantName();
      const itemName = variantDescription
        ? `${product.name} (${variantDescription})`
        : product.name;
      const variantId = selectedVariant?.id;
      const variantSku = selectedVariant?.sku || product.sku;

      await addItem({
        id: product.id,
        name: itemName,
        price: Number(product.basePrice) || 0,
        quantity,
        image: product.images[0]?.url || "",
        sku: variantSku,
        variantId,
      });

      toast.success(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart`);
      setQuantity(1);
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

  // Get price from basePrice (API field) and ensure it's a number
  const displayPrice = Number(product.basePrice || 0);

  const getVariantName = () => {
    if (!selectedVariant?.values?.length) return "";
    return selectedVariant.values
      .map((v) => v?.displayName || v?.value)
      .filter(Boolean)
      .join(" / ");
  };

  const currentStock = selectedVariant?.stock ?? product.stock;
  
  const canAddToCart = useMemo(() => {
    if (hasVariants) {
      return availableVariants.length > 0 && (!selectedVariant || selectedVariant.stock > 0);
    }
    return product.stock > 0;
  }, [hasVariants, selectedVariant, product.stock, availableVariants.length]);

  // Use the memoized currentImage from the useMemo hook
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors font-medium">
              {t('product.detail.breadcrumbs.home')}
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

      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 flex-1">
        {/* Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8 min-h-0">
          {/* Gallery Column */}
          <div className="lg:col-span-6 xl:col-span-6">
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <Card className="overflow-hidden border-0 shadow-lg bg-white h-full p-0">
                  <div className="relative h-full group bg-white">
                    {currentImage ? (
                      <div className="relative w-full h-full p-0 flex items-center justify-center">
                        <div className="relative w-full h-full min-h-[300px] md:min-h-[500px] lg:min-h-[600px]">
                          <Image
                            src={currentImage.url}
                            alt={currentImage.alt || product.name || "Product image"}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                            priority
                            onError={() => handleImageError(currentImage.id)}
                            unoptimized={process.env.NODE_ENV === "development"}
                          />
                        </div>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          onClick={() => navigator.share?.({ url: window.location.href, title: product.name })}
                        >
                          <IconShare2 className="h-4 w-4" />
                        </Button>

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
                              <p className="text-muted-foreground">Image not available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <div className="text-center">
                          <IconAlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No image available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Thumbnail Gallery */}
              {normalizedImages.length > 1 && (
                <div className="space-y-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">
                      {currentImageIndex + 1} of {normalizedImages.length} images
                    </span>
                  </div>

                  <div className="flex gap-2 overflow-x-scroll sm:overflow-x-auto scrollbar-hide py-2 px-2">
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
                          width={80}
                          height={80}
                          className="object-cover "
                          sizes="80px"
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

          {/* Product Information */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col px-4 sm:px-2">
            <div className="space-y-4 lg:space-y-6 py-4">
              {/* Product Header */}
              <div className="space-y-4">
                {(product.brand || product.category) && (
                  <div className="flex items-center gap-2 text-sm">
                    {product.brand && (
                      <Badge variant="outline" className="text-xs font-medium">
                        {product.brand.name}
                      </Badge>
                    )}
                    {product.category && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <Link
                          href={`/categories/${product.category.id}`}
                          className="text-muted-foreground hover:text-primary transition-colors text-sm"
                        >
                          {product.category.name}
                        </Link>
                      </>
                    )}
                  </div>
                )}

                <div>
                  <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                    {product.name}
                  </h1>
                  {selectedVariant && getVariantName() && (
                    <p className="text-lg text-muted-foreground mt-2">
                      {getVariantName()}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
                      {formatCurrency(displayPrice)}
                    </span>
                  </div>

                  <StockStatus stock={product.stock} variant={selectedVariant} t={t} />

                  {/* Stock Progress Bar */}
                  {currentStock > 0 && currentStock <= 20 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Stock Level</span>
                        <span className="font-medium">{currentStock} remaining</span>
                      </div>
                      <Progress value={(currentStock / 20) * 100} className="h-2" />
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Selector - Only for simple products */}
              {!hasVariants && (
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium">{t('product.detail.quantity')}:</Label>
                  <div className="flex items-center bg-background border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="h-10 w-10 rounded-r-none hover:bg-muted"
                    >
                      <IconMinus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={currentStock}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(Number(e.target.value))}
                      className="w-14 text-center border-0 rounded-none h-10 font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= currentStock}
                      className="h-10 w-10 rounded-l-none hover:bg-muted"
                    >
                      <IconPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Add to Cart and Wishlist Buttons */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    size="lg"
                    className="flex-1 h-12 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={handleAddToCartClick}
                    disabled={!canAddToCart || isAddingToCart}
                  >
                    <IconShoppingCart className="mr-2 h-4 w-4" />
                    {isAddingToCart
                      ? t('product.adding')
                      : hasVariants && availableVariants.length === 0
                        ? t('product.detail.unavailable')
                        : !canAddToCart
                          ? t('product.outOfStock')
                          : hasVariants && availableVariants.length > 0
                            ? t('product.detail.chooseOptions')
                            : t('product.addToCart')}
                  </Button>
                  
                  <WishlistButton
                    product={{
                      id: product.id,
                      name: product.name,
                      price: displayPrice,
                      image: normalizedImages[0]?.url,
                      description: product.description,
                      brand: product.brand,
                      stock: currentStock,
                      hasVariants,
                      variantCount: availableVariants.length,
                    }}
                    variant="default"
                    size="lg"
                    className="h-12 px-6"
                  />
                </div>
              </div>

              {/* Trust Signals */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-xs">
                  <IconShield className="h-3 w-3 text-green-600" />
                  <span className="font-medium">{t('product.detail.trustSignals.authentic')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <IconTruck className="h-3 w-3 text-blue-600" />
                  <span className="font-medium">{t('product.detail.trustSignals.fastShipping')}</span>
                </div>
              </div>

              {/* Product Description */}
              <Card className="p-4 overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t('product.detail.descriptionTitle')}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-primary h-auto p-1"
                      aria-expanded={showFullDescription}
                    >
                      {showFullDescription ? t('product.detail.showLess') : t('product.detail.showMore')}
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
                      !showFullDescription ? "line-clamp-3" : "max-h-[80vh] overflow-y-auto"
                    )}
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
                    }}
                  >
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: product.description || "No description available.",
                      }}
                    />
                  </div>
                </div>
              </Card>

              {/* Product Tags */}
              {Array.isArray(product.tags) && product.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{t('product.detail.tagsTitle')}</h4>
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

      {/* Related Products */}
      {Array.isArray(relatedProducts) && relatedProducts.length > 0 && (
        <div className="border-t bg-muted/30 mt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">{t('product.detail.relatedProducts.title')}</h2>
                <p className="text-muted-foreground">{t('product.detail.relatedProducts.subtitle')}</p>
              </div>

              <Carousel
                opts={{
                  align: "start",
                  slidesToScroll: 1,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-1">
                  {relatedProducts.map((relatedProduct) => (
                    <CarouselItem
                      key={relatedProduct.id}
                      className="pl-1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                    >
                      <Link href={`/products/${relatedProduct.slug}`} className="group">
                        <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg">
                          <div className="relative aspect-square bg-muted/20">
                            <div className="relative w-full h-full">
                              <Image
                                src={relatedProduct.image}
                                alt={relatedProduct.name}
                                fill
                                className="object-cover transition-all duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              />
                            </div>

                            {relatedProduct.originalPrice &&
                              relatedProduct.originalPrice > relatedProduct.price && (
                                <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-600/90">
                                  SALE
                                </Badge>
                              )}
                          </div>

                          <CardContent className="p-3 space-y-2">
                            <h3 className="font-medium line-clamp-2 leading-tight text-sm group-hover:text-primary transition-colors">
                              {relatedProduct.name}
                            </h3>
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold">
                                {formatCurrency(relatedProduct.price)}
                              </span>
                              {relatedProduct.originalPrice &&
                                relatedProduct.originalPrice > relatedProduct.price && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatCurrency(relatedProduct.originalPrice)}
                                  </span>
                                )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          </div>
        </div>
      )}

      {/* Variant Selection Modal */}
      <Dialog open={showVariantModal} onOpenChange={setShowVariantModal}>
        <DialogContent className="w-full sm:max-w-[90%] md:max-w-[640px] max-h-[90vh] sm:max-h-[80vh] overflow-y-auto p-0">
          <div className="relative">
            {/* Product Preview */}
            <div className="relative h-48 w-full bg-muted/20 overflow-hidden">
              {currentImage && (
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt || product.name || "Product"}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 640px"
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
                <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(Number(product.basePrice))}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 pt-4 space-y-6">
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl">{t('product.detail.variantModal.title')}</DialogTitle>
                <DialogDescription className="text-sm">
                  {t('product.detail.variantModal.subtitle')}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="space-y-6">
              {availableVariantTypes.map((variantType) => (
                <div key={variantType.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{variantType.name}</Label>
                    {selectedOptions[variantType.id] && (
                      <Badge variant="outline" className="text-xs">
                        {(() => {
                          const selectedValue = variantType.values?.find(
                            (v) => v.id === selectedOptions[variantType.id]
                          );
                          return selectedValue?.displayName || selectedValue?.value || "Selected";
                        })()}
                      </Badge>
                    )}
                  </div>

                  {variantType.name.toLowerCase().includes("color") ? (
                    <div className="flex flex-wrap gap-2">
                      {variantType.values?.map((value) => {
                        if (!value?.id) return null;

                        const isSelected = selectedOptions[variantType.id] === value.id;
                        const isAvailable = isOptionAvailable(variantType.id, value.id);
                        const displayName = value.displayName || value.value || "Unnamed";

                        return (
                          <TooltipProvider key={value.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className={cn(
                                    "h-9 w-9 rounded-full border-2 transition-all hover:scale-110 relative p-0",
                                    isSelected
                                      ? "border-primary shadow-md ring-2 ring-primary/20 scale-105"
                                      : "border-border hover:border-primary/60",
                                    !isAvailable && "opacity-50 cursor-not-allowed hover:scale-100"
                                  )}
                                  style={{
                                    backgroundColor: getClothingColorHex(value.value),
                                  }}
                                  onClick={() => handleOptionChange(variantType.id, value.id)}
                                  disabled={!isAvailable}
                                  aria-label={`${displayName}${!isAvailable ? " (Unavailable)" : ""}`}
                                >
                                  {isSelected && (
                                    <IconCheck className="h-3.5 w-3.5 text-white drop-shadow" />
                                  )}
                                  {!isAvailable && (
                                    <div className="absolute inset-0 rounded-full bg-foreground/20 flex items-center justify-center">
                                      <IconX className="h-3 w-3 text-destructive-foreground" />
                                    </div>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>{displayName}{!isAvailable ? " (Unavailable)" : ""}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {variantType.values?.map((value) => {
                        if (!value?.id) return null;

                        const isSelected = selectedOptions[variantType.id] === value.id;
                        const isAvailable = isOptionAvailable(variantType.id, value.id);
                        const displayName = value.displayName || value.value || "Unnamed";

                        return (
                          <Button
                            key={value.id}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "h-auto py-2 transition-all relative text-sm font-medium justify-center whitespace-normal min-h-[2.5rem]",
                              !isSelected && isAvailable && "hover:shadow-sm hover:scale-[1.02]",
                              isSelected && "shadow-sm scale-[1.02]",
                              !isAvailable && "opacity-50 cursor-not-allowed hover:scale-100"
                            )}
                            onClick={() => handleOptionChange(variantType.id, value.id)}
                            disabled={!isAvailable}
                          >
                            {displayName}
                            {!isAvailable && (
                              <IconX className="ml-1.5 h-3.5 w-3.5 text-destructive-foreground" />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Selected Variant Details */}
              {selectedVariant && (
                <div className="mt-2 p-4 bg-muted/10 border rounded-lg transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
                      {t('product.detail.variantModal.selectedVariant')}
                    </h4>
                    {selectedVariant.stock > 0 ? (
                      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5" />
                        {t('product.inStock')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">
                        <div className="h-2 w-2 rounded-full bg-destructive mr-1.5" />
                        {t('product.outOfStock')}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b">
                      <span className="text-muted-foreground">{t('product.detail.variantModal.price')}:</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(Number(product.basePrice))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b">
                      <span className="text-muted-foreground">{t('product.detail.variantModal.sku')}:</span>
                      <span className="font-mono text-sm bg-muted/30 px-2 py-0.5 rounded">
                        {selectedVariant.sku || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-muted-foreground">{t('product.detail.variantModal.stockLevel')}:</span>
                      <span
                        className={cn(
                          "font-medium inline-flex items-center",
                          selectedVariant.stock > 0 ? "text-green-600" : "text-destructive"
                        )}
                      >
                        {selectedVariant.stock > 0 ? (
                          <>
                          <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1.5" />
                          {t('product.detail.variantModal.stockAvailable', { count: selectedVariant.stock })}
                          </>
                        ) : (
                          <>
                            <span className="inline-block h-2 w-2 rounded-full bg-destructive mr-1.5" />
                            {t('product.detail.variantModal.outOfStock')}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-2 pb-4">
                <div>
                  <Label className="text-sm font-medium">{t('product.detail.variantModal.quantityLabel')}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('product.detail.variantModal.quantityAvailable', { 
                      count: selectedVariant ? selectedVariant.stock : product.stock 
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-1 bg-muted/30 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="h-8 w-8 rounded-md hover:bg-background"
                  >
                    <IconMinus className="h-4 w-4" />
                  </Button>
                  <div className="w-12">
                    <Input
                      type="number"
                      min="1"
                      max={selectedVariant?.stock || product.stock}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(Number(e.target.value))}
                      className="h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-background border-0 shadow-none focus-visible:ring-1"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= (selectedVariant?.stock || product.stock)}
                    className="h-8 w-8 rounded-md hover:bg-background"
                  >
                    <IconPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t sticky bottom-0 bg-background z-10">
              <div className="flex w-full flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowVariantModal(false)}
                  disabled={isAddingToCart}
                  className="flex-1"
                >
                  {t('product.detail.variantModal.cancel')}
                </Button>
                <Button
                  onClick={handleVariantConfirm}
                  disabled={!selectedVariant || isAddingToCart || (selectedVariant?.stock || 0) <= 0}
                  className="flex-1"
                >
                  {isAddingToCart ? (
                    <>
                      <IconRefresh className="mr-2 w-4 animate-spin" />
                      {t('product.adding')}
                    </>
                  ) : (
                    <>
                      <IconShoppingCart className="mr-2 w-4" />
                      {t('product.detail.variantModal.addToCart')}
                      {selectedVariant && selectedVariant.stock > 0 && (
                        <span className="ml-2 font-normal opacity-90">
                          • {formatCurrency(Number(product.basePrice) * quantity)}
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Screen Image Modal */}
      <ImageZoomModal
        isOpen={isImageZoomed}
        onClose={() => setIsImageZoomed(false)}
        images={normalizedImages}
        currentIndex={currentImageIndex}
        onNavigate={navigateImage}
      />

      {/* Dynamic bottom padding that accounts for mobile purchase bar */}
    </div>
  );
}