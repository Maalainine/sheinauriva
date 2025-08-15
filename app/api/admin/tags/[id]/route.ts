import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

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

    // Ensure ID is a number
    const tagId = Number(params.id);
    if (isNaN(tagId)) {
      return NextResponse.json(
        { error: 'Invalid tag ID' },
        { status: 400 }
      );
    }

    // Get the tag
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error in GET /api/admin/tags/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tag',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
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

    // Ensure ID is a number
    const tagId = Number(params.id);
    if (isNaN(tagId)) {
      return NextResponse.json(
        { error: 'Invalid tag ID' },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Check if another tag with the same name already exists
    const duplicateTag = await prisma.tag.findFirst({
      where: {
        name: data.name,
        id: { not: tagId },
      },
    });

    if (duplicateTag) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 400 }
      );
    }

    // Update the tag
    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name: data.name,
      },
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error('Error in PUT /api/admin/tags/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update tag',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
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

    // Ensure ID is a number
    const tagId = Number(params.id);
    if (isNaN(tagId)) {
      return NextResponse.json(
        { error: 'Invalid tag ID' },
        { status: 400 }
      );
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if tag exists and get product count
      const tag = await tx.tag.findUnique({
        where: { id: tagId },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      if (!tag) {
        throw new Error('Tag not found');
      }

      // Check if tag has associated products
      if (tag._count.products > 0) {
        throw new Error('Cannot delete tag with associated products');
      }

      // Delete the tag
      return await tx.tag.delete({
        where: { id: tagId },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/tags/[id]:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === 'Tag not found') {
        return NextResponse.json(
          { error: 'Tag not found' },
          { status: 404 }
        );
      }
      
      if (error.message === 'Cannot delete tag with associated products') {
        return NextResponse.json(
          { 
            error: 'Cannot delete tag with associated products. Please remove all products from this tag first.'
          },
          { status: 400 }
        );
      }
    }
    
    // Generic error response
    return NextResponse.json(
      { 
        error: 'Failed to delete tag',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
