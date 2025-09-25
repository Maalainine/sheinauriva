"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("Admin root page - Session status:", status);
    console.log("Admin root page - Session data:", session);

    // If session is loading, wait
    if (status === "loading") {
      console.log("Admin root page - Session loading...");
      return;
    }

    // If no session, redirect to login
    if (status === "unauthenticated" || !session?.user) {
      console.log("Admin root page - No session, redirecting to login");
      router.push("/admin/login?callbackUrl=/admin");
      return;
    }

    // If not admin, redirect to home
    if (session.user.role !== "ADMIN") {
      console.log(
        "Admin root page - Not admin role, redirecting to home. Role:",
        session.user.role,
      );
      router.push("/");
      return;
    }

    // Valid admin, redirect to dashboard
    console.log("Admin root page - Valid admin, redirecting to dashboard");
    router.push("/admin/dashboard");
  }, [session, status, router]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // This should not render as useEffect handles all redirects
  return null;
}
