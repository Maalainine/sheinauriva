import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for address
const addressSchema = z.object({
  address1: z.string().min(1, 'Address line 1 is required').trim(),
  address2: z.string().nullable().optional(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.string().min(1, 'State is required').trim(),
  postalCode: z.string().min(1, 'Postal code is required').trim(),
  country: z.string().min(1, 'Country is required').trim(),
  isDefault: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    const addresses = await prisma.shippingAddress.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        address1: true,
        address2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(addresses.map(address => ({
      ...address,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    })));

  } catch (error) {
    console.error('Addresses API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();

    // Validate request body
    const validationResult = addressSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { address1, address2, city, state, postalCode, country, isDefault } = validationResult.data;

    // If setting as default, remove default from other addresses
    if (isDefault) {
      await prisma.shippingAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const newAddress = await prisma.shippingAddress.create({
      data: {
        userId,
        address1,
        address2,
        city,
        state,
        postalCode,
        country,
        isDefault: isDefault || false,
      }
    });

    return NextResponse.json({
      message: 'Address created successfully',
      address: {
        ...newAddress,
        createdAt: newAddress.createdAt.toISOString(),
        updatedAt: newAddress.updatedAt.toISOString(),
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create address API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
