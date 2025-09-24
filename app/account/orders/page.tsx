'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconShoppingBag,
  IconCalendar,
  IconPackage,
  IconTruck,
  IconCheck,
  IconX,
  IconRefresh,
  IconEye,
  IconLoader2
} from "@tabler/icons-react";
import { formatCurrency } from "@/lib/utils";

interface Order {
  id: number;
  status: string;
  total: number;
  shippingCost: number;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderItems: OrderItem[];
  shippingAddress?: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface OrderItem {
  id: number;
  productName: string;
  productDetails?: string;
  quantity: number;
  price: number;
}

export default function OrdersPage() {
  const { t } = useTranslations();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/account/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <IconCalendar className="h-4 w-4" />;
      case 'CONFIRMED':
        return <IconCheck className="h-4 w-4" />;
      case 'PROCESSING':
        return <IconPackage className="h-4 w-4" />;
      case 'SHIPPED':
        return <IconTruck className="h-4 w-4" />;
      case 'DELIVERED':
        return <IconCheck className="h-4 w-4" />;
      case 'CANCELLED':
        return <IconX className="h-4 w-4" />;
      case 'REFUNDED':
        return <IconRefresh className="h-4 w-4" />;
      default:
        return <IconPackage className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
            </h1>
            <div className="h-4 bg-muted rounded w-64 mt-2 animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-32"></div>
                  <div className="h-4 bg-muted rounded w-48"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <IconX className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t("common.error")}</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          <IconRefresh className="h-4 w-4 mr-2" />
          {t("common.tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("account.orders.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("account.orders.subtitle", { count: orders.length })}
          </p>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <IconShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t("account.orders.noOrders")}</h3>
            <p className="text-muted-foreground mb-6">{t("account.orders.noOrdersDesc")}</p>
            <Button asChild>
              <Link href="/products">{t("common.startShopping")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconPackage className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {t("account.orders.orderNumber", { number: order.id })}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.orderItems.length} {t("common.items")}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                    {getStatusIcon(order.status)}
                    {t(`order.status.${order.status.toLowerCase()}`)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-2">
                  {order.orderItems.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <span className="font-medium">{item.productName}</span>
                        {item.productDetails && (
                          <span className="text-muted-foreground"> - {item.productDetails}</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground">
                          {item.quantity}x {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {order.orderItems.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      {t("account.orders.moreItems", { count: order.orderItems.length - 3 })}
                    </p>
                  )}
                </div>

                {/* Order Total & Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-lg font-semibold">
                      {formatCurrency(order.total)}
                    </span>
                    {order.shippingCost > 0 && (
                      <span className="text-sm text-muted-foreground ml-2">
                        ({t("account.orders.includesShipping", { amount: formatCurrency(order.shippingCost) })})
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/account/orders/${order.id}`}>
                        <IconEye className="h-4 w-4 mr-2" />
                        {t("account.orders.viewDetails")}
                      </Link>
                    </Button>
                    {order.status === 'DELIVERED' && (
                      <Button variant="outline" size="sm">
                        {t("account.orders.reorder")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
