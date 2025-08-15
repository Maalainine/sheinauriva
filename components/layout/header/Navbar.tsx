"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { IconShoppingCart, IconMenu2, IconX, IconUser } from "@tabler/icons-react";
import CartDrawer from "@/components/cart/CartDrawer";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  

  // Update cart count when cart changes
  useEffect(() => {
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
          console.error('Error parsing cart from storage:', e);
        }
      }
    };

    window.addEventListener('cart-updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cart-updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);



  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className={cn(
        "w-full bg-background/95 border-b border-border/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all duration-300",
        isScrolled ? "py-2 shadow-sm" : "py-3"
      )}>
        <div className="container flex items-center justify-between px-4 mx-auto">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden space-x-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle menu"
                  className="text-foreground/80 hover:bg-transparent hover:text-foreground"
                >
                  {mobileMenuOpen ? (
                    <IconX className="h-5 w-5" />
                  ) : (
                    <IconMenu2 className="h-5 w-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0">
                <SheetHeader className="border-b p-4 text-left">
                  <SheetTitle className="text-xl font-bold tracking-tight">
                    <div className="flex items-center gap-1">
                      <Link 
                        href="/" 
                        className="flex items-center h-10 w-10 relative"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Image
                          src="/images/LOGO.png"
                          alt="JustOriginale"
                          fill
                          className="object-contain"
                          priority
                        />
                      </Link>
                      <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent tracking-tight">
                        JustOriginale
                      </span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
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
                      >
                        {link.label}
                      </Link>
                    ))}
                    
                    <div className="pt-4 mt-4 border-t border-border/40">
                      <Link 
                        href="/account" 
                        className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-foreground/90 hover:bg-accent"
                      >
                        <IconUser className="h-5 w-5 mr-2" />
                        My Account
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <div className="flex-1 lg:flex-none">
            <div className="flex items-center gap-1">
              <Link 
                href="/" 
                className="h-10 w-10 relative hover:opacity-90 transition-opacity flex-shrink-0"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Image
                  src="/images/LOGO.png"
                  alt="JustOriginale"
                  fill
                  className="object-contain"
                  priority
                />
              </Link>
              <span className="text-2xl font-bold hidden sm:block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent tracking-tight">
                JustOriginale
              </span>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center space-x-1">
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
                      damping: 30
                    }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Cart and User Actions */}
          <div className="flex items-center justify-end gap-2 lg:gap-4 flex-1 lg:flex-none">

            {/* Account */}
            {/*<Button
              variant="ghost"
              size="icon"
              aria-label="Account"
              className="hidden lg:flex text-foreground/80 hover:bg-transparent hover:text-foreground"
              asChild
            >
              <Link href="/account">
                <IconUser className="h-5 w-5" />
              </Link>
            </Button>*/}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative group"
              onClick={() => setCartOpen(true)}
              aria-label={`Shopping cart (${cartCount} items)`}
            >
              <IconShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <motion.span 
                  key={cartCount}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </Button>
          </div>
        </div>


      </nav>
      
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
