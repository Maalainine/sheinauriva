import Link from "next/link";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTwitter,
} from "@tabler/icons-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Info */}
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center relative">
            <Image
              src="/images/SaadLogo.png"
              alt="SafSaf"
              width={200}
              height={200}
              className="object-contain"
              priority
            />
          </Link>
          <TypographyP className="text-sm text-muted-foreground max-w-md">
            Discover premier global beauty brands.
          </TypographyP>

          {/* Social Links */}
          <div className="flex space-x-4 mt-4">
            <Link
              href="https://twitter.com/SafSaf"
              target="_blank"
              aria-label="Twitter"
            >
              <IconBrandTwitter className="w-5 h-5 text-foreground hover:text-accent transition" />
            </Link>
            <Link
              href="https://facebook.com/SafSaf"
              target="_blank"
              aria-label="Facebook"
            >
              <IconBrandFacebook className="w-5 h-5 text-foreground hover:text-accent transition" />
            </Link>
            <Link
              href="https://instagram.com/SafSaf"
              target="_blank"
              aria-label="Instagram"
            >
              <IconBrandInstagram className="w-5 h-5 text-foreground hover:text-accent transition" />
            </Link>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <TypographyH1 className="text-lg font-semibold mb-2">
            Stay Updated
          </TypographyH1>
          <form className="space-y-2">
            <Input
              type="email"
              placeholder="Your email address"
              className="w-full"
              aria-label="Email for newsletter"
            />
            <Button type="submit" className="w-full">
              Subscribe
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Get the latest updates on new products and offers.
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="text-center text-muted-foreground text-xs">
        &copy; {new Date().getFullYear()} SafSaf. All rights reserved.
        <div className="mt-1">
          Developed by <span className="font-medium">CosmoCode</span>
        </div>
      </div>
    </footer>
  );
}
