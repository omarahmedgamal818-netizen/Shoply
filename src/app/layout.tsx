import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteHeader, SiteRail } from "@/components/site-header";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Shoply — Multi-vendor marketplace",
  description: "Shop independent fashion and lifestyle sellers on Shoply.",
  icons: { icon: "/shoply-mark.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ClerkProvider>
          <CartProvider>
            <div className="min-h-full md:pl-16">
              <SiteRail />
              <SiteHeader />
              <main>{children}</main>
            </div>
          </CartProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
