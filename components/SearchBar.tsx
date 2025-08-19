"use client";

import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "./ui/badge";

interface SearchBarProps {
  className?: string;
  variant?: "default" | "expanded";
  initialQuery?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ 
  className, 
  variant = "default",
  initialQuery = "",
  onSearch
}: SearchBarProps) {
  const router = useRouter();
  const {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    resetSearch,
    hasResults,
  } = useSearch();
  
  // Initialize with initialQuery if provided
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current !== event.target
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else if (query.trim()) {
      // Navigate to products page with search query
      router.push(`/products?search=${encodeURIComponent(query)}`);
    } else {
      // If no query, just go to products page
      router.push('/products');
    }
    setIsOpen(false);
  };

  const renderSection = (
    title: string,
    items: any[],
    type: "products" | "categories" | "tags" | "brands"
  ) => {
    if (!items.length) return null;

    const getHref = (item: any, type?: string) => {
    if (!type) type = item.__type__;
    
    // Always navigate to the products page with appropriate filters
    switch (type) {
      case 'products':
        return `/products?search=${encodeURIComponent(item.name)}`;
      case 'categories':
        return `/products?categoryId=${item.id}`;
      case 'brands':
        return `/products?brandId=${item.id}`;
      case 'tags':
        return `/products?tagId=${item.id}`;
      default:
        return '/products';
    }
  };

    const getImage = (item: any) => {
      if (type === "products" && item.images?.[0]?.url) {
        return item.images[0].url;
      }
      if (type === "brands" && item.logoUrl) {
        return item.logoUrl;
      }
      return null;
    };

    return (
      <div key={type} className="mb-4 last:mb-0">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 px-2">
          {title}
        </h4>
        <div className="space-y-1">
          {items.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              href={getHref(item)}
              className="flex items-center p-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => {
                resetSearch();
                setIsOpen(false);
              }}
            >
              {getImage(item) && (
                <div className="w-8 h-8 rounded-md overflow-hidden mr-3 flex-shrink-0">
                  <Image
                    src={getImage(item)}
                    alt={item.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <span className="text-sm truncate">{item.name}</span>
              {type === "products" && item.price && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MAD",
                  }).format(item.price)}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search products, categories, brands..."
          className={cn(
            "pl-10 pr-10",
            variant === "expanded" && "h-12 text-base"
          )}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {(query || isOpen) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={resetSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
        <Button
          type="submit"
          variant="default"
          size={variant === "expanded" ? "default" : "sm"}
          className={cn(
            "absolute right-1.5 top-1/2 -translate-y-1/2",
            variant === "expanded" ? "h-9 px-4" : "h-7 px-2 text-xs"
          )}
        >
          Search
        </Button>
      </form>

      {isOpen && (query || hasResults) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-popover text-popover-foreground rounded-md shadow-lg border overflow-hidden"
        >
          <div className="p-2 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : hasResults ? (
              <>
                {renderSection(
                  "Products",
                  results.products,
                  "products"
                )}
                {renderSection(
                  "Categories",
                  results.categories,
                  "categories"
                )}
                {renderSection("Brands", results.brands, "brands")}
                {renderSection("Tags", results.tags, "tags")}
                <div className="mt-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      router.push(`/products?search=${encodeURIComponent(query)}`);
                      setIsOpen(false);
                    }}
                  >
                    View all results for "{query}"
                  </Button>
                </div>
              </>
            ) : query ? (
              <div className="p-4 text-center text-muted-foreground">
                No results found for "{query}"
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
