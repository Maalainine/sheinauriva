'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const variantTypeFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
});

type VariantTypeFormValues = z.infer<typeof variantTypeFormSchema>;

interface VariantTypeFormProps {
  initialData?: {
    id?: number;
    name: string;
  } | null;
}

export function VariantTypeForm({ initialData }: VariantTypeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<VariantTypeFormValues>({
    resolver: zodResolver(variantTypeFormSchema),
    defaultValues: initialData || {
      name: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const onSubmit = async (values: VariantTypeFormValues) => {
    try {
      setLoading(true);
      const url = initialData?.id 
        ? `/api/admin/variants/types/${initialData.id}`
        : '/api/admin/variants/types';
      
      const method = initialData?.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save variant type');
      }

      toast.success(initialData?.id ? 'Variant type updated successfully' : 'Variant type created successfully');
      
      router.push('/admin/variants');
      router.refresh();
    } catch (error) {
      console.error('Error saving variant type:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save variant type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variant Type Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Size, Color, Material"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/variants')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? 'Update Variant Type' : 'Create Variant Type'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
