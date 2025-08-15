import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  message?: string;
  className?: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: React.ReactNode;
};

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load the content. Please try again.",
  className,
  onRetry,
  retryText = "Try again",
  icon,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="bg-destructive/10 p-3 rounded-full mb-4">
        {icon || <AlertCircle className="h-10 w-10 text-destructive" />}
      </div>
      <h2 className="text-xl font-semibold tracking-tight mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          {retryText}
        </Button>
      )}
    </div>
  );
}
