import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for password change
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
});

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
    const validationResult = changePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      }
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'User not found or password not set' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Check if new password is different from current
    const isSamePassword = await compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { message: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      }
    });

    return NextResponse.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
