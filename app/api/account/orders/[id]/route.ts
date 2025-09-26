import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(session.user.id);
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { message: "Invalid order ID" },
        { status: 400 },
      );
    }

    // Get the specific order for the user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId, // Ensure the order belongs to the current user
      },
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
        notes: true,
        orderItems: {
          select: {
            id: true,
            productName: true,
            productDetails: true,
            quantity: true,
            price: true,
          },
        },
        shippingAddress: {
          select: {
            address1: true,
            address2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
          },
        },
        shippingLine1: true,
        shippingLine2: true,
        shippingCity: true,
        shippingState: true,
        shippingPostal: true,
        shippingCountry: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Format the response to include shipping address from either relation or inline fields
    const formattedOrder = {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      shippingAddress:
        order.shippingAddress ||
        (order.shippingLine1
          ? {
              address1: order.shippingLine1,
              address2: order.shippingLine2,
              city: order.shippingCity,
              state: order.shippingState,
              postalCode: order.shippingPostal,
              country: order.shippingCountry,
            }
          : null),
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error("Order details API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
