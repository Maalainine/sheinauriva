"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, TrendingUp, Clock, Star, Filter } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "drawer" | "dialog";
}

// Mock recent searches - in real app, get from localStorage or user preferences
const mockRecentSearches = [
  "wireless headphones",
  "laptop stand", 
  "phone case",
  "gaming mouse"
];

const mockTrendingSearches = [
  "iPhone 15",
  "MacBook Pro",
  "AirPods Pro",
  "iPad Air",
  "Apple Watch"
];

const mockQuickCategories = [
  { id: "1", name: "Electronics", count: 1250, color: "bg-blue-500" },
  { id: "2", name: "Fashion", count: 890, color: "bg-pink-500" },
  { id: "3", name: "Home & Garden", count: 650, color: "bg-green-500" },
  { id: "4", name: "Sports", count: 420, color: "bg-orange-500" },
  { id: "5", name: "Books", count: 380, color: "bg-purple-500" },
  { id: "6", name: "Beauty", count: 320, color: "bg-rose-500" },
];

export function SearchDrawer({ open, onOpenChange, variant = "drawer" }: SearchDrawerProps) {
  const router = useRouter();
  const {
    query,
    setQuery,
    results,
    isLoading,
    hasResults,
    resetSearch,
  } = useSearch();

  const [localQuery, setLocalQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Initialize local query when the drawer opens
  useEffect(() => {
    if (open) {
      setLocalQuery(query);
      setShowResults(!!query);
    }
  }, [open]); // Only run when open changes

  // Handle search with debounce
  useEffect(() => {
    if (!open) return;
    
    const timer = setTimeout(() => {
      if (localQuery) {
        setQuery(localQuery);
        setShowResults(true);
      } else {
        setShowResults(false);
        resetSearch();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [localQuery, open, setQuery, resetSearch]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
    onOpenChange(false);
    resetSearch();
  };

  const handleQuickSearch = useCallback((searchTerm: string) => {
    setLocalQuery(searchTerm);
    // Don't call handleSearch here to prevent premature navigation
    // The search will be triggered by the useEffect that watches localQuery
  }, []);

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    router.push(`/products?categoryId=${categoryId}`);
    onOpenChange(false);
  };

  const renderSearchResults = () => {
    if (!showResults || !localQuery) return null;

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Searching our catalog...</p>
        </div>
      );
    }

    if (!hasResults) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">No results found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              We couldn't find anything matching "<strong>{localQuery}</strong>". Try different keywords or browse our categories.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocalQuery("")}>
              Clear search
            </Button>
            <Button variant="default" size="sm" onClick={() => handleSearch("")}>
              Browse all products
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {results.products.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Products</h3>
                <Badge variant="secondary">{results.products.length}</Badge>
              </div>
              {results.products.length > 3 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSearch(localQuery)}
                >
                  View all
                </Button>
              )}
            </div>
            
            <div className="grid gap-3">
              {results.products.slice(0, 3).map((product) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border-border/50"
                  onClick={() => handleSearch(product.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {product.images?.[0]?.url ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1 truncate">{product.name}</h4>
                        {product.category && (
                          <p className="text-xs text-muted-foreground mb-2">in {product.category}</p>
                        )}
                        {product.price && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "MAD",
                              }).format(product.price)}
                            </Badge>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-xs text-muted-foreground line-through">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "MAD",
                                }).format(product.originalPrice)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(results.categories.length > 0 || results.brands.length > 0) && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              {results.categories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    Categories 
                    <Badge variant="secondary" className="text-xs">{results.categories.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    {results.categories.slice(0, 3).map((category) => (
                      <Button
                        key={category.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => handleCategoryClick(category.id, category.name)}
                      >
                        <span className="truncate">{category.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {results.brands.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    Brands 
                    <Badge variant="secondary" className="text-xs">{results.brands.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    {results.brands.slice(0, 3).map((brand) => (
                      <Button
                        key={brand.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => router.push(`/products?brandId=${brand.id}`)}
                      >
                        {brand.logoUrl && (
                          <div className="w-5 h-5 rounded mr-2 overflow-hidden flex-shrink-0">
                            <Image
                              src={brand.logoUrl}
                              alt={brand.name}
                              width={20}
                              height={20}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <span className="truncate">{brand.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <Separator />
        
        <Button
          className="w-full h-12 text-base"
          onClick={() => handleSearch(localQuery)}
        >
          <Search className="h-4 w-4 mr-2" />
          View all results for "{localQuery}"
        </Button>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="space-y-8">
      {/* Recent Searches */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Recent Searches</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {mockRecentSearches.map((search) => (
            <Button
              key={search}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => handleQuickSearch(search)}
            >
              {search}
            </Button>
          ))}
        </div>
      </div>

      {/* Trending Searches */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Trending Now</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {mockTrendingSearches.map((search) => (
            <Button
              key={search}
              variant="secondary"
              size="sm"
              className="h-8 text-xs"
              onClick={() => handleQuickSearch(search)}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {search}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Categories */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Browse Categories</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {mockQuickCategories.map((category) => (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-md transition-all duration-200 border-border/50"
              onClick={() => handleCategoryClick(category.id, category.name)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", category.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.count} items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const searchContent = (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products, categories, brands..."
          className="pl-10 pr-12 h-12 text-base rounded-xl border-2 focus:border-primary/50"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch(localQuery);
            }
          }}
          autoFocus
        />
        {localQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => setLocalQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 -mx-1 px-1">
        {showResults && localQuery ? renderSearchResults() : renderEmptyState()}
      </ScrollArea>
    </div>
  );

  if (variant === "dialog") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">Search Products</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="px-6 pb-6 h-full">
            {searchContent}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-bold">Search Products</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="px-4 pb-6 h-full min-h-0">
          {searchContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}