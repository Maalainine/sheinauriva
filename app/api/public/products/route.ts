import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log('Received request with params:', Object.fromEntries(searchParams.entries()));
    
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const take = parseInt(searchParams.get('take') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Log parsed values for debugging
    console.log('Parsed params:', { sortBy, sortOrder, take, skip });

    // Validate sort fields to prevent SQL injection
    const validSortFields = ['name', 'price', 'basePrice', 'createdAt', 'updatedAt'];
    // Map 'price' to 'basePrice' for Prisma model compatibility
    const sortField = validSortFields.includes(sortBy) 
      ? sortBy === 'price' ? 'basePrice' : sortBy 
      : 'createdAt';
    
    // Validate sort order
    const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
    
    console.log('Using sort:', { sortField, orderDirection });

    // Build the orderBy object dynamically
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[sortField] = orderDirection as 'asc' | 'desc';

    // Build the where clause for filtering (expand as needed)
    const where: any = {};
    const categoryId = searchParams.get('categoryId');
    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10);
    }
    const brandId = searchParams.get('brandId');
    if (brandId) {
      where.brandId = parseInt(brandId, 10);
    }
    const tagId = searchParams.get('tagId');
    if (tagId) {
      where.tags = {
        some: {
          id: parseInt(tagId, 10),
        },
      };
    }
    if (searchParams.get('status')) {
      where.status = searchParams.get('status') === 'true';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        take,
        skip,
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

    // Add hasVariants and variantCount fields to each product
    const enhancedProducts = products.map(product => ({
      ...product,
      hasVariants: product.variants && product.variants.length > 0,
      variantCount: product.variants ? product.variants.length : 0
    }));

    return NextResponse.json({ products: enhancedProducts, total });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
