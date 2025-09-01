"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductDetail } from "@/components/products/ProductDetail";
import { useTranslations } from "@/hooks/useTranslations";

// Types
interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface VariantValue {
  id: string;
  value: string;
  displayName?: string | null;
  variantType: {
    id: string;
    name: string;
  };
}

export interface ProductVariant {
  id: string;
  sku?: string | null;
  price: number;
  stock: number;
  values: VariantValue[];
}

export interface VariantType {
  id: string;
  name: string;
  values: Array<{
    id: string;
    value: string;
    displayName?: string | null;
  }>;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
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
  onSale?: boolean;
}

export default function ProductDetailPage() {
  const params = useParams() || {};
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) || '';
  const { t } = useTranslations();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product data
  useEffect(() => {
    if (!id) {
      setError(t('product.detail.missingId'));
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/products/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(t('product.detail.loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery Skeleton */}
          <div>
            <div className="aspect-square w-full bg-muted rounded-lg animate-pulse" />
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 w-16 bg-muted rounded-md animate-pulse" />
              ))}
            </div>
          </div>
          
          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-1/2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-1/2" />
            </div>
            <div className="pt-4">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('product.detail.notFound')}</h2>
        <p className="text-muted-foreground mb-6">
          {error || t('product.detail.notFoundDescription')}
        </p>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}