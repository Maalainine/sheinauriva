'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IconArrowLeft,
  IconPackage,
  IconTruck,
  IconCheck,
  IconX,
  IconRefresh,
  IconCalendar,
  IconMapPin,
  IconUser,
  IconMail,
  IconPhone,
  IconLoader2
} from "@tabler/icons-react";
import { formatCurrency } from "@/lib/utils";

interface OrderDetails {
  id: number;
  status: string;
  total: number;
  shippingCost: number;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
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

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslations();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params?.id as string;

  useEffect(() => {
    if (!orderId || isNaN(Number(orderId))) {
      setError('Invalid order ID');
      setIsLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/account/orders/${orderId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Order not found');
          }
          throw new Error('Failed to fetch order details');
        }
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

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
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-4 bg-muted rounded w-32 mb-6"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-48"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-4 bg-muted rounded w-40"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-8">
        <IconX className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t("common.error")}</h2>
        <p className="text-muted-foreground mb-4">{error || 'Order not found'}</p>
        <Button onClick={() => router.back()}>
          <IconArrowLeft className="h-4 w-4 mr-2" />
          {t("common.goBack")}
        </Button>
      </div>
    );
  }

  const subtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            {t("account.orders.orderDetails", { number: order.id })}
          </h1>
          <p className="text-muted-foreground">
            {t("account.orders.placedOn")} {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 text-sm`}>
          {getStatusIcon(order.status)}
          {t(`order.status.${order.status.toLowerCase()}`)}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconPackage className="h-5 w-5" />
              {t("account.orders.orderItems")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.productName}</h4>
                  {item.productDetails && (
                    <p className="text-sm text-muted-foreground">{item.productDetails}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("common.quantity")}: {item.quantity}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="font-medium">{formatCurrency(item.price)}</div>
                  <div className="text-sm text-muted-foreground">
                    {t("common.total")}: {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t("account.orders.subtotal")}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("account.orders.shipping")}</span>
                <span>{formatCurrency(order.shippingCost)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>{t("account.orders.total")}</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order & Shipping Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                {t("account.orders.customerInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <IconUser className="h-4 w-4 text-muted-foreground" />
                <span>{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <IconMail className="h-4 w-4 text-muted-foreground" />
                <span>{order.customerEmail}</span>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-2">
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customerPhone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconMapPin className="h-5 w-5" />
                  {t("account.orders.shippingAddress")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div>{order.shippingAddress.address1}</div>
                  {order.shippingAddress.address2 && (
                    <div>{order.shippingAddress.address2}</div>
                  )}
                  <div>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </div>
                  <div>{order.shippingAddress.country}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>{t("account.orders.orderNotes")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("account.orders.orderActions")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {order.status === 'DELIVERED' && (
                <Button variant="outline">
                  {t("account.orders.reorder")}
                </Button>
              )}
              {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                <Button variant="outline">
                  {t("account.orders.cancelOrder")}
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href={`/account/orders/${order.id}/invoice`}>
                  {t("account.orders.downloadInvoice")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
