"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";

type Messages = Record<string, any>;

// Pre-import all message files to avoid dynamic import issues
import enMessages from "@/messages/en.json";
import arMessages from "@/messages/ar.json";
import frMessages from "@/messages/fr.json";

const messageFiles = {
  en: enMessages,
  ar: arMessages,
  fr: frMessages,
};

export function useTranslations() {
  const { locale } = useLanguage();
  const [messages, setMessages] = useState<Messages>(enMessages); // Default to English
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadMessages = () => {
      setIsLoading(true);
      try {
        const msgs = messageFiles[locale as keyof typeof messageFiles] || messageFiles.en;
        setMessages(msgs);
        console.log(`Messages loaded for locale: ${locale}`);
      } catch (error) {
        console.error(`Failed to load messages for locale ${locale}:`, error);
        setMessages(messageFiles.en); // Fallback to English
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [locale]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    if (isLoading) {
      return key; // Return key while loading
    }

    const keys = key.split('.');
    let value = messages;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters in the string
    if (params) {
      let result = String(value);
      Object.entries(params).forEach(([param, val]) => {
        result = result.replace(new RegExp(`{${param}}`, 'g'), String(val));
      });
      return result;
    }

    return value;
  };

  return { t, isLoading, locale };
}

// Helper hook for common patterns
export function useCommonTranslations() {
  const { t, isLoading, locale } = useTranslations();

  return {
    t,
    isLoading,
    locale,
    common: {
      loading: t('common.loading'),
      error: t('common.error'),
      save: t('common.save'),
      cancel: t('common.cancel'),
      delete: t('common.delete'),
      edit: t('common.edit'),
      add: t('common.add'),
      search: t('common.search'),
      viewDetails: t('common.viewDetails'),
    },
    product: {
      addToCart: t('product.addToCart'),
      addToWishlist: t('product.addToWishlist'),
      removeFromWishlist: t('product.removeFromWishlist'),
      outOfStock: t('product.outOfStock'),
      sale: t('product.sale'),
    },
    navigation: {
      home: t('navigation.home'),
      products: t('navigation.products'),
      cart: t('navigation.cart'),
      wishlist: t('navigation.wishlist'),
      login: t('navigation.login'),
      logout: t('navigation.logout'),
    },
  };
}