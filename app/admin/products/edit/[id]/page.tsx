"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProductForm, ProductFormData } from "@/components/admin/ProductForm";
  import { Loader } from "lucide-react";

const fetchOptions = async (endpoint: string) => {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return res.json();
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? String(params.id) : undefined;
console.log("EditPage id from params:", id);
  const [initialData, setInitialData] = useState<ProductFormData | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [variantTypes, setVariantTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        // Fetch product
        const productRes = await fetch(`/api/admin/products?id=${id}`);
        if (!productRes.ok) throw new Error('Failed to fetch product');
        const product = await productRes.json();

        // Map product to ProductFormData shape
        const initial: ProductFormData & { id?: string } = {
          id: product.id ? String(product.id) : undefined,
          name: product.name,
          description: product.description || '',
          categoryId: product.category?.id ? String(product.category.id) : '',
          brandId: product.brand?.id ? String(product.brand.id) : null,
          basePrice: String(product.basePrice || '0'),
          status: product.status ?? true,
          featured: product.featured ?? false,
          onSale: product.onSale ?? false,
          images: Array.isArray(product.images)
            ? product.images
            : [],
          // Ensure tagIds are always an array of strings
          tagIds: Array.isArray(product.tags) && product.tags.length > 0
            ? product.tags
                .filter((t: any) => t?.id != null) // Filter out any undefined/null tags
                .map((t: any) => String(t.id)) // Convert all IDs to strings
            : [],
          variants: Array.isArray(product.variants)
            ? product.variants.map((v: any) => ({
                id: v.id ? String(v.id) : undefined,
                sku: v.sku,
                price: String(v.price),
                stock: v.stock,
                selectedOptions: Array.isArray(v.selections)
                  ? v.selections.map((s: any) => ({
                      variantTypeId: s.option?.variantType?.id ? String(s.option?.variantType?.id) : '',
                      optionId: s.option?.id ? String(s.option?.id) : '',
                    }))
                  : [],
              }))
            : [],
          allowedOptions: Array.isArray(product.allowedOptions)
            ? product.allowedOptions.map((ao: any) => ({
                variantTypeId: ao.option?.variantType?.id ? String(ao.option?.variantType?.id) : '',
                optionId: ao.option?.id ? String(ao.option?.id) : '',
              }))
            : [],
        };
        setInitialData(initial);

        // Fetch options in parallel
        const [cats, brs, tgs, vts] = await Promise.all([
          fetchOptions('/api/public/categories'),
          fetchOptions('/api/public/brands'),
          fetchOptions('/api/public/tags'),
          fetchOptions('/api/admin/variants/types'),
        ]);
        setCategories(cats);
        setBrands(brs);
        setTags(tgs);
        setVariantTypes(
          Array.isArray(vts)
            ? vts.map((type: any) => ({
                ...type,
                id: String(type.id),
                options: (type.options || []).map((opt: any) => ({ id: String(opt.id), name: opt.value })),
              }))
            : []
        );
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin mr-2" /> Loading product...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-20 text-destructive">
        <div className="text-lg font-semibold">{error}</div>
        <button onClick={() => router.refresh()} className="mt-4 underline text-primary">Retry</button>
      </div>
    );
  }
  console.log("EditPage initialData:", initialData);
  if (!initialData) {
    return null;
  }
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm
        initialData={initialData}
        categories={categories}
        brands={brands}
        tags={tags}
        variantTypes={variantTypes}
        onSuccess={() => router.push("/admin/products")}
      />
    </div>
  );
}
