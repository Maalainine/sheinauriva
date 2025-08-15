import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductStatusBadgeProps {
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | string;
  className?: string;
}

export function ProductStatusBadge({ status, className }: ProductStatusBadgeProps) {
  const statusConfig = {
    in_stock: {
      label: 'In Stock',
      variant: 'default' as const,
      className: 'bg-green-500 hover:bg-green-600',
    },
    low_stock: {
      label: 'Low Stock',
      variant: 'secondary' as const,
      className: 'bg-amber-500 hover:bg-amber-600',
    },
    out_of_stock: {
      label: 'Out of Stock',
      variant: 'destructive' as const,
      className: '',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: 'Unknown',
    variant: 'outline' as const,
    className: '',
  };

  return (
    <Badge 
      variant={config.variant} 
      className={cn('whitespace-nowrap', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
