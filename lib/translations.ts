import { Locale } from './i18n';

// Translation interface for database content
export interface Translation {
  locale: Locale;
  content: string;
}

// Helper to get translated content from an array of translations
export function getTranslation(
  translations: Translation[] | null | undefined,
  locale: Locale,
  fallbackLocale: Locale = 'en'
): string {
  if (!translations || translations.length === 0) {
    return '';
  }

  // Try to find the requested locale
  const translation = translations.find(t => t.locale === locale);
  if (translation?.content) {
    return translation.content;
  }

  // Fallback to the fallback locale
  const fallbackTranslation = translations.find(t => t.locale === fallbackLocale);
  if (fallbackTranslation?.content) {
    return fallbackTranslation.content;
  }

  // Return the first available translation
  const firstTranslation = translations.find(t => t.content);
  return firstTranslation?.content || '';
}

// Helper to create translations array
export function createTranslations(
  en: string,
  ar?: string,
  fr?: string
): Translation[] {
  const translations: Translation[] = [
    { locale: 'en', content: en },
  ];

  if (ar) {
    translations.push({ locale: 'ar', content: ar });
  }

  if (fr) {
    translations.push({ locale: 'fr', content: fr });
  }

  return translations;
}

// Helper to update translations
export function updateTranslation(
  translations: Translation[],
  locale: Locale,
  content: string
): Translation[] {
  const updated = translations.filter(t => t.locale !== locale);
  updated.push({ locale, content });
  return updated;
}

// Format currency with locale-aware formatting
export function formatCurrency(
  amount: number,
  locale: Locale,
  currency: string = 'MAD'
): string {
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    ar: 'ar-MA', // Arabic (Morocco)
    fr: 'fr-MA', // French (Morocco)
  };

  try {
    return new Intl.NumberFormat(localeMap[locale], {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback to English if locale is not supported
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}