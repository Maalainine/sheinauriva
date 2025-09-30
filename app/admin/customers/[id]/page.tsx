"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar";
import {
  IconArrowLeft,
  IconEdit,
  IconDeviceFloppy,
  IconX,
  IconLoader2,
  IconAlertCircle,
  IconUser,
  IconMail,
  IconMapPin,
  IconShoppingCart,
  IconCurrencyDollar,
  IconCalendar,
  IconPackage,
  IconHeart,
  IconCheck,
  IconClock,
  IconTruck,
  IconBan,
} from "@tabler/icons-react";
import { formatCurrency } from "@/lib/utils";

// Types
interface Customer {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
  ordersCount: number;
  totalSpent: number;
  shippingAddresses: Array<{
    id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
  orders: Array<{
    id: string;
    status: string;
    total: number;
    createdAt: string;
    orderItems: Array<{
      id: string;
      quantity: number;
      price: number;
      productVariant: {
        id: string;
        sku: string;
        name: string;
        price: number;
        product: {
          id: string;
          name: string;
          images: string[];
        };
      } | null;
    }>;
  }>;
  wishlist: Array<{
    id: string;
    name: string;
    images: string;
    basePrice: number;
  }>;
}

interface CustomerStats {
  totalOrders: number;
  confirmedOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate: string | null;
  lastOrderDate: string | null;
}

interface StatusBreakdown {
  [key: string]: number;
}

interface TimelineItem {
  type: "order" | "registration";
  date: string;
  description: string;
  amount: number | null;
  orderId: string | null;
}

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown>({});
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "CLIENT",
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetch customer data
  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "Fetching customer with ID:",
        customerId,
        "Type:",
        typeof customerId,
      );
      const response = await fetch(`/api/admin/customers/${customerId}`);
      console.log("Customer API Response status:", response.status);
      const data = await response.json();
      console.log("Customer API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch customer");
      }

      setCustomer(data.customer);
      setStats(data.stats);
      setStatusBreakdown(data.statusBreakdown);
      setTimeline(data.timeline);

      // Initialize edit form
      setEditForm({
        name: data.customer.name || "",
        email: data.customer.email || "",
        role: data.customer.role || "CLIENT",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle customer update
  const handleUpdate = async () => {
    try {
      setUpdateLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update customer");
      }

      // Refresh customer data
      await fetchCustomer();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_CONFIRMATION":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            Pending
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Confirmed
          </Badge>
        );
      case "SHIPPED":
        return (
          <Badge
            variant="outline"
            className="text-purple-600 border-purple-600"
          >
            Shipped
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge variant="default" className="bg-green-600">
            Delivered
          </Badge>
        );
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING_CONFIRMATION":
        return <IconClock className="h-4 w-4 text-yellow-600" />;
      case "CONFIRMED":
        return <IconCheck className="h-4 w-4 text-blue-600" />;
      case "SHIPPED":
        return <IconTruck className="h-4 w-4 text-purple-600" />;
      case "DELIVERED":
        return <IconPackage className="h-4 w-4 text-green-600" />;
      case "CANCELLED":
        return <IconBan className="h-4 w-4 text-red-600" />;
      default:
        return <IconPackage className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Customer Profile</h1>
        </div>
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchCustomer} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (loading || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Customer Profile</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {customer.name || "Unnamed Customer"}
            </h1>
            <p className="text-muted-foreground">{customer.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleUpdate} disabled={updateLoading}>
                {updateLoading ? (
                  <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <IconDeviceFloppy className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <IconX className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <IconEdit className="h-4 w-4 mr-2" />
              Edit Customer
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="Customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={editForm.role}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLIENT">Client</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        <AvatarInitials
                          name={customer.name || customer.email}
                        />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {customer.name || "Unnamed Customer"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <IconUser className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant={
                        customer.role === "ADMIN" ? "destructive" : "secondary"
                      }
                    >
                      {customer.role}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconCalendar className="h-4 w-4" />
                    Joined{" "}
                    {formatDistanceToNow(new Date(customer.createdAt), {
                      addSuffix: true,
                    })}
                  </div>

                  {customer.lastLogin && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconClock className="h-4 w-4" />
                      Last seen{" "}
                      {formatDistanceToNow(new Date(customer.lastLogin), {
                        addSuffix: true,
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Statistics */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Order Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.confirmedOrders} confirmed
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(stats.totalSpent)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      From confirmed orders only
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Average Order Value
                  </p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(stats.averageOrderValue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Based on confirmed orders
                  </p>
                </div>
                {stats.firstOrderDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">First Order</p>
                    <p className="text-sm">
                      {format(new Date(stats.firstOrderDate), "PPP")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Status Breakdown */}
          {Object.keys(statusBreakdown).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(statusBreakdown).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <span className="text-sm capitalize">
                          {status.replace("_", " ").toLowerCase()}
                        </span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shipping Addresses */}
          {customer.shippingAddresses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customer.shippingAddresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium">{address.fullName}</p>
                        {address.isDefault && (
                          <Badge variant="outline" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p>{address.country}</p>
                        <p>📞 {address.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Orders and Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                {customer.orders.length} total orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customer.orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No orders found
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">
                          #{order.id.toString().substring(0, 8)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.orderItems.slice(0, 2).map((item, index) => (
                              <div key={item.id}>
                                {item.productVariant?.product.name ||
                                  "Unknown Product"}{" "}
                                × {item.quantity}
                              </div>
                            ))}
                            {order.orderItems.length > 2 && (
                              <div className="text-muted-foreground">
                                +{order.orderItems.length - 2} more items
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Wishlist */}
          {customer.wishlist.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Wishlist</CardTitle>
                <CardDescription>
                  {customer.wishlist.length} items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.wishlist.map((product) => (
                    <div
                      key={product.id}
                      className="flex gap-3 p-3 border rounded-lg"
                    >
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images.split(",")[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <IconPackage className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(product.basePrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      {activity.type === "order" ? (
                        <IconShoppingCart className="h-4 w-4" />
                      ) : (
                        <IconUser className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {activity.description}
                        </p>
                        {activity.amount && (
                          <p className="text-sm font-mono">
                            {formatCurrency(activity.amount)}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.date), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
