import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all variant types with their options
    const variantTypes = await prisma.variantType.findMany({
      orderBy: {
        name: 'asc',
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

    return NextResponse.json(variantTypes);
  } catch (error) {
    console.error('Error fetching variant types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variant types' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
    
    // Check for existing variant type with the same name (case-insensitive)
    const existingVariantType = await prisma.variantType.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingVariantType) {
      return NextResponse.json(
        { error: 'A variant type with this name already exists' },
        { status: 400 }
      );
    }

    // Create the new variant type
    const newVariantType = await prisma.variantType.create({
      data: {
        name,
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json(newVariantType, { status: 201 });
  } catch (error) {
    console.error('Error creating variant type:', error);
    
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A variant type with this name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create variant type' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
