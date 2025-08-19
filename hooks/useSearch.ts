import { useState, useEffect, useCallback } from 'react';

interface SearchResultItem {
  id: string;
  name: string;
  slug?: string;
  price?: number;
  images?: any[];
  logoUrl?: string;
}

interface SearchResults {
  products: SearchResultItem[];
  categories: SearchResultItem[];
  tags: SearchResultItem[];
  brands: SearchResultItem[];
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    products: [],
    categories: [],
    tags: [],
    brands: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({
        products: [],
        categories: [],
        tags: [],
        brands: []
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      // Optionally handle error state
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        search(query);
      } else {
        setResults({
          products: [],
          categories: [],
          tags: [],
          brands: []
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search]);

  const resetSearch = () => {
    setQuery('');
    setResults({
      products: [],
      categories: [],
      tags: [],
      brands: []
    });
    setIsOpen(false);
  };

  return {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    resetSearch,
    hasResults: Boolean(
      results.products.length || 
      results.categories.length || 
      results.tags.length || 
      results.brands.length
    )
  };
}
