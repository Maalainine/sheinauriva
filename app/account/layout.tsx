'use client';

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
  IconLoader2
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname() || '';
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(true);

  // Navigation items for the account sidebar
  const navigationItems = [
    {
      href: "/account",
      label: t("account.navigation.dashboard"),
      icon: IconDashboard,
      exact: true
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
    {
      href: "/account/settings",
      label: t("account.navigation.settings"),
      icon: IconSettings,
    },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      // If session is loading, wait
      if (status === 'loading') {
        return;
      }

      // Try to refresh the session if needed
      if (status === 'unauthenticated' || !session) {
        const refreshedSession = await update();

        if (!refreshedSession?.user) {
          const redirectUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
          router.push(redirectUrl);
          return;
        }

        // Use the refreshed session for the rest of the checks
        if (refreshedSession.user?.role !== 'CLIENT') {
          // If user is admin, redirect to admin dashboard
          if (refreshedSession.user?.role === 'ADMIN') {
            router.push('/admin/dashboard');
          } else {
            router.push('/login');
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
      if (session.user.role !== 'CLIENT') {
        // If user is admin, redirect to admin dashboard
        if (session.user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/login');
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
      callbackUrl: '/'
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IconUser className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">{session?.user?.name}</h2>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
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
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Sign Out Button */}
              <div className="mt-6 pt-6 border-t">
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

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
