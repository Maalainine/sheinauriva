"use client";

import { useEffect } from "react";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  className?: string;
  fullScreen?: boolean;
  title?: string;
  description?: string;
}

export function ErrorBoundary({
  error,
  reset,
  className = "",
  fullScreen = false,
  title = "Something went wrong",
  description,
}: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Error Boundary:", error);
  }, [error]);

  const containerClasses = cn(
    "rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-destructive dark:bg-destructive/10",
    fullScreen
      ? "flex min-h-screen w-full items-center justify-center"
      : "w-full",
    className,
  );

  const contentClasses = cn(
    "space-y-4",
    fullScreen ? "max-w-md text-center" : "",
  );

  return (
    <div className={containerClasses} role="alert">
      <div className={contentClasses}>
        <div className="flex items-center gap-2">
          <IconAlertCircle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        <p className="text-sm text-foreground/80">
          {description ||
            error.message ||
            "An unexpected error occurred. Please try again."}
        </p>

        <div className="pt-2">
          <Button
            variant="outline"
            size={fullScreen ? "default" : "sm"}
            onClick={reset}
            className="gap-2"
          >
            <IconRefresh className="h-4 w-4" />
            <span>Try again</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  className?: string;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  className = "",
}: ErrorFallbackProps) {
  return (
    <div
      className={cn(
        "border border-destructive/20 bg-destructive/5 p-4 destructive",
        className,
      )}
      role="alert"
    >
      <div className="flex items-start gap-2">
        <IconAlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div>
          <p className="font-medium">An error occurred</p>
          <p className="mt-1 text-foreground/80">{error.message}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetErrorBoundary}
            className="mt-2 h-8 px-3 text-xs"
          >
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}
