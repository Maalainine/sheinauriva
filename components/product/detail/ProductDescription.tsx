import { Card, CardContent } from "@/components/ui/card";

interface ProductDescriptionProps {
  description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="prose max-w-none">
          {description || 'No description available.'}
        </div>
      </CardContent>
    </Card>
  );
}
