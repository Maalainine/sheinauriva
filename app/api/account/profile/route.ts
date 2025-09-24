import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for profile update
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').trim(),
  email: z.string().email('Invalid email address').toLowerCase(),
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        totalSpent: true,
        ordersCount: true,
        lastLogin: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...user,
      lastLogin: user.lastLogin?.toISOString(),
      createdAt: user.createdAt.toISOString(),
    });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { name, email } = validationResult.data;

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { message: 'Email is already in use by another account' },
          { status: 409 }
        );
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        totalSpent: true,
        ordersCount: true,
        lastLogin: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        ...updatedUser,
        lastLogin: updatedUser.lastLogin?.toISOString(),
        createdAt: updatedUser.createdAt.toISOString(),
      }
    });

  } catch (error) {
    console.error('Profile update API error:', error);

    // Handle Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { message: 'Email is already in use by another account' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
