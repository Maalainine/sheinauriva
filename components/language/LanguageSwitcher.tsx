"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { IconLanguage, IconChevronDown } from "@tabler/icons-react";
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

  const handleLocaleChange = (newLocale: Locale) => {
    console.log('Language switcher clicked:', newLocale);
    setLocale(newLocale);
  };

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("h-8 px-2", className)}
            aria-label="Change language"
          >
            <span className="text-sm font-medium">{localeLabels[locale]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="min-w-[160px]">
          {locales.map((loc) => (
            <DropdownMenuItem 
              key={loc} 
              onClick={() => handleLocaleChange(loc)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="flex-1">{localeLabels[loc]}</span>
                {loc === locale && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("gap-2", className)}
          aria-label="Change language"
        >
          <IconLanguage className="h-4 w-4" />
          <span>{localeLabels[locale]}</span>
          <IconChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-[180px]">
        {locales.map((loc) => (
          <DropdownMenuItem 
            key={loc} 
            onClick={() => handleLocaleChange(loc)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex-1">{localeLabels[loc]}</span>
              {loc === locale && (
                <Badge variant="secondary" className="text-xs">
                  Current
                </Badge>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}