"use client";

import React from "react";
import { IconAlertCircle } from "@tabler/icons-react";

export interface ProductVariant {
  id: number;
  sku: string;
  price: string;
  stock: number;
  selections: Array<{
    option: {
      id: number;
      value: string;
      variantType: {
        id: number;
        name: string;
      };
    };
  }>;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  basePrice: string | number;
  status: boolean;
  featured: boolean;
  onSale: boolean;
  images: string[]; // Array of image URLs
  variants?: ProductVariant[];
  categoryId?: number;
  brandId?: number | null;
  category?: {
    id: number;
    name: string;
  };
  brand?: {
    id: number;
    name: string;
  } | null;
  tags?: Array<{
    id: number;
    name: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockSummary {
  totalStock: number;
  inStockVariants: number;
  outOfStockVariants: number;
  lowStockVariants: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "inactive";
  stockDisplay: string;
  stockLevel: "high" | "medium" | "low" | "out";
}

/**
 * Calculate comprehensive stock information from product variants
 */
export const calculateStockFromVariants = (
  product: Product,
  lowStockThreshold: number = 10,
): StockSummary => {
  // If product is inactive, return inactive status
  if (!product.status) {
    return {
      totalStock: 0,
      inStockVariants: 0,
      outOfStockVariants: 0,
      lowStockVariants: 0,
      stockStatus: "inactive",
      stockDisplay: "Inactive",
      stockLevel: "out",
    };
  }

  // If no variants, treat as a simple product
  if (!product.variants || product.variants.length === 0) {
    return {
      totalStock: 0,
      inStockVariants: 0,
      outOfStockVariants: 0,
      lowStockVariants: 0,
      stockStatus: "out_of_stock",
      stockDisplay: "No variants",
      stockLevel: "out",
    };
  }

  // Calculate stock metrics from variants
  const totalStock = product.variants.reduce(
    (sum, variant) => sum + (variant.stock || 0),
    0,
  );
  const inStockVariants = product.variants.filter(
    (v) => (v.stock || 0) > 0,
  ).length;
  const outOfStockVariants = product.variants.filter(
    (v) => (v.stock || 0) === 0,
  ).length;
  const lowStockVariants = product.variants.filter(
    (v) => (v.stock || 0) > 0 && (v.stock || 0) <= lowStockThreshold,
  ).length;

  // Determine stock status
  let stockStatus: StockSummary["stockStatus"];
  let stockDisplay: string;
  let stockLevel: StockSummary["stockLevel"];

  if (totalStock === 0) {
    stockStatus = "out_of_stock";
    stockDisplay = "Out of Stock";
    stockLevel = "out";
  } else if (totalStock <= lowStockThreshold) {
    stockStatus = "low_stock";
    stockDisplay = `Low Stock (${totalStock})`;
    stockLevel = "low";
  } else if (totalStock <= lowStockThreshold * 2) {
    stockStatus = "in_stock";
    stockDisplay = `In Stock (${totalStock})`;
    stockLevel = "medium";
  } else {
    stockStatus = "in_stock";
    stockDisplay = `In Stock (${totalStock})`;
    stockLevel = "high";
  }

  return {
    totalStock,
    inStockVariants,
    outOfStockVariants,
    lowStockVariants,
    stockStatus,
    stockDisplay,
    stockLevel,
  };
};

/**
 * Get stock badge color based on stock level
 */
export const getStockBadgeColor = (stockLevel: StockSummary["stockLevel"]) => {
  switch (stockLevel) {
    case "high":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "medium":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "low":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "out":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

/**
 * Enhanced render stock function for your component
 */
export const renderEnhancedStock = (
  product: Product,
  lowStockThreshold: number = 10,
) => {
  const stockSummary = calculateStockFromVariants(product, lowStockThreshold);

  return {
    display: stockSummary.stockDisplay,
    level: stockSummary.stockLevel,
    summary: stockSummary,
    badgeColor: getStockBadgeColor(stockSummary.stockLevel),
  };
};

/**
 * Get detailed stock breakdown for tooltips or detailed views
 */
export const getStockBreakdown = (product: Product): string => {
  if (!product.variants || product.variants.length === 0) {
    return "No variants available";
  }

  const breakdown = product.variants
    .map((variant) => {
      const variantName =
        variant.selections.map((s) => s.option.value).join(", ") || variant.sku;
      return `${variantName}: ${variant.stock || 0}`;
    })
    .join("\n");

  return breakdown;
};

/**
 * Check if product needs restocking
 */
export const needsRestocking = (
  product: Product,
  lowStockThreshold: number = 10,
): boolean => {
  const stockSummary = calculateStockFromVariants(product, lowStockThreshold);
  return (
    stockSummary.stockStatus === "low_stock" ||
    stockSummary.stockStatus === "out_of_stock"
  );
};

/**
 * Get products that need attention (low stock or out of stock)
 */
export const getProductsNeedingAttention = (
  products: Product[],
  lowStockThreshold: number = 10,
): Product[] => {
  return products.filter((product) =>
    needsRestocking(product, lowStockThreshold),
  );
};

/**
 * Stock Badge Component
 */
// StockBadge component is now defined in a separate file to avoid JSX/TSX parsing issues in this utility file

// renderStock function is now defined in a separate file to avoid JSX/TSX parsing issues in this utility file
