"use client";

import React, { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp, X, RotateCcw } from "lucide-react";

interface FilterBarProps {
  categories: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  activeSize: string;
  setActiveSize: (size: string) => void;
  activeColor: string;
  setActiveColor: (color: string) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClearFilters: () => void;
}

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = ["Ivory", "Beige", "Black", "Brown", "Olive"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "bestselling", label: "Bestselling" },
];

export default function FilterBar({
  categories,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  activeSize,
  setActiveSize,
  activeColor,
  setActiveColor,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  onClearFilters,
}: FilterBarProps) {
  const categoriesList = ["All", ...categories];
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isDesktopFiltersVisible, setIsDesktopFiltersVisible] = useState(false);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const hasActiveFilters =
    activeCategory !== "All" ||
    activeSize !== "" ||
    activeColor !== "" ||
    maxPrice < 10000 ||
    searchQuery !== "";

  return (
    <div className="space-y-4 font-sans text-brand-charcoal animate-fade-in">
      {/* Search Bar + Collapsible Trigger + Sort Selection Row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-4 border-b border-brand-taupe/40">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search within collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-brand-taupe/60 px-4 py-2.5 text-xs font-light tracking-wide focus:outline-none focus:border-brand-espresso placeholder-neutral-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-charcoal"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Toggle Filters Button (Desktop) */}
          <button
            onClick={() => {
              setIsDesktopFiltersVisible(!isDesktopFiltersVisible);
              setIsMobileFiltersOpen(!isMobileFiltersOpen);
            }}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 border border-brand-taupe bg-white px-4 py-2.5 text-xs uppercase tracking-wider hover:border-brand-charcoal transition-all"
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-espresso inline-block" />
            )}
            {isDesktopFiltersVisible ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {/* Sort selector */}
          <div className="flex-1 md:flex-initial relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white border border-brand-taupe px-4 py-2.5 text-xs uppercase tracking-wider focus:outline-none focus:border-brand-charcoal appearance-none pr-8 cursor-pointer rounded-none"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
              <ChevronDown size={12} />
            </div>
          </div>

          {/* Clear Filters (if active) */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="p-2.5 border border-dashed border-neutral-300 text-neutral-500 hover:text-brand-charcoal hover:border-brand-charcoal transition-colors rounded-none"
              title="Reset Filters"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Desktop Filter Panel (Slide down drawer) */}
      <div
        className={`hidden md:block transition-all duration-300 ease-in-out overflow-hidden ${
          isDesktopFiltersVisible ? "max-h-[350px] opacity-100 py-6 border-b border-brand-taupe/40" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid grid-cols-4 gap-6 bg-brand-beige/20 p-6 border border-brand-taupe/30">
          {/* Categories */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-sans font-medium block">
              Categories
            </span>
            <div className="flex flex-col space-y-1.5 max-h-[160px] overflow-y-auto pr-2">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left text-xs tracking-wide py-0.5 transition-colors ${
                    activeCategory === cat
                      ? "text-brand-charcoal font-medium underline underline-offset-4"
                      : "text-neutral-500 hover:text-brand-charcoal"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-sans font-medium block">
              Sizes
            </span>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setActiveSize(activeSize === size ? "" : size)}
                  className={`min-w-[36px] h-[36px] border text-[11px] transition-all flex items-center justify-center ${
                    activeSize === size
                      ? "border-brand-charcoal bg-brand-charcoal text-brand-cream"
                      : "border-brand-taupe/60 hover:border-brand-charcoal text-brand-charcoal bg-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-sans font-medium block">
              Colors
            </span>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => {
                let bgCode = "#ffffff";
                if (color === "Ivory") bgCode = "#FDFBF7";
                if (color === "Beige") bgCode = "#E6DFD3";
                if (color === "Black") bgCode = "#1A1A1A";
                if (color === "Brown") bgCode = "#5C4B40";
                if (color === "Olive") bgCode = "#4E5340";

                return (
                  <button
                    key={color}
                    onClick={() => setActiveColor(activeColor === color ? "" : color)}
                    style={{ backgroundColor: bgCode }}
                    className={`w-7 h-7 rounded-full border transition-all ${
                      activeColor === color
                        ? "ring-1 ring-brand-charcoal ring-offset-2 border-brand-charcoal"
                        : "border-neutral-300 hover:scale-105"
                    }`}
                    title={color}
                    aria-label={`Select filter color ${color}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-sans font-medium block">
              Max Price
            </span>
            <div className="space-y-2">
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-espresso cursor-pointer"
              />
              <div className="flex justify-between text-xs text-neutral-500 font-sans font-light">
                <span>{formatPrice(1000)}</span>
                <span className="text-brand-charcoal font-medium">{formatPrice(maxPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Panel */}
      {isMobileFiltersOpen && (
        <div className="md:hidden bg-brand-beige/30 p-4 border border-brand-taupe/40 space-y-5 animate-fade-in">
          {/* Categories */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-sans font-medium block">
              Categories
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 border text-xs tracking-wider transition-colors ${
                    activeCategory === cat
                      ? "border-brand-charcoal bg-brand-charcoal text-brand-cream"
                      : "border-brand-taupe bg-white text-neutral-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-sans font-medium block">
              Sizes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setActiveSize(activeSize === size ? "" : size)}
                  className={`min-w-[34px] h-[34px] border text-xs transition-all flex items-center justify-center ${
                    activeSize === size
                      ? "border-brand-charcoal bg-brand-charcoal text-brand-cream"
                      : "border-brand-taupe bg-white text-brand-charcoal"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-sans font-medium block">
              Colors
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {COLORS.map((color) => {
                let bgCode = "#ffffff";
                if (color === "Ivory") bgCode = "#FDFBF7";
                if (color === "Beige") bgCode = "#E6DFD3";
                if (color === "Black") bgCode = "#1A1A1A";
                if (color === "Brown") bgCode = "#5C4B40";
                if (color === "Olive") bgCode = "#4E5340";

                return (
                  <button
                    key={color}
                    onClick={() => setActiveColor(activeColor === color ? "" : color)}
                    style={{ backgroundColor: bgCode }}
                    className={`w-7 h-7 rounded-full border transition-all ${
                      activeColor === color
                        ? "ring-1 ring-brand-charcoal ring-offset-2 border-brand-charcoal"
                        : "border-neutral-300"
                    }`}
                    title={color}
                  />
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-sans font-medium block">
              Max Price
            </span>
            <div className="space-y-1">
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-espresso"
              />
              <div className="flex justify-between text-xs text-neutral-500 font-sans">
                <span>{formatPrice(1000)}</span>
                <span className="text-brand-charcoal font-medium">{formatPrice(maxPrice)}</span>
              </div>
            </div>
          </div>

          {/* Close Panel Button */}
          <button
            onClick={() => setIsMobileFiltersOpen(false)}
            className="w-full bg-brand-charcoal hover:bg-brand-espresso text-brand-cream text-xs uppercase tracking-widest py-2.5 text-center mt-2 font-sans"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}
