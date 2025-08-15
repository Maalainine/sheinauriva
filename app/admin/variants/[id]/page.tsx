'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VariantTypeForm } from '../_components/variant-type-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

interface VariantType {
  id: number;
  name: string;
}

export default function EditVariantTypePage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [variantType, setVariantType] = useState<VariantType | null>(null);

  useEffect(() => {
    const fetchVariantType = async () => {
      try {
        const response = await fetch(`/api/admin/variants/types/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch variant type');
        const data = await response.json();
        setVariantType(data);
      } catch (error) {
        console.error('Error fetching variant type:', error);
        toast.error('Failed to load variant type');
        router.push('/admin/variants');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVariantType();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!variantType) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Variant type not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/variants')}
            className="-ml-2 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Variant Types
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Variant Type</h1>
          <p className="text-muted-foreground">
            Update the variant type details and options
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variant Type Information</CardTitle>
          <CardDescription>Update the details for this variant type.</CardDescription>
        </CardHeader>
        <CardContent>
          <VariantTypeForm initialData={variantType} />
        </CardContent>
      </Card>
    </div>
  );
}
