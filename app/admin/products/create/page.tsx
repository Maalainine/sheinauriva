"use client";

import React, { useEffect, useState } from "react";
import { ProductForm, ProductFormData } from "@/components/admin/ProductForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

const fetchOptions = async (endpoint: string) => {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return res.json();
};

export default function CreateProductPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [variantTypes, setVariantTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetchOptions("/api/public/categories"),
      fetchOptions("/api/public/brands"),
      fetchOptions("/api/public/tags"),
      fetchOptions("/api/admin/variants/types")
    ]).then(([cat, br, tg, vt]) => {
      setCategories(cat);
      setBrands(br);
      setTags(tg);
      setVariantTypes(
        vt.map((type: any) => ({
          ...type,
          id: String(type.id),
          options: (type.options || []).map((opt: any) => ({ id: String(opt.id), name: opt.value }))
        }))
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader className="animate-spin mr-2" /> Loading product form...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <ProductForm
            categories={categories}
            brands={brands}
            tags={tags}
            variantTypes={variantTypes}
            onSuccess={() => router.push("/admin/products")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
