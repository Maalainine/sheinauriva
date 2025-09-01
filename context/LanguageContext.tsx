"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Locale, defaultLocale, isRtlLocale } from "@/lib/i18n";

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isRtl: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isRtl, setIsRtl] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
    
    // Load locale from localStorage on mount
    const savedLocale = localStorage.getItem("locale") as Locale;
    if (savedLocale && ['en', 'ar', 'fr'].includes(savedLocale)) {
      setLocaleState(savedLocale);
      setIsRtl(isRtlLocale(savedLocale));
      
      // Set document direction and language
      document.documentElement.lang = savedLocale;
      document.documentElement.dir = isRtlLocale(savedLocale) ? 'rtl' : 'ltr';
    } else {
      // Set default
      document.documentElement.lang = defaultLocale;
      document.documentElement.dir = 'ltr';
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    if (!isClient) return; // Don't change locale on server side
    
    setLocaleState(newLocale);
    setIsRtl(isRtlLocale(newLocale));
    
    // Save to localStorage
    localStorage.setItem("locale", newLocale);
    
    // Update document attributes
    document.documentElement.lang = newLocale;
    document.documentElement.dir = isRtlLocale(newLocale) ? 'rtl' : 'ltr';
    
    // Trigger a custom event for other components to react
    window.dispatchEvent(new CustomEvent("localechange", { 
      detail: { locale: newLocale, isRtl: isRtlLocale(newLocale) } 
    }));
    
    console.log('Language switched to:', newLocale);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}