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
import { IconShoppingCart, IconMenu2, IconSearch, IconX } from "@tabler/icons-react";

// Components
import CartDrawer from "@/components/cart/CartDrawer";
import SearchBar from "@/components/SearchBar";

// Hooks
import { useCart } from "@/context/CartContext";

// Utils
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
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
          <div className="flex lg:hidden items-center justify-between w-full">
            {/* Left side - Menu */}
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
              <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0">
                <SheetHeader className="border-b p-4 text-left">
                  <SheetTitle className="text-xl font-bold tracking-tight">
                    <div className="flex items-center gap-1">
                      <Link
                        href="/"
                        className="flex items-center relative"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Image
                          src="/images/SaadLogo.png"
                          alt="SafSaf"
                          width={80}
                          height={80}
                          className="object-contain"
                          priority
                        />
                      </Link>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {/* Mobile Search in Menu */}
                    <div className="mb-6 p-2 bg-muted/30 rounded-lg">
                      <SearchBar variant="expanded" />
                    </div>

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
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Center - Logo */}
            <div className="flex-1 flex justify-center">
              <Link
                href="/"
                className="relative hover:opacity-90 transition-opacity flex-shrink-0"
              >
                <Image
                  src="/images/SaadLogo.png"
                  alt="SafSaf"
                  width={80}
                  height={80}
                  priority
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Right side - Search & Cart */}
            <div className="flex items-center gap-1">
              {/* Mobile Search Toggle */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <IconSearch className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="p-0">
                  <SheetHeader className="px-4 pt-2.5 pb-0">
                    <SheetTitle className="text-lg font-semibold">Search</SheetTitle>
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
          <div className="hidden lg:flex items-center justify-between w-full">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="relative hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Image
                  src="/images/SaadLogo.png"
                  alt="SafSaf"
                  width={100}
                  height={100}
                  priority
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-1">
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
            <div className="flex items-center gap-2">
            <SearchBar />
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
        </div>
      </nav>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
