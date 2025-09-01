"use client";
import { Button } from "@/components/ui/button";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { useWishlist, type WishlistItem } from "@/context/WishlistContext";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  product: WishlistItem;
  variant?: "default" | "icon";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
}

export default function WishlistButton({ 
  product, 
  variant = "icon", 
  size = "icon",
  className 
}: WishlistButtonProps) {
  const { status } = useSession();
  const { toggleWishlist, isInWishlist, isLoading } = useWishlist();

  const isWishlisted = isInWishlist(product.id);
  const isDisabled = isLoading;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Allow wishlist functionality for both authenticated and unauthenticated users
    // The context will handle local vs server-side storage
    await toggleWishlist(product);
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          "rounded-full transition-all duration-200",
          isWishlisted 
            ? "text-red-500 hover:text-red-600" 
            : "text-muted-foreground hover:text-red-500",
          isDisabled && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isWishlisted ? (
          <IconHeartFilled className="h-5 w-5" />
        ) : (
          <IconHeart className="h-5 w-5" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={isWishlisted ? "default" : "outline"}
      size={size}
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        "gap-2 transition-all duration-200",
        isWishlisted 
          ? "bg-red-500 hover:bg-red-600 text-white" 
          : "hover:bg-red-50 hover:border-red-200 hover:text-red-600",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {isWishlisted ? (
        <IconHeartFilled className="h-4 w-4" />
      ) : (
        <IconHeart className="h-4 w-4" />
      )}
      {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
}