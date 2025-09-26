"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconAlertCircle, IconHome, IconLogin } from "@tabler/icons-react";

const errorMessages: Record<
  string,
  { title: string; description: string; action: string; href: string }
> = {
  Configuration: {
    title: "Server Configuration Error",
    description:
      "There is an issue with the server configuration. Please contact the administrator.",
    action: "Go to Home",
    href: "/",
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You do not have permission to access this resource.",
    action: "Go to Home",
    href: "/",
  },
  Verification: {
    title: "Verification Error",
    description: "The verification link is invalid or has expired.",
    action: "Try Again",
    href: "/login",
  },
  Default: {
    title: "Authentication Error",
    description: "An error occurred during authentication. Please try again.",
    action: "Try Again",
    href: "/login",
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams?.get("error");
    setError(errorParam);
  }, [searchParams]);

  const errorInfo =
    errorMessages[error || "Default"] || errorMessages["Default"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <IconAlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
            <CardDescription>{errorInfo.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertTitle>Error Code</AlertTitle>
              <AlertDescription>{error || "Unknown error"}</AlertDescription>
            </Alert>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => router.push(errorInfo.href)}
                className="w-full"
              >
                <IconLogin className="mr-2 h-4 w-4" />
                {errorInfo.action}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                <IconHome className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <IconAlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-2xl">Loading...</CardTitle>
                <CardDescription>
                  Please wait while we load the error details.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
