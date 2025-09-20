"use client";
import Link from "next/link";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
} from "@/components/ui/typography";
import { useTranslations } from "@/hooks/useTranslations";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTiktok,
} from "@tabler/icons-react";
import Image from "next/image";

export default function Footer() {
  const { t } = useTranslations();
  return (
    <footer className="bg-background border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Info */}
        <div className="md:col-span-2">
          <Link href="/" className="gap-4 flex items-center relative">
            <Image
              src="/images/JO-removebg.png"
              alt="JO"
              width={80}
              height={80}
              className="object-contain border-4 border-primary"
              priority
            />
            <TypographyH1 className="flex">
              <TypographyH1 className="text-primary/70">Just</TypographyH1>
              Originale
            </TypographyH1>
          </Link>
          <TypographyP className="text-sm text-muted-foreground max-w-md">
            {t('footer.tagline')}
          </TypographyP>

          {/* Social Links */}
          <div className="flex space-x-4 mt-4">
            <Link
              href="https://www.instagram.com/jusoriginale/"
              target="_blank"
              aria-label={t('footer.socialMedia.instagram')}
            >
              <IconBrandInstagram className="w-5 h-5 text-foreground hover:text-accent transition" />
            </Link>
            <Link
              href="https://www.facebook.com/profile.php?id=61580176392827"
              target="_blank"
              aria-label={t('footer.socialMedia.facebook')}
            >
              <IconBrandFacebook className="w-5 h-5 text-foreground hover:text-accent transition" />
            </Link>
            <Link
              href="https://www.tiktok.com/@justoriginale?lang=fr"
              target="_blank"
              aria-label={t('footer.socialMedia.tiktok')}
            >
              <IconBrandTiktok className="w-5 h-5 text-foreground hover:text-accent transition" />
            </Link>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <TypographyH1 className="text-lg font-semibold mb-2">
            {t('footer.newsletter.title')}
          </TypographyH1>
          <form className="space-y-2">
            <Input
              type="email"
              placeholder={t('footer.newsletter.placeholder')}
              className="w-full"
              aria-label={t('footer.newsletter.emailLabel')}
            />
            <Button type="submit" className="w-full">
              {t('footer.newsletter.subscribe')}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            {t('footer.motto')}
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="text-center text-muted-foreground text-xs">
        {t('footer.copyright', { year: new Date().getFullYear() })}
        <div className="mt-1">
          {t('footer.developedBy')} <span className="font-medium">CosmoCode</span>
        </div>
      </div>
    </footer>
  );
}
