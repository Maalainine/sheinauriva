"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import ProductCard from "@/components/product/card/ProductCard";

export default function CategoryDetailPage({ params }: { params: { id: string } }) {
  const id = params?.id;
  const [category, setCategory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/category/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setCategory(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4">
        <Skeleton className="h-14 w-1/2 mb-6 rounded" />
        <Skeleton className="h-24 w-full mb-8 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }
  if (notFound || !category) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <EmptyState message="Category not found." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <Link href="/categories" className="text-primary hover:underline mb-4 inline-block">← Back to Categories</Link>
      <Card>
        <CardHeader>
          <TypographyH1 className="mb-2 text-3xl">{category.name}</TypographyH1>
        </CardHeader>
        <CardContent>
          <TypographyP className="mb-4 text-xl text-muted-foreground">{category.description}</TypographyP>
        </CardContent>
      </Card>
      {category.products && category.products.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Products in this Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {category.products.map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                stock={product.stock}
                images={product.images || (product.primaryImage ? [product.primaryImage] : [])}
                tags={product.tags || []}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState message="No products in this category." />
      )}
    </div>
  );
}

