import { Metadata } from 'next';
import { VariantTypeForm } from '../_components/variant-type-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Add New Variant Type',
  description: 'Add a new variant type to your store',
};

export default function NewVariantTypePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Variant Type</h1>
        <p className="text-muted-foreground">
          Add a new variant type to your store (e.g., Size, Color, Material)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variant Type Information</CardTitle>
          <CardDescription>Enter the details for the new variant type.</CardDescription>
        </CardHeader>
        <CardContent>
          <VariantTypeForm />
        </CardContent>
      </Card>
    </div>
  );
}
