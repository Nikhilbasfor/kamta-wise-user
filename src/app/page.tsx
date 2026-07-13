"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroBanner from "@/components/HeroBanner";
import ProductGrid from "@/components/ProductGrid";
import CategoryRow from "@/components/CategoryRow";
import SectionHeading from "@/components/SectionHeading";
import NewsletterSection from "@/components/NewsletterSection";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc } from "firebase/firestore";
import { Product } from "@/data/products";
import { Loader2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";

const categoryImages: Record<string, string> = {
  "Tshirts": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&h=300&fit=crop&q=80",
  "Full Shirts": "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=300&h=300&fit=crop&q=80",
  "Trousers": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop&q=80",
  "Half Pants": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300&h=300&fit=crop&q=80",
  "Sneakers": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop&q=80"
};

export default function HomePage() {
  const { products, productsLoading } = useStore();
  const [categories, setCategories] = useState<{ name: string; displayName: string; image: string }[]>([]);
  const [lookbook, setLookbook] = useState<any>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    // 1. Subscribe to categories
    const qCat = query(collection(db, "categories"), orderBy("name", "asc"));
    const unsubscribeCat = onSnapshot(qCat, (snapshot) => {
      const fetchedCats: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const catName = data.name;
        fetchedCats.push({
          name: catName,
          displayName: data.displayName || catName,
          image: data.image || categoryImages[catName] || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=300&fit=crop&q=80"
        });
      });
      setCategories(fetchedCats);
      setCategoriesLoading(false);
    }, (err) => {
      console.error("Error loading categories:", err);
      setCategoriesLoading(false);
    });

    // 2. Subscribe to lookbook settings
    const unsubscribeSettings = onSnapshot(doc(db, "siteSettings", "main"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.lookbook) {
          setLookbook(data.lookbook);
        }
      }
    }, (err) => {
      console.error("Error loading lookbook settings:", err);
    });

    return () => {
      unsubscribeCat();
      unsubscribeSettings();
    };
  }, []);

  const loading = productsLoading || categoriesLoading;

  // Filter new arrivals (items marked as isNewArrival)
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);

  return (
    <div className="relative w-full space-y-12 md:space-y-16 pb-12 overflow-hidden bg-brand-cream">
      
      {/* Premium Quiet-Luxury Editorial Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Left vertical rule */}
        <div className="absolute left-[6%] xl:left-[10%] top-0 bottom-0 w-[1px] bg-brand-taupe/20 hidden lg:block" />
        {/* Right vertical rule */}
        <div className="absolute right-[6%] xl:right-[10%] top-0 bottom-0 w-[1px] bg-brand-taupe/20 hidden lg:block" />
        
        {/* Soft, warm ambient light highlights */}
        <div className="absolute top-[8%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-beige/50 blur-[130px] opacity-70" />
        <div className="absolute top-[35%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-brand-taupe/30 blur-[160px] opacity-60" />
        <div className="absolute top-[65%] right-[-12%] w-[45vw] h-[45vw] rounded-full bg-brand-beige/50 blur-[120px] opacity-70" />
        <div className="absolute bottom-[5%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-taupe/25 blur-[140px] opacity-60" />

        {/* Delicate geometric accent circles */}
        <div className="absolute top-[18%] left-[4%] w-64 h-64 rounded-full border border-brand-taupe/15 opacity-40 hidden md:block" />
        <div className="absolute top-[52%] right-[4%] w-80 h-80 rounded-full border border-brand-taupe/10 opacity-30 hidden md:block" />
        <div className="absolute bottom-[22%] left-[8%] w-96 h-96 rounded-full border border-brand-taupe/15 opacity-35 hidden md:block" />
        
        {/* Floating editorial text accents */}
        <div className="absolute top-[22%] left-[2%] xl:left-[4%] text-[8px] uppercase tracking-[0.6em] text-neutral-400/20 [writing-mode:vertical-lr] select-none hidden lg:block">
          KAMTA WISE // SEASONAL DROP
        </div>
        <div className="absolute bottom-[35%] right-[2%] xl:right-[4%] text-[8px] uppercase tracking-[0.6em] text-neutral-400/20 [writing-mode:vertical-lr] select-none hidden lg:block">
          RAW. ROOTS. REAL.
        </div>
      </div>
 
      {/* Hero Banner Slider */}
      <div className="relative z-10">
        <HeroBanner />
      </div>

      {/* Circular Categories Row */}
      <div className="relative z-10">
        {categories.length > 0 && <CategoryRow categories={categories} />}
      </div>

      {/* New Arrivals Section */}
      <section id="new-arrivals" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center space-y-3 mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-brand-charcoal font-serif tracking-wide uppercase">
            New Arrivals
          </h2>
          <p className="text-xs text-neutral-400 font-sans tracking-wide">
            Fresh additions to your permanent capsule wardrobe.
          </p>
          <div className="h-1.5 w-24 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 mx-auto mt-4 rounded-full animate-pulse" />
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-neutral-400 animate-spin" />
          </div>
        ) : newArrivals.length === 0 ? (
          <div className="text-center py-20 text-xs text-neutral-500 uppercase tracking-widest font-light">
            No new arrivals listed at this time.
          </div>
        ) : (
          <ProductGrid products={newArrivals} />
        )}
        <div className="text-center pt-8">
          <Link
            href="/shop?filter=new"
            className="inline-block border-b border-brand-charcoal hover:border-brand-espresso pb-1 text-xs uppercase tracking-[0.2em] text-brand-charcoal hover:text-brand-espresso transition-all duration-300 font-sans cursor-pointer"
          >
            Shop All New Arrivals
          </Link>
        </div>
      </section>

      {/* Brand Story Preview */}
      <section className="relative z-10 bg-brand-beige/25 border-y border-brand-taupe/15 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center px-4 space-y-6 animate-fade-in">
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-sans block">
            KAMTA WISE BRAND STORY
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-brand-charcoal font-serif tracking-wide leading-tight">
            Designed for quiet confidence,<br />crafted for everyday ease.
          </h2>
          <p className="text-sm font-sans font-light text-neutral-550 max-w-xl mx-auto leading-relaxed">
            We reject the loudness of temporary cycles. Our focus is on constructing clothing that feels soft against your skin, retains shape over time, and adapts fluidly to your schedule.
          </p>
          <div className="pt-4">
            <Link
              href="/profile?tab=about"
              className="inline-block px-8 py-3.5 border border-brand-charcoal text-xs uppercase tracking-[0.2em] text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-cream transition-all duration-300 font-sans"
            >
              Discover Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Summer Lookbook Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={lookbook?.title || "Summer Lookbook 2026"}
          subtitle={lookbook?.subtitle || "A visual inquiry into lightweight shapes, sunlit rooms, and natural materials."}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {(lookbook?.stories || [
            {
              tag: "Story 01 // Breezy Linen",
              title: "The Art of Rest",
              description: "Understated textures and organic fibres that echo the ease of summer middays.",
              image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
            },
            {
              tag: "Story 02 // Clean Cuts",
              title: "Structured Ease",
              description: "Perfecting the balance between tailoring and movement, designed to breathe.",
              image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&q=80",
            },
            {
              tag: "Story 03 // Natural Palette",
              title: "Sun-Dappled Hues",
              description: "Shades of raw ivory, washed sand, and stone that settle into the environment.",
              image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
            },
            {
              tag: "Story 04 // Fluid Forms",
              title: "Summer Solitude",
              description: "Weightless coordinates that flow with the wind, moving with quiet grace.",
              image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
            }
          ]).map((story: any, idx: number) => (
            <div key={idx} className="flex flex-row sm:flex-col gap-4 sm:gap-4 items-center sm:items-start group">
              <div className="relative w-28 xs:w-36 sm:w-full aspect-[3/4] bg-brand-beige overflow-hidden rounded-xl border border-brand-taupe/20 flex-shrink-0">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 space-y-1 sm:pl-1">
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-sans block">{story.tag}</span>
                <h4 className="font-serif text-base sm:text-lg font-light text-brand-charcoal">{story.title}</h4>
                <p className="text-xs text-neutral-550 font-sans font-light leading-relaxed line-clamp-3 sm:line-clamp-none">
                  {story.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <div className="relative z-10">
        <NewsletterSection />
      </div>

    </div>
  );
}
