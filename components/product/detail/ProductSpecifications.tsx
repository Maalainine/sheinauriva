import { Card, CardContent } from "@/components/ui/card";
import { IconPackage, IconCircleCheck } from "@tabler/icons-react";

interface ProductSpecificationsProps {
  specifications: Record<string, unknown> | string | undefined;
  weight?: string;
  dimensions?: string;
  brand?: string;
  category?: { name: string };
}

export function ProductSpecifications({
  specifications,
  weight,
  dimensions,
  brand,
  category,
}: ProductSpecificationsProps) {
  const renderSpecifications = () => {
    if (!specifications) {
      return <p className="text-muted-foreground">No specifications available.</p>;
    }

    if (typeof specifications === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: specifications }} />;
    }

    return (
      <div className="space-y-4">
        {Object.entries(specifications).map(([key, value]) => (
          <div key={key} className="flex justify-between border-b pb-2 last:border-b-0 last:pb-0">
            <dt className="font-medium text-foreground">{key}</dt>
            <dd className="text-muted-foreground text-right">{String(value)}</dd>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          {category && (
            <div className="flex justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <IconCircleCheck className="h-4 w-4" />
                Category
              </span>
              <span className="text-foreground">{category.name}</span>
            </div>
          )}
          {brand && (
            <div className="flex justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <IconCircleCheck className="h-4 w-4" />
                Brand
              </span>
              <span className="text-foreground">{brand}</span>
            </div>
          )}
          {weight && (
            <div className="flex justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <IconCircleCheck className="h-4 w-4" />
                Weight
              </span>
              <span className="text-foreground">{weight}g</span>
            </div>
          )}
          {dimensions && (
            <div className="flex justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <IconCircleCheck className="h-4 w-4" />
                Dimensions
              </span>
              <span className="text-foreground">{dimensions}</span>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t">
          <h3 className="font-medium mb-4">Technical Specifications</h3>
          {renderSpecifications()}
        </div>
      </CardContent>
    </Card>
  );
}
