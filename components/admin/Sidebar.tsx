"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconDashboard,
  IconPackage,
  IconShoppingCart,
  IconUsers,
  IconSettings,
  IconLogout,
  IconMenu2,
  IconX,
  IconCategory,
  IconTags,
  IconBoxMultiple,
  IconListDetails,
} from "@tabler/icons-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: IconDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: IconPackage,
    children: [
      { title: "All Products", href: "/admin/products", icon: IconListDetails },
      { title: "Add New", href: "/admin/products/create", icon: IconPackage },
      { title: "Categories", href: "/admin/categories", icon: IconCategory },
      { title: "Tags", href: "/admin/tags", icon: IconTags },
      { title: "Brands", href: "/admin/brands", icon: IconListDetails },
      { title: "Variants", href: "/admin/variants", icon: IconListDetails },
    ],
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: IconShoppingCart,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: IconUsers,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: IconSettings,
  },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden"
        >
          {isOpen ? (
            <IconX className="h-6 w-6" />
          ) : (
            <IconMenu2 className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r bg-background transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link
              href="/admin"
              className="flex items-center gap-2 font-semibold"
            >
              <span>Admin Panel</span>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1">
            <nav className="space-y-1 p-2">
              {navItems.map((item) => (
                <div key={item.href} className="space-y-1">
                  {item.children ? (
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {item.title}
                      </div>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ml-2",
                            pathname === child.href
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground",
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="w-5 h-5 flex items-center justify-center mr-3">
                            {child.icon ? (
                              <child.icon className="h-4 w-4" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                            )}
                          </span>
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* User profile */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback>
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                title="Sign out"
              >
                <IconLogout className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
