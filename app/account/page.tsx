'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconShoppingBag,
  IconHeart,
  IconMapPin,
  IconCurrency,
  IconTrendingUp,
  IconCalendar,
  IconPackage,
  IconArrowRight
} from "@tabler/icons-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  wishlistCount: number;
  addressCount: number;
  recentOrders: RecentOrder[];
}

interface RecentOrder {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  orderItems: {
    productName: string;
    quantity: number;
  }[];
}

export default function AccountDashboard() {
  const { data: session } = useSession();
  const { t } = useTranslations();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/account/dashboard');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  const quickStats = [
    {
      title: t("account.dashboard.stats.totalOrders"),
      value: stats?.totalOrders || 0,
      icon: IconShoppingBag,
      href: "/account/orders",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: t("account.dashboard.stats.totalSpent"),
      value: formatCurrency(stats?.totalSpent || 0),
      icon: IconCurrency,
      href: "/account/orders",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: t("account.dashboard.stats.wishlistItems"),
      value: stats?.wishlistCount || 0,
      icon: IconHeart,
      href: "/account/wishlist",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: t("account.dashboard.stats.addresses"),
      value: stats?.addressCount || 0,
      icon: IconMapPin,
      href: "/account/addresses",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 bg-muted rounded-full w-12 mb-4"></div>
                <div className="h-6 bg-muted rounded w-16 mb-2"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders Skeleton */}
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t("account.dashboard.welcome", { name: session?.user?.name || t("common.user") })}
        </h1>
        <p className="text-muted-foreground">
          {t("account.dashboard.subtitle")}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t("account.dashboard.recentOrders")}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/account/orders">
                {t("common.viewAll")}
                <IconArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <IconPackage className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {t("account.dashboard.orderNumber", { number: order.id })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.orderItems.length} {t("common.items")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(order.total)}</div>
                      <div className={`text-sm px-2 py-1 rounded-full ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t(`order.status.${order.status.toLowerCase()}`)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IconShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">{t("account.dashboard.noOrders")}</h3>
                <p className="text-muted-foreground mb-4">{t("account.dashboard.noOrdersDesc")}</p>
                <Button asChild>
                  <Link href="/products">{t("common.startShopping")}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("account.dashboard.quickActions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center gap-2">
                <Link href="/account/orders">
                  <IconShoppingBag className="h-6 w-6" />
                  <span className="text-sm">{t("account.navigation.orders")}</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center gap-2">
                <Link href="/account/wishlist">
                  <IconHeart className="h-6 w-6" />
                  <span className="text-sm">{t("account.navigation.wishlist")}</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center gap-2">
                <Link href="/account/addresses">
                  <IconMapPin className="h-6 w-6" />
                  <span className="text-sm">{t("account.navigation.addresses")}</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center gap-2">
                <Link href="/account/profile">
                  <IconTrendingUp className="h-6 w-6" />
                  <span className="text-sm">{t("account.navigation.profile")}</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
