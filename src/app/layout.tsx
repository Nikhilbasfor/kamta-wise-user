import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductQuickViewModal from "@/components/ProductQuickViewModal";
import BottomNavigation from "@/components/BottomNavigation";
import AuthModal from "@/components/AuthModal";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kamtawise.in'),
  title: "Kamta Wise | Everyday Luxury Clothing",
  description: "Discover refined everyday clothing designed with simplicity, comfort, and quiet elegance.",
  openGraph: {
    title: 'Kamta Wise | Everyday Luxury Clothing',
    description: 'Discover refined everyday clothing designed with simplicity, comfort, and quiet elegance.',
    url: 'https://www.kamtawise.in',
    siteName: 'Kamta Wise',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kamta Wise',
    description: 'Everyday luxury clothing.',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-cream text-brand-charcoal selection:bg-brand-taupe selection:text-brand-charcoal pb-16 md:pb-18">
        <AuthProvider>
          <StoreProvider>
            <Header />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <ProductQuickViewModal />
            <BottomNavigation />
            <AuthModal />
            {process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && (
              <>
                <Script
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}`}
                  strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                  {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}', {
                      page_path: window.location.pathname,
                    });
                  `}
                </Script>
              </>
            )}
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
