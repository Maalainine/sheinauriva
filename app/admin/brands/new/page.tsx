import { Metadata } from 'next';
import { BrandForm } from '../_components/brand-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Add New Brand',
  description: 'Add a new brand to your store',
};

export default function NewBrandPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Brand</h1>
        <p className="text-muted-foreground">
          Add a new brand to your store
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
          <CardDescription>Enter the details for the new brand.</CardDescription>
        </CardHeader>
        <CardContent>
          <BrandForm />
        </CardContent>
      </Card>
    </div>
  );
}
