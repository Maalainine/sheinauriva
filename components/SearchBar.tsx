"use client";

import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Badge } from "./ui/badge";

interface SearchBarProps {
  className?: string;
  variant?: 'default' | 'expanded';
  autoFocus?: boolean;
}

export default function SearchBar({ className, variant = 'default', autoFocus = false }: SearchBarProps) {
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

  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current !== event.target &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (variant === 'default') {
          setExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen, variant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/products");
    }
    resetSearch();
    setExpanded(false);
  };

  const handleResultClick = (item: any, type: string) => {
    const href =
      type === "products"
        ? `/products?search=${encodeURIComponent(item.name)}`
        : type === "categories"
        ? `/products?categoryId=${item.id}`
        : type === "brands"
        ? `/products?brandId=${item.id}`
        : type === "tags"
        ? `/products?tagId=${item.id}`
        : "/products";

    router.push(href);
    resetSearch();
    setExpanded(false);
  };

  const renderSection = (
    title: string,
    items: any[],
    type: "products" | "categories" | "tags" | "brands"
  ) => {
    if (!items.length) return null;
    
    return (
      <div key={type} className="mb-4 last:mb-0">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 px-2 uppercase tracking-wider">
          {title}
        </h4>
        <div className="space-y-1">
          {items.slice(0, 5).map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center p-2 rounded-md hover:bg-accent transition-colors text-left"
              onClick={() => handleResultClick(item, type)}
            >
              {item.images?.[0]?.url && (
                <div className="w-8 h-8 rounded-md overflow-hidden mr-3 flex-shrink-0 bg-muted">
                  <Image
                    src={item.images[0].url}
                    alt={item.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <span className="text-sm truncate flex-1">{item.name}</span>
              {type === "products" && item.price && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MAD",
                  }).format(item.price)}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const toggleSearch = useCallback(() => {
    setExpanded(prev => !prev);
    if (!expanded) {
      // Only set focus if we're expanding
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [expanded]);

  // Auto-expand if variant is 'expanded'
  useEffect(() => {
    if (variant === 'expanded') {
      setExpanded(true);
    }
  }, [variant]);

  return (
    <div className={cn("relative", variant === 'expanded' ? 'w-full' : '', className)}>
      {/* Toggle button & animated input */}
      <div className="flex items-center gap-2">
        {variant !== 'expanded' && !expanded ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSearch}
            type="button"
          >
            <Search className="h-5 w-5" />
          </Button>
        ) : (
          <AnimatePresence>
            <motion.form
              initial={variant === 'expanded' ? false : { width: 0, opacity: 0, marginRight: 0 }}
              animate={variant === 'expanded' 
                ? { width: '100%', opacity: 1 } 
                : { width: '16rem', opacity: 1, marginRight: '0.5rem' }
              }
              exit={variant === 'expanded' 
                ? { width: '100%', opacity: 0 } 
                : { width: 0, opacity: 0, marginRight: 0 }
              }
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className={cn("relative flex items-center", variant === 'expanded' ? 'w-full' : '')}
            >
              <Input
                autoFocus={autoFocus}
                ref={inputRef}
                type="search"
                placeholder="Search products, categories, brands..."
                className="pl-3 pr-8 text-sm"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-0"
                onClick={() => {
                  resetSearch();
                  setExpanded(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.form>
          </AnimatePresence>
        )}
      </div>

      {/* Dropdown results */}
      <AnimatePresence>
        {expanded && isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-2 w-64 bg-popover border rounded-md shadow-lg z-50"
          >
            <div className="p-3 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Searching...
                  </span>
                </div>
              ) : hasResults ? (
                <>
                  {renderSection("Products", results.products, "products")}
                  {renderSection("Categories", results.categories, "categories")}
                  {renderSection("Brands", results.brands, "brands")}
                  {renderSection("Tags", results.tags, "tags")}
                </>
              ) : query ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No results for "{query}"
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Start typing to search...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
