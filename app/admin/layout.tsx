'use client';

import { Sidebar } from "@/components/admin/Sidebar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: { [key: string]: string | string[] | undefined };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [isLoading, setIsLoading] = useState(true);
  const isLoginPage = pathname === '/admin/login';
  
  // Debug log
  console.log('AdminLayout - Current path:', pathname);
  console.log('AdminLayout - Session status:', status);
  console.log('AdminLayout - Session data:', session);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('AdminLayout - Pathname:', pathname);
      console.log('AdminLayout - Session status:', status);
      console.log('AdminLayout - Session data:', session);
      
      // Skip check if we're already on the login page
      if (isLoginPage) {
        console.log('AdminLayout - On login page, skipping auth check');
        setIsLoading(false);
        return;
      }

      // If session is loading, wait
      if (status === 'loading') {
        console.log('AdminLayout - Session is loading...');
        return;
      }

      // Try to refresh the session if needed
      if (status === 'unauthenticated' || !session) {
        console.log('AdminLayout - No active session, attempting to refresh...');
        const refreshedSession = await update();
        console.log('AdminLayout - Refreshed session:', refreshedSession);
        
        if (!refreshedSession?.user) {
          console.log('AdminLayout - No session after refresh, redirecting to login');
          const redirectUrl = `/admin/login?callbackUrl=${encodeURIComponent(pathname)}`;
          console.log('AdminLayout - Redirect URL:', redirectUrl);
          router.push(redirectUrl);
          return;
        }
        
        // Use the refreshed session for the rest of the checks
        if (refreshedSession.user) {
          // If we have a valid session after refresh, continue with the checks
          if (refreshedSession.user.role !== 'ADMIN') {
            console.log('AdminLayout - Refreshed user is not an admin, redirecting to home');
            router.push('/');
            return;
          }
          
          console.log('AdminLayout - User is authenticated and is an admin after refresh');
          setIsLoading(false);
          return;
        }
      }

      // If still no session, redirect to login
      if (!session?.user) {
        console.log('AdminLayout - No session found, redirecting to login');
        const redirectUrl = `/admin/login?callbackUrl=${encodeURIComponent(pathname)}`;
        console.log('AdminLayout - Redirect URL:', redirectUrl);
        router.push(redirectUrl);
        return;
      }

      // If user is not admin, redirect to home
      if (session.user.role !== 'ADMIN') {
        console.log('AdminLayout - User is not an admin, redirecting to home');
        router.push('/');
        return;
      }
      
      console.log('AdminLayout - User is authenticated and is an admin');
      setIsLoading(false);
    };

    checkAuth();
  }, [session, status, isLoginPage, pathname, router, update]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // For login page, just render the children without the sidebar
  if (isLoginPage) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-full">
          {children}
        </div>
      </div>
    );
  }

  // Render the admin layout with sidebar for authenticated admins
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={{
        name: session?.user?.name || null,
        email: session?.user?.email || null,
        image: session?.user?.image || null
      }} />
      <div className="flex-1 md:pl-64">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
