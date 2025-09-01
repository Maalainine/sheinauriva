"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyH1, TypographyH2, TypographyP } from "@/components/ui/typography";
import EmptyState from "@/components/common/EmptyState";
import { useTranslations } from "@/hooks/useTranslations";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import WishlistButton from "@/components/wishlist/WishlistButton";
import Image from "next/image";
import { 
  IconShoppingCart, 
  IconHeart, 
  IconLogin,
  IconPhoto 
} from "@tabler/icons-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { wishlist, isLoading, refreshWishlist } = useWishlist();
  const { addItem } = useCart();
  const { t } = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login?callbackUrl=/wishlist");
    }
  }, [status, router]);

  // Show loading skeleton while session is loading
  if (!mounted || status === "loading") {
    return <WishlistSkeleton />;
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          title={t('auth.loginRequired')}
          description={t('wishlist.pleaseLogin')}
          action={
            <Button asChild>
              <Link href="/admin/login?callbackUrl=/wishlist">
                <IconLogin className="h-4 w-4 mr-2" />
                {t('auth.login')}
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const handleAddToCart = (item: any) => {
    if (item.stock <= 0) {
      toast.error(`${item.name} is out of stock`);
      return;
    }

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });

    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <TypographyH1 className="mb-2">{t('wishlist.title')}</TypographyH1>
        <TypographyP>Save your favorite products for later</TypographyP>
      </div>

      {isLoading ? (
        <WishlistSkeleton />
      ) : wishlist.length === 0 ? (
        <EmptyState
          title={t('wishlist.empty')}
          description="Start adding products you love to keep track of them"
          action={
            <Button asChild>
              <Link href="/products">
                {t('wishlist.startShopping')}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <TypographyH2 className="text-xl">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
            </TypographyH2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshWishlist}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item) => (
              <Card key={item.id} className="group h-full flex flex-col">
                {/* Product Image */}
                <div className="relative aspect-square bg-muted/20 overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                      <IconPhoto size={48} className="opacity-30" />
                    </div>
                  )}
                  
                  {/* Wishlist button overlay */}
                  <div className="absolute top-2 right-2">
                    <WishlistButton
                      product={item}
                      variant="icon"
                      className="bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background/90"
                    />
                  </div>
                </div>

                <CardHeader className="flex-1">
                  <div className="space-y-2">
                    <CardTitle className="line-clamp-2 text-lg leading-tight">
                      <Link 
                        href={`/products/${item.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </CardTitle>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-foreground">
                        {item.price.toFixed(2)} MAD
                      </div>
                      {item.brand && (
                        <div className="text-sm text-muted-foreground">
                          {item.brand.name}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Stock and variant info */}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={item.stock === 0 ? "destructive" : item.stock < 10 ? "default" : "secondary"}
                      className={
                        item.stock === 0 
                          ? "text-destructive-foreground"
                          : item.stock < 10
                            ? "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900"
                            : "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900"
                      }
                    >
                      {item.stock === 0 ? "Out of stock" : `${item.stock} available`}
                    </Badge>
                    
                    {item.hasVariants && (
                      <Badge variant="outline" className="text-xs">
                        {item.variantCount} options
                      </Badge>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {item.hasVariants || item.stock === 0 ? (
                      <Button asChild className="flex-1" size="sm">
                        <Link href={`/products/${item.id}`}>
                          <IconHeart className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleAddToCart(item)} 
                        className="flex-1" 
                        size="sm"
                        disabled={item.stock === 0}
                      >
                        <IconShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WishlistSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-full">
            <Skeleton className="aspect-square" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}