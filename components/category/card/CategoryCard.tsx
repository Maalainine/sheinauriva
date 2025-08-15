"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TypographyH3, TypographyP } from "@/components/ui/typography";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

type CategoryCardProps = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  productCount?: number;
  buttonText?: string;
  onButtonClick?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
};

const CategoryCard = React.forwardRef<HTMLDivElement, CategoryCardProps>(
  (
    {
      id,
      title,
      subtitle,
      imageUrl,
      productCount,
      onClick,
      className,
      buttonText = "View Collection",
      onButtonClick,
      ...cardProps
    },
    ref
  ) => {
    const router = useRouter();

    return (
      <Card
        ref={ref}
        className={cn(
          "group relative flex w-full overflow-hidden",
          "hover:shadow-lg transition-shadow duration-300",
          className
        )}
        style={{
          height: "fit-content",
          position: "relative",
        }}
        onClick={(e) => {
          e.preventDefault();
          router.push(`/products?categoryId=${encodeURIComponent(id)}`);
          if (onClick) {
            onClick(e);
          }
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && (() => {
          e.preventDefault();
          router.push(`/products?categoryId=${encodeURIComponent(id)}`);
          onClick?.(e as any);
        })()}
        {...cardProps}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: imageUrl ? "transparent" : "hsl(var(--muted))",
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/100 via-foreground/50 to-transparent" />
          
          {/* Fallback content when no image */}
          {!imageUrl && (
            <div className="h-full w-full flex items-center justify-center text-muted-background">
              <span className="text-2xl font-bold">{title}</span>
            </div>
          )}
        </div>
        <CardHeader className="flex flex-col justify-end relative z-10 pb-2">
          <TypographyH3 className="text-background drop-shadow-md line-clamp-2">
            {title}
          </TypographyH3>
        </CardHeader>

        <CardContent className="flex-1 relative z-10 pt-0">
          <TypographyP className="text-background/90 line-clamp-2 max-w-[60%] break-words">
            {subtitle}
          </TypographyP>
        </CardContent>

        <CardFooter className="flex items-center relative z-10 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="bg-background/20 backdrop-blur-sm hover:bg-background/30 border-background/20 text-background hover:text-background"
            onClick={(e) => {
              e.stopPropagation();
              onButtonClick?.(e);
            }}
          >
            {buttonText || "View Collection"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }
);

CategoryCard.displayName = "CategoryCard";

export { CategoryCard };
