"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import {
  IconChevronRight,
  IconTruck,
  IconCircleCheck,
  IconShield,
  IconHeadphones,
} from "@tabler/icons-react";
import { type CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TypographyH1,
  TypographyH2,
  TypographyH4,
  TypographyP,
} from "@/components/ui/typography";
import CenterFocusedCarousel from "@/components/CenterFocusedCarousel";
import ProductCard from "@/components/product/card/ProductCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryCard } from "@/components/category/card/CategoryCard";
import { BrandLogos } from "@/components/ui/brand-logos";
import { useTranslations } from "@/hooks/useTranslations";

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: ProductImage[];
  description?: string;
  stock?: number;
  originalPrice?: number | null;
  slug?: string | null;
  brand?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  } | null;
  tags?: Array<{ id: string; name: string }>;
  hasVariants?: boolean;
  variantCount?: number;
}

interface CategoryItem {
  id: string;
  name: string;
  subtitle: string | null;
  images: Array<{ url: string; alt: string }>;
  _count: { products: number };
}

// Auto-slide functionality for the carousel
const useAutoSlide = (api: CarouselApi | undefined, autoPlay?: boolean) => {
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const play = useCallback(() => {
    if (!api || autoPlay === false) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (api) {
        api.scrollNext();
      }
    }, 5000);
  }, [api, autoPlay]);

  useEffect(() => {
    if (!api) return;

    api.on("select", play);
    play();

    return () => {
      clearTimeout(timerRef.current);
      api.off("select", play);
    };
  }, [api, play]);
};

export default function Home() {
  const [api] = useState<CarouselApi>();
  const [isLoading, setIsLoading] = useState(true);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslations();

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    if (!mounted) return;

    // Static categories fallback - these will be replaced by the API response
    const staticCategories: CategoryItem[] = [
      {
        id: "all",
        name: "All",
        subtitle: "Browse all products",
        images: [],
        _count: { products: 0 },
      },
      {
        id: "clothing",
        name: "Clothing",
        subtitle: "Trendy outfits & more",
        images: [],
        _count: { products: 0 },
      },
      {
        id: "shoes",
        name: "Shoes",
        subtitle: "Stylish footwear",
        images: [],
        _count: { products: 0 },
      },
      {
        id: "accessories",
        name: "Accessories",
        subtitle: "Complete your look",
        images: [],
        _count: { products: 0 },
      },
      {
        id: "bags",
        name: "Bags",
        subtitle: "Carry in style",
        images: [],
        _count: { products: 0 },
      },
    ];

    const fetchData = async () => {
      try {
        console.log("Fetching products...");
        setIsLoading(true);

        // Fetch products with proper error handling
        try {
          const apiUrl =
            "/api/public/product?sortBy=createdAt&sortOrder=desc&take=10&featured=true";
          console.log("Fetching from URL:", apiUrl);

          const productsRes = await fetch(apiUrl);
          console.log("Products response status:", productsRes.status);

          if (!productsRes.ok) {
            const errorText = await productsRes.text();
            console.error("API Error Response:", errorText);
            throw new Error(
              `Failed to fetch products: ${productsRes.status} ${productsRes.statusText}`,
            );
          }

          const data = await productsRes.json();
          console.log("Raw API response data:", data);

          // The API returns data in a { success, data, meta } structure
          const productsArray = Array.isArray(data?.data) ? data.data : [];

          console.log("Processed products array:", productsArray);

          if (!productsArray.length) {
            console.warn("No products found in the response");
          }

          // Transform the data to match our Product interface
          const formattedProducts = productsArray.map(
            (product: {
              id: string;
              name: string;
              price: number | string;
              originalPrice?: number | string | null;
              description?: string;
              stock?: number;
              images?: ProductImage[];
              primaryImage?: ProductImage;
              brand?: {
                id: string;
                name: string;
                logoUrl?: string | null;
              } | null;
              slug?: string | null;
              tags?: Array<{ id: string; name: string }>;
              variants?: Array<{ stock?: number; price?: number | string }>;
            }) => {
              // Calculate stock - sum all variant stocks if variants exist, otherwise use product stock
              let stock = 0;

              if (product.variants && product.variants.length > 0) {
                // Sum stock from all variants
                stock = product.variants.reduce(
                  (
                    sum: number,
                    variant: { stock?: number; price?: number | string },
                  ) => {
                    const variantStock =
                      typeof variant.stock === "number" ? variant.stock : 0;
                    return sum + variantStock;
                  },
                  0,
                );
              } else {
                // Use product-level stock if no variants
                stock = typeof product.stock === "number" ? product.stock : 0;
              }

              // Use the price from the first variant if available, otherwise use product price
              const price =
                product.variants && product.variants.length > 0
                  ? typeof product.variants[0]?.price === "number"
                    ? product.variants[0].price
                    : parseFloat(String(product.variants[0]?.price)) || 0
                  : typeof product.price === "number"
                    ? product.price
                    : parseFloat(String(product.price)) || 0;

              // Handle originalPrice, allowing null/undefined
              const originalPrice = product.originalPrice
                ? typeof product.originalPrice === "number"
                  ? product.originalPrice
                  : parseFloat(product.originalPrice) || null
                : null;

              return {
                id: product.id,
                name: product.name,
                price,
                originalPrice,
                description: product.description || "",
                stock,
                images: Array.isArray(product.images)
                  ? product.images
                  : product.primaryImage
                    ? [product.primaryImage]
                    : [],
                brand: product.brand || null,
                slug: product.slug || null,
                tags: product.tags || [],
                hasVariants: (product.variants?.length || 0) > 0,
                variantCount: product.variants?.length || 0,
              };
            },
          );

          console.log("Formatted products:", formattedProducts);
          setNewArrivals(formattedProducts);
        } catch (error) {
          console.error("Error in fetch products:", error);
          // Set empty array to prevent errors in the UI
          setNewArrivals([]);
        }

        // Fetch categories from public API
        try {
          console.log("Fetching categories from public API...");
          const categoriesRes = await fetch("/api/public/categories");
          console.log("Categories response status:", categoriesRes.status);

          if (!categoriesRes.ok) {
            const errorText = await categoriesRes.text();
            console.error("Categories API error:", errorText);
            throw new Error(
              `Failed to fetch categories: ${categoriesRes.status} ${categoriesRes.statusText}`,
            );
          }

          const categoriesData = await categoriesRes.json();
          console.log("Fetched categories:", categoriesData);

          // Ensure we have valid categories data
          if (Array.isArray(categoriesData)) {
            setCategories(categoriesData);
          } else {
            console.warn("Categories data is not an array, using fallback");
            setCategories(staticCategories);
          }
        } catch (error) {
          console.error("Error fetching categories, using fallback:", error);
          setCategories(staticCategories);
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        console.log("Finished loading, setting isLoading to false");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  useAutoSlide(api);

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10 flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <TypographyH1 className="mb-4 text-white font-bold drop-shadow-lg">
              {t("home.hero.title")}
            </TypographyH1>
            <TypographyH4 className="mb-8 max-w-2xl text-white/90 drop-shadow-md">
              {t("home.hero.subtitle")}
            </TypographyH4>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 font-semibold shadow-lg"
                >
                  {t("home.hero.shopNow")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Image
          src="/images/Banner03.png"
          alt="Fashion Collection"
          fill
          className="object-cover"
          priority
        />
      </section>

      {/* Brand Logos Section */}
      <BrandLogos />

      {/* Categories Section - Only render when mounted */}
      {mounted && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-t">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <TypographyH2>{t("home.sections.categories")}</TypographyH2>
              <Link
                href="/categories"
                className="text-primary flex items-center gap-1"
              >
                {t("home.viewAllCategories")}{" "}
                <IconChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="rounded-lg overflow-hidden shadow-sm">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="m-0">
                <CenterFocusedCarousel
                  autoPlay={true}
                  autoPlayInterval={5000}
                  cardHeight={140}
                >
                  {categories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      id={category.id}
                      title={category.name}
                      imageUrl={category.images?.[0]?.url}
                      className="h-full w-full aspect-auto"
                    />
                  ))}
                </CenterFocusedCarousel>
              </div>
            ) : (
              <div className="text-center py-12">
                <TypographyP className="text-muted-foreground">
                  {t("home.noCategories")}
                </TypographyP>
              </div>
            )}
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <TypographyH2>{t("home.sections.newArrivals")}</TypographyH2>
            <Link
              href="/products?featured=true&sort=newest"
              className="text-primary flex items-center gap-1"
            >
              {t("home.viewAll")} <IconChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : newArrivals.length === 0 ? (
            <div className="text-center py-12">
              <TypographyP className="text-muted-foreground">
                {t("home.noProducts")}
              </TypographyP>
            </div>
          ) : (
            <div className="mt-8 mb-12">
              <CenterFocusedCarousel
                autoPlay={true}
                autoPlayInterval={5000}
                cardHeight={480}
              >
                {newArrivals.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description || ""}
                    price={product.price}
                    originalPrice={product.originalPrice ?? undefined}
                    stock={product.stock || 0}
                    images={product.images}
                    tags={product.tags || []}
                    brand={product.brand}
                    hasVariants={product.hasVariants}
                    variantCount={product.variantCount}
                  />
                ))}
              </CenterFocusedCarousel>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: IconTruck,
                title: t("home.features.shipping.title"),
                description: t("home.features.shipping.description"),
              },
              {
                icon: IconCircleCheck,
                title: t("home.features.quality.title"),
                description: t("home.features.quality.description"),
              },
              {
                icon: IconShield,
                title: t("home.features.payment.title"),
                description: t("home.features.payment.description"),
              },
              {
                icon: IconHeadphones,
                title: t("home.features.support.title"),
                description: t("home.features.support.description"),
              },
            ].map((feature, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-col items-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>

                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
