import React, { Suspense } from "react";
import { Metadata } from "next";
import ShopClient from "./ShopClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Shop Collection | Kamta Wise",
    description: "Explore our premium collection of minimal luxury shirts, trousers, t-shirts, and sneakers designed for comfort and confidence.",
    openGraph: {
      title: "Shop Collection | Kamta Wise",
      description: "Explore our premium collection of minimal luxury shirts, trousers, t-shirts, and sneakers designed for comfort and confidence.",
      url: "https://www.kamtawise.in/shop",
    }
  };
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-cream" />
      }
    >
      <ShopClient />
    </Suspense>
  );
}
