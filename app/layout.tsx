import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
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
  title: "Saad - Premium E-commerce",
  description: "Welcome to Saad - Your premium e-commerce destination. Quality products you can trust.",
  keywords: ["e-commerce", "online shopping", "premium products", "saad"],
  authors: [{ name: "Saad" }],
  creator: "Saad",
  publisher: "Saad",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <CartProvider>
            {children}
            <Toaster richColors position="top-center" />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
