"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconGlobe,
  IconCheck,
  IconLetterA,
  IconLetterE,
  IconLetterF,
} from "@tabler/icons-react";
import { useLanguage } from "@/context/LanguageContext";
import { locales, localeLabels, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/useTranslations";

interface LanguageSwitcherProps {
  variant?: "default" | "compact" | "drawer";
  className?: string;
}

// Map locales to their corresponding letter icons
const localeIcons: Record<
  Locale,
  React.ComponentType<{ className?: string }>
> = {
  en: IconLetterE, // English
  ar: IconLetterA, // Arabic
  fr: IconLetterF, // French
};

export default function LanguageSwitcher({
  variant = "default",
  className,
}: LanguageSwitcherProps) {
  const { locale, setLocale, isRtl } = useLanguage();
  const { t } = useTranslations();

  const handleLanguageSelect = (selectedLocale: Locale) => {
    console.log("Language selected:", selectedLocale);
    setLocale(selectedLocale);
  };

  if (variant === "drawer") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer",
              "text-foreground/90 hover:bg-accent w-full",
              className,
            )}
          >
            <IconGlobe className="h-5 w-5" />
            <span className="flex-1">{t("common.language")}</span>
            <span className="text-muted-foreground">
              {localeLabels[locale]}
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={isRtl ? "start" : "end"}
          className="min-w-[140px]"
        >
          {locales.map((loc) => {
            const IconComponent = localeIcons[loc];
            return (
              <DropdownMenuItem
                key={loc}
                onClick={() => handleLanguageSelect(loc)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <IconComponent className="h-4 w-4" />
                <span className="flex-1">{localeLabels[loc]}</span>
                {locale === loc && (
                  <IconCheck className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 px-2 text-sm font-medium gap-2", className)}
            aria-label={`Switch language - current: ${localeLabels[locale]}`}
          >
            <span>{localeLabels[locale]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={isRtl ? "start" : "end"}
          className="min-w-[120px]"
        >
          {locales.map((loc) => {
            const IconComponent = localeIcons[loc];
            return (
              <DropdownMenuItem
                key={loc}
                onClick={() => handleLanguageSelect(loc)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <IconComponent className="h-4 w-4" />
                <span className="flex-1">{localeLabels[loc]}</span>
                {locale === loc && (
                  <IconCheck className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("", className)}
          aria-label={`Switch language - current: ${localeLabels[locale]}`}
        >
          <IconGlobe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRtl ? "start" : "end"}
        className="min-w-[140px]"
      >
        {locales.map((loc) => {
          const IconComponent = localeIcons[loc];
          return (
            <DropdownMenuItem
              key={loc}
              onClick={() => handleLanguageSelect(loc)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <IconComponent className="h-4 w-4" />
              <span className="flex-1">{localeLabels[loc]}</span>
              {locale === loc && <IconCheck className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
