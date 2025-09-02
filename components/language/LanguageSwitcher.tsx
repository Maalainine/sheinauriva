"use client";
import { Button } from "@/components/ui/button";
import { IconGlobe } from "@tabler/icons-react";
import { useLanguage } from "@/context/LanguageContext";
import { locales, localeLabels, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "default" | "compact";
  className?: string;
}

export default function LanguageSwitcher({ 
  variant = "default", 
  className 
}: LanguageSwitcherProps) {
  const { locale, setLocale, isRtl } = useLanguage();

  const cycleLanguage = () => {
    const currentIndex = locales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % locales.length;
    const nextLocale = locales[nextIndex];
    console.log('Language switcher clicked:', nextLocale);
    setLocale(nextLocale);
  };

  if (variant === "compact") {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={cycleLanguage}
        className={cn("h-8 px-2 text-sm font-medium", className)}
        aria-label={`Switch language - current: ${localeLabels[locale]}`}
      >
        {localeLabels[locale]}
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={cycleLanguage}
      className={cn("relative", className)}
      aria-label={`Switch language - current: ${localeLabels[locale]}`}
    >
      <IconGlobe className="h-5 w-5" />
      <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
        {locale.toUpperCase()}
      </span>
    </Button>
  );
}