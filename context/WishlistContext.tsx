"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  brand?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  } | null;
  stock?: number;
  hasVariants?: boolean;
  variantCount?: number;
};

type WishlistContextType = {
  wishlist: WishlistItem[];
  isLoading: boolean;
  toggleWishlist: (item: WishlistItem) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => Promise<void>;
  addToWishlist: (item: WishlistItem) => Promise<void>;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();

  // Fetch user's wishlist on login
  const fetchWishlist = async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      setWishlist([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/wishlist");
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist || []);
      } else {
        console.error("Failed to fetch wishlist");
        setWishlist([]);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch wishlist when session changes
  useEffect(() => {
    fetchWishlist();
  }, [session?.user?.id, status]);

  const addToWishlist = async (item: WishlistItem) => {
    if (status !== "authenticated") {
      toast.error("Please log in to add items to your wishlist");
      return;
    }

    if (isInWishlist(item.id)) {
      toast.info("Item is already in your wishlist");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: item.id }),
      });

      if (response.ok) {
        setWishlist(prev => [...prev, item]);
        toast.success(`${item.name} added to wishlist`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add to wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (status !== "authenticated") {
      toast.error("Please log in to manage your wishlist");
      return;
    }

    const item = wishlist.find(item => item.id === productId);
    if (!item) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(item => item.id !== productId));
        toast.success(`${item.name} removed from wishlist`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlist = async (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      await removeFromWishlist(item.id);
    } else {
      await addToWishlist(item);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  const refreshWishlist = async () => {
    await fetchWishlist();
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        addToWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}