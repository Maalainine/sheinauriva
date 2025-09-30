"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  IconArrowLeft,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconPackage,
  IconTruck,
  IconEdit,
  IconCheck,
  IconClock,
  IconX,
  IconAlertTriangle,
  IconRefresh,
  IconDownload,
  IconCopy,
} from "@tabler/icons-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Types
interface OrderDetails {
  id: string;
  status:
    | "PENDING_CONFIRMATION"
    | "CONFIRMED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCost: number;
  notes: string;
  trackingNumber?: string;
  isGuestOrder: boolean;
  createdAt: string;
  updatedAt: string;

  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
    totalSpent: number;
    ordersCount: number;
  };

  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      description: string;
      images: string[];
      category?: {
        id: string;
        name: string;
      };
      brand?: {
        id: string;
        name: string;
      };
    };
    variant?: {
      id: string;
      sku: string;
      name: string;
      price: number;
      stock: number;
      images: string[];
      variantOptions: Array<{
        variantOption: {
          id: string;
          name: string;
          value: string;
          variantType: {
            id: string;
            name: string;
          };
        };
      }>;
    };
  }>;

  summary: {
    itemsCount: number;
    itemsTotal: number;
    shippingCost: number;
    totalAmount: number;
  };

  customer: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    isRegistered: boolean;
    profile?: {
      totalSpent: number;
      ordersCount: number;
      memberSince: string;
    };
  };

  shipping: {
    address: string;
    city: string;
    cost: number;
  };

  history: Array<{
    status: string;
    timestamp: string;
    note: string;
  }>;
}

// Status configuration
const statusConfig = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: IconClock,
    description: "Order received, awaiting processing",
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: IconRefresh,
    description: "Order is being processed",
  },
  PENDING_CONFIRMATION: {
    label: "Pending Confirmation",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: IconClock,
    description: "Order received, awaiting confirmation",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: IconCheck,
    description: "Order confirmed, preparing for shipment",
  },
  SHIPPED: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: IconTruck,
    description: "Order shipped, on the way to customer",
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: IconPackage,
    description: "Order successfully delivered",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: IconX,
    description: "Order has been cancelled",
  },
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  // State management
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Status update state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  // Fetch order details
  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/orders/${orderId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch order");
      }

      setOrder(result.data);
      setNewStatus(result.data.status);
      setTrackingNumber(result.data.trackingNumber || "");
      setStatusNotes(result.data.notes || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return;

    try {
      setUpdating(true);

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: statusNotes,
          trackingNumber: trackingNumber || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update order");
      }

      // Refresh order data
      await fetchOrder();
      setStatusDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setUpdating(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Effects
  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Alert variant="destructive">
          <IconAlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || "Order not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Order #{order.id.toString().substring(0, 8)}
            </h1>
            <p className="text-muted-foreground">
              Placed{" "}
              {formatDistanceToNow(new Date(order.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrder}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <IconEdit className="mr-2 h-4 w-4" />
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogDescription>
                  Change the order status and add any relevant notes or tracking
                  information.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center">
                            <config.icon className="mr-2 h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(newStatus === "SHIPPED" || newStatus === "DELIVERED") && (
                  <div>
                    <Label htmlFor="tracking">Tracking Number (Optional)</Label>
                    <Input
                      id="tracking"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Add any notes about this status change..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setStatusDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleStatusUpdate} disabled={updating}>
                  {updating ? "Updating..." : "Update Status"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Status & Timeline */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge className={`${currentStatus.color} border text-sm`}>
                {currentStatus.label}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {currentStatus.description}
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Order Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Order Placed</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), "PPp")}
                    </p>
                  </div>
                </div>

                {order.status !== "PENDING_CONFIRMATION" && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.updatedAt), "PPp")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {order.trackingNumber && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Tracking Information</h4>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {order.trackingNumber}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(order.trackingNumber!)}
                    >
                      <IconCopy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {order.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {order.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Contact Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <IconUser className="h-4 w-4 text-muted-foreground" />
                        <span>{order.customer.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconMail className="h-4 w-4 text-muted-foreground" />
                        <span>{order.customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconPhone className="h-4 w-4 text-muted-foreground" />
                        <span>{order.customer.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">Shipping Address</h4>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <IconMapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{order.shipping.address}</p>
                          <p>{order.shipping.city}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {order.customer.isRegistered && order.customer.profile && (
                  <div>
                    <h4 className="font-medium mb-1">Customer Profile</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium text-foreground">
                          Total Spent:
                        </span>{" "}
                        {formatCurrency(order.customer.profile.totalSpent)}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">
                          Total Orders:
                        </span>{" "}
                        {order.customer.profile.ordersCount}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">
                          Member Since:
                        </span>{" "}
                        {format(
                          new Date(order.customer.profile.memberSince),
                          "PP",
                        )}
                      </p>
                    </div>
                    {order.customer.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        asChild
                      >
                        <Link href={`/admin/customers/${order.customer.id}`}>
                          View Customer Profile
                        </Link>
                      </Button>
                    )}
                  </div>
                )}

                {order.isGuestOrder && (
                  <div>
                    <Badge variant="secondary">Guest Order</Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      This order was placed by a guest customer
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconPackage className="h-5 w-5" />
                Order Items ({order.summary.itemsCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item) => {
                  const productImage =
                    item.variant?.images[0] || item.product.images[0];

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {productImage ? (
                          <Image
                            src={productImage}
                            alt={item.product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <IconPackage className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{item.product.name}</h4>
                            {item.variant && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.variant.variantOptions.map((option) => (
                                  <Badge
                                    key={option.variantOption.id}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {option.variantOption.variantType.name}:{" "}
                                    {option.variantOption.value}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(item.price)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex gap-4">
                            {item.variant?.sku && (
                              <span>SKU: {item.variant.sku}</span>
                            )}
                            {item.product.category && (
                              <span>
                                Category: {item.product.category.name}
                              </span>
                            )}
                            {item.product.brand && (
                              <span>Brand: {item.product.brand.name}</span>
                            )}
                          </div>
                          <div className="font-medium text-foreground">
                            Subtotal:{" "}
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span>{formatCurrency(order.summary.itemsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatCurrency(order.summary.shippingCost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(order.summary.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
