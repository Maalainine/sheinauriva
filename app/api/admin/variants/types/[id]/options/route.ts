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

    // Fetch all options for the variant type
    const options = await prisma.variantOption.findMany({
      where: {
        variantTypeId,
      },
      select: {
        id: true,
        value: true,
      },
      orderBy: {
        value: 'asc',
      },
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error fetching variant options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variant options' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(
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
    if (!data.value || typeof data.value !== 'string' || data.value.trim() === '') {
      return NextResponse.json(
        { error: 'Option value is required' },
        { status: 400 }
      );
    }

    const value = data.value.trim();

    // Check if variant type exists
    const variantType = await prisma.variantType.findUnique({
      where: { id: variantTypeId },
    });

    if (!variantType) {
      return NextResponse.json(
        { error: 'Variant type not found' },
        { status: 404 }
      );
    }

    // Check for duplicate option value (case-insensitive, same variant type)
    const existingOption = await prisma.variantOption.findFirst({
      where: {
        variantTypeId,
        value: {
          equals: value,
          mode: 'insensitive',
        },
      },
    });

    if (existingOption) {
      return NextResponse.json(
        { error: 'An option with this value already exists for this variant type' },
        { status: 400 }
      );
    }

    // Create the new option
    const newOption = await prisma.variantOption.create({
      data: {
        value,
        variantType: {
          connect: { id: variantTypeId },
        },
      },
      select: {
        id: true,
        value: true,
      },
    });

    return NextResponse.json(newOption, { status: 201 });
  } catch (error) {
    console.error('Error creating variant option:', error);
    
    if (error instanceof Error && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'An option with this value already exists for this variant type' },
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
      { error: 'Failed to create variant option' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
