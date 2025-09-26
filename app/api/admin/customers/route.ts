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

// GET - List customers with pagination, search, and analytics
export async function GET(req: NextRequest) {
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
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const role = searchParams.get("role") || ""; // Filter by role

    const offset = (page - 1) * limit;

    // Build where clause for search and filters
    const whereClause: any = {};

    // Role filter
    if (role && role !== "ALL") {
      whereClause.role = role;
    } else {
      // By default, only show CLIENT users (exclude ADMIN)
      whereClause.role = "CLIENT";
    }

    // Search functionality
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get customers with order statistics
    const [customers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          lastLogin: true,
          ordersCount: true,
          totalSpent: true,
          shippingAddresses: {
            select: {
              id: true,
              isDefault: true,
              city: true,
              country: true,
            }
          },
          orders: {
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 3, // Latest 3 orders for preview
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where: whereClause })
    ]);

    // Get customer analytics
    const analytics = await prisma.user.aggregate({
      where: { role: "CLIENT" },
      _count: { id: true },
      _sum: {
        totalSpent: true,
        ordersCount: true,
      },
      _avg: {
        totalSpent: true,
        ordersCount: true,
      }
    });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await prisma.user.count({
      where: {
        role: "CLIENT",
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      customers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasMore,
        limit,
      },
      analytics: {
        totalCustomers: analytics._count.id,
        totalRevenue: Number(analytics._sum.totalSpent || 0),
        totalOrders: analytics._sum.ordersCount || 0,
        averageOrderValue: Number(analytics._avg.totalSpent || 0),
        averageOrdersPerCustomer: Number(analytics._avg.ordersCount || 0),
        recentRegistrations,
      }
    });

  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// PATCH - Update customer role or status (bulk operations)
export async function PATCH(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { customerIds, action, value } = body;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: "Customer IDs are required" },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case "updateRole":
        if (!["CLIENT", "ADMIN"].includes(value)) {
          return NextResponse.json(
            { error: "Invalid role" },
            { status: 400 }
          );
        }
        updateData.role = value;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    // Update customers
    const updatedCustomers = await prisma.user.updateMany({
      where: {
        id: { in: customerIds }
      },
      data: updateData
    });

    return NextResponse.json({
      message: `Successfully updated ${updatedCustomers.count} customers`,
      updatedCount: updatedCustomers.count
    });

  } catch (error) {
    console.error("Error updating customers:", error);
    return NextResponse.json(
      { error: "Failed to update customers" },
      { status: 500 }
    );
  }
}
