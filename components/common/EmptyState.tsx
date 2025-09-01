"use client";
import { TypographyP, TypographyH3 } from "@/components/ui/typography";
import { IconShoppingCartOff } from "@tabler/icons-react";
import { useTranslations } from "@/hooks/useTranslations";
import { ReactNode } from "react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ 
  title,
  message,
  description,
  action 
}: EmptyStateProps) {
  const { t } = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <IconShoppingCartOff className="mb-4 text-muted-foreground" size={48} />
      {title ? <TypographyH3 className="mb-2">{title}</TypographyH3> : <TypographyH3 className="mb-2">{t('common.nothingHere')}</TypographyH3>}
      {description && <p className="text-muted-foreground mb-6 max-w-md">{description}</p>}
      {message && <TypographyP className="text-center">{message}</TypographyP>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
