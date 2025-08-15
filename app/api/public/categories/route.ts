import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all categories with product count
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Format the response with images from database
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      subtitle: category.description,
      images: category.imageUrl ? [
        {
          url: category.imageUrl,
          alt: category.name,
        },
      ] : [],
      _count: {
        products: category._count.products,
      },
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching public categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
