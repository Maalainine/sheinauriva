import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Admin authorization check
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { authorized: false, error: "Authentication required" };
  }

  if (session.user.role !== "ADMIN") {
    return { authorized: false, error: "Admin access required" };
  }

  return { authorized: true, user: session.user };
}

// GET - Get single order details
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: 401 }
      );
    }

    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get order with all related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            totalSpent: true,
            ordersCount: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                images: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                brand: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            variant: {
              select: {
                id: true,
                sku: true,
                name: true,
                price: true,
                stock: true,
                images: true,
                variantOptions: {
                  include: {
                    variantOption: {
                      include: {
                        variantType: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Calculate order summary
    const itemsTotal = order.orderItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    // Get order history (status changes) - simplified version
    // In a full implementation, you'd track status change history
    const orderHistory = [
      {
        status: order.status,
        timestamp: order.updatedAt,
        note: order.notes || `Order ${order.status.toLowerCase().replace('_', ' ')}`,
      },
    ];

    // Enhanced order data
    const enhancedOrder = {
      ...order,
      summary: {
        itemsCount: order.orderItems.length,
        itemsTotal,
        shippingCost: order.shippingCost || 0,
        totalAmount: order.total,
      },
      history: orderHistory,
      customer: {
        id: order.user?.id || null,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        isRegistered: !order.isGuestOrder,
        profile: order.user ? {
          totalSpent: order.user.totalSpent,
          ordersCount: order.user.ordersCount,
          memberSince: order.user.createdAt,
        } : null,
      },
      shipping: {
        address: order.shippingAddress,
        city: order.shippingCity,
        cost: order.shippingCost || 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: enhancedOrder,
    });

  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch order",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// PUT - Update single order (status, notes, etc.)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: 401 }
      );
    }

    const orderId = params.id;
    const { status, notes, trackingNumber, shippingCost } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Validate status if provided
    if (status) {
      const validStatuses = [
        "PENDING_CONFIRMATION",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
      ];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (shippingCost !== undefined) updateData.shippingCost = shippingCost;

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // In a full implementation, you might want to:
    // - Send email notifications for status changes
    // - Create audit log entries
    // - Update inventory for delivered orders
    // - Handle refunds for cancelled orders

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });

  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      {
        error: "Failed to update order",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE - Cancel/delete order (optional)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: 401 }
      );
    }

    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Check if order exists and can be cancelled
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Only allow cancellation of certain statuses
    const cancellableStatuses = ["PENDING_CONFIRMATION", "CONFIRMED"];
    if (!cancellableStatuses.includes(existingOrder.status)) {
      return NextResponse.json(
        { error: "Order cannot be cancelled at this stage" },
        { status: 400 }
      );
    }

    // Update order status to cancelled instead of deleting
    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        notes: existingOrder.notes
          ? `${existingOrder.notes}\n\nOrder cancelled by admin on ${new Date().toISOString()}`
          : `Order cancelled by admin on ${new Date().toISOString()}`,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      data: cancelledOrder,
    });

  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      {
        error: "Failed to cancel order",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
