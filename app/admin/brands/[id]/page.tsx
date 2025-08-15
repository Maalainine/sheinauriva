'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BrandForm } from '../_components/brand-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

interface Brand {
  id: number;
  name: string;
  logoUrl: string | null;
  website: string | null;
}

export default function EditBrandPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<Brand | null>(null);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await fetch(`/api/admin/brands/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch brand');
        const data = await response.json();
        setBrand(data);
      } catch (error) {
        console.error('Error fetching brand:', error);
        toast.error('Failed to load brand');
        router.push('/admin/brands');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBrand();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Brand not found</p>
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
            onClick={() => router.push('/admin/brands')}
            className="-ml-2 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Brands
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Brand</h1>
          <p className="text-muted-foreground">
            Update the brand details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
          <CardDescription>Update the details for this brand.</CardDescription>
        </CardHeader>
        <CardContent>
          <BrandForm initialData={brand} />
        </CardContent>
      </Card>
    </div>
  );
}
