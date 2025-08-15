// Product types based on Prisma schema
export interface Image {
  url: string;
  alt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface Brand {
  id: number;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
}

export interface Tag {
  id: number;
  name: string;
  color?: string | null;
}

export interface VariantType {
  id: number;
  name: string;
  options: VariantOption[];
}

export interface VariantOption {
  id: number;
  variantTypeId: number;
  value: string;
  variantType: {
    id: number;
    name: string;
  };
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  stock: number;
  selections: {
    option: VariantOption;
  }[];
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  basePrice: number;
  status: boolean;
  featured: boolean;
  onSale: boolean;
  images: string[];
  category: Category;
  brand: Brand | null;
  tags: Tag[];
  variants: ProductVariant[];
  allowedOptions: Array<{
    option: VariantOption;
  }>;
  _count: {
    variants: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Helper types for the product detail page
export interface SelectedOptions {
  [key: number]: number | null; // variantTypeId -> optionId
}

export interface PriceRange {
  min: number;
  max: number;
  hasRange: boolean;
}
