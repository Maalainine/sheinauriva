import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

// Use a single PrismaClient instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('GET /api/admin/categories/[id] - Start');
  console.log('Category ID:', params.id);
  
  try {
    // Verify admin access
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ensure ID is a number
    const categoryId = Number(params.id);
    if (isNaN(categoryId)) {
      console.log('Invalid category ID:', params.id);
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }
    
    console.log('Fetching category with ID:', categoryId);
    
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      console.log('Category not found');
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    console.log('Category found:', category);
    return NextResponse.json(category);
    
  } catch (error) {
    console.error('Error in GET /api/admin/categories/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch category',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('PUT /api/admin/categories/[id] - Start');
  console.log('Category ID:', params.id);
  
  try {
    // Verify admin access
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('Update data received:', data);
    
    // Validate required fields
    if (!data.name) {
      console.log('Validation failed: Name is required');
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Ensure ID is a number
    const categoryId = Number(params.id);
    if (isNaN(categoryId)) {
      console.log('Invalid category ID:', params.id);
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }
    
    // Prepare update data according to Prisma schema
    const updateData = {
      name: data.name,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      updatedAt: new Date()
    };

    console.log('Updating category with data:', updateData);

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    console.log('Category updated successfully:', updatedCategory);
    return NextResponse.json(updatedCategory);
    
  } catch (error) {
    console.error('Error in PUT /api/admin/categories/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update category',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('DELETE /api/admin/categories/[id] - Start');
  console.log('Category ID to delete:', params.id);
  
  try {
    // Verify admin access
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User authorized, checking category...');
    
    // Ensure ID is a number
    const categoryId = Number(params.id);
    if (isNaN(categoryId)) {
      console.log('Invalid category ID:', params.id);
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }
    
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if category exists and get product count
      const category = await tx.category.findUnique({
        where: { id: categoryId },
        include: { 
          _count: { 
            select: { products: true } 
          } 
        }
      });

      if (!category) {
        console.log('Category not found');
        throw new Error('Category not found');
      }

      // Check if category has products
      if (category._count.products > 0) {
        console.log('Cannot delete category with products');
        throw new Error('Cannot delete category with products');
      }

      console.log('Deleting category...');
      
      // Delete the category
      return await tx.category.delete({
        where: { id: categoryId }
      });
    });

    console.log('Category deleted successfully');
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Error in DELETE /api/admin/categories/[id]:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === 'Category not found') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
      
      if (error.message === 'Cannot delete category with products') {
        return NextResponse.json(
          { 
            error: 'Cannot delete category with products. Please remove all products from this category first.'
          },
          { status: 400 }
        );
      }
    }
    
    // For any other errors
    return NextResponse.json(
      { 
        error: 'Failed to delete category',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
