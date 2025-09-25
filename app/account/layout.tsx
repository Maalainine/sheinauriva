"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  IconUser,
  IconShoppingBag,
  IconHeart,
  IconMapPin,
  IconLogout,
  IconDashboard,
  IconSettings,
  IconLoader2,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname() || "";
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(true);

  // Navigation items for the account sidebar
  const navigationItems = [
    {
      href: "/account",
      label: t("account.navigation.dashboard"),
      icon: IconDashboard,
      exact: true,
    },
    {
      href: "/account/orders",
      label: t("account.navigation.orders"),
      icon: IconShoppingBag,
    },
    {
      href: "/account/wishlist",
      label: t("account.navigation.wishlist"),
      icon: IconHeart,
    },
    {
      href: "/account/addresses",
      label: t("account.navigation.addresses"),
      icon: IconMapPin,
    },
    {
      href: "/account/profile",
      label: t("account.navigation.profile"),
      icon: IconUser,
    },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      // If session is loading, wait
      if (status === "loading") {
        return;
      }

      // Try to refresh the session if needed
      if (status === "unauthenticated" || !session) {
        const refreshedSession = await update();

        if (!refreshedSession?.user) {
          const redirectUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
          router.push(redirectUrl);
          return;
        }

        // Use the refreshed session for the rest of the checks
        if (refreshedSession.user?.role !== "CLIENT") {
          // If user is admin, redirect to admin dashboard
          if (refreshedSession.user?.role === "ADMIN") {
            router.push("/admin/dashboard");
          } else {
            router.push("/login");
          }
          return;
        }

        setIsLoading(false);
        return;
      }

      // If still no session, redirect to login
      if (!session?.user) {
        const redirectUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
        router.push(redirectUrl);
        return;
      }

      // If user is not a client, redirect appropriately
      if (session.user.role !== "CLIENT") {
        // If user is admin, redirect to admin dashboard
        if (session.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/login");
        }
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [session, status, pathname, router, update]);

  const handleSignOut = async () => {
    await signOut({
      redirect: true,
      callbackUrl: "/",
    });
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <IconLoader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile: Regular layout */}
      <div className="lg:hidden">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8">
            {/* Sidebar for mobile */}
            <div className="w-full">
              <Card className="p-6">
                {/* User Info */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IconUser className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="font-semibold text-lg">
                    {session?.user?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                {/* Language Switcher & Sign Out */}
                <div className="mt-6 pt-6 border-t space-y-2">
                  <LanguageSwitcher variant="drawer" />
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    <IconLogout className="h-4 w-4 mr-3" />
                    {t("account.navigation.signOut")}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Main Content for mobile */}
            <div className="w-full">{children}</div>
          </div>
        </div>
      </div>

      {/* Desktop: Fixed sidebar layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Fixed Sidebar */}
        <div className="w-80 fixed ltr:left-0 rtl:right-0 top-0 h-screen bg-background ltr:border-r rtl:border-l border-border overflow-y-auto">
          <div className="p-6">
            <Card className="p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IconUser className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">{session?.user?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Language Switcher & Sign Out */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <LanguageSwitcher variant="drawer" />
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <IconLogout className="h-4 w-4 mr-3" />
                  {t("account.navigation.signOut")}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ltr:ml-80 rtl:mr-80">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
