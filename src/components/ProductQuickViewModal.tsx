"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import Image from "next/image";
import QuantitySelector from "./QuantitySelector";
import SizeSelector from "./SizeSelector";
import WishlistButton from "./WishlistButton";
import AddToCartButton from "./AddToCartButton";
import { useAuth } from "@/context/AuthContext";

export default function ProductQuickViewModal() {
  const {
    quickViewProduct,
    isQuickViewOpen,
    closeQuickView,
    addToCart,
    clearCart,
    triggerCheckout,
    toggleWishlist,
    isInWishlist,
  } = useStore();
  const { user, setIsAuthModalOpen } = useAuth();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Set default size and color when product changes
  useEffect(() => {
    if (quickViewProduct) {
      setSelectedSize(quickViewProduct.sizes[0] || "");
      setSelectedColor(quickViewProduct.colors[0] || "");
      setQuantity(1);
      setActiveImageIndex(0);
    }
  }, [quickViewProduct]);

  // Handle ESC keypress to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isQuickViewOpen) {
        closeQuickView();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQuickViewOpen, closeQuickView]);

  if (!isQuickViewOpen || !quickViewProduct) return null;

  const product = quickViewProduct;
  const isWishlisted = isInWishlist(product.id);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddToCart = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }
    if (!selectedColor) {
      alert("Please select a color.");
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    closeQuickView();
  };

  const handleBuyNow = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }
    if (!selectedColor) {
      alert("Please select a color.");
      return;
    }
    clearCart();
    addToCart(product, selectedSize, selectedColor, quantity);
    closeQuickView();
    setTimeout(() => {
      triggerCheckout();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeQuickView}
      />

      {/* Modal Box */}
      <div
        ref={modalRef}
        className="relative bg-brand-cream w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row z-10 border border-brand-taupe animate-fade-in"
      >
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute right-4 top-4 z-20 p-2 text-brand-charcoal hover:text-brand-espresso bg-brand-cream/80 rounded-full md:bg-transparent"
          aria-label="Close details"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Left: Product Images */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col gap-4 bg-brand-beige/25">
          <div className="relative aspect-[3/4] w-full bg-brand-beige overflow-hidden">
            <Image
              src={product.images[activeImageIndex]}
              alt={`${product.name} - View ${activeImageIndex + 1}`}
              fill
              className="object-cover transition-all duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 font-sans">
              {product.discountedPrice && (
                <span className="bg-brand-espresso text-brand-cream text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 font-medium">
                  Sale
                </span>
              )}
              {product.isNewArrival && (
                <span className="bg-white/95 text-brand-charcoal text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 border border-brand-taupe">
                  New
                </span>
              )}
              {product.isBestseller && (
                <span className="bg-brand-charcoal text-white text-[9px] uppercase tracking-[0.2em] px-2.5 py-1">
                  Bestseller
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-20 bg-brand-beige overflow-hidden border ${
                    activeImageIndex === idx ? "border-brand-charcoal" : "border-brand-taupe/30"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumb ${idx}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-neutral-500 font-sans">{product.category}</p>
              <h1 className="text-2xl md:text-3xl font-light text-brand-charcoal tracking-wide mt-1 font-serif">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-2.5 mt-2">
                {product.discountedPrice ? (
                  <>
                    <span className="text-sm line-through text-neutral-400 font-sans font-light">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xl font-sans font-semibold text-brand-espresso">
                      {formatPrice(product.discountedPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-sans text-brand-charcoal">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm font-sans font-light text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            {/* Colors Selection */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-neutral-500 font-sans">
                Color: <span className="text-brand-charcoal font-medium">{selectedColor}</span>
              </span>
              <div className="flex gap-2">
                {product.colors.map((color) => {
                  // Mini preview colors matching
                  let bgCode = "#ffffff";
                  if (color === "Ivory") bgCode = "#FDFBF7";
                  if (color === "Beige") bgCode = "#E6DFD3";
                  if (color === "Black") bgCode = "#1A1A1A";
                  if (color === "Brown") bgCode = "#5C4B40";
                  if (color === "Olive") bgCode = "#4E5340";

                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: bgCode }}
                      className={`w-7 h-7 rounded-full border transition-all ${
                        selectedColor === color
                          ? "ring-1 ring-brand-charcoal ring-offset-2 border-brand-charcoal"
                          : "border-neutral-300 hover:scale-105"
                      }`}
                      aria-label={`Select color ${color}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Sizes Selection */}
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onChange={setSelectedSize}
            />

            {/* Product Specifications (Fabric, Fit, Care) Accordion style */}
            <div className="border-t border-brand-taupe/60 pt-4 space-y-3">
              <div className="text-xs font-sans text-neutral-600">
                <span className="font-medium text-brand-charcoal">Fabric: </span>
                <span className="font-light">{product.fabric}</span>
              </div>
              <div className="text-xs font-sans text-neutral-600">
                <span className="font-medium text-brand-charcoal">Fit: </span>
                <span className="font-light">{product.fit}</span>
              </div>
              <div className="text-xs font-sans text-neutral-600">
                <span className="font-medium text-brand-charcoal">Care: </span>
                <span className="font-light">{product.care}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-8 pt-6 border-t border-brand-taupe/60 space-y-4">
            <div className="flex gap-4 items-center">
              {/* Quantity */}
              <QuantitySelector quantity={quantity} onChange={setQuantity} />

              {/* Add to Cart */}
              <AddToCartButton onClick={handleAddToCart} />

              {/* Wishlist toggle */}
              <WishlistButton product={product} />
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 bg-brand-espresso hover:bg-brand-charcoal text-brand-cream text-xs uppercase tracking-widest font-sans font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 rounded-lg"
            >
              Buy Now (Direct Checkout)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
