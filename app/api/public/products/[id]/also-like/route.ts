import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id, 10);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // First, get the current product to find its category
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        categoryId: true,
        id: true
      }
    });

    if (!currentProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Find other products in the same category, excluding the current product
    const alsoLikeProducts = await prisma.product.findMany({
      where: {
        categoryId: currentProduct.categoryId,
        id: { not: productId },
        status: true // Only include active products
      },
      take: 4, // Limit to 4 related products
      include: {
        category: true,
        brand: true,
        tags: true
      },
      orderBy: {
        createdAt: 'desc' // Show newest products first
      }
    });

    return NextResponse.json({
      products: alsoLikeProducts
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related products' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
