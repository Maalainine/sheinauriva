"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Link from 'next/link';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    } else {
      setLoading(false);
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch category');
      const data = await response.json();
      console.log('Fetched category data:', data);
      setCategory({
        name: data.name,
        description: data.description || '',
        imageUrl: data.imageUrl || '',
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      const method = categoryId ? 'PUT' : 'POST';
      const url = categoryId 
        ? `/api/admin/categories/${categoryId}`
        : '/api/admin/categories';

      const requestData = {
        name: category.name,
        description: category.description || null,
        imageUrl: category.imageUrl || null
      };

      console.log('Sending request to:', url);
      console.log('Request data:', requestData);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save category');
      }

      toast.success(`Category ${categoryId ? 'updated' : 'created'} successfully`);
      router.push('/admin/categories');
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

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
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {categoryId ? 'Edit Category' : 'Create Category'}
          </h1>
          <p className="text-muted-foreground">
            {categoryId ? 'Update category details' : 'Add a new product category'}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>
              {categoryId 
                ? 'Update the category information below.'
                : 'Enter the category details below.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={category.name}
                onChange={(e) => setCategory({...category, name: e.target.value})}
                placeholder="e.g., Electronics, Clothing, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={category.imageUrl}
                onChange={(e) => setCategory({...category, imageUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
              {category.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={category.imageUrl} 
                    alt={category.name}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

<div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={category.description}
                onChange={(e) => setCategory({ ...category, description: e.target.value })}
                placeholder="Enter a description for the category"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/categories')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
