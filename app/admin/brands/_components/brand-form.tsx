"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const brandFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  logoUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  website: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

type BrandFormValues = z.infer<typeof brandFormSchema>;

interface BrandFormProps {
  initialData?: {
    id?: number;
    name: string;
    logoUrl: string | null;
    website: string | null;
  } | null;
}

export function BrandForm({ initialData }: BrandFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      logoUrl: initialData?.logoUrl || "",
      website: initialData?.website || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        logoUrl: initialData.logoUrl || "",
        website: initialData.website || "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: BrandFormValues) => {
    try {
      setLoading(true);
      const url = initialData?.id
        ? `/api/admin/brands/${initialData.id}`
        : "/api/admin/brands";

      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          logoUrl: values.logoUrl || null,
          website: values.website || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save brand");
      }

      toast.success(
        initialData?.id
          ? "Brand updated successfully"
          : "Brand created successfully",
      );

      router.push("/admin/brands");
      router.refresh();
    } catch (error) {
      console.error("Error saving brand:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save brand",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter brand name"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/logo.png"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="w-48 h-48 border rounded-md flex items-center justify-center overflow-hidden bg-muted/50">
              {form.watch("logoUrl") ? (
                <img
                  src={form.watch("logoUrl")}
                  alt="Brand logo preview"
                  className="max-w-full max-h-full object-contain p-2"
                />
              ) : (
                <span className="text-muted-foreground text-sm">
                  Logo preview
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/brands")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? "Update Brand" : "Create Brand"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
