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

// GET - List orders with pagination, search, and filters
export async function GET(req: Request) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const whereClause: any = {};

    // Search by order ID, customer name, or email
    if (search) {
      whereClause.OR = [
        { id: { contains: search } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by status
    if (status && status !== "all") {
      whereClause.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Add 1 day to include the entire end date
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = endDateTime;
      }
    }

    // Get total count for pagination
    const totalOrders = await prisma.order.count({ where: whereClause });

    // Get orders with includes
    const orders = await prisma.order.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
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
                images: true,
              },
            },
            variant: {
              select: {
                id: true,
                sku: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    // Calculate summary statistics
    const totalPages = Math.ceil(totalOrders / limit);

    // Get status counts for filters
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const statusSummary = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total revenue
    const revenueResult = await prisma.order.aggregate({
      where: whereClause,
      _sum: {
        total: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map(order => ({
          ...order,
          itemsCount: order._count.orderItems,
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        summary: {
          statusCounts: statusSummary,
          totalRevenue: revenueResult._sum.total || 0,
        },
      },
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// PUT - Bulk update orders (status updates)
export async function PUT(req: Request) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: 401 }
      );
    }

    const { orderIds, status, notes } = await req.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: "Order IDs are required" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
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

    // Update orders
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    const updatedOrders = await prisma.order.updateMany({
      where: {
        id: {
          in: orderIds,
        },
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedOrders.count} orders`,
      updatedCount: updatedOrders.count,
    });

  } catch (error) {
    console.error("Error updating orders:", error);
    return NextResponse.json(
      {
        error: "Failed to update orders",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
