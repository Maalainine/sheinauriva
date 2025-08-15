// Base types that match our Prisma schema
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VariantType {
  id: number;
  name: string;
  options: VariantOption[];
}

export interface VariantOption {
  id: number;
  value: string;
  variantTypeId: number;
  variantType?: VariantType;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFormValues {
  name: string;
  description?: string;
  categoryId: string;
  brandId?: string;
  basePrice: string;
  status: boolean;
  featured: boolean;
  onSale: boolean;
  images: Array<{
    url: string;
    alt?: string;
    order: number;
  }>;
  tagIds: string[];
  variants: Array<{
    sku: string;
    price: string;
    stock: number;
    selections: Array<{
      variantTypeId: string;
      optionId: string;
    }>;
  }>;
}

export interface ProductFormProps {
  categories?: Category[];
  brands?: Brand[];
  tags?: Tag[];
  variantTypes?: VariantType[];
  initialData?: any;
  isEditing?: boolean;
  onSubmit?: (data: any) => Promise<void> | void;
  isLoading?: boolean;
}
