"use client";

import React, { useState, useEffect } from "react";
import SectionHeading from "@/components/SectionHeading";
import ProductGrid from "@/components/ProductGrid";
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/context/StoreContext";
import { Product } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const { user } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qProd = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      qProd,
      (snapshot) => {
        const fetched: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.isActive !== false) {
            fetched.push({ id: docSnap.id, ...data } as Product);
          }
        });
        setAllProducts(fetched);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading recommendations:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const wishlistIds = new Set(wishlist.map((item) => item.id));
  const recommendations = allProducts.filter((p) => !wishlistIds.has(p.id)).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16">
      
      {/* Title block */}
      <div className="space-y-6">
        <SectionHeading
          title="Wishlist"
          subtitle="Your saved pieces, ready whenever you are."
          align="center"
        />

        {/* Wishlist Items */}
        {!user ? (
          <EmptyState
            title="Please Sign In"
            subtitle="Sign in to save pieces to your wishlist and view them across your devices."
            actionText="Sign In to Account"
            actionHref="/profile"
          />
        ) : wishlist.length === 0 ? (
          <EmptyState
            title="Your wishlist is waiting."
            subtitle="Save your favourite pieces and return to them anytime."
            actionText="Start Shopping"
            actionHref="/shop"
          />
        ) : (
          <div className="space-y-6">
            <p className="text-xs text-neutral-400 font-sans tracking-wide">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
            </p>
            <ProductGrid products={wishlist} />
          </div>
        )}
      </div>

      {/* Recommendations */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-6 w-6 text-neutral-400 animate-spin" />
        </div>
      ) : recommendations.length > 0 ? (
        <div className="border-t border-brand-taupe/40 pt-16 space-y-10">
          <SectionHeading
            title="You May Also Like"
            subtitle="Explore complementary additions selected for modular styling options."
            align="center"
          />
          <ProductGrid products={recommendations} />
        </div>
      ) : null}

    </div>
  );
}
