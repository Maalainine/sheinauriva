"use client";

import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { ProductActions } from "./ProductActions";
import { Skeleton } from "@/components/ui/skeleton";

export interface ProductRowProps {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  category?: string;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export const ProductRow = ({
  id,
  name,
  price,
  stock,
  imageUrl,
  category,
  onDelete,
  isDeleting = false,
}: ProductRowProps) => {
  const status = stock > 10 ? 'in_stock' : stock > 0 ? 'low_stock' : 'out_of_stock';
  
  return (
    <tr>
      <td className="py-4">
        <div className="flex items-center space-x-4">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <span className="text-xs text-muted-foreground">No image</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            {category && (
              <p className="truncate text-xs text-muted-foreground">{category}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm">
        {formatCurrency(price / 100)}
      </td>
      <td className="px-4 py-4">
        <ProductStatusBadge status={status} />
      </td>
      <td className="px-4 py-4 text-right text-sm text-muted-foreground">
        {stock} in stock
      </td>
      <td className="px-4 py-4 text-right">
        <ProductActions 
          productId={id} 
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      </td>
    </tr>
  );
};

export const ProductRowSkeleton = () => {
  return (
    <tr>
      <td className="py-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-6 w-20" />
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </td>
    </tr>
  );
};
