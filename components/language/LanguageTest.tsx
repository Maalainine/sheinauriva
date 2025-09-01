"use client";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LanguageSwitcher from "./LanguageSwitcher";

export default function LanguageTest() {
  const { t } = useTranslations();
  const { locale, isRtl } = useLanguage();

  return (
    <Card className="max-w-md mx-auto m-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Language Test
          <LanguageSwitcher variant="compact" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p><strong>Current Locale:</strong> {locale}</p>
        <p><strong>Is RTL:</strong> {isRtl ? 'Yes' : 'No'}</p>
        <p><strong>Home:</strong> {t('navigation.home')}</p>
        <p><strong>Products:</strong> {t('navigation.products')}</p>
        <p><strong>Cart:</strong> {t('navigation.cart')}</p>
        <p><strong>Add to Cart:</strong> {t('product.addToCart')}</p>
        <p><strong>Loading:</strong> {t('common.loading')}</p>
      </CardContent>
    </Card>
  );
}