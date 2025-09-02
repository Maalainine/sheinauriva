"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

// Icons
import { IconShoppingCart, IconMenu2, IconSearch, IconX, IconHeart } from "@tabler/icons-react";

// Components
import CartDrawer from "@/components/cart/CartDrawer";
import SearchBar from "@/components/SearchBar";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/context/LanguageContext";

// Hooks
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

// Utils
import { cn } from "@/lib/utils";
import { TypographyH1, TypographyH2, TypographyH3, TypographyLarge } from "@/components/ui/typography";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { t } = useTranslations();
  const { isRtl } = useLanguage();

  const navLinks = [
    { href: "/", label: t('navigation.home') },
    { href: "/products", label: t('navigation.products') },
    { href: "/categories", label: t('navigation.categories') },
    { href: "/contact", label: t('navigation.contact') },
  ];
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isClient, setIsClient] = useState(false);

  // Set client-side state and handle scroll effect
  useEffect(() => {
    setIsClient(true);

    // Initialize cart count from localStorage if available
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        const items = JSON.parse(stored);
        const count = Array.isArray(items)
          ? items.reduce((sum, item) => sum + (item.quantity || 1), 0)
          : 0;
        setCartCount(count);
      } catch (e) {
        console.error("Error parsing cart from storage:", e);
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update cart count when cart changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  }, [cart]);

  // Update wishlist count when wishlist changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    setWishlistCount(wishlist.length);
  }, [wishlist]);

  // Listen for cart updates from other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("cart");
      if (stored) {
        try {
          const items = JSON.parse(stored);
          const count = Array.isArray(items)
            ? items.reduce((sum, item) => sum + (item.quantity || 1), 0)
            : 0;
          setCartCount(count);
        } catch (e) {
          console.error("Error parsing cart from storage:", e);
        }
      }
    };

    window.addEventListener("cart-updated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("cart-updated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav
        className={cn(
          "w-full bg-background/95 border-b border-border/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all duration-300",
          isScrolled ? "py-2 shadow-sm" : "py-3"
        )}
      >
        <div className="container flex items-center justify-between px-4 mx-auto">
          {/* Mobile Layout */}
          <div className="grid lg:hidden grid-cols-3 items-center w-full">
            {/* Left side - Menu */}
            <div className={cn("flex", isRtl ? "justify-end" : "justify-start")}>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Toggle menu"
                    className="text-foreground/80 hover:bg-transparent hover:text-foreground"
                  >
                    <IconMenu2 className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className={cn("w-full h-auto max-h-[80vh] p-0", isRtl && "[&>[data-slot=close]]:left-2 [&>[data-slot=close]]:right-auto")}>
                  <SheetHeader className={cn("border-b py-2", isRtl ? "pl-6 pr-12 text-right" : "pl-6 pr-12 text-left")}>
                    <SheetTitle className="text-xl font-bold tracking-tight">
                      <div className={cn("flex items-center gap-2", isRtl && "flex-row-reverse")}>
                        <Link
                          href="/"
                          className="border-2 border-primary flex items-center relative"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Image
                            src="/images/JO-removebg.png"
                            alt="JO"
                            width={30}
                            height={30}
                            className="object-contain"
                            priority
                          />
                        </Link>
                        <TypographyH3 className="flex"><TypographyH3 className="text-primary/70">Just</TypographyH3>Originale</TypographyH3>

                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="pb-4">
                    <div className="p-4 space-y-1">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            "flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors",
                            pathname === link.href
                              ? "bg-primary/10 text-primary"
                              : "text-foreground/90 hover:bg-accent"
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                      
                      {/* Wishlist Link */}
                      <Link
                        href="/wishlist"
                        className={cn(
                          "flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors",
                          pathname === "/wishlist"
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/90 hover:bg-accent"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('navigation.wishlist')}
                      </Link>
                      
                      {/* Language Switcher in Mobile Menu */}
                      <div className="px-3 py-3">
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Language
                        </Label>
                        <LanguageSwitcher variant="compact" />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Center - Logo (Perfectly Centered) */}
            <div className="flex justify-center">
              <Link
                href="/"
                className="border-2 border-primary relative hover:opacity-90 transition-opacity flex-shrink-0"
              >
                <Image
                  src="/images/JO-removebg.png"
                  alt="JO"
                  width={30}
                  height={30}
                  priority
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Right side - Search & Cart */}
            <div className={cn("flex items-center justify-end gap-1", isRtl ? "flex-row-reverse [&>*:nth-child(1)]:order-2 [&>*:nth-child(2)]:order-1" : "")}>
              {/* Mobile Search Toggle */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <IconSearch className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className={cn("p-0 h-auto", isRtl && "[&>button.absolute]:!left-4 [&>button.absolute]:!right-auto")}>
                  <SheetHeader className={cn("px-4 pt-2.5 pb-0", isRtl ? "text-left pl-12 pr-5" : "text-left pr-12 pl-4")}>
                    <SheetTitle className="text-lg font-semibold">{t('common.search')}</SheetTitle>
                  </SheetHeader>
                  <SearchBar className="p-4 border-t" variant="expanded" autoFocus />
                </SheetContent>
              </Sheet>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative group"
                onClick={() => setCartOpen(true)}
                aria-label={
                  isClient
                    ? `Shopping cart (${cartCount} items)`
                    : "Shopping cart"
                }
              >
                <IconShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
                {isClient && cartCount > 0 && (
                  <motion.span
                    key={`cart-count-${cartCount}`}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:items-center w-full">
            {/* Logo */}
            <div className="flex-shrink-0 items-center">
              <Link
                href="/"
                className="relative hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Image
                  src="/images/JO-removebg.png"
                  alt="JO"
                  width={30}
                  height={30}
                  priority
                  className="border-2 border-primary object-contain"
                />
                <TypographyH3 className="flex"><TypographyH3 className="text-primary/70">Just</TypographyH3>Originale</TypographyH3>
              </Link>
            </div>

            {/* Navigation Links - Perfectly Centered */}
            <div className="flex items-center justify-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-foreground/80 hover:text-primary hover:bg-muted/50"
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.span
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
                      layoutId="activeNav"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className={cn("flex items-center justify-end gap-2", isRtl ? "flex-row-reverse [&>*:nth-child(1)]:order-4 [&>*:nth-child(2)]:order-3 [&>*:nth-child(3)]:order-2 [&>*:nth-child(4)]:order-1" : "")}>
              <SearchBar />
              
              {/* Wishlist Button */}
              <Button variant="ghost" size="icon" className="relative group" asChild>
                <Link href="/wishlist">
                  <IconHeart className="h-5 w-5 transition-transform group-hover:scale-110" />
                  {isClient && wishlistCount > 0 && (
                    <motion.span
                      key={`wishlist-count-desktop-${wishlistCount}`}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </motion.span>
                  )}
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="relative group"
                onClick={() => setCartOpen(true)}
                aria-label={
                  isClient
                    ? `Shopping cart (${cartCount} items)`
                    : "Shopping cart"
                }
              >
                <IconShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
                {isClient && cartCount > 0 && (
                  <motion.span
                    key={`cart-count-${cartCount}`}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </Button>
              
              {/* Language Switcher */}
              <LanguageSwitcher variant="compact" />
            </div>
          </div>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
