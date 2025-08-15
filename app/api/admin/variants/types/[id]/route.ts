import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const variantTypeId = parseInt(params.id, 10);
    if (isNaN(variantTypeId)) {
      return NextResponse.json(
        { error: 'Invalid variant type ID' },
        { status: 400 }
      );
    }

    // Fetch the variant type with its options
    const variantType = await prisma.variantType.findUnique({
      where: { id: variantTypeId },
      include: {
        options: {
          select: {
            id: true,
            value: true,
          },
          orderBy: {
            value: 'asc',
          },
        },
      },
    });

    if (!variantType) {
      return NextResponse.json(
        { error: 'Variant type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(variantType);
  } catch (error) {
    console.error('Error fetching variant type:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variant type' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const variantTypeId = parseInt(params.id, 10);
    if (isNaN(variantTypeId)) {
      return NextResponse.json(
        { error: 'Invalid variant type ID' },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    // Validation
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      return NextResponse.json(
        { error: 'Variant type name is required' },
        { status: 400 }
      );
    }

    const name = data.name.trim();
    
    // Check if variant type exists
    const existingVariantType = await prisma.variantType.findUnique({
      where: { id: variantTypeId },
    });

    if (!existingVariantType) {
      return NextResponse.json(
        { error: 'Variant type not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name (excluding current variant type)
    const duplicateVariantType = await prisma.variantType.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        NOT: {
          id: variantTypeId,
        },
      },
    });

    if (duplicateVariantType) {
      return NextResponse.json(
        { error: 'A variant type with this name already exists' },
        { status: 400 }
      );
    }

    // Update the variant type
    const updatedVariantType = await prisma.variantType.update({
      where: { id: variantTypeId },
      data: {
        name,
      },
      include: {
        options: {
          select: {
            id: true,
            value: true,
          },
          orderBy: {
            value: 'asc',
          },
        },
      },
    });

    return NextResponse.json(updatedVariantType);
  } catch (error) {
    console.error('Error updating variant type:', error);
    
    if (error instanceof Error && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A variant type with this name already exists' },
          { status: 400 }
        );
      }
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Variant type not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update variant type' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const variantTypeId = parseInt(params.id, 10);
    if (isNaN(variantTypeId)) {
      return NextResponse.json(
        { error: 'Invalid variant type ID' },
        { status: 400 }
      );
    }

    // Check if variant type has associated products
    const variantTypeWithProducts = await prisma.variantType.findUnique({
      where: { id: variantTypeId },
      include: {
        options: {
          include: {
            productOptions: {
              select: { id: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!variantTypeWithProducts) {
      return NextResponse.json(
        { error: 'Variant type not found' },
        { status: 404 }
      );
    }

    // Check if any option is used in products
    const isUsedInProducts = variantTypeWithProducts.options.some(
      option => option.productOptions.length > 0
    );

    if (isUsedInProducts) {
      return NextResponse.json(
        { 
          error: 'Cannot delete variant type that is being used in products',
          isUsedInProducts: true,
        },
        { status: 400 }
      );
    }

    // Delete the variant type (cascades to options due to Prisma schema)
    await prisma.variantType.delete({
      where: { id: variantTypeId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting variant type:', error);
    
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Variant type not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete variant type' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
