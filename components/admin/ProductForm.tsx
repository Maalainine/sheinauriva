"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { VariantEditor } from "@/components/admin/VariantEditor";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

// Types matching ProductFormData from API
export interface ProductVariantForm {
  id?: string;
  sku: string;
  price: string;
  stock: number;
  selectedOptions: Array<{ variantTypeId: string; optionId: string }>;
}

export interface ProductFormData {
  name: string;
  description?: string;
  categoryId: string;
  brandId?: string | null;
  basePrice?: string;
  status?: boolean;
  featured?: boolean;
  onSale?: boolean;
  images?: string[];
  tagIds?: string[];
  variants?: ProductVariantForm[];
  allowedOptions?: Array<{ variantTypeId: string; optionId: string }>;
}

interface ProductFormProps {
  initialData?: ProductFormData;
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
  variantTypes: Array<{ id: string; name: string; options: Array<{ id: string; name: string }> }>;
  onSuccess?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  brands,
  tags,
  variantTypes,
  onSuccess,
}) => {
  const [form, setForm] = useState<ProductFormData & { _imagesText?: string }>(
    initialData ? {
      ...initialData,
      _imagesText: initialData.images?.join('\n') || ''
    } : {
      name: "",
      description: "",
      categoryId: categories[0]?.id || "",
      brandId: brands[0]?.id || null,
      basePrice: "0",
      status: true,
      featured: false,
      onSale: false,
      images: [],
      _imagesText: "",
      tagIds: [],
      variants: [],
      allowedOptions: [],
    }
  );
  const [loading, setLoading] = useState(false);

  // Handlers
  // Handles input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handles rich text editor changes
  const handleRichTextChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      description: value,
    }));
  };

  // Handles select changes
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handles switch (boolean) changes
  const handleSwitch = (name: keyof ProductFormData, value: boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  // Handle multiple image URLs (comma or newline separated)
  const handleImagesInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Store the raw value for the textarea
    const textareaValue = value;
    
    // Split on comma or newline, trim whitespace, filter empty
    const images = value
      .split(/[,\n]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
      
    setForm((prev) => ({ 
      ...prev, 
      images,
      // Store the raw textarea value in a separate field to maintain newlines
      _imagesText: textareaValue 
    }));
  };

  const handleTagChange = (tagId: string) => {
    setForm((prev) => {
      const tagIds = prev.tagIds || [];
      // Ensure we're comparing strings by converting both to string
      const tagIdStr = String(tagId);
      return {
        ...prev,
        tagIds: tagIds.some(id => String(id) === tagIdStr)
          ? tagIds.filter((id) => String(id) !== tagIdStr)
          : [...tagIds, tagIdStr],
      };
    });
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = initialData ? "PUT" : "POST";
      const url = "/api/admin/products";
      // For update, include id in body
      const body = initialData && (initialData as any).id
        ? { ...form, id: (initialData as any).id }
        : form;
      console.log("ProductForm submitting, id in initialData:", initialData?.id);
    console.log("ProductForm submitting, id in form state:", form?.id);
    console.log("ProductForm submitting, payload body:", body);
    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(`Product ${initialData ? "updated" : "created"} successfully!`);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? "Edit Product" : "Add Product"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input name="name" value={form.name} onChange={handleInputChange} required />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextEditor
              value={form.description || ''}
              onChange={handleRichTextChange}
              placeholder="Enter product description..."
              className="min-h-[200px]"
            />
          </div>
          <div>
            <Label htmlFor="categoryId">Category</Label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleSelectChange}
              className="w-full border rounded-md px-3 py-2"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="brandId">Brand</Label>
            <select
              name="brandId"
              value={form.brandId || ""}
              onChange={handleSelectChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">None</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="basePrice">Base Price</Label>
            <Input name="basePrice" type="number" value={form.basePrice} onChange={handleInputChange} required min="0" />
          </div>
          <div className="flex items-center gap-4">
            <Label>Status</Label>
            <Switch checked={form.status} onCheckedChange={(v) => handleSwitch("status", v)} />
            <Label>Featured</Label>
            <Switch checked={form.featured} onCheckedChange={(v) => handleSwitch("featured", v)} />
            <Label>On Sale</Label>
            <Switch checked={form.onSale} onCheckedChange={(v) => handleSwitch("onSale", v)} />
          </div>
          <div>
            <Label>Images (URLs)</Label>
            <Textarea
              name="images"
              value={form._imagesText || ""}
              onChange={handleImagesInput}
              placeholder="Paste one or more image URLs, separated by newlines or commas"
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-1">One image URL per line or comma separated. The first image will be used as the primary image.</p>
          </div>
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Button
                  type="button"
                  key={tag.id}
                  variant={form.tagIds?.some(id => String(id) === String(tag.id)) ? "default" : "outline"}
                  className="rounded-full px-3 py-1 text-xs"
                  onClick={() => handleTagChange(tag.id)}
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>
          <VariantEditor
            value={form.variants || []}
            variantTypes={variantTypes}
            productPrice={form.basePrice || "0"}
            allowedOptions={form.allowedOptions || []}
            onChange={(variants) => setForm(prev => ({ ...prev, variants }))}
            onAllowedOptionsChange={(allowedOptions) => setForm(prev => ({ ...prev, allowedOptions }))}
            baseName={form.name}
          />
        </CardContent>
        <Separator />
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (initialData ? "Updating..." : "Creating...") : initialData ? "Update Product" : "Create Product"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};
