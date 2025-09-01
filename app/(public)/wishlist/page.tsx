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
import ProductCard from "@/components/product/card/ProductCard";
import { 
  IconLogin
} from "@tabler/icons-react";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { wishlist, isLoading, refreshWishlist } = useWishlist();
  const { t } = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading skeleton while session is loading
  if (!mounted || status === "loading") {
    return <WishlistSkeleton />;
  }

  // Show login prompt if not authenticated but wishlist is empty
  if (status === "unauthenticated" && wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          title={t('wishlist.empty')}
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


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <TypographyH1 className="mb-2">{t('wishlist.title')}</TypographyH1>
        <TypographyP>{t('wishlist.description')}</TypographyP>
        {status === "unauthenticated" && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <TypographyP className="text-sm">
                  {t('wishlist.loginPrompt')}
                </TypographyP>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/login?callbackUrl=/wishlist">
                  <IconLogin className="h-4 w-4 mr-2" />
                  {t('auth.login')}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <WishlistSkeleton />
      ) : wishlist.length === 0 ? (
        <EmptyState
          title={t('wishlist.empty')}
          description={t('wishlist.emptyDescription')}
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
              {wishlist.length} {wishlist.length === 1 ? t('wishlist.item') : t('wishlist.items')}
            </TypographyH2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshWishlist}
              disabled={isLoading}
            >
              {t('common.refresh')}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {wishlist.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description || ""}
                price={item.price}
                stock={item.stock || 0}
                images={item.image ? [item.image] : []}
                tags={[]}
                brand={item.brand || null}
                hasVariants={item.hasVariants || false}
                variantCount={item.variantCount || 0}
              />
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