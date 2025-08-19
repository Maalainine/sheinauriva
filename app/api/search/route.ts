import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() || '';
  
  if (!query) {
    return NextResponse.json({ 
      products: [],
      categories: [],
      tags: [],
      brands: []
    });
  }

  try {
    // Search products
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ],
        status: true, // Only show active products
      },
      take: 5,
      select: {
        id: true,
        name: true,
        images: true,
        basePrice: true,
        description: true
      }
    });

    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        description: true
      }
    });

    // Search tags
    const tags = await prisma.tag.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        color: true
      }
    });

    // Search brands
    const brands = await prisma.brand.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        logoUrl: true,
        description: true
      }
    });

    return NextResponse.json({
      products,
      categories,
      tags,
      brands
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
