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

    // Get all orders for the user
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        total: true,
        shippingCost: true,
        createdAt: true,
        updatedAt: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        orderItems: {
          select: {
            id: true,
            productName: true,
            productDetails: true,
            quantity: true,
            price: true,
          }
        },
        shippingAddress: {
          select: {
            address1: true,
            address2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
          }
        },
        shippingLine1: true,
        shippingLine2: true,
        shippingCity: true,
        shippingState: true,
        shippingPostal: true,
        shippingCountry: true,
      }
    });

    // Format the response to include shipping address from either relation or inline fields
    const formattedOrders = orders.map(order => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      shippingAddress: order.shippingAddress || (
        order.shippingLine1 ? {
          address1: order.shippingLine1,
          address2: order.shippingLine2,
          city: order.shippingCity,
          state: order.shippingState,
          postalCode: order.shippingPostal,
          country: order.shippingCountry,
        } : null
      )
    }));

    return NextResponse.json(formattedOrders);

  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
