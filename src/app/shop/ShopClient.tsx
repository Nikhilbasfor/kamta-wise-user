"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SectionHeading from "@/components/SectionHeading";
import FilterBar from "@/components/FilterBar";
import ProductGrid from "@/components/ProductGrid";
import EmptyState from "@/components/EmptyState";
import { Product } from "@/data/products";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export default function ShopClient() {
  const searchParams = useSearchParams();

  // Search parameters parsing
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "All";
  const initialFilter = searchParams.get("filter") || "";

  // State Management
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeSize, setActiveSize] = useState("");
  const [activeColor, setActiveColor] = useState("");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState("newest");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state with URL params on load
  useEffect(() => {
    if (initialSearch) setSearchQuery(initialSearch);
    if (initialCategory) setActiveCategory(initialCategory);
    if (initialFilter === "new") setActiveCategory("New Arrivals");
  }, [initialSearch, initialCategory, initialFilter]);

  // Real-time Firestore subscriptions
  useEffect(() => {
    // 1. Subscribe to products
    const qProd = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribeProd = onSnapshot(qProd, (snapshot) => {
      const fetched: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.isActive !== false) {
          fetched.push({ id: docSnap.id, ...data } as Product);
        }
      });
      setAllProducts(fetched);
      setLoading(false);
    }, (err) => {
      console.error("Error loading products:", err);
      setLoading(false);
    });

    // 2. Subscribe to categories
    const qCat = query(collection(db, "categories"), orderBy("name", "asc"));
    const unsubscribeCat = onSnapshot(qCat, (snapshot) => {
      const fetchedCats: string[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.name) {
          fetchedCats.push(data.name);
        }
      });
      setCategories(fetchedCats);
    }, (err) => {
      console.error("Error loading categories:", err);
    });

    return () => {
      unsubscribeProd();
      unsubscribeCat();
    };
  }, []);

  // Handle actual filtering logic
  useEffect(() => {
    let result = [...allProducts];

    // Search query filter
    if (searchQuery.trim()) {
      const queryStr = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(queryStr) ||
          p.description.toLowerCase().includes(queryStr) ||
          p.category.toLowerCase().includes(queryStr)
      );
    }

    // Category filter
    if (activeCategory !== "All") {
      if (activeCategory === "New Arrivals") {
        result = result.filter((p) => p.isNewArrival);
      } else {
        result = result.filter((p) => p.category === activeCategory);
      }
    }

    // Size filter
    if (activeSize) {
      result = result.filter((p) => p.sizes.includes(activeSize));
    }

    // Color filter
    if (activeColor) {
      result = result.filter((p) => p.colors.includes(activeColor));
    }

    // Price range filter
    result = result.filter((p) => (p.discountedPrice ?? p.price) <= maxPrice);

    // Sorting logic
    if (sortBy === "price-asc") {
      result.sort((a, b) => (a.discountedPrice ?? a.price) - (b.discountedPrice ?? b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.discountedPrice ?? b.price) - (a.discountedPrice ?? a.price));
    } else if (sortBy === "bestselling") {
      result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    } else {
      // Default / Newest first
      result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    }

    setFilteredProducts(result);
  }, [allProducts, searchQuery, activeCategory, activeSize, activeColor, maxPrice, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setActiveSize("");
    setActiveColor("");
    setMaxPrice(10000);
    setSortBy("newest");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
      
      {/* Title block */}
      <SectionHeading
        title="Shop Collection"
        subtitle="Explore refined everyday pieces designed with comfort, detail, and quiet luxury."
        align="center"
      />

      {/* Filter Component */}
      <FilterBar
        categories={categories}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeSize={activeSize}
        setActiveSize={setActiveSize}
        activeColor={activeColor}
        setActiveColor={setActiveColor}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onClearFilters={handleClearFilters}
      />

      {/* Results grid */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-neutral-450 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="No products found."
            subtitle="Try adjusting your filters, search term, or clearing all criteria to start over."
            actionText="Clear Filters"
            onClickAction={handleClearFilters}
          />
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-neutral-400 font-sans tracking-wide">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </p>
            <ProductGrid products={filteredProducts} />
          </div>
        )}
      </div>

    </div>
  );
}
