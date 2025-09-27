"use client";
import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import {
  IconX,
  IconPlus,
  IconMinus,
  IconShoppingCart,
  IconArrowLeft,
  IconTrash,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/context/LanguageContext";

// Skeleton Loader Component
const CartItemSkeleton = () => (
  <div className="flex gap-4 items-start p-4">
    <Skeleton className="w-16 h-16 rounded-md" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/4" />
      <div className="flex items-center gap-2 mt-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-12 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  </div>
);

// Cart Item Component
const CartItem = ({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: any; // Using any for now, but should be properly typed
  onRemove: (id: string, variantId?: string) => void;
  onUpdateQuantity: (id: string, quantity: number, variantId?: string) => void;
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const price = Number(item.price) || 0;
  const itemTotal = (price * item.quantity).toFixed(2);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(item.id, item.variantId), 200); // Allow animation to complete
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={isRemoving ? { opacity: 0, x: 100 } : { opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="flex gap-4 items-start p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow transition-shadow"
    >
      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={80}
            height={80}
            className="object-cover w-full h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <IconShoppingCart className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-medium text-sm line-clamp-2 leading-tight">
            {item.name}
          </h3>
          <button
            onClick={handleRemove}
            aria-label="Remove from cart"
            className="text-muted-foreground hover:text-destructive transition-colors p-1 -m-1"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            MAD {price.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground">
            x {item.quantity}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                onUpdateQuantity(item.id, item.quantity - 1, item.variantId)
              }
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <IconMinus className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm font-medium w-6 text-center">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                onUpdateQuantity(item.id, item.quantity + 1, item.variantId)
              }
              aria-label="Increase quantity"
            >
              <IconPlus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <span className="text-sm font-medium">MAD {itemTotal}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const { t } = useTranslations();
  const { isRtl } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Calculate subtotal
  const subtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
    0,
  );

  // Handle client-side only rendering
  useEffect(() => {
    setIsClient(true);

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle quantity update with debounce
  const handleUpdateQuantity = (
    id: string,
    newQuantity: number,
    variantId?: string,
  ) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity, variantId);
  };

  // Handle item removal
  const handleRemoveItem = (id: string, variantId?: string) => {
    removeItem(id, variantId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  // Determine drawer direction and styling based on screen size and language
  const direction = isMobile ? "top" : isRtl ? "left" : "right";
  const contentClassName = isMobile
    ? "h-[85vh] max-h-[85vh] w-full rounded-b-lg"
    : "h-full w-96 max-w-96";

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={direction}>
      <DrawerContent className={contentClassName}>
        <DrawerHeader className="px-4 sm:px-6 border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold">
              {t("cart.title")}
              {cart.length > 0 && (
                <span className="text-muted-foreground font-normal ml-2">
                  ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </span>
              )}
            </DrawerTitle>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <IconTrash className="h-4 w-4 mr-1" />
                  {t("cart.clearCart")}
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                  <span className="sr-only">{t("common.close")}</span>
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t("cart.empty")}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t("cart.noItems")}
              </p>
              <DrawerClose asChild>
                <Button asChild>
                  <Link href="/products" className="flex items-center gap-2">
                    <IconArrowLeft className="h-4 w-4" />
                    {t("cart.continueShopping")}
                  </Link>
                </Button>
              </DrawerClose>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <motion.div
                layout
                className="space-y-4"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
              >
                {cart.map((item) => (
                  <CartItem
                    key={`${item.id}-${item.variantId || "no-variant"}`}
                    item={item}
                    onRemove={handleRemoveItem}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {cart.length > 0 && (
          <DrawerFooter className="border-t p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>{t("cart.total")}</span>
                <span>MAD {subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              <Link href="/checkout">{t("cart.checkout")}</Link>
            </Button>

            <DrawerClose asChild>
              <Button variant="outline" className="mt-2">
                {t("cart.continueShopping")}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
