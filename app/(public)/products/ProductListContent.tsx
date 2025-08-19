"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search as SearchIcon,
  Filter,
  X,
  SlidersHorizontal,
  Loader2,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import ProductCard from "@/components/product/card/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

// Types for product data
interface ProductImage {
  url: string;
  alt?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  originalPrice?: number;
  stock: number;
  images: ProductImage[] | string[];
  category?: { id: string; name: string; logoUrl?: string | null };
  brand?: { id: string; name: string; logoUrl?: string | null };
  tags?: { id: string; name: string }[];
  variants?: Array<{
    id: string;
    price: number;
    stock: number;
    sku: string;
    selectedOptions: Array<{
      id: string;
      name: string;
      value: string;
    }>;
  }>;
  hasVariants?: boolean;
  variantCount?: number;
}

// Types for API response
interface ApiResponse {
  products: Product[];
  total: number;
}

// Types for filters
interface FilterOption {
  id: string;
  name: string;
  count: number;
}

interface FilterState {
  categories: string[];
  brands: string[];
  tags: string[];
  sortBy: string;
  isMobileFiltersOpen: boolean;
}

// Sort options - values must match the API's expected format
const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

// Enhanced Filter Section Component with search and better UX
function FilterSection({
  title,
  options,
  selected,
  onToggle,
  defaultOpen = true,
}: {
  title: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (id: string) => void;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchQuery, setSearchQuery] = useState("");
  const hasSelection = selected.length > 0;

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option: FilterOption) =>
      option.name.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Clear search when section is closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  return (
    <div className="border-b border-border/30 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        type="button"
        className="flex items-center justify-between w-full text-left mb-3 focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {hasSelection && (
            <span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {selected.length}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              {/* Search input for filter options */}
              {options.length > 5 && (
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`Search ${title.toLowerCase()}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1"
                  />
                </div>
              )}

              <div className="max-h-60 overflow-y-auto pr-2 -mr-2">
                {filteredOptions.length > 0 ? (
                  <div className="space-y-2">
                    {filteredOptions.map((option) => (
                      <div
                        key={option.id}
                        className={cn(
                          "group flex items-center rounded-md p-2 transition-colors",
                          selected[0] === option.id
                            ? "bg-primary/5"
                            : "hover:bg-accent/50"
                        )}
                      >
                        <div className="group flex items-center">
                          <div className="relative flex h-5 w-5 items-center justify-center">
                            <input
                              type="radio"
                              id={`${title}-${option.id}`}
                              name={title}
                              checked={selected[0] === option.id}
                              onChange={() => onToggle(option.id)}
                              className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-border transition-colors checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1"
                            />
                            <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-white opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100" />
                          </div>
                          <label
                            htmlFor={`${title}-${option.id}`}
                            className={cn(
                              "ml-3 flex w-full cursor-pointer items-center justify-between text-sm transition-colors",
                              selected[0] === option.id
                                ? "text-foreground font-medium"
                                : "text-muted-foreground group-hover:text-foreground"
                            )}
                          >
                            <span className="truncate transition-colors group-hover:text-primary/90">
                              {option.name}
                            </span>
                            <span
                              className={cn(
                                "ml-2 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
                                selected[0] === option.id
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted/50 text-muted-foreground group-hover:bg-muted/80"
                              )}
                            >
                              {option.count}
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No {title.toLowerCase()} found
                  </div>
                )}
              </div>

              {hasSelection && (
                <button
                  type="button"
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent/50 hover:text-foreground/90"
                  onClick={(e) => {
                    e.preventDefault();
                    onToggle("");
                  }}
                >
                  Clear selection
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Filter Chip Component
function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.1 }}
      className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm text-foreground hover:bg-primary/10 transition-colors group"
    >
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-1 p-0.5 rounded-full hover:bg-primary/20 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3.5 w-3.5 text-foreground/70 group-hover:text-foreground" />
      </button>
    </motion.div>
  );
}

// Skeleton Loader Component
function ProductCardSkeleton() {
  return (
    <div className="space-y-4 group">
      <Skeleton className="h-60 w-full rounded-xl bg-muted/50 group-hover:bg-muted/70 transition-colors" />
      <div className="space-y-2.5">
        <Skeleton className="h-4 w-3/4 bg-muted/40" />
        <Skeleton className="h-4 w-1/2 bg-muted/30" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-16 bg-muted/40" />
          <Skeleton className="h-4 w-10 bg-muted/30" />
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 12;

export default function ProductListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Initialize filters from URL parameters immediately
  const initialCategory = searchParams?.get("categoryId") || "";
  const initialBrand = searchParams?.get("brandId") || "";
  const initialTag = searchParams?.get("tagId") || "";
  const initialSort = searchParams?.get("sort") || "createdAt-desc";

  const [filters, setFilters] = useState<FilterState>({
    categories: initialCategory ? [initialCategory] : [],
    brands: initialBrand ? [initialBrand] : [],
    tags: initialTag ? [initialTag] : [],
    sortBy: initialSort,
    isMobileFiltersOpen: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Set isClient to true after mount to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter options with counts
  const [filterOptions, setFilterOptions] = useState<{
    categories: FilterOption[];
    brands: FilterOption[];
    tags: FilterOption[];
  }>({ categories: [], brands: [], tags: [] });

  // Check if we can load more products
  const canLoadMore = skip + PAGE_SIZE < total;

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        console.log("Fetching filter options...");
        const [categoriesRes, brandsRes, tagsRes] = await Promise.all([
          fetch("/api/public/categories").then((res) => {
            if (!res.ok) throw new Error("Failed to fetch categories");
            return res.json();
          }),
          fetch("/api/public/brands").then((res) => {
            if (!res.ok) throw new Error("Failed to fetch brands");
            return res.json();
          }),
          fetch("/api/public/tags").then((res) => {
            if (!res.ok) throw new Error("Failed to fetch tags");
            return res.json();
          }),
        ]);

        console.log("Filter options loaded:", {
          categories: categoriesRes,
          brands: brandsRes,
          tags: tagsRes,
        });

        setFilterOptions({
          categories: categoriesRes?.data || categoriesRes || [],
          brands: brandsRes?.data || brandsRes || [],
          tags: tagsRes?.data || tagsRes || [],
        });
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Handle URL parameter changes after initial load
  useEffect(() => {
    if (initialLoad || !searchParams) return;

    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");
    const tagId = searchParams.get("tagId");

    // Only update if the URL params are different from current filter state
    const shouldUpdate =
      (categoryId && filters.categories[0] !== categoryId) ||
      (brandId && filters.brands[0] !== brandId) ||
      (tagId && filters.tags[0] !== tagId);

    if (shouldUpdate) {
      setFilters((prev) => ({
        ...prev,
        categories: categoryId ? [categoryId] : [],
        brands: brandId ? [brandId] : [],
        tags: tagId ? [tagId] : [],
      }));
      setSkip(0);
    }
  }, [searchParams]);

  // Fetch products with filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Add filters to params if they exist (single-select, as integers)
      if (filters.categories?.[0])
        params.set("categoryId", String(Number(filters.categories[0])));
      if (filters.brands?.[0])
        params.set("brandId", String(Number(filters.brands[0])));
      if (filters.tags?.[0])
        params.set("tagId", String(Number(filters.tags[0])));

      // Add sorting
      const [sortField, sortOrder] = filters.sortBy.split('-');
      params.set("sortBy", sortField);
      params.set("sortOrder", sortOrder || 'desc');

      params.set("skip", skip.toString());
      params.set("take", PAGE_SIZE.toString());

      const url = `/api/public/products?${params.toString()}`;
      console.log('Fetching products from:', url);
      
      const response = await fetch(url);

      if (!response.ok) {
        let errorMessage = `Failed to fetch products: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          // Ignore JSON parse error
        }
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }
      const data: ApiResponse = await response.json();

      setProducts((prev) =>
        skip === 0 ? data.products : [...prev, ...data.products]
      );
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [filters, skip]);

  // Debounced fetch function
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Effect to update URL when filters change
  useEffect(() => {
    if (initialLoad || !isClient) return; // Skip initial render and SSR

    const params = new URLSearchParams();
    if (filters.categories[0]) params.set("categoryId", filters.categories[0]);
    if (filters.brands[0]) params.set("brandId", filters.brands[0]);
    if (filters.tags[0]) params.set("tagId", filters.tags[0]);
    if (filters.sortBy !== "newest") params.set("sort", filters.sortBy);

    const newUrl = params.toString()
      ? `/products?${params.toString()}`
      : "/products";
    window.history.pushState({}, "", newUrl);
  }, [filters, initialLoad, isClient]);

  // Toggle filter selection (single-select)
  const toggleFilter = (type: "categories" | "brands" | "tags", id: string) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [type]: id ? [id] : [],
      };
      return newFilters;
    });
    setSkip(0); // Reset to first page when changing filters
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: value,
    }));
    setSkip(0);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters((prev) => ({
      ...prev,
      categories: [],
      brands: [],
      tags: [],
      sortBy: "newest",
    }));
    setSkip(0);
  };

  // Get active filter count (excluding default sort)
  const activeFilterCount =
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.brands.length > 0 ? 1 : 0) +
    (filters.tags.length > 0 ? 1 : 0) +
    (filters.sortBy !== "newest" ? 1 : 0);

  // Mobile filters dialog with improved state management
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Update local filters when filters prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle filter changes locally before applying
  const handleLocalFilterChange = (
    type: "categories" | "brands" | "tags",
    id: string
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [type]: id ? [id] : [],
    }));
  };

  // Apply filters from local state
  const applyFilters = () => {
    setFilters(localFilters);
    setSkip(0);
    setMobileFiltersOpen(false);
  };

  // Reset all filters
  const resetFilters = () => {
    const resetState = {
      categories: [],
      brands: [],
      tags: [],
      sortBy: "newest",
      isMobileFiltersOpen: false,
    };
    setLocalFilters(resetState);
    setFilters(resetState);
    setSkip(0);
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set("q", searchQuery.trim());
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-12 md:py-16 mb-8">
        <div className="container mx-auto px-4">
          <motion.h1
            className="text-3xl md:text-4xl font-bold mb-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Products
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Discover our wide range of high-quality products
          </motion.p>

          {/* Search Bar */}
          <motion.div
            className="max-w-2xl mx-auto relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <form onSubmit={handleSearch}>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className={cn(
                    "pl-10 pr-10 py-6 text-base w-full rounded-full shadow-sm",
                    isSearchFocused ? "ring-2 ring-primary" : ""
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Header with title and filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {filters.categories.length > 0 ||
              filters.brands.length > 0 ||
              filters.tags.length > 0 ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:bg-transparent"
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        categories: [],
                        brands: [],
                        tags: [],
                      }));
                      setSkip(0);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <span>All Products</span>
              )}
            </h1>
            <p className="text-muted-foreground">
              {total} {total === 1 ? "product" : "products"} found
              {filters.categories.length > 0 &&
                ` in ${filterOptions.categories.find((c) => c.id === filters.categories[0])?.name || "category"}`}
              {filters.brands.length > 0 &&
                ` from ${filterOptions.brands.find((b) => b.id === filters.brands[0])?.name || "brand"}`}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="hidden md:block w-56">
              <Select
                value={filters.sortBy}
                onValueChange={(value) => {
                  setFilters((prev) => ({ ...prev, sortBy: value }));
                  setSkip(0);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="md:hidden gap-2 flex-1"
              onClick={() =>
                setFilters((prev) => ({ ...prev, isMobileFiltersOpen: true }))
              }
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {(filters.categories.length > 0 ||
                filters.brands.length > 0 ||
                filters.tags.length > 0) && (
                <motion.span
                  key={
                    filters.categories.length +
                    filters.brands.length +
                    filters.tags.length
                  }
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="ml-1"
                >
                  <Badge variant="secondary">
                    {filters.categories.length +
                      filters.brands.length +
                      filters.tags.length}
                  </Badge>
                </motion.span>
              )}
            </Button>
          </div>

          {/* Enhanced Mobile Filter Dialog */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent
              side="bottom"
              className="w-full max-h-[90vh] p-0 rounded-t-2xl"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Product Filters</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-full"
                    aria-label="Close filters"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close filters</span>
                  </Button>
                </div>

                {/* Scrollable Content */}
                <ScrollArea className="flex-1 px-4 py-2">
                  <div className="space-y-6 py-2">
                    {/* Categories */}
                    <FilterSection
                      title="Categories"
                      options={filterOptions.categories}
                      selected={localFilters.categories}
                      onToggle={(id) =>
                        handleLocalFilterChange("categories", id)
                      }
                      defaultOpen={localFilters.categories.length > 0}
                    />

                    <Separator />

                    {/* Brands */}
                    <FilterSection
                      title="Brands"
                      options={filterOptions.brands}
                      selected={localFilters.brands}
                      onToggle={(id) => handleLocalFilterChange("brands", id)}
                      defaultOpen={localFilters.brands.length > 0}
                    />

                    <Separator />

                    {/* Tags */}
                    <FilterSection
                      title="Tags"
                      options={filterOptions.tags}
                      selected={localFilters.tags}
                      onToggle={(id) => handleLocalFilterChange("tags", id)}
                      defaultOpen={localFilters.tags.length > 0}
                    />
                  </div>
                </ScrollArea>

                {/* Sticky Footer */}
                <div className="sticky bottom-0 bg-background border-t p-4 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={resetFilters}
                  >
                    Reset All
                  </Button>
                  <Button className="flex-1" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content area with sidebar and product grid */}
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-6 space-y-6">
              {/* Filters Header */}
              <div className="space-y-4 rounded-lg bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    Filters
                  </h2>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-7 text-xs text-primary hover:bg-transparent hover:text-primary/80"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Active Filters */}
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.categories.map((id) => {
                      const category = filterOptions.categories.find(
                        (c) => c.id === id
                      );
                      return category ? (
                        <FilterChip
                          key={`active-category-${id}`}
                          label={category.name}
                          onRemove={() => toggleFilter("categories", "")}
                        />
                      ) : null;
                    })}

                    {filters.brands.map((id) => {
                      const brand = filterOptions.brands.find(
                        (b) => b.id === id
                      );
                      return brand ? (
                        <FilterChip
                          key={`active-brand-${id}`}
                          label={brand.name}
                          onRemove={() => toggleFilter("brands", "")}
                        />
                      ) : null;
                    })}

                    {filters.tags.map((id) => {
                      const tag = filterOptions.tags.find((t) => t.id === id);
                      return tag ? (
                        <FilterChip
                          key={`active-tag-${id}`}
                          label={tag.name}
                          onRemove={() => toggleFilter("tags", "")}
                        />
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Filter Sections */}
              <div className="space-y-6 rounded-lg bg-card p-4 shadow-sm">
                <FilterSection
                  title="Categories"
                  options={filterOptions.categories}
                  selected={filters.categories}
                  onToggle={(id) => toggleFilter("categories", id)}
                  defaultOpen={filters.categories.length > 0}
                />

                <FilterSection
                  title="Brands"
                  options={filterOptions.brands}
                  selected={filters.brands}
                  onToggle={(id) => toggleFilter("brands", id)}
                  defaultOpen={filters.brands.length > 0}
                />

                <FilterSection
                  title="Tags"
                  options={filterOptions.tags}
                  selected={filters.tags}
                  onToggle={(id) => toggleFilter("tags", id)}
                  defaultOpen={filters.tags.length > 0}
                />

                {/* Results Count */}
                <div className="pt-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {products.length}
                    </span>{" "}
                    products
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Active filters for desktop */}
            <div className="hidden lg:block mb-6">
              <div className="flex flex-wrap items-center gap-2">
                {activeFilterCount > 0 && (
                  <span className="text-sm text-muted-foreground mr-2">
                    Filters:
                  </span>
                )}

                {filters.categories.map((id) => {
                  const category = filterOptions.categories.find(
                    (c) => c.id === id
                  );
                  return category ? (
                    <FilterChip
                      key={`category-${id}`}
                      label={category.name}
                      onRemove={() => toggleFilter("categories", "")}
                    />
                  ) : null;
                })}

                {filters.brands.map((id) => {
                  const brand = filterOptions.brands.find((b) => b.id === id);
                  return brand ? (
                    <FilterChip
                      key={`brand-${id}`}
                      label={brand.name}
                      onRemove={() => toggleFilter("brands", "")}
                    />
                  ) : null;
                })}

                {filters.tags.map((id) => {
                  const tag = filterOptions.tags.find((t) => t.id === id);
                  return tag ? (
                    <FilterChip
                      key={`tag-${id}`}
                      label={tag.name}
                      onRemove={() => toggleFilter("tags", "")}
                    />
                  ) : null;
                })}

                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-7 text-xs text-primary hover:bg-transparent hover:text-primary/80"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>

            {/* Product Grid */}
            <div className="mt-4">
              {loading && products.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`products-${filters.categories[0] || "all"}-${filters.brands[0] || "all"}-${filters.tags[0] || "all"}-${filters.sortBy}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6"
                  >
                    {products.map((product) => {
                      // Handle images format (string[] or { url, alt? }[])
                      const normalizedImages = (() => {
                        if (!product.images?.length) return [];
                        if (typeof product.images[0] === "string") {
                          return (product.images as string[]).map((url) => ({
                            url,
                          }));
                        }
                        return product.images as {
                          url: string;
                          alt?: string;
                        }[];
                      })();

                      // Handle variants
                      const variants = Array.isArray(product.variants)
                        ? product.variants
                        : [];
                      const stock =
                        variants.length > 0
                          ? variants.reduce((sum, v) => sum + (v.stock || 0), 0)
                          : product.stock;

                      const price =
                        variants.length > 0
                          ? Math.min(...variants.map((v) => v.price || 0))
                          : product.price;

                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.2 }}
                          className="h-full"
                        >
                          <ProductCard
                            id={product.id}
                            name={product.name}
                            description={product.description || ""}
                            price={price}
                            originalPrice={product.originalPrice}
                            stock={stock}
                            images={
                              normalizedImages.length
                                ? normalizedImages
                                : ["/placeholder-product.jpg"]
                            }
                            tags={product.tags || []}
                            brand={product.brand}
                            hasVariants={
                              !!(product.hasVariants || variants.length > 0)
                            }
                            variantCount={
                              product.variantCount || variants.length
                            }
                            variants={variants}
                          />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="text-center py-16">
                  <div className="mx-auto h-24 w-24 text-muted-foreground/50 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-full h-full"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414.168.75.375.75h.008a.75.75 0 00.375-.75V9a.75.75 0 00-.375-.75h-.008a.75.75 0 00-.375.75v.75zm0 0h.008v.015h-.008V9.75zm5.25 0c0 .414.168.75.375.75h.008a.75.75 0 00.375-.75V9a.75.75 0 00-.375-.75h-.008a.75.75 0 00-.375.75v.75zm0 0h.008v.015h-.008V9.75z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">
                    No products found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search or filter to find what you're
                    looking for.
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1.5"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear all filters</span>
                  </Button>
                </div>
              )}

              {/* Load more button */}
              {canLoadMore && (
                <div className="mt-10 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setSkip((prev) => prev + PAGE_SIZE)}
                    disabled={loading}
                    className="min-w-[180px] relative overflow-hidden"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load more products"
                    )}
                    {loading && (
                      <motion.div
                        className="absolute bottom-0 left-0 h-0.5 bg-primary/20"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
