'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TagForm } from '../_components/tag-form';
import { toast } from 'sonner';

interface Tag {
  id: number;
  name: string;
}

export default function EditTagPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState<Tag | null>(null);

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const response = await fetch(`/api/admin/tags/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tag');
        }
        const data = await response.json();
        setTag(data);
      } catch (error) {
        console.error('Error fetching tag:', error);
        toast.error('Failed to load tag');
        router.push('/admin/tags');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTag();
    } else {
      setLoading(false);
    }
  }, [params.id, router, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Tag</h1>
          <p className="text-muted-foreground">
            Update the tag details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tag Details</CardTitle>
          <CardDescription>Update the tag information below</CardDescription>
        </CardHeader>
        <CardContent>
          {tag ? (
            <TagForm initialData={tag} />
          ) : (
            <p className="text-muted-foreground">Tag not found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
