import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JustOriginale – Global Brands, Curated for You",
  description:
    "Discover JustOriginale.com – Your destination for authentic, high-quality products from the world's most celebrated brands.",
  keywords: [
    "global brands",
    "premium products",
    "online shopping",
    "authentic goods",
    "curated collections",
  ],
  authors: [{ name: "Maalainine" }],
  creator: "Maalainine",
  publisher: "Maalainine",
  icons: {
    icon: "/images/LOGO.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <Providers>
            <WishlistProvider>
              <CartProvider>
                {children}
                <Toaster richColors position="top-center" />
              </CartProvider>
            </WishlistProvider>
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
