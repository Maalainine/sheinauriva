"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconCategory, IconSearch, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { CategoryCard } from "@/components/category/card/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDebounce } from "../../../hooks/use-debounce";

// Types
type Category = {
  id: string;
  name: string;
  subtitle: string;
  searchText?: string;
  images?: Array<{ url: string; alt?: string }>;
  _count?: {
    products: number;
  };
};

// Skeleton Loader for Category Cards
function CategoryCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export default function CategoryListPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/public/categories");
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        
        const transformedData = Array.isArray(data) ? data.map((category: any) => ({
          ...category,
          subtitle: category.subtitle || category.description || '',
          searchText: `${category.name} ${category.subtitle || ''} ${category.description || ''}`.toLowerCase()
        })) : [];
        
        setCategories(transformedData);
        setFilteredCategories(transformedData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search query
  useEffect(() => {
    if (debouncedSearchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const query = debouncedSearchQuery.toLowerCase();
      const filtered = categories.filter(category => 
        (category.searchText || '').toLowerCase().includes(query) ||
        category.name.toLowerCase().includes(query) ||
        (category.subtitle || '').toLowerCase().includes(query)
      );
      setFilteredCategories(filtered);
    }
  }, [debouncedSearchQuery, categories]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-16 mb-12">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 max-w-full mx-auto" />
          </div>
        </div>
        
        <div className="container mx-auto px-4 mb-8">
          <Skeleton className="h-12 w-full max-w-md mx-auto mb-8 rounded-full" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorState
          title="Error loading categories"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-16 md:py-20 mb-12">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Shop by Category
          </motion.h1>
          <motion.p 
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Discover our wide range of products organized by category
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        {/* Search Bar */}
        <motion.div 
          className="max-w-2xl mx-auto mb-12 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-10 py-6 text-base rounded-full border-border/50 focus-visible:ring-2 focus-visible:ring-primary/50"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <IconX className="h-5 w-5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Categories Grid */}
        <AnimatePresence mode="wait">
          {filteredCategories.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              key="categories-grid"
            >
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <CategoryCard
                    id={category.id}
                    title={category.name}
                    subtitle={category.subtitle}
                    imageUrl={
                      category.images?.[0]?.url ||
                      `https://placehold.co/600x400/1e293b/ffffff?text=${encodeURIComponent(category.name)}`
                    }
                    buttonText="Browse more"
                    productCount={category._count?.products}
                    className="h-full w-full hover:shadow-lg transition-shadow duration-300"
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="flex flex-col items-center justify-center py-16 px-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="no-results"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
                <IconSearch className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight mb-2">No categories found</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                {searchQuery 
                  ? `No categories match "${searchQuery}". Try a different search term.`
                  : "We couldn't find any categories at the moment. Please check back later."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {searchQuery ? (
                  <Button 
                    onClick={clearSearch} 
                    variant="outline"
                    className="gap-2"
                  >
                    <IconX size={16} />
                    Clear search
                  </Button>
                ) : (
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                    className="gap-2"
                  >
                    Refresh page
                  </Button>
                )}
                <Button 
                  onClick={() => router.push('/')}
                  className="gap-2"
                >
                  <IconArrowLeft size={16} />
                  Back to home
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
