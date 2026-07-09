"use client";

import React, { useState } from "react";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import { Product } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist, openQuickView, addToCart } = useStore();
  const { user, setIsAuthModalOpen } = useAuth();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const isWishlisted = isInWishlist(product.id);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    // Use default first size and color
    const defaultSize = product.sizes[0] || "M";
    const defaultColor = product.colors[0] || "Ivory";
    addToCart(product, defaultSize, defaultColor, 1);
  };

  return (
    <div
      onClick={() => router.push(`/shop/${product.slug}`)}
      className="group relative flex flex-col bg-brand-cream border border-brand-taupe/20 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xs hover:border-brand-taupe/60 animate-fade-in"
    >
      {/* Product Image and Overlay Icons */}
      <div className="relative aspect-[3/4] bg-brand-beige overflow-hidden">
        <Image
          src={activeImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Labels */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 font-sans">
          {product.discountedPrice && (
            <span className="bg-brand-espresso text-brand-cream text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 font-medium">
              Sale
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-white/95 text-brand-charcoal text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border border-brand-taupe">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-brand-charcoal text-white text-[9px] uppercase tracking-[0.2em] px-2 py-0.5">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!user) {
              setIsAuthModalOpen(true);
            } else {
              toggleWishlist(product);
            }
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-xs transition-all duration-300 ${
            isWishlisted
              ? "bg-brand-charcoal text-brand-cream"
              : "bg-white/80 text-brand-charcoal hover:bg-white hover:scale-105"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
        </button>

        {/* Quick actions overlay (Desktop only) */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 flex items-end justify-center p-4">
          <div className="flex gap-2 w-full max-w-[90%] transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleQuickAdd}
              className="flex-1 bg-white hover:bg-brand-charcoal hover:text-white text-brand-charcoal py-2.5 text-[10px] uppercase tracking-wider font-sans border border-brand-taupe/60 transition-all duration-300 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <ShoppingCart size={11} />
              Quick Add
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openQuickView(product);
              }}
              className="bg-brand-charcoal hover:bg-brand-espresso text-brand-cream p-2.5 transition-all duration-300 flex items-center justify-center border border-brand-charcoal shadow-xs"
              title="Quick View"
            >
              <Eye size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-grow justify-between min-h-[120px]">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 font-sans block">
            {product.category}
          </span>
          <h3 className="font-serif text-[15px] font-light text-brand-charcoal leading-snug group-hover:text-brand-espresso transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-sans font-medium text-brand-charcoal">
            {product.discountedPrice ? (
              <span className="flex items-center gap-2">
                <span className="line-through text-xs text-neutral-400 font-light">
                  {formatPrice(product.price)}
                </span>
                <span className="text-brand-espresso font-semibold">
                  {formatPrice(product.discountedPrice)}
                </span>
              </span>
            ) : (
              formatPrice(product.price)
            )}
          </span>

          {/* Color Circles */}
          <div className="flex gap-1">
            {product.colors.slice(0, 3).map((color) => {
              let bgCode = "#ffffff";
              if (color === "Ivory") bgCode = "#FDFBF7";
              if (color === "Beige") bgCode = "#E6DFD3";
              if (color === "Black") bgCode = "#1A1A1A";
              if (color === "Brown") bgCode = "#5C4B40";
              if (color === "Olive") bgCode = "#4E5340";

              return (
                <span
                  key={color}
                  title={color}
                  style={{ backgroundColor: bgCode }}
                  className="w-2.5 h-2.5 rounded-full border border-neutral-300 inline-block"
                />
              );
            })}
            {product.colors.length > 3 && (
              <span className="text-[9px] text-neutral-400 font-sans">
                +{product.colors.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
