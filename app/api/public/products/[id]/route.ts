/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

// Helper function to handle errors
function handleError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("Prisma Error Code:", error.code);
    console.error("Prisma Error Meta:", error.meta);
    return NextResponse.json(
      {
        error: "Database error",
        details: {
          code: error.code,
          meta: error.meta,
        },
      },
      { status: 500 },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    // Fetch the product with all necessary relations
    const product = (await prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
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
    })) as any; // Complex Prisma type with deep includes is difficult to type precisely

    console.log("Product found:", !!product);
    console.log("Product ID type:", typeof productId);
    console.log("Product ID value:", productId);

    // Log the raw product data for debugging
    try {
      console.log(
        "Raw product data from DB:",
        JSON.stringify(product, null, 2),
      );
    } catch (e) {
      console.error("Error stringifying product data:", e);
    }

    if (!product) {
      console.error(
        `Product with ID ${productId} not found after initial check`,
      );
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Log the structure of the product for debugging
    console.log(
      "Product structure:",
      JSON.stringify(
        {
          id: product.id,
          name: product.name,
          variants: Array.isArray(product.variants)
            ? product.variants.length
            : "not an array",
          variantTypes: "variantTypes" in product ? "exists" : "does not exist",
          hasSelections: Array.isArray(product.variants)
            ? product.variants.some((v: any) => Array.isArray(v.selections))
            : "n/a",
        },
        null,
        2,
      ),
    );

    if (!product) {
      console.error(
        `Product with ID ${productId} not found after initial check`,
      );
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    try {
      // Build variantTypes from the variant values we already have
      const variantTypeMap = new Map();

      if (Array.isArray(product.variants)) {
        for (const variant of product.variants) {
          if (Array.isArray(variant.selections)) {
            for (const selection of variant.selections) {
              const variantType = (selection as any).option?.variantType;
              if (!variantType) continue;

              const typeId = variantType.id.toString();
              if (!variantTypeMap.has(typeId)) {
                variantTypeMap.set(typeId, {
                  id: typeId,
                  name: variantType.name,
                  values: new Map(),
                });
              }

              const option = selection.option;
              const optionId = option.id.toString();
              const value = option.value;
              if (!variantTypeMap.get(typeId).values.has(optionId)) {
                variantTypeMap.get(typeId).values.set(optionId, {
                  id: optionId,
                  value: value,
                  displayName: value,
                });
              }
            }
          }
        }
      }

      // Convert variant type map to array
      const transformedVariantTypes = Array.from(variantTypeMap.values()).map(
        (type) => ({
          ...type,
          values: Array.from(type.values.values()),
        }),
      );

      console.log("Processed variant types:", transformedVariantTypes);

      // Transform the product data to match the frontend's expected format
      const transformedProduct = {
        id: (product as any).id.toString(),
        name: (product as any).name,
        description: (product as any).description,
        basePrice: (product as any).basePrice,
        images: (product as any).images || [],
        status: (product as any).status,
        featured: (product as any).featured,
        onSale: (product as any).onSale,
        brand: (product as any).brand
          ? {
              id: (product as any).brand.id.toString(),
              name: (product as any).brand.name,
            }
          : null,
        category: (product as any).category
          ? {
              id: (product as any).category.id.toString(),
              name: (product as any).category.name,
            }
          : null,
        tags: ((product as any).tags || []).map((tag: any) => ({
          id: tag.id.toString(),
          name: tag.name,
        })),
        variants: ((product as any).variants || []).map((v: any) => ({
          id: v.id.toString(),
          sku: v.sku || "",
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          values: Array.isArray(v.selections)
            ? v.selections.map((s: any) => ({
                id: s.option?.id?.toString() || "",
                value: s.option?.value || "",
                displayName: s.option?.value || null,
                variantType: {
                  id: s.option?.variantType?.id?.toString() || "",
                  name: s.option?.variantType?.name || "",
                },
              }))
            : [],
        })),
        variantTypes: transformedVariantTypes,
        stock: ((product as any).variants || []).reduce(
          (sum: number, v: any) => sum + (Number(v.stock) || 0),
          0,
        ),
        sku: (product as any).sku || `prod-${(product as any).id}`,
        weight: (product as any).weight || null,
        dimensions: (product as any).dimensions || null,
        rating: 0, // Default values, can be updated later
        reviewCount: 0,
        createdAt: (product as any).createdAt
          ? new Date((product as any).createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: (product as any).updatedAt
          ? new Date((product as any).updatedAt).toISOString()
          : new Date().toISOString(),
      };

      console.log(
        "Transformed product data:",
        JSON.stringify(transformedProduct, null, 2),
      );

      return NextResponse.json(transformedProduct);
    } catch (error) {
      console.error("Error transforming product data:", error);
      // Include more error details in the response
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      return NextResponse.json(
        {
          error: "Failed to process product data",
          message: errorMessage,
          stack:
            process.env.NODE_ENV === "development" ? errorStack : undefined,
          productId,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    return handleError(error);
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error("Error disconnecting Prisma client:", e);
    }
  }
}
