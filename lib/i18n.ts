export const locales = ["en", "ar", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
};

// RTL languages
export const rtlLocales: Locale[] = ["ar"];

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
