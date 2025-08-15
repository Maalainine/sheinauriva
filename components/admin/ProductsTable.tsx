"use client";

import React from 'react';
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Plus,
  Loader2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  RefreshCw,
  Package,
  PlusCircle,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import Link from "next/link";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { toast } from "sonner";
import { FormEvent } from "react";
import { type Product } from "@/lib/stockUtils";
import { renderStock } from "./StockDisplay";

// Product interface is now imported from stockUtils

interface ProductsTableProps {
  pageSize?: number;
}

interface ApiResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

type SortField = "name" | "price" | "stock" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";

function ProductsTableContent({ pageSize = 10 }: ProductsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [localIsLoading, setLocalIsLoading] = React.useState(true);
  const [localIsError, setLocalIsError] = React.useState(false);
  const [localError, setLocalError] = React.useState<Error | null>(null);

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);

  // Get and parse URL params with defaults
  const search = searchParams?.get('search') || '';
  const pageParam = searchParams?.get('page') || '1';
  const sortBy = (searchParams?.get('sortBy') || 'createdAt') as SortField;
  const sortOrder = (searchParams?.get('sortOrder') || 'desc') as SortOrder;

  // Parse and validate page number
  let page = 1;
  try {
    const parsedPage = parseInt(pageParam, 10);
    page = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
  } catch (error) {
    console.error('Error parsing page number:', error);
    page = 1;
  }

  // Fetch products with search and pagination
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery<ApiResponse, Error>({
    queryKey: ["admin-products", search, page, sortBy, sortOrder, pageSize],
    queryFn: async (): Promise<ApiResponse> => {
      try {
        console.log('Fetching products with params:', { search, page, pageSize, sortBy, sortOrder });
        
        const params = new URLSearchParams({
          search: search ?? "",
          page: page.toString(),
          limit: pageSize.toString(),
          sortBy: sortBy ?? "createdAt",
          sortOrder: sortOrder ?? "desc",
        });

        const apiUrl = `/api/admin/products?${params.toString()}`;
        console.log('API URL:', apiUrl);
        
        const res = await fetch(apiUrl);
        const responseText = await res.text();
        
        if (!res.ok) {
          console.error('API Error Response:', {
            status: res.status,
            statusText: res.statusText,
            response: responseText
          });
          
          let errorData;
          try {
            errorData = responseText ? JSON.parse(responseText) : {};
          } catch (e) {
            errorData = { message: 'Invalid JSON response' };
          }
          
          // Don't treat 404 as an error if it's the first page with no search
          if (res.status === 404 && page === 1 && !search) {
            console.log('No products found - returning empty results');
            return { 
              products: [], 
              pagination: {
                page: 1,
                limit: pageSize,
                totalCount: 0,
                totalPages: 1,
                hasNext: false,
                hasPrev: false
              }
            };
          }
          
          const errorMessage = errorData.message || `HTTP error! status: ${res.status}`;
          console.error('API Error:', errorMessage);
          throw new Error(errorMessage);
        }
        
        try {
          const response = JSON.parse(responseText) as ApiResponse;
          console.log('API Response:', response);
          return response;
        } catch (e) {
          console.error('Error parsing API response:', e);
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        console.error("Error in queryFn:", error);
        throw error instanceof Error
          ? error
          : new Error("An unknown error occurred while fetching products");
      }
    },
    retry: 1,
  });
  
  // Log errors when they occur
  React.useEffect(() => {
    if (error) {
      console.error('Products fetch error:', error);
    }
  }, [error]);
  
  // Safely access data properties with defaults
  const products = data?.products ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    limit: pageSize,
    totalCount: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  };
  
  const { page: currentPage, totalCount, totalPages } = pagination;

  // Handle sort
  const handleSort = (field: SortField) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (sortBy === field) {
      params.set("sortOrder", sortOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("sortOrder", "asc");
    }
    router.push(`/admin/products?${params.toString()}`);
  };

  // Handle search
  const handleSearch = (e: FormEvent<HTMLFormElement> | string) => {
    if (typeof e !== 'string' && e?.preventDefault) {
      e.preventDefault();
    }
    
    const searchTerm = typeof e === 'string' ? e : searchQuery;
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.set('search', searchTerm);
      params.set('page', '1');
    }
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    
    router.push(`/admin/products?${params.toString()}`);
  };

  // Handle search form submission
  const handleSearchFormSubmission = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(e);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("page", newPage.toString());
    router.push(`/admin/products?${params.toString()}`);
    window.scrollTo(0, 0);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch().catch(error => {
      console.error('Error refreshing products:', error);
      toast.error('Failed to refresh products');
    });
  };

  // Open dialog with selected product
  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) setProductToDelete(null);
  };

  // Handle delete success
  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
    refetch();
  };

  // Render sort indicator
  const SortIndicator = ({ field }: { field: SortField }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => handleSort(field)}
    >
      {field.charAt(0).toUpperCase() + field.slice(1)}
      <ArrowUpDown className="ml-2 h-4 w-4" />
      {sortBy === field && (
        <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
      )}
    </Button>
  );

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-'; // Return dash for missing or invalid dates
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  // Render status badge
  const StatusBadge = ({ status }: { status?: boolean }) => {
    const statusText = status ? 'Active' : 'Inactive';
    const statusClass = status 
      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
      : 'bg-gray-100 text-gray-800 hover:bg-gray-200';

    return (
      <Badge
        className={`${statusClass} capitalize`}
        variant="secondary"
      >
        {statusText}
      </Badge>
    );
  };

  // Render product image
  const renderProductImage = (product: Product) => {
    const primaryImage = product.images?.[0];
    if (primaryImage) {
      return (
        <Image
          src={primaryImage}
          alt={product.name}
          width={48}
          height={48}
          className="rounded-md object-cover aspect-square"
        />
      );
    }
    return (
      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
        <Package className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  };

  // Render price
  const renderPrice = (product: Product) => {
    // If product has variants, show price range, otherwise show base price
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants.map(v => parseFloat(v.price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      return minPrice === maxPrice 
        ? formatCurrency(minPrice)
        : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
    }
    
    // Fallback to base price if no variants
    return formatCurrency(parseFloat(product.basePrice.toString()));
  };

  // Render stock status using the StockDisplay component
  const renderStockStatus = (product: Product) => {
    return renderStock(product);
  };

  // Render category
  const renderCategory = (product: Product) => {
    return product.category?.name || '-';
  };

  // Render brand
  const renderBrand = (product: Product) => {
    return product.brand?.name || '-';
  };

  // Render pagination
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">
            {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.totalCount)}
          </span> to {' '}
          <span className="font-medium">
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
          </span>{' '}
          of <span className="font-medium">{pagination.totalCount}</span> products
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            onClick={() => handlePageChange(1)}
            disabled={!pagination.hasPrev}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium px-4">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={!pagination.hasNext}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>Loading products...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TableSkeleton />
        </CardContent>
      </Card>
    );
  }

  const isEmpty = products.length === 0 && totalCount === 0;

  // Main table render
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage your products and inventory
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/products/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearchFormSubmission} className="w-full md:w-1/3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {renderProductImage(product)}
                        <span>{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{renderPrice(product)}</TableCell>
                    <TableCell>{renderStockStatus(product)}</TableCell>
                    <TableCell>{renderCategory(product)}</TableCell>
                    <TableCell>{renderBrand(product)}</TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
                    </TableCell>
                    <TableCell>{formatDate(product.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(product)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          {renderPagination()}
          {/* Delete Product Dialog */}
          {productToDelete && (
            <DeleteProductDialog
              productId={productToDelete.id}
              productName={productToDelete.name}
              open={deleteDialogOpen}
              onOpenChange={handleDialogOpenChange}
              onSuccess={handleDeleteSuccess}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductsTable(props: ProductsTableProps) {
  try {
    return <ProductsTableContent {...props} />;
  } catch (error) {
    return (
      <ErrorBoundary 
        error={error instanceof Error ? error : new Error('An unknown error occurred')}
        reset={() => window.location.reload()}
        title="Application Error"
        description="An error occurred while loading the products. Please check your browser console for details and try again."
      />
    );
  }
}