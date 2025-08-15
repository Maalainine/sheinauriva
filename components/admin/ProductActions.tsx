"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface ProductActionsProps {
  productId: string;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function ProductActions({ 
  productId, 
  onDelete, 
  isDeleting = false 
}: ProductActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="ghost" 
        size="icon" 
        asChild
        className="h-8 w-8"
      >
        <Link href={`/admin/products/${productId}`}>
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Link>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => onDelete?.(productId)}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        asChild
        className="h-8 w-8"
      >
        <Link href={`/products/${productId}`} target="_blank">
          <Eye className="h-4 w-4" />
          <span className="sr-only">View</span>
        </Link>
      </Button>
    </div>
  );
}
