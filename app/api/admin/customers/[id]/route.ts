import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

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

// GET - Get customer details with full order history
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    // Convert string ID to integer
    const customerId = parseInt(id, 10);

    if (!customerId || isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 },
      );
    }

    // Get customer with detailed information
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        shippingAddresses: {
          orderBy: { isDefault: "desc" },
        },
        orders: {
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
                productVariant: {
                  select: {
                    id: true,
                    sku: true,
                    price: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        wishlist: {
          select: {
            id: true,
            name: true,
            images: true,
            basePrice: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    // Calculate customer statistics considering order statuses
    // Only count confirmed/completed orders for spending statistics
    const confirmedStatuses = ["CONFIRMED", "SHIPPED", "DELIVERED"];
    const confirmedOrders = customer.orders.filter((order) =>
      confirmedStatuses.includes(order.status),
    );
    const actualTotalSpent = confirmedOrders.reduce(
      (total, order) => total + Number(order.total),
      0,
    );

    const orderStats = {
      totalOrders: customer.orders.length, // All orders
      confirmedOrders: confirmedOrders.length, // Only confirmed/completed orders
      totalSpent: actualTotalSpent, // Only from confirmed orders
      averageOrderValue:
        confirmedOrders.length > 0
          ? actualTotalSpent / confirmedOrders.length
          : 0,
      firstOrderDate:
        customer.orders.length > 0
          ? customer.orders[customer.orders.length - 1].createdAt
          : null,
      lastOrderDate:
        customer.orders.length > 0 ? customer.orders[0].createdAt : null,
    };

    // Order status breakdown
    const statusBreakdown = customer.orders.reduce((acc: any, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Recent activity timeline
    const timeline = [
      ...customer.orders.slice(0, 10).map((order) => ({
        type: "order",
        date: order.createdAt,
        description: `Order #${order.id.toString().substring(0, 8)} - ${order.status}`,
        amount: Number(order.total),
        orderId: order.id,
      })),
      {
        type: "registration",
        date: customer.createdAt,
        description: "Customer registered",
        amount: null,
        orderId: null,
      },
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      customer: {
        ...customer,
        // Convert Decimal to number for JSON serialization
        totalSpent: Number(customer.totalSpent || 0),
        orders: customer.orders.map((order) => ({
          ...order,
          total: Number(order.total),
          orderItems: order.orderItems.map((item) => ({
            ...item,
            price: Number(item.price),
            productVariant: item.productVariant
              ? {
                  ...item.productVariant,
                  price: Number(item.productVariant.price),
                }
              : null,
          })),
        })),
        wishlist: customer.wishlist.map((product) => ({
          ...product,
          basePrice: Number(product.basePrice),
        })),
      },
      stats: orderStats,
      statusBreakdown,
      timeline: timeline.slice(0, 20), // Limit to 20 most recent activities
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer details" },
      { status: 500 },
    );
  }
}

// PATCH - Update customer information
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    const { id } = await params;

    const customerId = parseInt(id, 10);

    if (!customerId || isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 },
      );
    }
    const body = await req.json();
    const { name, email, role } = body;

    // Validate role if provided
    if (role && !["CLIENT", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Check if email is already in use by another user
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser && existingUser.id !== customerId) {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 400 },
        );
      }
    }

    // Update customer
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;

    const updatedCustomer = await prisma.user.update({
      where: { id: customerId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}
