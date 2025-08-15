import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconPackage, IconShoppingCart, IconUsers, IconCurrencyDollar, IconArrowRight, IconClock, IconAlertTriangle, IconPlus, IconTag, IconTags, IconLayoutGrid } from "@tabler/icons-react";

// Create aliases for consistency with existing code
const IconCategory = IconLayoutGrid;
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Decimal } from "@prisma/client/runtime/library";
import type {
  Product,
  ProductVariant as PrismaProductVariant,
  Order,
} from "@prisma/client";
import { DashboardStatsSkeleton, DashboardRecentOrdersSkeleton } from "@/components/common/loading-skeleton";
import { ErrorBoundary, ErrorFallback } from '@/components/common/error-boundary';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

// Alias for backward compatibility
const RefreshCw = IconRefresh;

// Define types for our data
interface StatsItem {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  loading?: boolean;
  error?: string | null;
}

interface OrderItem extends Omit<Order, "total"> {
  total: number | Decimal;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number | Decimal;
    productId: string;
    productName: string;
    productVariantId: string | null;
    productVariantName: string | null;
  }>;
}

interface ProductVariant extends Omit<PrismaProductVariant, "price"> {
  product: Pick<Product, "name" | "id" | "categoryId" | "brandId">;
}

// Data fetching function with error handling
async function fetchDashboardData() {
  try {
    const [
      productCount,
      orderCount,
      userCount,
      revenueData,
      recentOrders,
      lowStockProducts
    ] = await Promise.allSettled([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: {
            take: 1,
            select: {
              id: true,
              quantity: true,
              price: true,
              productId: true,
              productVariantId: true,
            },
          },
        },
      }),
      prisma.productVariant.findMany({
        where: {
          stock: {
            lt: 10,
          },
        },
        include: {
          product: {
            select: {
              name: true,
              id: true,
              categoryId: true,
              brandId: true,
            },
          },
        },
        take: 5,
      }),
    ]);

    return {
      productCount: productCount.status === 'fulfilled' ? productCount.value : 0,
      orderCount: orderCount.status === 'fulfilled' ? orderCount.value : 0,
      userCount: userCount.status === 'fulfilled' ? userCount.value : 0,
      totalRevenue: revenueData.status === 'fulfilled' ? revenueData.value._sum.total || 0 : 0,
      recentOrders: recentOrders.status === 'fulfilled' ? recentOrders.value : [],
      lowStockProducts: lowStockProducts.status === 'fulfilled' ? lowStockProducts.value : [],
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw new Error('Failed to fetch dashboard data');
  }
}

export default async function DashboardPage() {
  const data = await fetchDashboardData();
  
  const stats: StatsItem[] = [
    {
      title: "Total Products",
      value: data.productCount,
      icon: IconPackage,
      href: "/admin/products",
    },
    {
      title: "Total Orders",
      value: data.orderCount,
      icon: IconShoppingCart,
      href: "/admin/orders",
    },
    {
      title: "Total Users",
      value: data.userCount,
      icon: IconUsers,
      href: "/admin/users",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(Number(data.totalRevenue)),
      icon: IconCurrencyDollar,
      href: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your store's performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <Link href={stat.href} className="hover:underline">
                  View all <IconArrowRight className="inline h-3 w-3" />
                </Link>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              {data.recentOrders.length} orders processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data.recentOrders.length > 0 ? (
                data.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Order #{String(order.id).substring(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {formatCurrency(Number(order.total))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Low Stock</CardTitle>
            <CardDescription>
              {data.lowStockProducts.length} products with low stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {data.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {product.product.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {product.sku} • {product.stock} in stock
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      <IconPlus className="mr-2 h-4 w-4" />
                      Restock
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                All products are well stocked
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
