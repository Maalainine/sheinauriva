import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Get user stats in parallel
    const [userStats, recentOrders, wishlistCount, addressCount] = await Promise.all([
      // User stats from the user record
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          totalSpent: true,
          ordersCount: true,
        }
      }),

      // Recent orders (last 5)
      prisma.order.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
          orderItems: {
            select: {
              productName: true,
              quantity: true,
            }
          }
        }
      }),

      // Wishlist count
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          wishlist: {
            select: { id: true }
          }
        }
      }).then(user => user?.wishlist.length || 0),

      // Address count
      prisma.shippingAddress.count({
        where: { userId }
      })
    ]);

    const dashboardData = {
      totalOrders: userStats?.ordersCount || 0,
      totalSpent: userStats?.totalSpent || 0,
      wishlistCount,
      addressCount,
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt.toISOString(),
        orderItems: order.orderItems
      }))
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
