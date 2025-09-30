import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

// Helper function to handle errors
function handleError(error: unknown, message: string) {
  console.error(message, error);
  return NextResponse.json(
    {
      success: false,
      error: message,
      details: error instanceof Error ? error.message : String(error),
    },
    { status: 500 },
  );
}

// Define types for the response data
interface ProductResponse {
  id: number;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  slug: string | null;
  sku: string;
  isActive: boolean;
  categoryId: number;
  category: {
    id: number;
    name: string;
  } | null;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
  brand: {
    id: number;
    name: string;
    logoUrl: string | null;
  } | null;
  tags: Array<{
    id: number;
    name: string;
  }>;
  images: Array<{
    id: string;
    url: string;
    alt: string;
  }>;
  variants: Array<{
    id: number;
    sku: string;
    price: number;
    stock: number;
    values: Array<{
      id: number;
      value: string;
      variantType: {
        id: number;
        name: string;
      };
    }>;
  }>;
  variantTypes: Array<{
    id: number;
    name: string;
    values: Array<{
      id: number;
      value: string;
    }>;
  }>;
  hasVariants: boolean;
  variantCount: number;
}

export async function GET(request: Request) {
  console.log("Received request to /api/public/product");
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const take = parseInt(searchParams.get("take") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Validate sort fields to prevent SQL injection
    const validSortFields = ["name", "price", "createdAt", "updatedAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");
    const tagId = searchParams.get("tagId");
    const featured = searchParams.get("featured");

    // Build the where clause
    const where: any = {
      status: true, // Only show active products
    };

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (brandId) {
      where.brandId = parseInt(brandId);
    }

    if (tagId) {
      where.tags = {
        some: {
          id: parseInt(tagId),
        },
      };
    }

    if (featured === "true") {
      where.featured = true;
    }

    // Build the orderBy clause
    let orderBy: any = { [sortBy]: sortOrder };
    if (sortBy === "price") {
      orderBy = {
        basePrice: sortOrder,
      };
    } else if (sortBy === "name") {
      orderBy = {
        name: sortOrder,
      };
    } else {
      orderBy = {
        createdAt: sortOrder === "asc" ? "asc" : "desc",
      };
    }

    console.log("Query parameters:", { sortBy, sortOrder, take, skip, where });

    // Fetch products with pagination, sorting, and filtering
    const [dbProducts, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        take: Math.min(take, 100), // Limit to 100 items max
        skip,
        orderBy,
        include: {
          category: true,
          brand: true,
          tags: true,
          variants: {
            include: {
              selections: {
                include: {
                  option: {
                    include: {
                      variantType: true,
                    },
                  },
                },
              },
            },
          },
          allowedOptions: {
            include: {
              option: {
                include: {
                  variantType: true,
                },
              },
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);
    console.log(`Fetched ${dbProducts.length} products`);

    // Transform the database response to match the expected frontend format
    const formattedProducts: ProductResponse[] = [];

    for (const product of dbProducts) {
      // Safely access variants or default to empty array
      const variants = Array.isArray(product.variants) ? product.variants : [];

      // Calculate total stock from variants
      const stock = variants.reduce(
        (sum, variant) => sum + (variant.stock || 0),
        0,
      );

      // Process variant types and values
      const variantTypesMap = new Map<
        number,
        {
          id: number;
          name: string;
          values: Array<{ id: number; value: string }>;
        }
      >();

      // Process allowed options first to get all possible variant types
      if (Array.isArray(product.allowedOptions)) {
        for (const allowedOption of product.allowedOptions) {
          if (!allowedOption?.option?.variantType) continue;

          const typeId = allowedOption.option.variantType.id;
          const typeName = allowedOption.option.variantType.name;

          if (!variantTypesMap.has(typeId)) {
            variantTypesMap.set(typeId, {
              id: typeId,
              name: typeName,
              values: [],
            });
          }
        }
      }

      // Process each variant's selections
      for (const variant of variants) {
        if (!Array.isArray(variant.selections)) continue;

        for (const selection of variant.selections) {
          if (!selection?.option?.variantType) continue;

          const typeId = selection.option.variantType.id;
          const valueId = selection.option.id;
          const value = selection.option.value;

          const type = variantTypesMap.get(typeId);
          if (type && !type.values.some((v) => v.id === valueId)) {
            type.values.push({
              id: valueId,
              value,
            });
          }
        }
      }

      // Format the product response
      const formattedProduct: ProductResponse = {
        id: product.id,
        name: product.name,
        description: product.description || null,
        price: Number(product.basePrice),
        originalPrice: product.onSale ? Number(product.basePrice) * 1.2 : null,
        slug: null, // Add slug if available in your schema
        sku: product.variants[0]?.sku || `PROD-${product.id}`,
        isActive: product.status,
        categoryId: product.categoryId,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name,
            }
          : null,
        stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        brand: product.brand
          ? {
              id: product.brand.id,
              name: product.brand.name,
              logoUrl: product.brand.logoUrl || null,
            }
          : null,
        tags: Array.isArray(product.tags)
          ? product.tags.map((tag) => ({
              id: tag.id,
              name: tag.name,
            }))
          : [],
        images: (product.images || []).map(
          (imageUrl: string, index: number) => ({
            id: `img-${product.id}-${index}`,
            url: imageUrl,
            alt: `${product.name} - Image ${index + 1}`,
          }),
        ),
        variants: variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku || `VAR-${variant.id}`,
          price: Number(variant.price || product.basePrice),
          stock: variant.stock || 0,
          values: Array.isArray(variant.selections)
            ? variant.selections
                .filter((sel) => sel?.option?.variantType)
                .map((sel) => ({
                  id: sel.option.id,
                  value: sel.option.value,
                  variantType: {
                    id: sel.option.variantType.id,
                    name: sel.option.variantType.name,
                  },
                }))
            : [],
        })),
        variantTypes: Array.from(variantTypesMap.values()),
        hasVariants: variants.length > 0,
        variantCount: variants.length,
      };

      formattedProducts.push(formattedProduct);
    }

    // Ensure we have a valid response structure
    const response = {
      success: true,
      data: formattedProducts,
      meta: {
        total: totalCount,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(totalCount / take),
      },
    };

    console.log("Sending response with", formattedProducts.length, "products");
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error, "Failed to fetch products");
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error("Error disconnecting from Prisma:", e);
    }
  }
}
