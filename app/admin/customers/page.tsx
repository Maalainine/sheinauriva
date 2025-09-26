'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  IconSearch,
  IconUsers,
  IconCurrencyDollar,
  IconShoppingCart,
  IconUserPlus,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconEdit,
  IconEye,
  IconLoader2,
  IconAlertCircle,
} from '@tabler/icons-react';
import { formatCurrency } from '@/lib/utils';

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
    isDefault: boolean;
    city: string;
    country: string;
  }>;
  orders: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
}

interface CustomerAnalytics {
  totalCustomers: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  averageOrdersPerCustomer: number;
  recentRegistrations: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
  limit: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  // Bulk action state
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Fetch customers data
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search,
        role: roleFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/customers?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch customers');
      }

      setCustomers(data.customers);
      setAnalytics(data.analytics);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when filters change
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, search, roleFilter, sortBy, sortOrder]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle bulk selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(customers.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers(prev => [...prev, customerId]);
    } else {
      setSelectedCustomers(prev => prev.filter(id => id !== customerId));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, value?: string) => {
    if (selectedCustomers.length === 0) return;

    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerIds: selectedCustomers,
          action,
          value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bulk action failed');
      }

      // Refresh data and clear selection
      await fetchCustomers();
      setSelectedCustomers([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk action failed');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Toggle sort order
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Get role badge variant
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="destructive">Admin</Badge>;
      case 'CLIENT':
        return <Badge variant="secondary">Client</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  // Get order status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return 'text-yellow-600';
      case 'CONFIRMED':
        return 'text-blue-600';
      case 'SHIPPED':
        return 'text-purple-600';
      case 'DELIVERED':
        return 'text-green-600';
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Customer Management</h1>
        </div>
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchCustomers} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage your customers and view their purchase history
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                +{analytics.recentRegistrations} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {analytics.totalOrders} orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <IconShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.averageOrderValue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Orders/Customer</CardTitle>
              <IconUserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.averageOrdersPerCustomer.toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="CLIENT">Clients</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedCustomers.length > 0 && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {selectedCustomers.length} customers selected
              </p>
              <Select
                onValueChange={(value) => {
                  if (value === 'make-admin') handleBulkAction('updateRole', 'ADMIN');
                  if (value === 'make-client') handleBulkAction('updateRole', 'CLIENT');
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Bulk actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="make-admin">Make Admin</SelectItem>
                  <SelectItem value="make-client">Make Client</SelectItem>
                </SelectContent>
              </Select>
              {bulkActionLoading && (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>
            {pagination && `${pagination.totalCount} total customers`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <IconLoader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No customers found
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          customers.length > 0 &&
                          selectedCustomers.length === customers.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        {sortBy === 'name' && (
                          sortOrder === 'asc' ? (
                            <IconSortAscending className="h-4 w-4" />
                          ) : (
                            <IconSortDescending className="h-4 w-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-1">
                        Email
                        {sortBy === 'email' && (
                          sortOrder === 'asc' ? (
                            <IconSortAscending className="h-4 w-4" />
                          ) : (
                            <IconSortDescending className="h-4 w-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('totalSpent')}
                    >
                      <div className="flex items-center gap-1">
                        Total Spent
                        {sortBy === 'totalSpent' && (
                          sortOrder === 'asc' ? (
                            <IconSortAscending className="h-4 w-4" />
                          ) : (
                            <IconSortDescending className="h-4 w-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('ordersCount')}
                    >
                      <div className="flex items-center gap-1">
                        Orders
                        {sortBy === 'ordersCount' && (
                          sortOrder === 'asc' ? (
                            <IconSortAscending className="h-4 w-4" />
                          ) : (
                            <IconSortDescending className="h-4 w-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-1">
                        Joined
                        {sortBy === 'createdAt' && (
                          sortOrder === 'asc' ? (
                            <IconSortAscending className="h-4 w-4" />
                          ) : (
                            <IconSortDescending className="h-4 w-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Recent Orders</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={(checked) =>
                            handleSelectCustomer(customer.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>{customer.name || 'N/A'}</div>
                          {customer.shippingAddresses.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {customer.shippingAddresses[0].city}, {customer.shippingAddresses[0].country}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{getRoleBadge(customer.role)}</TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell>{customer.ordersCount}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(customer.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {customer.orders.slice(0, 2).map((order) => (
                            <div key={order.id} className="text-xs">
                              <span className="font-mono">
                                #{order.id.substring(0, 8)}
                              </span>
                              <span className={`ml-2 ${getStatusColor(order.status)}`}>
                                {order.status.replace('_', ' ')}
                              </span>
                            </div>
                          ))}
                          {customer.orders.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{customer.orders.length - 2} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/admin/customers/${customer.id}`}>
                            <Button variant="outline" size="sm">
                              <IconEye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(currentPage * pagination.limit, pagination.totalCount)} of{' '}
                    {pagination.totalCount} customers
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasMore}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
